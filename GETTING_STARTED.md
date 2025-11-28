# Getting Started with IntentX

**A Complete Developer Guide**

---

## 🎯 What is IntentX?

IntentX is an **intent-based DeFi aggregator** that lets users express financial goals in natural language and automatically executes them across multiple blockchains.

**Simple Example:**
```
User: "Swap 100 USDC for ETH and stake the ETH"
System: Parses → Optimizes → Executes → Confirms (all in <2 seconds)
```

---

## 🚀 5-Minute Quick Start

### 1. Open in Replit

```bash
# Already in Replit? Skip to step 2
# If not, click "Open in Replit" or:
# https://replit.com/your-project-url
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The app opens at `http://localhost:5000` with:
- ✅ Hot reload on save
- ✅ Backend API running
- ✅ Frontend ready

### 4. Explore the App

```
http://localhost:5000
├── Dashboard (overview)
├── Intent Lab (try creating an intent)
├── Vaults (stake/lend)
├── Analytics (performance)
└── ... 6 more pages
```

### 5. Test the API

```bash
# In another terminal:
curl http://localhost:5000/api/analytics/summary

# Or use the API in your code:
const res = await fetch('http://localhost:5000/api/vaults')
const vaults = await res.json()
```

---

## 📁 Project Structure

### Frontend (`client/src/`)

```
client/src/
├── pages/                    # 9 full pages
│   ├── dashboard.tsx        # Portfolio overview
│   ├── intent-lab.tsx       # Create & execute intents
│   ├── vaults.tsx           # Stake/lend interface
│   ├── execution-explorer.tsx # Intent tracking
│   ├── analytics.tsx        # Performance charts
│   ├── ai-support.tsx       # AI assistant
│   ├── faq.tsx              # Help section
│   ├── wallet-profile.tsx   # User profile
│   └── settings.tsx         # App settings
├── components/              # Reusable UI
│   ├── network-selector.tsx # Switch chains
│   ├── wallet-connect.tsx   # Wallet integration
│   └── sidebar.tsx          # Navigation
├── lib/                     # Utilities
│   ├── queryClient.ts       # API client (TanStack Query)
│   └── utils.ts             # Helpers
└── App.tsx                  # Main router
```

### Backend (`server/`)

```
server/
├── routes.ts                # 50+ API endpoints
├── storage.ts               # In-memory data store
├── index.ts                 # Express server
├── off-chain-executor.ts    # Relayer simulation
├── route-optimizer.ts       # RAG route optimization
├── bridge-router.ts         # Cross-chain routing
├── ai-support.ts            # AI responses
├── faq-knowledge.json       # FAQ database
└── mock-intents.ts          # Sample data
```

### Smart Contracts (`contracts/`)

```
contracts/
├── IntentRegistry.sol       # Intent storage
├── ExecutionManager.sol     # Multi-step orchestration
└── mocks/
    ├── MockRouter.sol       # DEX simulation
    ├── MockPair.sol         # Liquidity pool
    ├── LendingPoolMock.sol  # Lending protocol
    ├── StakingVault.sol     # Yield farming
    └── MockERC20.sol        # Test token
```

---

## 🔧 Common Tasks

### Create a New Page

```typescript
// 1. Create: client/src/pages/my-feature.tsx
import { useQuery } from '@tanstack/react-query'

export default function MyFeature() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/my-endpoint'],
  })

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {data && <div>{JSON.stringify(data)}</div>}
    </div>
  )
}

// 2. Register in App.tsx
import MyFeature from './pages/my-feature'

<Route path="/my-feature" component={MyFeature} />

// 3. Add to sidebar navigation
// client/src/components/sidebar.tsx
```

### Add an API Endpoint

```typescript
// 1. Add route in server/routes.ts
app.get('/api/my-endpoint', async (req, res) => {
  try {
    const data = await storage.getData()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Failed' })
  }
})

// 2. Call from frontend
const res = await fetch('/api/my-endpoint')
const data = await res.json()

// Or with TanStack Query
const { data } = useQuery({
  queryKey: ['/api/my-endpoint'],
})
```

### Add a Component

