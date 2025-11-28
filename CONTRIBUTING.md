# Contributing to IntentX

Thank you for your interest in contributing to IntentX! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How to Contribute

### Reporting Bugs

Before creating bug reports, check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and the expected behavior**
- **Explain why this enhancement would be useful**

### Pull Requests

- Fill in the required template
- Follow the [JavaScript/TypeScript styleguides](#styleguides)
- Include appropriate test cases
- End all files with a newline

## Development Setup

### Prerequisites

```bash
node --version    # v20.19.3 or higher
npm --version     # v10 or higher
git --version     # for version control
```

### Local Development

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/intentx.git
   cd intentx
   ```

3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/blockdag/intentx.git
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

6. Start development server:
   ```bash
   npm run dev
   ```

7. Make your changes and test thoroughly

### Running Tests

```bash
# All tests
npm run test:all

# API tests
npm run test:api

# Component tests
npm run test:components

# Type checking
npm run check

# Linting
npm run lint
```

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- Example:
  ```
  Add batch intent processing API
  
  Enables processing up to 100 intents in parallel
  Improves performance for portfolio rebalancing
  
  Closes #123
  ```

### TypeScript/JavaScript Style

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable names
- Add comments for complex logic
- Use Zod for input validation

Example:
```typescript
import { z } from 'zod'

// Use schema validation
const swapIntentSchema = z.object({
  fromToken: z.string().min(1),
  toToken: z.string().min(1),
  amount: z.string().regex(/^\d+\.?\d*$/),
})

export async function parseSwapIntent(data: unknown) {
  return swapIntentSchema.parse(data)
}
```

### React Component Style

- Use functional components with hooks
- Add `data-testid` attributes to interactive elements
- Use Shadcn UI components
- Include TypeScript types for props

Example:
```typescript
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'

interface VaultProps {
  vaultId: string
  onStake?: (amount: string) => void
}

export function VaultCard({ vaultId, onStake }: VaultProps) {
  const { data: vault, isLoading } = useQuery({
    queryKey: [`/api/vaults/${vaultId}`],
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h3>{vault?.name}</h3>
      <Button 
        onClick={() => onStake?.('100')}
        data-testid="button-stake"
      >
        Stake
      </Button>
    </div>
  )
}
```

### Solidity Smart Contracts

- Use Solidity 0.8.24+
- Follow OpenZeppelin standards
- Include comprehensive NatSpec documentation
- Add event logging for all state changes

Example:
```solidity
/// @notice Execute a swap intent on Uniswap
/// @param fromToken Address of input token
/// @param toToken Address of output token
/// @param amount Amount of input tokens
/// @return outputAmount Amount of output tokens received
function swap(
    address fromToken,
    address toToken,
    uint256 amount
) external returns (uint256 outputAmount) {
    // Implementation
    emit Swap(msg.sender, fromToken, toToken, amount, outputAmount);
    return outputAmount;
}
```

## Project Structure

```
intentx/
├── client/src/              # React frontend
│   ├── pages/              # Page components
│   ├── components/         # Reusable components
│   └── lib/               # Utilities
├── server/                 # Express backend
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Data management
│   └── tests/             # API tests
├── contracts/             # Solidity contracts
│   ├── IntentRegistry.sol
│   └── ExecutionManager.sol
└── docs/                  # Documentation
```

## Documentation

- All significant features should have documentation in the `docs/` folder
- Update README.md if adding new features
- Add inline code comments for complex logic
- Keep documentation up-to-date with code changes

## Testing Requirements

For pull requests to be merged:

- ✅ All existing tests must pass
- ✅ New features must include tests
- ✅ Test coverage should not decrease
- ✅ Type checking must pass (`npm run check`)

### Writing Tests

**API Tests:**
```typescript
async function testMyEndpoint(): Promise<TestResult> {
  const start = performance.now()
  try {
    const res = await fetch(`${API_BASE}/my-endpoint`)
    if (!res.ok) throw new Error(`Status ${res.status}`)
    const data = await res.json()
    
    if (!data.expectedField) {
      throw new Error('Missing expected field')
    }
    
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

**Component Tests:**
```typescript
function testMyComponent() {
  const testCases = [
    {
      name: 'Component renders without errors',
      check: () => document.querySelector('[data-testid="my-component"]') !== null,
    },
    {
      name: 'Button has correct data-testid',
      check: () => document.querySelector('[data-testid="button-submit"]') !== null,
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
      results.push({
        component: 'MyComponent',
        test: testCase.name,
        status: 'fail',
        error: String(error),
      })
    }
  }
}
```

## Review Process

1. Submit a pull request with a clear description
2. Link any related issues
3. Ensure all checks pass (tests, type checking, etc.)
4. Request review from maintainers
5. Address feedback and push updates
6. Once approved, your PR will be merged

## Release Process

Releases follow Semantic Versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

## Community

- **GitHub Issues**: For bug reports and feature requests
- **Discussions**: For questions and ideas
- **Discord** (if applicable): For real-time chat

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- GitHub contributors page
- Release notes for significant contributions

---

## Additional Notes

- Be respectful and constructive in all interactions
- Help others learn and grow
- Share knowledge and experience
- Celebrate contributions from the community

Thank you for contributing to IntentX! 🎉
