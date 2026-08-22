# QuoteCompare

QuoteCompare is a procurement decision workspace that turns supplier quotations into structured, comparable, auditable purchasing decisions.

## Phase 2 — Firebase Authentication

Phase 2 builds on the editorial Phase 1 UI and adds a real Firebase Authentication foundation.

### Included

- Next.js App Router + strict TypeScript
- Firebase Web SDK configuration through `.env.local`
- Email/password account creation
- Display-name profile setup
- Email verification before workspace access
- Email/password sign in
- Local persistence when **Keep me signed in** is enabled
- Session-only persistence when it is disabled
- Password reset flow
- Authentication state observer
- Protected workspace route guard
- Authenticated account menu and sign out
- Mobile sign-out control
- Custom Firebase configuration, validation, loading, and error states
- Existing readable editorial QuoteCompare design system

## Firebase setup

1. Create or open a Firebase project.
2. Add a **Web app** in Firebase Project settings.
3. In Firebase Authentication, enable the **Email/Password** sign-in provider.
4. Copy `.env.example` to `.env.local`.
5. Paste the web app configuration values into `.env.local`.
6. Restart `npm run dev` after changing environment variables.

Example structure:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

Do **not** place Firebase Admin SDK service-account private keys in `NEXT_PUBLIC_*` variables. Phase 2 uses only the browser Firebase SDK.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Test the authentication flow

1. Open `/signup` and create an account.
2. Open the Firebase verification email and verify the address.
3. Return to QuoteCompare and click **I verified my email**.
4. Confirm `/dashboard` becomes accessible.
5. Sign out using the account menu.
6. Confirm `/dashboard` redirects an unauthenticated user to `/signin`.
7. Test **Forgot password** from the sign-in page.
8. Test sign-in with **Keep me signed in** checked and unchecked.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
npm run format:check
```

## Security boundary for Phase 2

The workspace route guard improves navigation and user experience, but client-side route protection is **not** the final authorization boundary for procurement data.

Phase 3 introduces:

- organizations and memberships
- admin / manager / staff / viewer roles
- Firestore data model
- Firestore Security Rules
- Storage Security Rules
- authorization-aware UI

Those server-enforced Firebase rules will protect actual organization data independently of what the browser UI shows.

## Readability standard

Visible metadata does not drop below 12px, while normal body/helper text generally stays at 13–16px or larger. This applies across authentication, navigation, forms, status labels, cards, tables, mobile UI, empty states, and future phases.
