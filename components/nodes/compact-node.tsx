/**
 * Compact Node Component
 * 
 * n8n-style minimal node that shows just icon and name.
 * Click to open the full editor panel.
 */

"use client";

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { NodeIconComponent } from "./node-icons";

// Node type to color mapping
const NODE_COLORS: Record<string, string> = {
  phantomWatch: "bg-purple-500",
  metamaskWatch: "bg-orange-500",
  openai: "bg-emerald-500",
  gmail: "bg-red-500",
  googleSheets: "bg-green-500",
  postgres: "bg-blue-600",
  webhook: "bg-blue-500",
  http: "bg-cyan-500",
  code: "bg-gray-500",
  text: "bg-yellow-500",
  email: "bg-red-400",
  slack: "bg-purple-600",
  telegram: "bg-sky-500",
  discord: "bg-indigo-500",
  twitter: "bg-blue-400",
  default: "bg-gray-400",
};

// Node type to display name
const NODE_NAMES: Record<string, string> = {
  phantomWatch: "Phantom",
  metamaskWatch: "MetaMask",
  openai: "OpenAI",
  gmail: "Gmail",
  googleSheets: "Sheets",
  postgres: "PostgreSQL",
  webhook: "Webhook",
  http: "HTTP",
  code: "Code",
  text: "Text",
};

export interface CompactNodeData {
  label?: string;
  [key: string]: unknown;
}

interface CompactNodeProps extends NodeProps {
  data: CompactNodeData;
}

export const CompactNode = memo(({ id, type, data, selected }: CompactNodeProps) => {
  const colorClass = NODE_COLORS[type || "default"] || NODE_COLORS.default;
  const displayName = data.label || NODE_NAMES[type || ""] || type || "Node";

  // Check if this is a trigger node
  const isTrigger = type?.includes("Watch") || type?.includes("webhook") || type?.includes("trigger");

  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-1 cursor-pointer transition-all",
        "hover:scale-105",
        selected && "scale-105"
      )}
    >
      {/* Trigger badge */}
      {isTrigger && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
          TRIGGER
        </div>
      )}

      {/* Node icon container */}
      <div
        className={cn(
          "relative w-16 h-16 rounded-xl overflow-hidden transition-all",
          selected ? "ring-2 ring-offset-2 ring-offset-background ring-primary shadow-lg" : "shadow-md",
          "hover:shadow-lg"
        )}
      >
        <NodeIconComponent type={type || "default"} size={64} />
        
        {/* Status indicator */}
        {data.webhookStatus === "active" && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-background"></span>
          </span>
        )}
      </div>

      {/* Node name */}
      <span className={cn(
        "text-[11px] font-medium text-center max-w-[80px] truncate",
        selected ? "text-foreground" : "text-muted-foreground"
      )}>
        {displayName}
      </span>

      {/* Input handle */}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-2.5 !h-2.5 !bg-muted-foreground/50 !border-2 !border-background !-left-1"
        />
      )}

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-muted-foreground/50 !border-2 !border-background !-right-1"
      />
    </div>
  );
});

CompactNode.displayName = "CompactNode";


