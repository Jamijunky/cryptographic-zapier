/**
 * Helius Webhook API
 * 
 * Creates/deletes Helius webhooks for Solana address monitoring
 * Docs: https://www.helius.dev/docs/api-reference/webhooks/create-webhook
 */

import { NextRequest, NextResponse } from "next/server";

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;

// Use devnet for testing, mainnet for production
const getHeliusApiUrl = (network: string | undefined) => {
  // Default to DEVNET for development/testing
  const normalizedNetwork = (network || "SOLANA_DEVNET").toUpperCase();
  console.log(`   🔍 getHeliusApiUrl: input="${network}", normalized="${normalizedNetwork}"`);
  
  if (normalizedNetwork.includes("DEVNET")) {
    console.log(`   ✅ Returning DEVNET URL`);
    return "https://api-devnet.helius-rpc.com/v0/webhooks";
  }
  console.log(`   ⚠️ Returning MAINNET URL`);
  return "https://api-mainnet.helius-rpc.com/v0/webhooks";
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, network, nodeId } = body;

    console.log("\n");
    console.log("╔══════════════════════════════════════════════════════════════╗");
    console.log("║           🟣 HELIUS - CREATE SOLANA WEBHOOK                  ║");
    console.log("╚══════════════════════════════════════════════════════════════╝");
    console.log("\n📥 Request:", JSON.stringify(body, null, 2));

    if (!address) {
      console.log("❌ Error: Address is required");
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    if (!HELIUS_API_KEY) {
      console.log("❌ Error: HELIUS_API_KEY not found in .env");
      return NextResponse.json({ error: "Helius API key not configured. Add HELIUS_API_KEY to .env" }, { status: 500 });
    }

    console.log("✅ Helius API key found:", HELIUS_API_KEY.substring(0, 10) + "...");

    // Your webhook endpoint that Helius will call - MUST be a public URL (not localhost)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    
    if (!baseUrl || baseUrl.includes("localhost")) {
      console.log("❌ Error: NEXT_PUBLIC_APP_URL must be a public URL (not localhost)");
      console.log("   Current value:", baseUrl || "not set");
      console.log("   💡 Tip: Use ngrok to expose your local server:");
      console.log("      1. Run: ngrok http 3000");
      console.log("      2. Copy the https URL");
      console.log("      3. Add to .env: NEXT_PUBLIC_APP_URL=https://xxxx.ngrok.io");
      return NextResponse.json({ 
        error: "Webhook URL must be public. Use ngrok and set NEXT_PUBLIC_APP_URL in .env" 
      }, { status: 400 });
    }
    
    const webhookUrl = `${baseUrl}/api/webhooks/helius`;
    console.log("📌 Webhook URL:", webhookUrl);

    // Determine which Helius API to use based on network
    const heliusApiUrl = getHeliusApiUrl(network);
    console.log("🌐 Network:", network || "mainnet (default)");
    console.log("🔗 Helius API:", heliusApiUrl);

    // Determine webhook type based on network
    const isDevnet = (network || "SOLANA_DEVNET").toUpperCase().includes("DEVNET");
    const webhookType = isDevnet ? "rawDevnet" : "raw";
    
    console.log(`   📡 Webhook type: ${webhookType} (isDevnet: ${isDevnet})`);

    // Create webhook via Helius API
    const heliusPayload = {
      webhookURL: webhookUrl,
      transactionTypes: ["ANY"], // Watch all transaction types
      accountAddresses: [address],
      webhookType: webhookType,
    };

    console.log("\n📤 Calling Helius API...");
    console.log("   URL:", `${heliusApiUrl}?api-key=***`);
    console.log("   Payload:", JSON.stringify(heliusPayload, null, 2));

    const response = await fetch(`${heliusApiUrl}?api-key=${HELIUS_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(heliusPayload),
    });

    const responseText = await response.text();
    console.log("\n📨 Helius API Response:");
    console.log("   Status:", response.status);
    console.log("   Body:", responseText);

    if (!response.ok) {
      console.error("❌ Helius API error");
      return NextResponse.json(
        { error: `Helius API error: ${response.status} - ${responseText}` },
        { status: response.status }
      );
    }

    const data = JSON.parse(responseText);

    const result = {
      success: true,
      webhookId: data.webhookID,
      address,
      network: network || "SOLANA_MAINNET",
      message: `Now watching ${address} for Solana transactions`,
    };

    console.log("\n✅ Webhook created successfully!");
    console.log("   Webhook ID:", data.webhookID);
    console.log("════════════════════════════════════════════════════════════════\n");

    return NextResponse.json(result);
  } catch (error) {
    console.error("\n❌ Helius watch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create webhook" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { webhookId, network } = await request.json();

    console.log("\n🗑️  Deleting Helius webhook:", webhookId);

    if (!webhookId) {
      return NextResponse.json({ error: "Webhook ID is required" }, { status: 400 });
    }

    if (!HELIUS_API_KEY) {
      return NextResponse.json({ error: "Helius API key not configured" }, { status: 500 });
    }

    // Use the correct API URL based on network
    const heliusApiUrl = getHeliusApiUrl(network || "mainnet");
    
    const response = await fetch(`${heliusApiUrl}/${webhookId}?api-key=${HELIUS_API_KEY}`, {
      method: "DELETE",
    });

    console.log("   Delete response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("   Delete error:", errorText);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete webhook error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete webhook" },
      { status: 500 }
    );
  }
}


