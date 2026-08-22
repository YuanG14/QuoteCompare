# QuoteCompare

QuoteCompare is a procurement decision workspace that turns supplier quotations into structured, comparable, auditable purchasing decisions.

## Phase 3 — Organizations, Roles & Firebase Security

Phase 3 builds the authorization boundary that future supplier, quotation, comparison, and award data will rely on.

### Included

- Firebase Authentication from Phase 2
- Cloud Firestore client configuration
- Organization onboarding after verified sign-in
- Organization-scoped data model
- First workspace creator becomes **Admin**
- Four roles: Admin, Procurement Manager, Procurement Staff, Viewer
- Central permission helpers for authorization-aware UI
- Workspace gate that requires an active organization membership
- Organization name management for Admins
- Member roster sourced from Firestore
- Role and permission matrix in Settings
- Firestore Security Rules
- Storage Security Rules prepared for quotation files
- Firebase configuration files for rules deployment
- Existing readable editorial UI and accessibility baseline

## Firebase setup for Phase 3

1. Keep Email/Password enabled in **Firebase Authentication**.
2. In Firebase Console, create a **Cloud Firestore** database.
3. Keep your Phase 2 Firebase web configuration in `.env.local`.
4. Deploy the included Firestore rules before creating an organization.
5. Storage rules are included now; quotation upload itself arrives in a later phase.

### Deploy rules with Firebase CLI

From the project folder:

```bash
npx firebase-tools login
npx firebase-tools use --add
npx firebase-tools deploy --only firestore:rules
```

When Cloud Storage is enabled for the project, deploy its rules too:

```bash
npx firebase-tools deploy --only storage
```

The repository includes:

- `firebase.json`
- `firestore.rules`
- `firestore.indexes.json`
- `storage.rules`

## Firestore structure

```text
users/{uid}
organizations/{organizationId}
organizations/{organizationId}/members/{uid}
```

The organization document owns the workspace. A user's `activeOrganizationId` helps the UI locate the active workspace, but **membership documents are the authorization source**. Setting an organization ID in a user profile does not grant access by itself.

## Roles

- **Admin** — organization settings, members, procurement work, quotations, suppliers, awards, reports
- **Procurement Manager** — procurement work, quotations, suppliers, awards, reports
- **Procurement Staff** — procurement work, quotations, suppliers, reports
- **Viewer** — read-oriented/report access

Future modules will use the same permission helpers and extend Firebase rules per collection.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Test Phase 3

1. Sign in with a verified Firebase account.
2. If the account has no organization, `/dashboard` should redirect to `/organization/setup`.
3. Create an organization.
4. Confirm you enter `/dashboard` as **Admin**.
5. Open **Settings** and verify the organization name, current member, role, and permission matrix.
6. Rename the organization and confirm the sidebar/topbar reflect the new name.
7. Sign out and confirm protected routes still redirect to `/signin`.
8. In Firestore, confirm the organization and membership documents were created under the expected organization path.

## Security notes

- Client-side route guards are for navigation and UX, not the final data boundary.
- Firestore rules require an active organization membership to read organization data.
- The initial Admin membership can only be created for the authenticated user who created that organization.
- Admins cannot remove or demote themselves through the current member rule, reducing accidental workspace lockout.
- Storage rules restrict quotation paths to active organization members and reserve writes for Admin, Manager, and Staff roles.
- Quotation uploads are limited by rules to supported document/image types and 20 MB once that feature is enabled.
- Firebase Admin SDK credentials are not included and must never be stored in `NEXT_PUBLIC_*` variables.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
npm run format:check
```

## Readability standard

Visible metadata does not drop below 12px, while normal body/helper text generally stays at 13–16px or larger. This continues to apply to navigation, forms, statuses, settings, tables, cards, empty states, and mobile UI.
