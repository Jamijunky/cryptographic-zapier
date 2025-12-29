/**
 * Event Broadcasting Utility
 * 
 * Sends real-time events to connected clients
 */

// In-memory store for broadcast functions (set by SSE route)
let broadcastFunction: ((workflowId: string, event: any) => void) | null = null;

export function setBroadcastFunction(fn: (workflowId: string, event: any) => void) {
  broadcastFunction = fn;
}

export function broadcastNodeOutput(
  workflowId: string,
  nodeId: string,
  output: any
) {
  if (broadcastFunction) {
    broadcastFunction(workflowId, {
      type: "node_output",
      nodeId,
      output,
      timestamp: new Date().toISOString(),
    });
  }
}

export function broadcastWebhookReceived(
  workflowId: string,
  nodeId: string,
  transaction: any
) {
  if (broadcastFunction) {
    broadcastFunction(workflowId, {
      type: "webhook_received",
      nodeId,
      transaction,
      timestamp: new Date().toISOString(),
    });
  }
}

export function broadcastExecutionStarted(
  workflowId: string,
  executionId: string
) {
  if (broadcastFunction) {
    broadcastFunction(workflowId, {
      type: "execution_started",
      executionId,
      timestamp: new Date().toISOString(),
    });
  }
}

export function broadcastExecutionCompleted(
  workflowId: string,
  executionId: string,
  results: any[]
) {
  if (broadcastFunction) {
    broadcastFunction(workflowId, {
      type: "execution_completed",
      executionId,
      results,
      timestamp: new Date().toISOString(),
    });
  }
}


