/**
 * Workflow Executor
 * 
 * Executes workflows by traversing nodes in topological order
 * and passing outputs between connected nodes.
 */

import { database } from "@/lib/database";
import { workflows, workflowExecutions } from "@/schema";
import { eq } from "drizzle-orm";
import { invalidateWorkflowCache } from "@/lib/redis-cache";

export interface NodeResult {
  nodeId: string;
  nodeType: string;
  status: "success" | "error";
  input: unknown;
  output: unknown;
  error?: string;
  timestamp: string;
}

export interface ExecutionContext {
  trigger: {
    output: any;
  };
  [nodeId: string]: {
    output: any;
  };
}

/**
 * Execute a workflow
 */
export async function executeWorkflow(
  executionId: string,
  workflowDef: any,
  triggerOutput: any,
  userId: string,
  workflowId?: string  // Optional - if provided, updates node outputs in workflow content
): Promise<void> {
  const nodes = workflowDef.nodes || [];
  const edges = workflowDef.edges || [];
  
  console.log(`\n╔══════════════════════════════════════════════════════════════╗`);
  console.log(`║           🚀 WORKFLOW EXECUTION STARTED                      ║`);
  console.log(`╚══════════════════════════════════════════════════════════════╝`);
  console.log(`   Execution ID: ${executionId}`);
  console.log(`   Workflow ID: ${workflowId || "N/A"}`);
  console.log(`   Nodes: ${nodes.length}`);
  console.log(`   Edges: ${edges.length}`);

  // Build execution context with trigger data
  const context: ExecutionContext = {
    trigger: { output: triggerOutput },
  };

  // Also add trigger data under specific keys for easy access
  if (triggerOutput.transactions?.[0]) {
    const tx = triggerOutput.transactions[0];
    context.trigger.output = {
      ...triggerOutput,
      // Flatten common fields for easy access
      signature: tx.signature || tx.transaction?.signatures?.[0],
      slot: tx.slot,
      blockTime: tx.blockTime,
      amount: extractAmount(tx),
      from: extractFromAddress(tx),
      to: extractToAddress(tx),
    };
  }

  const executionLog: NodeResult[] = [];

  try {
    // Get execution order (topological sort based on edges)
    const sortedNodes = topologicalSort(nodes, edges);
    
    console.log(`\n📋 Execution order:`);
    sortedNodes.forEach((n, i) => console.log(`   ${i + 1}. ${n.type} (${n.id})`));

    // Execute each node
    for (const node of sortedNodes) {
      // Skip trigger nodes - they already executed
      if (isTriggerNode(node.type)) {
        console.log(`\n⏭️  Skipping trigger node: ${node.type}`);
        // But store their output in context
        context[node.id] = { output: triggerOutput };
        continue;
      }

      console.log(`\n▶️  Executing: ${node.type} (${node.id})`);

      // Get input from connected nodes
      const nodeInput = getNodeInput(node.id, edges, context);
      console.log(`   Input:`, JSON.stringify(nodeInput).substring(0, 200) + "...");

      try {
        // Execute the node
        const output = await executeNode(node, nodeInput, context, userId);
        
        // Store output in context
        context[node.id] = { output };
        
        // Log result
        executionLog.push({
          nodeId: node.id,
          nodeType: node.type,
          status: "success",
          input: nodeInput,
          output,
          timestamp: new Date().toISOString(),
        });

        console.log(`   ✅ Success:`, JSON.stringify(output).substring(0, 200) + "...");
        
        // Update node output in workflow content (if workflowId provided)
        if (workflowId) {
          await updateNodeOutputInWorkflow(workflowId, node.id, output);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        
        executionLog.push({
          nodeId: node.id,
          nodeType: node.type,
          status: "error",
          input: nodeInput,
          output: null,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        });

        console.error(`   ❌ Failed:`, errorMessage);
        throw error;
      }
    }

    // Update execution as completed
    await database
      .update(workflowExecutions)
      .set({
        status: "completed",
        completedAt: new Date(),
        result: { context, log: executionLog },
        executionLog,
      })
      .where(eq(workflowExecutions.id, executionId));

    console.log(`\n╔══════════════════════════════════════════════════════════════╗`);
    console.log(`║           ✅ WORKFLOW EXECUTION COMPLETED                    ║`);
    console.log(`╚══════════════════════════════════════════════════════════════╝\n`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    await database
      .update(workflowExecutions)
      .set({
        status: "failed",
        completedAt: new Date(),
        result: { error: errorMessage },
        executionLog,
      })
      .where(eq(workflowExecutions.id, executionId));

    console.log(`\n╔══════════════════════════════════════════════════════════════╗`);
    console.log(`║           ❌ WORKFLOW EXECUTION FAILED                       ║`);
    console.log(`╚══════════════════════════════════════════════════════════════╝`);
    console.log(`   Error: ${errorMessage}\n`);
    
    throw error;
  }
}

/**
 * Check if a node type is a trigger
 */
function isTriggerNode(type: string): boolean {
  return ["phantomWatch", "metamaskWatch", "webhook", "schedule"].includes(type);
}

/**
 * Topological sort of nodes based on edges
 */
function topologicalSort(nodes: any[], edges: any[]): any[] {
  // Build adjacency list
  const graph = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  
  for (const node of nodes) {
    graph.set(node.id, []);
    inDegree.set(node.id, 0);
  }
  
  for (const edge of edges) {
    const targets = graph.get(edge.source) || [];
    targets.push(edge.target);
    graph.set(edge.source, targets);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  }
  
  // Kahn's algorithm
  const queue: string[] = [];
  for (const [nodeId, degree] of inDegree) {
    if (degree === 0) queue.push(nodeId);
  }
  
  const sorted: any[] = [];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodes.find(n => n.id === nodeId);
    if (node) sorted.push(node);
    
    for (const targetId of graph.get(nodeId) || []) {
      const newDegree = (inDegree.get(targetId) || 0) - 1;
      inDegree.set(targetId, newDegree);
      if (newDegree === 0) queue.push(targetId);
    }
  }
  
  return sorted;
}

/**
 * Get input for a node from its connected sources
 */
function getNodeInput(nodeId: string, edges: any[], context: ExecutionContext): any {
  // Find edges that target this node
  const incomingEdges = edges.filter(e => e.target === nodeId);
  
  if (incomingEdges.length === 0) {
    // No incoming edges, use trigger output
    return context.trigger?.output || {};
  }
  
  // Merge outputs from all source nodes
  const input: any = {};
  
  for (const edge of incomingEdges) {
    const sourceOutput = context[edge.source]?.output;
    if (sourceOutput) {
      // If there's only one source, use its output directly
      if (incomingEdges.length === 1) {
        return { previous: sourceOutput, ...context.trigger?.output };
      }
      // Otherwise merge by source node id
      input[edge.source] = sourceOutput;
    }
  }
  
  return { ...input, trigger: context.trigger?.output };
}

/**
 * Execute a single node
 */
async function executeNode(
  node: any,
  input: any,
  context: ExecutionContext,
  userId: string
): Promise<any> {
  const { type, data } = node;
  
  // Interpolate variables in node data
  const interpolatedData = interpolateVariables(data, context, input);
  
  switch (type) {
    case "openai":
      return executeOpenAI(interpolatedData, input);
    
    case "email":
      return executeEmail(interpolatedData, input);
    
    case "http":
      return executeHTTP(interpolatedData, input);
    
    case "slack":
      return executeSlack(interpolatedData, input);
    
    case "telegram":
      return executeTelegram(interpolatedData, input);
    
    case "code":
      return executeCode(interpolatedData, input);
    
    default:
      console.log(`   ⚠️  Unknown node type: ${type}, passing through`);
      return input;
  }
}

/**
 * Interpolate {{variable}} syntax in node data
 */
function interpolateVariables(data: any, context: ExecutionContext, input: any): any {
  if (!data) return data;
  
  const jsonStr = JSON.stringify(data);
  
  const interpolated = jsonStr.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const value = resolvePath(path.trim(), { ...context, input, previous: input.previous });
    return value !== undefined ? JSON.stringify(value).slice(1, -1) : match;
  });
  
  try {
    return JSON.parse(interpolated);
  } catch {
    return data;
  }
}