```typescript
// client/src/components/my-component.tsx
import { Button } from '@/components/ui/button'

export function MyComponent() {
  return (
    <div className="flex gap-4">
      <Button data-testid="button-submit">Submit</Button>
    </div>
  )
}

// Use it
import { MyComponent } from '@/components/my-component'

export default function Page() {
  return <MyComponent />
}
```

### Run Tests

```bash
# API tests
npm run test:api

# Component tests
npm run test:components

# Smart contracts (requires Node.js 22+)
npm test

# All tests
npm run test:all
```

---

## 📚 Key Features Explained

### 1. Natural Language Intent Parsing

```typescript
// User input
"Swap 100 USDC for ETH on Uniswap"

// Parsed into steps
{
  steps: [
    {
      action: 'swap',
      from: 'USDC',
      to: 'ETH',
      amount: '100',
      protocol: 'Uniswap'
    }
  ]
}

// Code: server/routes.ts → parseIntent()
```

### 2. Batch Intent Processing

```bash
# Process 10-100 intents in parallel
curl -X POST http://localhost:5000/api/intents/batch \
  -H "Content-Type: application/json" \
  -d '{
    "intents": [
      { "description": "Swap 100 USDC for ETH" },
      { "description": "Stake 50 ETH" },
      ...
    ]
  }'

# Returns in ~500ms for 10 intents
# Response includes: batchId, success count, metrics
```

### 3. Gasless Execution (Account Abstraction)

```bash
# Submit intent without paying gas
curl -X POST http://localhost:5000/api/intent/aa-gasless \
  -H "Content-Type: application/json" \
  -d '{
    "naturalLanguage": "Swap 100 USDC for ETH",
    "userOperation": {...}
  }'

# Returns: Zero gas cost ✅
```

### 4. Route Optimization (RAG)

```bash
# Get best route for a swap
curl -X POST http://localhost:5000/api/optimizer/optimize-route \
  -H "Content-Type: application/json" \
  -d '{
    "fromToken": "USDC",
    "toToken": "ETH",
    "amount": "100"
  }'

# Returns: Best route with slippage, gas, impact analysis
```

### 5. Cross-Chain Bridge Routing

```bash
# Find route when liquidity is insufficient on primary chain
curl -X POST http://localhost:5000/api/bridge/find-route \
  -H "Content-Type: application/json" \
  -d '{
    "primaryChainId": 808080,
    "token": "USDC",
    "amount": "1000"
  }'

# Returns: Best destination chain for routing
```

---

## 🎨 Design System

### Colors (Dark Theme)

```
Background: bg-gray-950/900
Primary: blue-600 / blue-400
Secondary: gray-700
Text: white (primary), gray-300 (secondary), gray-500 (tertiary)
Danger: red-600
Success: green-600
Warning: amber-600
```

### Components from Shadcn UI

```typescript
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
// ... 50+ components available
```

### Icons

```typescript
// From lucide-react (800+ icons)
import { Send, Loader, CheckCircle2, AlertCircle } from 'lucide-react'

// Company logos from react-icons
import { SiEthereum, SiPolygon } from 'react-icons/si'
```

---

## 🔗 API Reference

### Authentication

```
No authentication needed (development mode)

For production, add:
- API Key validation
- JWT tokens
- Rate limiting middleware
```

### Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "timestamp": "2024-11-28T10:30:00Z"
}
```

### Common Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/analytics/summary` | Portfolio metrics |
| GET | `/api/intents` | List all intents |
| POST | `/api/intents` | Create intent |
| GET | `/api/vaults` | List vaults |
| POST | `/api/vaults/action` | Stake/unstake |
| POST | `/api/intents/batch` | Batch processing |
| POST | `/api/intent/aa-gasless` | Gasless execution |
| POST | `/api/executor/sign-intent` | Sign intent |
| POST | `/api/optimizer/optimize-route` | Optimize route |
| POST | `/api/bridge/find-route` | Cross-chain routing |

---

## 🧪 Testing

### Write an API Test

