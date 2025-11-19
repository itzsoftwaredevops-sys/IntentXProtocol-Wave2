# Security Policy

## Overview

IntentX takes security seriously. This document outlines our security practices, known limitations, and how to report vulnerabilities.

## Security Measures

### Smart Contract Security

#### 1. OpenZeppelin Libraries

All contracts use battle-tested OpenZeppelin implementations:

```solidity
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
```

**Benefits**:
- Industry-standard security patterns
- Thoroughly audited code
- Regular security updates

#### 2. ReentrancyGuard

All state-changing functions use ReentrancyGuard modifier:

```solidity
function executeIntent(...) external nonReentrant {
    // Protected against reentrancy attacks
}
```

**Protects Against**:
- Reentrancy attacks
- Cross-function reentrancy
- Callback exploits

#### 3. SafeERC20

All token transfers use SafeERC20:

```solidity
using SafeERC20 for IERC20;

IERC20(token).safeTransfer(recipient, amount);
IERC20(token).safeTransferFrom(sender, recipient, amount);
```

**Prevents**:
- Silent transfer failures
- Non-standard ERC20 behavior
- Return value manipulation

#### 4. Access Control

Owner-based authorization on sensitive functions:

```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Unauthorized");
    _;
}

function updateIntentStatus(...) external onlyOwner {
    // Only authorized callers
}
```

#### 5. Input Validation

All inputs validated before processing:

```solidity
require(amount > 0, "Invalid amount");
require(token != address(0), "Invalid token");
require(deadline >= block.timestamp, "Expired");
```

**Validates**:
- Non-zero amounts
- Valid addresses
- Timestamp constraints
- Array lengths

### Backend Security

#### 1. Zod Schema Validation

All API endpoints validate requests:

```typescript
const intentSchema = z.object({
  naturalLanguage: z.string().min(1).max(500),
  network: z.enum(['blockdag', 'goerli', 'mumbai', 'hardhat'])
});

app.post('/api/intent/parse', async (req, res) => {
  const validated = intentSchema.parse(req.body);
  // Process validated data
});
```

**Prevents**:
- SQL injection (no database)
- XSS attacks
- Invalid data types
- Missing required fields

#### 2. CORS Configuration

Configured CORS with sensible defaults:

```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
```

#### 3. Session Security

Express sessions use secure secrets:

```typescript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
```

**Features**:
- HttpOnly cookies (prevent XSS)
- Secure flag in production
- Session expiration
- CSRF protection ready

#### 4. Rate Limiting (Recommended)

While not currently implemented, production deployments should add:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### Frontend Security

#### 1. Content Security Policy

Recommended CSP headers:

```
Content-Security-Policy: default-src 'self'; 
  script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data: https:;
```

#### 2. XSS Prevention

React's built-in XSS protection:
- Automatic escaping of user input
- No `dangerouslySetInnerHTML` usage
- Sanitized URL parameters

#### 3. Secure Environment Variables

Frontend uses Vite's env system:

```typescript
// Only VITE_ prefixed vars exposed to client
const apiUrl = import.meta.env.VITE_API_URL;

// Private keys stay server-side
const privateKey = process.env.PRIVATE_KEY; // Not accessible in client
```

## Known Limitations

### 1. Mock Wallet Connection

**Status**: Current implementation uses mock wallet  
**Risk**: No real private key handling  
**Mitigation**: Production requires Web3 provider (MetaMask, WalletConnect)

### 2. In-Memory Storage

**Status**: Uses MemStorage (not persistent)  
**Risk**: Data lost on server restart  
**Mitigation**: Production should use database (PostgreSQL, MongoDB)

### 3. Simulated Transactions

**Status**: Demo mode simulates blockchain interactions  
**Risk**: No real on-chain security testing  
**Mitigation**: Deploy to testnet for real transaction testing

### 4. No Contract Audits (Yet)

**Status**: Contracts not professionally audited  
**Risk**: Potential undiscovered vulnerabilities  
**Mitigation**: 
- Using audited OpenZeppelin libs
- 48 unit tests covering core functionality
- Recommend audit before mainnet deployment

### 5. Centralized Intent Parsing

**Status**: Backend parses intents (not on-chain)  
**Risk**: Trust in backend parsing logic  
**Mitigation**: Plan for decentralized solver network in Phase 2

## Attack Vectors & Mitigations

### 1. Reentrancy Attacks

**Vector**: Malicious contract calls back during execution  
**Mitigation**: ReentrancyGuard on all state-changing functions

**Example Protection**:
```solidity
function withdraw(...) external nonReentrant {
    // Safe from reentrancy
}
```

### 2. Front-Running

**Vector**: MEV bots see intent in mempool and front-run  
**Mitigation**: 
- Flashbots integration (planned)
- Private transaction pools
- Slippage protection

### 3. Intent Manipulation

**Vector**: Attacker modifies intent before execution  
**Mitigation**:
- Intent hash verification
- User signature required
- Immutable once registered

```solidity
function registerIntent(...) external {
    bytes32 intentId = keccak256(abi.encodePacked(
        msg.sender,
        naturalLanguage,
        block.timestamp
    ));
    // Intent ID tied to user and timestamp
}
```

### 4. Gas Griefing

**Vector**: Intentionally high gas estimates to DoS  
**Mitigation**:
- Gas estimation caps
- Multi-oracle gas price feeds
- User-adjustable gas limits