/**
 * Resolve a dot-notation path like "trigger.output.amount"
 */
function resolvePath(path: string, obj: any): any {
  return path.split('.').reduce((curr, key) => curr?.[key], obj);
}

/**
 * Extract SOL amount from transaction
 */
function extractAmount(tx: any): number {
  // From raw format
  if (tx.meta?.preBalances && tx.meta?.postBalances) {
    const change = Math.abs(tx.meta.postBalances[0] - tx.meta.preBalances[0]);
    return change / 1_000_000_000; // lamports to SOL
  }
  // From enhanced format
  if (tx.nativeTransfers?.[0]) {
    return tx.nativeTransfers[0].amount / 1_000_000_000;
  }
  return 0;
}

/**
 * Extract sender address from transaction
 */
function extractFromAddress(tx: any): string {
  if (tx.nativeTransfers?.[0]) {
    return tx.nativeTransfers[0].fromUserAccount;
  }
  return tx.transaction?.message?.accountKeys?.[0] || "";
}

/**
 * Extract recipient address from transaction
 */
function extractToAddress(tx: any): string {
  if (tx.nativeTransfers?.[0]) {
    return tx.nativeTransfers[0].toUserAccount;
  }
  return tx.transaction?.message?.accountKeys?.[1] || "";
}

// ============================================================================
// Node Executors
// ============================================================================