```typescript
// server/tests/api.test.ts
async function testMyEndpoint(): Promise<TestResult> {
  const start = performance.now()
  try {
    const res = await fetch(`${API_BASE}/my-endpoint`)
    if (!res.ok) throw new Error(`Status ${res.status}`)
    const data = await res.json()
    
    // Validate response
    if (!data.expectedField) throw new Error('Missing field')
    
    return {
      name: 'GET /api/my-endpoint',
      status: 'pass',
      duration: performance.now() - start,
    }
  } catch (error) {
    return {
      name: 'GET /api/my-endpoint',
      status: 'fail',
      duration: performance.now() - start,
      error: String(error),
    }
  }
}
```

### Write a Component Test

```typescript
// client/src/tests/components.test.ts
function testMyComponent() {
  const testCases = [
    {
      name: 'Component renders',
      check: () => document.querySelector('[data-testid="my-element"]') !== null,
    },
  ]
  
  for (const testCase of testCases) {
    try {
      const passed = testCase.check()
      results.push({
        component: 'MyComponent',
        test: testCase.name,
        status: passed ? 'pass' : 'fail',
      })
    } catch (error) {
      // Handle error
    }
  }
}
```

---

## 🚀 Performance Tips

### Frontend

```typescript
// 1. Use React Query cache effectively
useQuery({
  queryKey: ['/api/vaults'],
  staleTime: 5 * 60 * 1000,  // Don't refetch for 5min
})

// 2. Lazy load pages
const IntentLab = lazy(() => import('./pages/intent-lab'))

// 3. Use memo for expensive components
const VaultCard = memo(({ vault }) => (...))

// 4. Optimize images
import vaultImage from '@assets/vault.png'  // Auto-optimized
```

### Backend

```typescript
// 1. Use in-memory cache
const cache = new Map()

// 2. Batch similar operations
Promise.all([...])

// 3. Add response caching headers
res.set('Cache-Control', 'public, max-age=300')

// 4. Use connection pooling (for DB)
const pool = new Pool({ max: 10 })
```

---

## 🔐 Security Best Practices

### Secrets Management

```bash
# Never commit secrets to git
# Replit: Settings → Secrets tab

# Add secrets:
SESSION_SECRET=your_secret_key
DATABASE_URL=postgresql://...
PRIVATE_KEY=0x...

# Access in code:
const secret = process.env.SESSION_SECRET
```

### Input Validation

```typescript
// Use Zod for validation
import { z } from 'zod'

const swapSchema = z.object({
  fromToken: z.string().min(1),
  toToken: z.string().min(1),
  amount: z.string().regex(/^\d+\.?\d*$/),
})

// Validate request
const validated = swapSchema.parse(req.body)
```

### API Security

```typescript
// 1. Validate request headers
app.use((req, res, next) => {
  if (req.method === 'POST' && req.get('Content-Type') !== 'application/json') {
    return res.status(400).json({ error: 'Invalid content type' })
  }
  next()
})

// 2. Rate limiting
import rateLimit from 'express-rate-limit'
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
app.use('/api/', limiter)

// 3. CORS
app.use(cors({ origin: process.env.ALLOWED_ORIGINS }))
```

---

## 📈 Debugging

### Enable Verbose Logging

```bash
# Set debug environment variable
export DEBUG=express:*
npm run dev
```

### Check Browser Console

```
DevTools → Console
Look for: [vite] connecting messages
Error stack traces with file/line numbers
```

### Check Server Logs

```
Replit: Click "Logs" tab
See: HTTP requests, errors, warnings
Real-time output as events happen
```

### Use Debugging Tools

```
VS Code: Built-in debugger
Chrome DevTools: For frontend debugging
Postman: For API testing
```

---

## 🆘 Common Issues

| Problem | Solution |
|---------|----------|
| Port 5000 in use | Kill: `kill -9 $(lsof -t -i :5000)` |
| Node modules broken | Delete: `rm -rf node_modules && npm install` |
| Build errors | Check: `npm run check` for type errors |
| API not responding | Check logs, restart: `npm run dev` |
| Styles not loading | Clear cache, hard refresh: Ctrl+Shift+R |

---

## 📞 Need Help?

Check these files:
- **Features**: README.md
- **Advanced Features**: WAVE2.md
- **Testing**: TEST_SUITE.md
- **Performance**: PERF_REPORT.md
- **Security**: SECURITY.md
- **Deployment**: DEPLOYMENT_GUIDE.md

---

**Happy coding!** 🎉

For questions, check the docs or open an issue on GitHub.
