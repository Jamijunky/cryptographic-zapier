import { DropNode } from "./drop";
import { CompactNode } from "./compact-node";

// All workflow nodes use the compact n8n-style design
// The full configuration opens in a panel when clicked
export const nodeTypes = {
  trigger: CompactNode,
  email: CompactNode,
  gmail: CompactNode,
  openai: CompactNode,
  googleSheets: CompactNode,
  httpRequest: CompactNode,
  transform: CompactNode,
  flow: CompactNode,
  drop: DropNode,
  phantomWatch: CompactNode,
  metamaskWatch: CompactNode,
  postgres: CompactNode,
  coingateWebhook: CompactNode,
  coingate: CompactNode,
  // Add more node types here
  webhook: CompactNode,
  http: CompactNode,
  code: CompactNode,
  slack: CompactNode,
  telegram: CompactNode,
  discord: CompactNode,
};


