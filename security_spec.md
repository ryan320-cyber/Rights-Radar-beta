# Security Specification — Rights Radar

## 1. Architectural Overview & Trust Boundaries
Rights Radar operates with strict client-server boundaries:
- **Client-Side Pure Logic**: Calculation of European Regulation (EC) No 261/2004 eligibility, distance brackets, delay thresholds, and claim-letter generation is executed locally as deterministic, testable pure functions.
- **Backend API (`server.ts`)**: Encapsulates external AI/Search calls and database operations. Protects API keys (Gemini) behind server-side proxies (`/api/verify-flight`, `/api/regulatory-pulse`).
- **Persistence Layers**:
  - **Cloud SQL (PostgreSQL)**: Primary datastore for registered users, waitlist submissions, and user flight scans.
  - **Firebase Firestore**: User profiles and saved flight inspections under strict security rules.

## 2. API & Endpoint Protections
1. **Request Body Size Limits**: JSON payloads are restricted to `64kb` to prevent memory exhaustion and DoS.
2. **Security Headers**: Standard defense-in-depth headers applied on every request:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: SAMEORIGIN`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `X-XSS-Protection: 1; mode=block`
3. **Rate Limiting**: In-memory IP-based rate limiters on public and computationally heavy routes:
   - `/api/waitlist`: max 15 requests per 10 minutes.
   - `/api/verify-flight`: max 20 requests per 10 minutes.
4. **Ownership Verification on Flight Scans (`/api/flight-scans`)**:
   - Requires verified Firebase Auth Bearer token via `requireAuth` middleware.
   - Database record is tied strictly to the authenticated UID extracted from `decodedToken.uid`. Body-supplied `userId` is never trusted.
5. **Truthful Flight Grounding & Caching**:
   - Results from Google Search Grounding are stored in a bounded LRU cache (100 items max, 1-hour TTL).
   - If search service is unavailable or quotas are exceeded, truthful fallback states (`live_check_unavailable`) are returned. Fake negative assertions ("no incidents reported, flight is compensable") are strictly banned.

## 3. Firestore Security Rules Invariants
- `users/{userId}`: Only readable and writable by the authenticated owner (`request.auth.uid == userId`) or admin.
- `waitlist_submissions/{submissionId}`: Write-only for visitors (creating an entry with validated schema keys and length bounds). Public read/list is blocked; only authorized admin can read submissions.
- `inspections/{inspectionId}`: Each record belongs to an authenticated user (`resource.data.userId == request.auth.uid`). Users can only read, create, update, or delete their own inspections. Cross-user operations are denied.

## 4. Gmail Privacy & Least Privilege
- **Minimal OAuth Scopes**: Only `gmail.readonly` (for message search) and `gmail.compose` (for creating editable drafts). Broad scopes like `mail.google.com` or `gmail.modify` are prohibited.
- **In-Memory Lifecycle**: OAuth access tokens are stored in transient application memory and cleared immediately on user disconnect or session end. Tokens are never persisted to localStorage or logged.
- **Zero Fabricated Records**: If an inbox search yields zero matching messages, an empty list is returned. Demonstration records are isolated behind an explicit, user-activated demo sandbox mode.
- **No Automatic Sending**: The system never sends emails autonomously; it only prepares drafts for user review.

## 5. Privacy & Data Handling
- Sensitive user emails, reservation codes, and claim letters are never written to standard application logs.
- Waitlist deduplication is performed using normalized email hashes.
