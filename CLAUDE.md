# Security Rules for AI-Generated Apps (by Taha Jaffri)

These rules are strictly enforced for this project. No exceptions.

## 1. Secrets and Environment Variables
- Never expose secrets in frontend code.
- API keys, tokens, database URLs, and private config live in `.env` files only.
- `.env` files must be in `.gitignore`. (Exclude `.env`, `.env.local`, `.env.*.local`).
- Frontend code must never contain raw secret values (No `const API_KEY = "sk-..."`).
- For Next.js/Vite: only variables prefixed with `NEXT_PUBLIC_` or `VITE_` belong in the frontend.
- Backend secrets are accessed via `process.env.VAR_NAME` only and never returned to the client.
- Generate a `.env.example` file.

## 2. Rate Limiting
- Apply rate limiting on all API routes.
- Auth endpoints: 5 req/15 min per IP.
- General API: 60 req/min per IP.
- AI/LLM endpoints: 10 req/min per user.
- File uploads: 5 req/min per IP.
- Return `429 Too Many Requests`.

## 3. Input Validation and Sanitization
- Validate and sanitize everything on the server.
- Use schema validation libraries: `Zod`.
- Sanitize all string inputs.
- Use parameterized queries or ORMs (Prisma). No raw string SQL.
- Validate data types, lengths, allowed characters.

## 4. Authentication and Authorization
- Passwords must never be stored in plain text. Use `bcrypt` (min cost 12).
- JWTs must be signed with a strong secret (min 32 chars) stored in env. Short expiry (15-60 mins).
- Refresh tokens in `httpOnly` cookies.
- Verify user identity AND permissions on every request.

## 5. SQL and Database Security
- Always use an ORM (Prisma).
- Apply principle of least privilege.
- Never return raw database errors to the client.

## 6. CORS Configuration
- Never use wildcard CORS in production.
- Explicitly whitelist allowed origins.
- Restrict allowed HTTP methods.

## 7. HTTP Security Headers
- Always set security headers using `helmet`.
- Content-Security-Policy, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Strict-Transport-Security, Referrer-Policy.
- Remove `X-Powered-By` header.

## 8. File Upload Security
- Validate file type by MIME type and extension on the server.
- Set strict file size limits (5MB images, 25MB documents).
- Store uploaded files outside web root or in cloud (Cloudinary/S3).
- Rename uploaded files to UUID.

## 9. Error Handling and Logging
- Never return internal errors to the client.
- Return generic error messages.
- Log errors server-side with context.

## 10. Dependency Security
- Pin dependency versions.
- Audit dependencies.

## 11. XSS Prevention
- Never render dynamic user content as raw HTML without `DOMPurify`.
- No `eval()`, `new Function()`, or `innerHTML` with dynamic content.

## 12. AI and LLM-Specific Rules
- Treat LLM inputs and outputs like untrusted data.
- Sanitize input to prevent prompt injection.
- Always set `max_tokens` limits.
- Store API key server-side only. Route all calls through backend.
- Validate/sanitize LLM output before rendering.
