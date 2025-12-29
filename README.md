# Zynthex

**AI Automation for Crypto Payments**

Zynthex is a workflow automation platform that lets you monitor crypto wallets, process transactions with AI, and trigger automated actions. Think Zapier, but built specifically for crypto payments.

## Features

- **🔮 Wallet Monitoring** - Watch Phantom (Solana) and MetaMask wallets for incoming transactions in real-time via Helius webhooks
- **🤖 AI Processing** - Use OpenAI GPT-4 to analyze transactions, generate receipts, categorize payments, and make smart decisions
- **📧 Automated Notifications** - Send emails via Gmail when payments arrive, with full variable interpolation
- **🔗 Visual Workflow Builder** - Drag-and-drop n8n-style interface to connect triggers, AI, and actions
- **⚡ Real-time Execution** - Workflows execute instantly when transactions are detected on-chain

## How It Works

1. **Create a Workflow** - Add a Phantom or MetaMask watch trigger to monitor your wallet address
2. **Add AI Processing** - Connect an OpenAI node to analyze transaction data
3. **Configure Actions** - Set up Gmail to send receipts or notifications
4. **Go Live** - Activate your workflow and watch it run automatically

## Example Workflow

```
[Phantom Watch] → [OpenAI] → [Gmail]
     │                │          │
     │                │          └── Send payment receipt email
     │                └── Generate receipt from transaction data
     └── Trigger on SOL/token transfer to your wallet
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, React Flow, Tailwind CSS
- **Backend**: Next.js API Routes, Drizzle ORM
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth with Google OAuth
- **Blockchain**: Helius API for Solana webhooks
- **AI**: OpenAI GPT-4
- **Email**: Gmail API with OAuth

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account
- Helius API key (for Solana webhooks)
- OpenAI API key
- Google Cloud credentials (for Gmail)

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Helius (Solana)
HELIUS_API_KEY=

# OpenAI
OPENAI_API_KEY=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# App URL (for OAuth callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/zynthex.git
cd zynthex

# Install dependencies
pnpm install

# Run database migrations
pnpm migrate

# Start development server
pnpm dev
```

## Node Types

| Node | Type | Description |
|------|------|-------------|
| Phantom Watch | Trigger | Monitors Solana wallet for transactions via Helius |
| MetaMask Watch | Trigger | Monitors EVM wallet for transactions |
| OpenAI | Action | Processes data with GPT-4, supports variable interpolation |
| Gmail | Action | Sends emails via Gmail API with OAuth |
| Google Sheets | Action | Appends data to spreadsheets |

## Variable Interpolation

Use `{{nodes.nodeId.field}}` syntax to reference data from previous nodes:

```
{{nodes.phantom_abc123.amount}} - Transaction amount
{{nodes.phantom_abc123.sender}} - Sender address
{{nodes.openai_xyz789.response}} - AI-generated text
```

## API Endpoints

- `POST /api/webhooks/helius/[workflowId]` - Helius webhook receiver
- `POST /api/workflows/execute` - Manual workflow execution
- `POST /api/workflows/test-node` - Test individual node execution
- `GET /api/auth/google` - Google OAuth initiation
- `GET /api/auth/google/callback` - Google OAuth callback

## License

MIT

---

Built for hackathon by the zynthex team 🚀

