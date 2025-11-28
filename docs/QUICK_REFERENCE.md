# IntentX Quick Reference

**Copy-paste solutions for common tasks**

---

## 🚀 Start Development

```bash
npm run dev
# Server: http://localhost:5000
# Frontend: http://localhost:5000
```

## 📝 Create New Page

1. Create file: `client/src/pages/my-page.tsx`
2. Add route in `client/src/App.tsx`
3. Add navigation in `client/src/components/sidebar.tsx`

## 🔌 Add API Endpoint

```typescript
// server/routes.ts
app.get('/api/my-endpoint', async (req, res) => {
  res.json({ data: 'hello' })
})

// Call from frontend
const data = await fetch('/api/my-endpoint')
```

## 🧪 Test Your Code

```bash
npm run test:api         # API tests
npm run test:components  # Component tests
npm run test:all         # Everything (needs Node 22+)
```

## 🎯 Deploy to Live

```bash
# Replit: Already live! Share URL:
# https://your-project.replit.dev

# Or make public:
Share → Make Public → Copy URL
```

## 🛠️ Switch Networks

Frontend automatically supports all 4 networks:
- BlockDAG Testnet (primary)
- Ethereum Goerli
- Polygon Mumbai
- Hardhat Local

Users can switch via Network Selector button.

## 📚 Key Files

| File | Purpose |
|------|---------|
| `client/src/App.tsx` | Routes, sidebar config |
| `server/routes.ts` | All API endpoints |
| `server/storage.ts` | Data management |
| `tsconfig.json` | TypeScript config |
| `package.json` | Dependencies, scripts |

## ⚡ Performance Targets

- Single intent: < 300ms ✅
- Batch 10: < 600ms ✅
- Batch 100: < 2.5s ✅
- Page load: < 2s ✅

## 🔐 Security Checklist

- [ ] Set SESSION_SECRET in Secrets
- [ ] Use Zod for validation
- [ ] No secrets in code
- [ ] CORS configured
- [ ] Input sanitized

## 🐛 Debugging

```bash
# See logs in Replit UI (Logs tab)
# Or local terminal

# Check API
curl http://localhost:5000/api/analytics/summary

# Check type errors
npm run check

# Check frontend
F12 → Console → Look for errors
```

## 📖 Full Docs

- README.md - Overview
- DEPLOYMENT_GUIDE.md - Deploying
- GETTING_STARTED.md - Learning
- TEST_SUITE.md - Testing
- WAVE2.md - Advanced features