### 5. Oracle Manipulation

**Vector**: Fake price data for swaps  
**Mitigation**:
- Chainlink price feeds (planned)
- Multi-oracle aggregation
- TWAP (Time-Weighted Average Price)

### 6. Smart Contract Bugs

**Vector**: Logic errors in contracts  
**Mitigation**:
- Comprehensive unit tests (48 tests)
- OpenZeppelin patterns
- Static analysis tools
- Manual code review

## Security Best Practices for Users

### 1. Wallet Security

- **Never share private keys**: IntentX never asks for private keys
- **Use hardware wallets**: Ledger, Trezor for large amounts
- **Enable transaction signing**: Always verify before signing
- **Check addresses**: Verify contract addresses match official docs

### 2. Transaction Safety

- **Review parsed intents**: Always check steps before executing
- **Set slippage limits**: Protect against unexpected price changes
- **Monitor gas prices**: Don't overpay during peak times
- **Start small**: Test with small amounts first

### 3. Network Selection

- **Verify network**: Ensure you're on intended network (BlockDAG, etc.)
- **Check explorer links**: Confirm transactions on block explorer
- **Use testnets first**: Try on testnet before mainnet

### 4. Phishing Protection

- **Bookmark official URL**: Don't trust links in emails/messages
- **Verify SSL certificate**: Look for HTTPS and valid certificate
- **Check domain carefully**: intents-x.io ≠ intentx.io
- **No unsolicited contact**: We never DM first

## Responsible Disclosure

### Reporting Vulnerabilities

If you discover a security vulnerability, please email:

**Email**: security@intentx.io

**PGP Key**: Available at https://intentx.io/pgp-key.txt

### What to Include

1. **Description**: Clear explanation of the vulnerability
2. **Steps to Reproduce**: Detailed reproduction steps
3. **Impact Assessment**: Potential damage/exploit
4. **Proof of Concept**: Code/screenshots (if applicable)
5. **Suggested Fix**: Proposed solution (optional)

### Response Timeline

- **Initial Response**: Within 24 hours
- **Status Update**: Within 72 hours
- **Fix Deployed**: Severity-dependent (see below)

### Severity Levels

| Level | Response Time | Examples |
|-------|---------------|----------|
| **Critical** | 24 hours | Private key exposure, fund theft |
| **High** | 3 days | Reentrancy, unauthorized access |
| **Medium** | 7 days | DoS, gas griefing |
| **Low** | 14 days | Information disclosure, UI bugs |

### Bug Bounty (Coming Soon)

We plan to launch a bug bounty program with rewards:

- **Critical**: $5,000 - $10,000
- **High**: $1,000 - $5,000
- **Medium**: $250 - $1,000
- **Low**: $50 - $250

## Audit History

### Current Status

**No audits completed yet.**

### Planned Audits

1. **Q1 2026**: Internal security review
2. **Q2 2026**: External audit (Trail of Bits, OpenZeppelin, or similar)
3. **Q3 2026**: Formal verification of critical paths

## Security Roadmap

### Phase 1: Foundation (Current)
- ✅ OpenZeppelin libraries
- ✅ ReentrancyGuard
- ✅ SafeERC20
- ✅ Input validation
- ✅ 48 unit tests

### Phase 2: Hardening
- [ ] Professional security audit
- [ ] Formal verification
- [ ] Mainnet deployment
- [ ] Bug bounty program
- [ ] Rate limiting
- [ ] DDoS protection

### Phase 3: Advanced
- [ ] Decentralized solver network
- [ ] MEV protection (Flashbots)
- [ ] Multi-sig governance
- [ ] Timelock contracts
- [ ] Insurance fund

## Incident Response

### In Case of Security Incident

1. **Detect**: Monitoring, user reports, automated alerts
2. **Assess**: Severity, impact, affected users
3. **Contain**: Pause contracts (if necessary), isolate issue
4. **Communicate**: Public disclosure, user notifications
5. **Fix**: Deploy patches, update contracts
6. **Review**: Post-mortem, lessons learned

### Emergency Contacts

- **Security Team**: security@intentx.io
- **Discord**: #security-alerts channel
- **Twitter**: [@IntentX_Security](https://twitter.com/IntentX_Security)

## Compliance

### Data Privacy

- **No PII Collection**: IntentX doesn't collect personal data
- **Wallet Addresses Only**: Only blockchain addresses stored
- **GDPR Compliant**: Right to be forgotten (delete intents)
- **No Tracking**: No third-party analytics (optional)

### Regulatory

- **Not Financial Advice**: IntentX is a tool, not financial advisor
- **User Responsibility**: Users responsible for tax compliance
- **Terms of Service**: Must accept before using
- **Age Restriction**: 18+ only

## Additional Resources

- **OpenZeppelin Security**: https://docs.openzeppelin.com/contracts/security
- **Smart Contract Best Practices**: https://consensys.github.io/smart-contract-best-practices/
- **Solidity Security**: https://solidity.readthedocs.io/en/latest/security-considerations.html
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/

## Questions?

For security-related questions:
- **Email**: security@intentx.io
- **Discord**: #security channel
- **Documentation**: https://docs.intentx.io/security

---

**Last Updated**: November 19, 2025  
**Version**: 1.0.0

**Security is a shared responsibility. Stay vigilant, stay safe.**
