# QuoteCompare

QuoteCompare is an organization-secured procurement workspace for maintaining suppliers and turning quotations into structured, auditable purchasing decisions.

## Phase 4 — Supplier Management

Phase 4 adds a real supplier directory on top of the existing Next.js, TypeScript, Tailwind, Firebase Authentication, and Firestore foundation.

### Included

- Redesigned warm editorial interface with improved shell, typography, spacing, responsive states, and accessible focus treatment
- Organization-scoped supplier directory at `/suppliers`
- Create and edit supplier records
- Active/inactive supplier lifecycle that preserves historical context
- Search by supplier, category, contact, or email
- Status filtering and live directory summary
- Client-side form validation with readable inline errors
- Role-aware controls using the existing `suppliers.manage` permission
- Firestore Security Rules that independently enforce organization membership and supplier write roles
- No Firebase Storage dependency or other paid-only Firebase service

## Firebase free-plan setup

1. Enable Email/Password in **Firebase Authentication**.
2. Create a **Cloud Firestore** database.
3. Copy `.env.example` to `.env.local` and add the Firebase web app values.
4. Deploy the included Firestore rules before testing supplier changes.

```bash
npx firebase-tools login
npx firebase-tools use --add
npx firebase-tools deploy --only firestore:rules
```

Only Authentication and Firestore are used. Supplier records are text data, so Phase 4 does not use Cloud Storage.

## Firestore structure

```text
users/{uid}
organizations/{organizationId}
organizations/{organizationId}/members/{uid}
organizations/{organizationId}/suppliers/{supplierId}
```

Supplier documents store the organization ID, name, normalized name, category, primary contact fields, address, internal notes, status, creator/updater IDs, and timestamps.

## Authorization

- **Admin** — view and manage suppliers
- **Procurement Manager** — view and manage suppliers
- **Procurement Staff** — view and manage suppliers
- **Viewer** — view suppliers only

The interface hides write controls for viewers, but Firestore Rules remain the actual authorization boundary. Supplier deletion is denied; records are marked inactive to preserve future quotation history.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Test Phase 4

1. Sign in with a verified account and enter an organization workspace.
2. Deploy the Phase 4 Firestore rules.
3. Open **Suppliers** and add a supplier with a name and category.
4. Confirm the record appears in the table and summary counts.
5. Search for it by name, contact, category, or email.
6. Edit the supplier and confirm the updated date changes.
7. Mark it inactive, filter to inactive records, then reactivate it.
8. Test with a Viewer account and confirm write controls are unavailable and Firestore rejects direct writes.
9. Check the layout on mobile; the supplier editor should use the full screen width and the directory table should remain horizontally accessible.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
npm run format:check
```

## Readability standard

Visible metadata does not drop below 12px. Body text, helper text, forms, navigation, table content, statuses, controls, empty states, and mobile UI generally remain 13–16px or larger.
