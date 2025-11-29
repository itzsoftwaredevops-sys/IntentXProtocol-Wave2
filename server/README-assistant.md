# AI Assistant & Intent Parser Guide

## Overview

The AI Assistant module provides natural language intent parsing and conversational support for IntentX. It features:

- **Deterministic Intent Parser**: Rules-based NLP using regex and token mapping
- **Optional OpenAI Integration**: LLM-powered parsing for improved accuracy
- **Multi-turn Chat**: Conversational assistant with context awareness
- **Knowledge Base RAG**: FAQ matching and strategic recommendations
- **Intent Logging**: Parsed intents saved for auditing and analytics

## Quick Start

### 1. Enable Mock Mode (Default)

No additional configuration needed. The system uses deterministic parsing:

```bash
# Just start the server
npm run dev
```

Test with:

```bash
curl -X POST http://localhost:5000/api/intent/parse \
  -H "Content-Type: application/json" \
  -d '{"intent": "Swap 10 ETH for USDC with low slippage"}'
```

Expected response:

```json
{
  "success": true,
  "parsed": {
    "action": "swap",
    "tokenIn": "ETH",
    "tokenOut": "USDC",
    "amount": "10",
    "minReturn": "9.8",
    "route": ["MockDEX"],
    "explanation": "Swap 10 ETH for USDC with MockDEX route. Max slippage: 2.00%",
    "source": "mock",
    "timestamp": "2025-11-29T04:45:00Z"
  }
}
```

### 2. Enable OpenAI Integration (Optional)

To use GPT-3.5 for enhanced parsing:

#### Step 1: Get API Key

