# Security Policy

## Reporting a Vulnerability

We take security very seriously. If you discover a security vulnerability in IntentX, please report it responsibly.

### How to Report

**Please DO NOT open a public GitHub issue for security vulnerabilities.**

Instead, email your report to: **security@intentx.dev**

Include the following information:

1. **Title**: Brief description of vulnerability
2. **Description**: Detailed explanation of the issue
3. **Affected Component**: Frontend, Backend, Smart Contracts, or Dependencies
4. **Steps to Reproduce**: How to trigger the vulnerability
5. **Potential Impact**: Severity and what could be compromised
6. **Suggested Fix**: Optional, but helpful

### Example Report

```
Subject: XSS Vulnerability in Intent Lab Component

The intent input field in the Intent Lab page does not properly escape 
user input, allowing XSS attacks.

Steps to Reproduce:
1. Go to Intent Lab page
2. Enter: <img src=x onerror="alert('xss')">
3. Submit intent
4. See alert box

Impact: Medium - Attacker can steal session cookies or user data

Suggested Fix: Use React.Fragment or ensure proper escaping
```

## Response Timeline

We commit to the following response times:

| Phase | Timeline | Action |
|-------|----------|--------|
| Acknowledgment | 24 hours | We'll confirm receipt of report |
| Initial Assessment | 48 hours | We'll assess severity and impact |
| Fix Development | 5-7 days | We'll develop and test the fix |
| Fix Release | 14 days | We'll release patched version |
| Public Disclosure | 30 days | Public disclosure and credit |

## Severity Levels

We classify vulnerabilities as follows:

### Critical (Score 9.0-10.0)
- Complete data breach
- RCE (Remote Code Execution)
- Authentication bypass
- Smart contract funds at risk

**Response**: Immediate hotfix release

### High (Score 7.0-8.9)
- Significant data exposure
- Denial of Service (DoS)
- Privilege escalation
- Smart contract functionality compromise

**Response**: Within 3-5 days

### Medium (Score 4.0-6.9)
- Partial data exposure
- Information disclosure
- Logical bypass
- Limited impact

**Response**: Within 7 days

### Low (Score 0.1-3.9)
- Minor issue
- Requires unusual configuration
- Limited scope

**Response**: Next regular release

## Vulnerability Disclosure

Once a security patch is released:

1. **Public Advisory**: GitHub Security Advisory published
2. **Credit**: Researcher name/organization credited (optional)
3. **Details**: Technical details published (after fix is available)
4. **Patch**: Update instructions provided

## Safe Harbor

We will not:
- Pursue civil action against researchers reporting good-faith vulnerabilities
- Report researchers to law enforcement for responsible disclosure
- Take action for authorized security research

We assume good faith. Please:
- Make reasonable attempts to avoid privacy violations
- Avoid interrupting or degrading our services
- Provide adequate time for remediation

## Dependency Security

### Regular Audits

```bash
# Run weekly
npm audit

# Fix vulnerabilities
npm audit fix

# Check for updates
npm outdated
```

### Automated Updates

- Dependabot configured for GitHub
- Weekly security scans
- Automatic PRs for minor updates
- Manual review for major updates

## Code Security

### Secure Coding Practices

1. **Input Validation**: All user input validated with Zod schemas
2. **Output Encoding**: React auto-escapes HTML
3. **Access Control**: Session-based authorization
4. **Data Protection**: Encryption in transit (HTTPS)
5. **Error Handling**: No sensitive data in error messages
6. **Logging**: Security events logged but no PII

### Code Review

All changes reviewed for:
- Security vulnerability patterns
- Dependency vulnerabilities
- Input/output validation
- Error handling
- Secret exposure

## Infrastructure Security

### Hosting Security (Replit)

- ✅ Auto HTTPS/TLS
- ✅ DDoS protection
- ✅ Automatic backups
- ✅ Access controls
- ✅ Audit logging

### Secrets Management

```bash
# Store secrets securely
Settings → Secrets tab → Add secret

# Access in code
process.env.SECRET_NAME

# Never commit
.gitignore includes .env files
```

### Database Security

For production deployments:

```typescript
// Use connection pooling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  ssl: { rejectUnauthorized: true }
})

// Use parameterized queries
const result = await pool.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]  // Parameterized - safe from injection
)
```

## Compliance

### Standards Met

- ✅ OWASP Top 10 mitigations
- ✅ CWE coverage
- ✅ Secure SDLC practices
- ✅ Dependency management
- ✅ Security testing

### Benchmarks

- ✅ npm audit: 0 vulnerabilities (after fixes)
- ✅ No known CVEs in dependencies
- ✅ Regular security reviews
- ✅ Automated security scanning

## Security Updates

### Update Frequency

- **Critical**: Hotfix release ASAP
- **High**: Within 3-5 days
- **Medium**: Within 1-2 weeks
- **Low**: Next regular release

### Update Installation

```bash
# Check for updates
npm outdated

# Install security updates
npm audit fix

# Update to latest
npm update
```

## Contact

- **Security Email**: security@intentx.dev
- **GitHub Security Advisory**: [Link to be added]
- **Security Researcher Program**: [Coming soon]

## Acknowledgments

We'd like to thank researchers who responsibly disclose vulnerabilities:

- [To be updated with researcher credits]

---

**Thank you for helping keep IntentX secure!**

Last Updated: November 28, 2025  
Next Review: December 28, 2025
