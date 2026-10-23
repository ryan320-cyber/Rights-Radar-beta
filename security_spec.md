# Security Specification — Rights Radar Firestore

## 1. Data Invariants
- `users/{userId}`: A user document can only be read and written by its authenticated owner (`request.auth.uid == userId`) or admin.
- `waitlist_submissions/{submissionId}`: Anyone (including unauthenticated visitors) can submit an email and usage choice for the waitlist. Read and list access is restricted to authenticated admins (`rhilanerayaneyasmine@gmail.com`).
- `inspections/{inspectionId}`: Each flight inspection record belongs to an authenticated user (`resource.data.userId == request.auth.uid`). Users can only read, create, update, or delete their own inspections.

## 2. Dirty Dozen Threat Vectors & Mitigations
1. **Unauthenticated Reading of Waitlist Emails (PII Leak)**: Prevented via `allow list, get: if isAdmin()`.
2. **Identity Spoofing in Inspections**: Prevented via `incoming().userId == request.auth.uid` validation.
3. **Cross-User Inspection Modification**: Prevented by verifying `existing().userId == request.auth.uid`.
4. **Denial of Wallet via Oversized Payloads**: All string fields are constrained with `.size() <= MAX` (e.g., flightCode <= 32, email <= 256).
5. **Path Poisoning via Malformed IDs**: Document IDs validated with `isValidId(id)`.
6. **Shadow Field Injection**: Prevented with schema keys check `data.keys().hasAll(...)` and `hasOnly(...)`.
7. **Privilege Escalation**: Admin status verified against trusted email `rhilanerayaneyasmine@gmail.com` with `email_verified == true`.
8. **Client Query Delegation Vulnerability**: `allow list` explicitly validates `resource.data.userId == request.auth.uid`.
9. **Tampering with Immutable Creation Timestamps**: Prevented by checking `incoming().createdAt == request.time` or verifying consistency during updates.
10. **Arbitrary Deletion of Waitlist Entries**: Deletions disallowed except for admin.
11. **User Profile Hijacking**: `match /users/{userId}` strictly checks `request.auth.uid == userId`.
12. **Malformed Enum Values**: Validated against acceptable values in `isValidWaitlist` and `isValidInspection`.