1. Visit [OpenAI API Keys](https://platform.openai.com/api/keys)
2. Create a new API key
3. Copy the key (keep it secret!)

#### Step 2: Set Environment Variable

**Option A: Local Development (.env.local)**

```bash
echo "OPENAI_API_KEY=sk-..." >> .env.local
```

**Option B: Replit Secrets**

1. Go to **Secrets** tab in Replit
2. Click **Add Secret**
3. Name: `OPENAI_API_KEY`
4. Value: `sk-...` (your API key)
5. Click **Add Secret**

#### Step 3: Verify Configuration

```bash
# Check if key is available
echo "OPENAI_API_KEY is set: $([ -n "$OPENAI_API_KEY" ] && echo 'YES' || echo 'NO')"
```

#### Step 4: Test LLM Parsing

```bash
curl -X POST http://localhost:5000/api/intent/parse \
  -H "Content-Type: application/json" \
  -d '{"intent": "I want to maximize my yield on 1000 USDC while keeping risk low"}'
```

Expected response with LLM:

```json
{
  "success": true,
  "parsed": {
    "action": "supply",
    "tokenIn": "USDC",
    "amount": "1000",
    "minReturn": "990",
    "route": ["Vault", "YieldFarm"],
    "explanation": "Supply 1000 USDC to high-yield vault with conservative risk profile",
    "source": "llm",
    "llmConfidence": 0.92,
    "timestamp": "2025-11-29T04:45:00Z"
  }
}
```

## API Reference

### POST /api/intent/parse

Parse natural language into structured intent.

**Request:**

```json
{
  "intent": "Swap 1 ETH to USDC with at least 980 USDC"
}
```

**Response:**

```json
{
  "success": true,
  "parsed": {
    "action": "swap",
    "tokenIn": "ETH",
    "tokenOut": "USDC",
    "amount": "1",
    "minReturn": "0.98",
    "route": ["MockDEX"],
    "explanation": "Swap 1 ETH for USDC with MockDEX route. Max slippage: 2.00%",
    "source": "mock" | "llm",
    "llmConfidence": 0.85, // only if source is "llm"
    "timestamp": "2025-11-29T04:45:00Z"
  },
  "message": "Intent parsed: swap - Swap 1 ETH for USDC..."
}
```

**Supported Actions:**

- `swap` - Token exchange
- `stake` - Deposit for staking rewards
- `supply` - Deposit to lending pool
- `borrow` - Borrow against collateral

### POST /api/assistant/query

Chat with the AI assistant.

**Request:**

```json
{
  "message": "What's the best strategy for 1000 USDC?",
  "intentId": "intent-123",
  "walletAddress": "0x...",
  "conversationHistory": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! How can I help?" }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "response": "For 1000 USDC, I recommend: 1) Start with a conservative vault (5-7% APY), 2) Once comfortable, consider mixing in medium-risk yield farms, 3) Rebalance monthly",
  "context": {
    "message": "What's the best strategy for 1000 USDC?",
    "intentId": "intent-123",
    "walletAddress": "0x...",
    "history": [...]
  },
  "suggestions": [
    "Compare APY across different vaults",
    "Consider Conservative strategy for lower risk"
  ],
  "timestamp": "2025-11-29T04:45:00Z"
}
```

### GET /api/assistant/parsed-intents

List recently parsed intents (debugging/analytics).

**Response:**

```json
{
  "success": true,
  "count": 47,
  "recent": [
    {
      "action": "swap",
      "tokenIn": "ETH",
      "tokenOut": "USDC",
      "amount": "1",
      "minReturn": "0.98",
      "source": "mock",
      "timestamp": "2025-11-29T04:45:00Z"
    }
  ]
}
```

## Implementation Details

### Deterministic Parser (Mock Mode)

Located in `server/intent-parser.ts`, the deterministic parser uses:

1. **Action Detection** (regex):
   - `swap` ← matches: "swap", "exchange", "trade"
   - `stake` ← matches: "stake", "lock"
   - `supply` ← matches: "lend", "supply", "deposit"
   - `borrow` ← matches: "borrow", "take loan"

2. **Token Extraction** (regex):
   - Matches patterns like "10 ETH" or "100.5 USDC"
   - Consults `server/data/tokens.json` for normalization
   - Falls back to defaults if unknown

3. **Slippage Calculation**:
   - "low slippage" → 1% slippage
   - "high slippage" or "aggressive" → 5% slippage
   - Default → 2% slippage

4. **Route Selection**:
   - "multiple" / "split" → Multi-hop routes
   - Default → Direct MockDEX route

### Token Database (`server/data/tokens.json`)

Maps token symbols to metadata:

```json
{
  "ETH": {
    "symbol": "ETH",
    "address": "0x...",
    "decimals": 18,
    "riskTag": "stable"
  }
}
```

Add more tokens by editing this file.

### FAQ Database (`server/data/faq.json`)

Contains:

- **10+ FAQ entries** - Common questions about swaps, vaults, gas, security
- **4 strategy hints** - Conservative, Maximize Yield, Growth, Gas Optimization
- **4 risk alerts** - Liquidation, Slippage, Impermanent Loss, Smart Contract Risk

### Intent Logging (`server/data/parsed_intents.json`)

Automatically logs all parsed intents (max 100 recent entries). Use for:

- Auditing
- Analytics
- Debugging
- User intent history

## OpenAI Configuration Details

### How It Works

1. **Check**: System checks if `OPENAI_API_KEY` environment variable is set
2. **Try LLM**: Calls OpenAI API with parsed system prompt
3. **Fallback**: If API fails or key missing, uses deterministic parser
4. **Return**: Response includes `source: "llm"` or `source: "mock"`

### System Prompt

```
Parse DeFi intent from natural language into structured JSON.
Return only valid JSON with fields: action, tokenIn, tokenOut, amount, minReturn, route, explanation.
Be concise.
```

### Cost Estimation

- **Per request**: ~100-200 tokens = $0.0002-0.0004
- **1000 parses/day**: ~$0.20-0.40/day
- **Free tier**: First $5 credit covers ~12,000 parses

### Troubleshooting

**"OpenAI API error: 401 Unauthorized"**
- Check API key is correct in secrets/env
- Verify key hasn't expired

**"OpenAI API error: 429 Too Many Requests"**
- Rate limited - implement backoff
- Consider caching responses

**Parser returns "source": "mock" when expecting "llm"**
- OpenAI key not set or not accessible
- Check Replit Secrets configuration
- Fall back to deterministic mode works fine

## Security

### Input Validation

- Intent strings limited to 500 chars
- Messages limited to 1000 chars
- All inputs sanitized before logging

### API Key Protection

- **Never** commit API keys to git
- Use `.env.local` (gitignored) for local development
- Use Replit Secrets for production
- Keys not logged or exposed in responses

### Database Files

- `parsed_intents.json` - No sensitive data, only parsed intents
- `tokens.json` - Public token metadata
- `faq.json` - General knowledge base

## Testing

### Test Deterministic Parser

```bash
curl -X POST http://localhost:5000/api/intent/parse \
  -H "Content-Type: application/json" \
  -d '{"intent": "Stake 5 ETH for rewards"}'
```

### Test Assistant Chat

```bash
curl -X POST http://localhost:5000/api/assistant/query \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I minimize slippage?"}'
```

### View Parsed Intent Logs

```bash
curl http://localhost:5000/api/assistant/parsed-intents
```

### View FAQ Database

```bash
cat server/data/faq.json | jq '.faqs | length'
```

## Customization

### Add Custom Tokens

Edit `server/data/tokens.json`:

```json
{
  "MYTOKEN": {
    "symbol": "MYTOKEN",
    "address": "0x...",
    "decimals": 18,
    "riskTag": "high"
  }
}
```

### Add FAQ Entries

Edit `server/data/faq.json` and add to `faqs` array:

```json
{
  "id": "custom-1",
  "question": "Your question here?",
  "answer": "Your answer here."
}
```

### Modify Parser Logic

Edit `server/intent-parser.ts`:

- Update regex patterns in `parseIntentDeterministic()`
- Add new token symbols
- Adjust slippage thresholds
- Change route selection logic

## Monitoring

### Check Health

```bash
# Parser working?
curl http://localhost:5000/api/intent/parse -X POST -d '{"intent":"swap"}' -H "Content-Type: application/json" | jq .success

# Assistant working?
curl http://localhost:5000/api/assistant/query -X POST -d '{"message":"hello"}' -H "Content-Type: application/json" | jq .success

# Intent logs growing?
curl http://localhost:5000/api/assistant/parsed-intents | jq .count
```

## Performance Notes

- **Deterministic parsing**: <50ms
- **OpenAI parsing**: 500-2000ms (depends on network)
- **FAQ matching**: <10ms
- **Intent logging**: File I/O, <100ms

## Future Enhancements

1. **Advanced NLP**: Fine-tuned LLM for DeFi-specific language
2. **Intent Optimization**: Auto-suggest better execution strategies
3. **Multi-language**: Support Spanish, Chinese, etc.
4. **Intent History**: Personal user intent timeline
5. **Feedback Loop**: Learn from user corrections

---

**Version**: 1.0 (Production Ready)  
**Last Updated**: November 29, 2025
