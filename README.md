# QuoteCompare

QuoteCompare is an organization-secured procurement workspace that carries a documented internal need through supplier quotation comparison and an auditable purchasing decision.

## Phase 5 — Purchase Requests

Phase 5 adds the internal purchase request that begins procurement. It extends the Phase 4 supplier directory without replacing existing functionality.

### Included

- Create organization-scoped purchase requests
- Edit requests while role and lifecycle rules permit
- Archive and restore requests without deleting procurement history
- Draft, Open, and Closed statuses
- Manager/Admin-only closing and reopening
- Request number generation such as `PR-2026-A1B2C3`
- Requester, department, purpose, budget, required date, and internal notes
- Up to 30 requested item lines with quantity, unit, and specifications
- Search by request number, title, requester, department, or purpose
- Status and archive filters
- Dedicated responsive request detail page
- Deterministic TypeScript summary calculations for line count and total quantity
- Organization-aware Firestore Security Rules
- Existing Supplier Management, Authentication, organization roles, and editorial UI preserved
- No Firebase Storage dependency

## Firebase free-plan setup

1. Enable Email/Password in **Firebase Authentication**.
2. Create a **Cloud Firestore** database.
3. Copy `.env.example` to `.env.local` and add the Firebase web app values.
4. Deploy the current Firestore rules before testing Phase 5.

```bash
npx firebase-tools login
npx firebase-tools use --add
npx firebase-tools deploy --only firestore:rules
```

QuoteCompare currently uses Firebase Authentication and Firestore only. Purchase requests and supplier records are structured text data and do not require Cloud Storage.

## Firestore structure

```text
users/{uid}
organizations/{organizationId}
organizations/{organizationId}/members/{uid}
organizations/{organizationId}/suppliers/{supplierId}
organizations/{organizationId}/purchaseRequests/{requestId}
```

The organization subcollections are the data boundary. A user profile's `activeOrganizationId` helps the UI locate the workspace, but the organization membership document remains the authorization source.

## Purchase request lifecycle

- **Draft** — still being prepared
- **Open** — ready for RFQ preparation in Phase 6
- **Closed** — procurement work completed or intentionally stopped
- **Archived** — removed from the active register without deleting its record

Procurement Staff can create and manage non-closed requests. Procurement Managers and Admins can also close, reopen, edit, and archive closed requests. Viewers can read requests but cannot write them.

The interface hides actions the member cannot use, while Firestore Rules independently enforce the same organization and role restrictions. Direct client writes cannot bypass these rules.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Test Phase 5

1. Sign in with a verified account and enter an organization workspace.
2. Deploy the Phase 5 Firestore rules.
3. Open **Procurement** and create a Draft purchase request.
4. Add several item lines and confirm validation catches missing names, invalid quantities, and missing units.
5. Open the resulting detail page and verify the request number, budget, required date, purpose, items, and calculated summary.
6. Edit the request and change it to Open.
7. Search for it and test Draft, Open, Closed, and Archived filters.
8. As a Manager or Admin, close and reopen the request.
9. Archive and restore the request.
10. As a Viewer, confirm the request remains readable but write actions are unavailable.
11. Confirm Firestore rejects unauthorized direct writes and cross-organization reads.
12. Test the register, editor, and detail view on desktop and mobile widths.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
npm run format:check
```

## Readability standard

Visible metadata does not drop below 12px. Body text, helper text, forms, navigation, request tables, statuses, buttons, empty states, and mobile UI generally remain 13–16px or larger.

## Next phase

Phase 6 will turn an Open purchase request into a structured Request for Quotation without changing the original request record.
