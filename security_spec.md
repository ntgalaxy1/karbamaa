# Security Specification for Karbama Firestore Security Rules

## Data Invariants
1. A user profile document ID under `/users/{userId}` must match authenticated or identified user credentials.
2. A notification under `/notifications/{notificationId}` can be created by system/admin or triggers, and read by intended recipients or all seekers if `recipientRole` is 'all' or 'seeker'.
3. Job listings under `/jobs/{jobId}` can be created or updated by admins, and publicly listed if active.

## The "Dirty Dozen" Threat Payloads
1. Shadow update injecting administrative role into standard seeker profile.
2. Unauthenticated write to `/users/admin`.
3. Overwriting another user's push notification FCM token.
4. Setting non-existent or oversized title strings in notification documents.
5. Direct deletion of system notification audit logs by non-admin users.
6. Spoofing notification recipient ID to hijack private messages.
7. Injecting non-string types into nationalId or username fields.
8. Bypassing size limits on job title or notification body.
9. List query scraping without filtering by recipientId/role.
10. Unverified modification of user verification status from 'pending' to 'approved'.
11. Updating immutable `createdAt` timestamp fields.
12. Attempting cross-site path poisoning in user document keys.
