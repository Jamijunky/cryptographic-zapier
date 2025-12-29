/**
 * Server-Sent Events for workflow updates
 * 
 * Sends real-time updates to the frontend when:
 * - Webhook is received
 * - Node execution completes
 * - Workflow execution completes
 */

import { NextRequest } from "next/server";

// Store active connections per workflow
const connections = new Map<string, Set<ReadableStreamDefaultController>>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await params;

  const stream = new ReadableStream({
    start(controller) {
      // Add this controller to the workflow's connections
      if (!connections.has(workflowId)) {
        connections.set(workflowId, new Set());
      }
      connections.get(workflowId)!.add(controller);

      // Send initial connection message
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "connected", workflowId })}\n\n`));

      console.log(`📡 SSE: Client connected to workflow ${workflowId}`);
    },
    cancel(controller) {
      // Remove this controller when the connection closes
      const workflowConnections = connections.get(workflowId);
      if (workflowConnections) {
        workflowConnections.delete(controller);
        if (workflowConnections.size === 0) {
          connections.delete(workflowId);
        }
      }
      console.log(`📡 SSE: Client disconnected from workflow ${workflowId}`);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

/**
 * Broadcast an event to all clients watching a workflow
 */
export function broadcastToWorkflow(workflowId: string, event: any) {
  const workflowConnections = connections.get(workflowId);
  if (!workflowConnections || workflowConnections.size === 0) {
    console.log(`📡 SSE: No clients connected for workflow ${workflowId}`);
    return;
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(`data: ${JSON.stringify(event)}\n\n`);

  console.log(`📡 SSE: Broadcasting to ${workflowConnections.size} client(s)`);

  for (const controller of workflowConnections) {
    try {
      controller.enqueue(data);
    } catch (error) {
      // Connection may have closed
      workflowConnections.delete(controller);
    }
  }
}

// Export the connections map for other modules to broadcast
export { connections };
