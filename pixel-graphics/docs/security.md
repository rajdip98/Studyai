# Security Requirements
## Pixel Graphics — Design & Print Solution

**Document status:** Draft v1.0

## 1. Security objectives
Protect the studio, customers, inquiry data, uploaded artwork, and operational systems while keeping the website simple and fast.

Primary goals:
- prevent unauthorized access
- minimize stored personal data
- protect inquiry endpoints
- protect uploaded artwork
- prevent abuse and spam
- prevent credential leakage
- maintain secure operational access

## 2. Threat model
### Public website
Threats include:
- spam and automated form abuse
- XSS
- CSRF
- injection attacks
- malicious file uploads
- scraping
- denial-of-service
- malicious third-party content
- dependency vulnerabilities

### Administrative systems
Threats include:
- stolen credentials
- excessive permissions
- exposed API keys
- unauthorized portfolio/content changes
- compromised third-party accounts

## 3. Data classification
### Public
- service descriptions
- portfolio images intended for publication
- public contact details
- business location
- published technical specifications

### Internal
- unpublished pricing
- operational notes
- production workflows
- internal analytics

### Confidential
- customer contact details
- inquiry notes
- uploaded artwork/proofs
- order information

Do not collect sensitive personal information unless a legitimate business requirement exists.

## 4. Authentication and authorization
- Use MFA for administrative accounts where supported.
- Apply least privilege.
- Separate public website access from admin access.
- Never use shared admin passwords.
- Rotate credentials after personnel changes.
- Use short-lived tokens for temporary upload access.

## 5. Secrets management
Secrets must:
- live only in server-side environment variables or a secrets manager
- never be committed to Git
- never be placed in HTML, CSS, client JavaScript, or screenshots
- never be logged

Examples:
- email provider API keys
- database credentials
- storage credentials
- analytics write keys where sensitive
- admin tokens

## 6. Web application controls
### Input validation
Validate every field on the server:
- string length
- allowed characters/formats
- enumerated service values
- numeric quantity limits
- dimensions format
- email format

### Output encoding
Escape untrusted data before rendering it into HTML, emails, logs, or templates.

### CSRF
Use CSRF protection for state-changing same-origin form requests when cookies/session authentication are involved.

### XSS
- Prefer framework auto-escaping.
- Avoid raw HTML injection.
- Sanitize rich text if it is ever accepted.

### Injection
Use parameterized queries or ORM-safe APIs. Never concatenate user input into SQL, shell commands, or dynamic code.

## 7. Form abuse prevention
- Rate limit by IP and/or session.
- Add honeypot or managed bot protection.
- Enforce server-side validation.
- Apply cooldowns for repeated submissions.
- Return generic failure messages where revealing internal details would help attackers.

## 8. File upload security
If artwork upload is implemented:
- allow only required file extensions and MIME types
- enforce file-size limits
- rename files using generated identifiers
- store outside executable web roots
- scan for malware where feasible
- never execute uploaded content
- strip unnecessary metadata where appropriate
- use signed, expiring download URLs
- isolate customer files from application code

## 9. HTTP security
Production should use:
- HTTPS only
- HSTS
- Content-Security-Policy
- X-Content-Type-Options: nosniff
- Referrer-Policy
- Permissions-Policy
- frame protection via CSP `frame-ancestors`

Use a restrictive CSP and explicitly allow only required external font/icon/media domains.

## 10. Third-party resources
The reference UI loads fonts, icons, and an image from external hosts. Before production:
- inventory every third-party origin
- remove unnecessary dependencies
- prefer self-hosting critical assets
- use Subresource Integrity where compatible
- review privacy implications
- avoid third-party scripts that are not necessary for conversion or measurement

## 11. Privacy
- Provide a clear privacy notice if personal data is collected.
- Collect only what is necessary to quote/contact the customer.
- Define retention periods.
- Delete stale inquiry data when no longer needed.
- Restrict internal access to customer information.
- Do not expose inquiry details in URLs or public client-side state.

## 12. Logging and monitoring
Log:
- authentication events
- rate-limit events
- server errors
- security events
- administrative changes

Do not log:
- passwords
- authentication tokens
- full uploaded files
- unnecessary personal data
- private message contents

Set alerts for unusual form volume, repeated failures, suspicious upload behavior, and admin authentication anomalies.

## 13. Dependency and supply-chain security
- Pin or lock dependencies.
- Run dependency vulnerability scans.
- Remove unused packages.
- Review major version upgrades.
- Protect CI/CD secrets.
- Require code review for production changes.

## 14. Backup and recovery
If customer/order data is persisted:
- perform encrypted backups
- restrict backup access
- test restoration periodically
- define recovery objectives
- keep production and backup credentials separate

## 15. Incident response
Minimum process:
1. Detect and triage.
2. Contain the affected system.
3. Preserve relevant logs.
4. Rotate compromised credentials.
5. Patch/remove the root cause.
6. Restore trusted service.
7. Assess affected data/users.
8. Document lessons learned.

## 16. Security acceptance criteria
Before launch:
- HTTPS enforced.
- No secrets in repository/client bundle.
- Forms have rate limiting and validation.
- Security headers configured.
- Dependencies scanned.
- File upload disabled until securely implemented.
- Admin access protected with MFA where available.
- Error responses do not reveal stack traces or secrets.
- Privacy/data retention requirements documented.