async function executeOpenAI(data: any, input: any): Promise<any> {
  const OpenAI = (await import("openai")).default;
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Build the prompt with input data
  let prompt = data.prompt || "";
  
  // Replace {{previous.output}} and similar
  if (input.previous) {
    prompt = prompt.replace(/\{\{previous\.output\}\}/g, JSON.stringify(input.previous));
    prompt = prompt.replace(/\{\{previous\}\}/g, JSON.stringify(input.previous));
  }
  
  // Replace trigger data
  if (input.trigger || input.amount) {
    prompt = prompt.replace(/\{\{trigger\.output\.amount\}\}/g, input.amount?.toString() || "");
    prompt = prompt.replace(/\{\{trigger\.output\.from\}\}/g, input.from || "");
    prompt = prompt.replace(/\{\{trigger\.output\.to\}\}/g, input.to || "");
    prompt = prompt.replace(/\{\{trigger\.output\.signature\}\}/g, input.signature || "");
  }

  console.log(`   📝 Prompt: ${prompt.substring(0, 100)}...`);

  const response = await openai.chat.completions.create({
    model: data.model || "gpt-4o-mini",
    messages: [
      { role: "system", content: data.systemPrompt || "You are a helpful assistant." },
      { role: "user", content: prompt },
    ],
    max_tokens: data.maxTokens || 1000,
    temperature: data.temperature || 0.7,
  });

  return {
    content: response.choices[0]?.message?.content || "",
    model: response.model,
    usage: response.usage,
  };
}

async function executeEmail(data: any, input: any): Promise<any> {
  // Use Resend or similar
  console.log(`   📧 Would send email to: ${data.to}`);
  return { sent: true, to: data.to };
}

async function executeHTTP(data: any, input: any): Promise<any> {
  const response = await fetch(data.url, {
    method: data.method || "GET",
    headers: data.headers || {},
    body: data.method !== "GET" ? JSON.stringify(data.body || input) : undefined,
  });
  
  const result = await response.json();
  return result;
}

async function executeSlack(data: any, input: any): Promise<any> {
  // Send to Slack webhook
  if (!data.webhookUrl) {
    throw new Error("Slack webhook URL not configured");
  }
  
  let message = data.message || "";
  if (input.previous?.content) {
    message = message.replace(/\{\{previous\.output\}\}/g, input.previous.content);
  }
  
  const response = await fetch(data.webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: message }),
  });
  
  return { sent: response.ok };
}

async function executeTelegram(data: any, input: any): Promise<any> {
  const botToken = data.botToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = data.chatId;
  
  if (!botToken || !chatId) {
    throw new Error("Telegram bot token or chat ID not configured");
  }
  
  let message = data.message || "";
  if (input.previous?.content) {
    message = message.replace(/\{\{previous\.output\}\}/g, input.previous.content);
  }
  
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message }),
  });
  
  return await response.json();
}

async function executeCode(data: any, input: any): Promise<any> {
  // Simple JavaScript execution (be careful with this in production!)
  const code = data.code || "";
  
  try {
    const fn = new Function("input", "context", code);
    return fn(input, {});
  } catch (error) {
    throw new Error(`Code execution failed: ${error}`);
  }
}

/**
 * Update a node's lastOutput in the workflow content
 * This allows the frontend to show real-time results
 */
async function updateNodeOutputInWorkflow(
  workflowId: string,
  nodeId: string,
  output: any
): Promise<void> {
  try {
    // Fetch current workflow
    const workflow = await database.query.workflows.findFirst({
      where: eq(workflows.id, workflowId),
    });
    
    if (!workflow?.content) {
      console.log(`   ⚠️ Could not find workflow ${workflowId} to update node output`);
      return;
    }
    
    const content = workflow.content as any;
    const nodes = content.nodes || [];
    
    // Update the specific node's lastOutput
    const updatedNodes = nodes.map((n: any) => {
      if (n.id === nodeId) {
        return {
          ...n,
          data: {
            ...n.data,
            lastOutput: output,
            lastExecutedAt: new Date().toISOString(),
          },
        };
      }
      return n;
    });
    
    // Save updated workflow
    await database
      .update(workflows)
      .set({
        content: {
          ...content,
          nodes: updatedNodes,
        },
        updatedAt: new Date(),
      })
      .where(eq(workflows.id, workflowId));
    
    // Invalidate cache so frontend gets fresh data
    await invalidateWorkflowCache(workflowId);
    
    console.log(`   📝 Node ${nodeId} output saved to workflow (cache invalidated)`);
  } catch (error) {
    console.error(`   ⚠️ Failed to update node output in workflow:`, error);
    // Don't throw - this is a non-critical operation
  }
}


