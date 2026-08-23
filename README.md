# QuoteCompare

QuoteCompare is an organization-secured procurement workspace that carries a documented internal need through RFQ preparation, supplier quotation comparison, and an auditable purchasing decision.

## Phase 6 — RFQ Builder

Phase 6 turns an Open purchase request into a structured Request for Quotation. The source purchase request remains unchanged while the RFQ keeps its own item and requirement snapshot for consistent supplier outreach.

### Included

- Dedicated RFQ register and navigation
- Select an Open, non-archived purchase request
- Copy and refine requested items, quantities, units, and specifications
- Add required and preferred criteria
- Set the quotation deadline and delivery destination
- Record payment expectations and the evaluation approach
- Select up to 20 active suppliers
- Automatic RFQ numbers such as `RFQ-2026-A1B2C3`
- Draft, Issued, and Closed lifecycle
- Procurement Staff can prepare and edit Drafts
- Procurement Managers and Admins can issue and close RFQs
- Issued RFQ content is locked for consistent quotation intake
- Search and lifecycle filters
- Dedicated responsive RFQ detail view
- Deterministic TypeScript summaries for items, quantities, criteria, and supplier counts
- Organization-scoped Firestore persistence and Security Rules
- Existing Authentication, organizations, suppliers, and purchase requests preserved
- No Firebase Storage dependency

## Firebase free-plan setup

1. Enable Email/Password in **Firebase Authentication**.
2. Create a **Cloud Firestore** database.
3. Copy `.env.example` to `.env.local` and add the Firebase web app values.
4. Deploy the current Firestore rules before testing Phase 6.

```bash
npx firebase-tools login
npx firebase-tools use --add
npx firebase-tools deploy --only firestore:rules
```

QuoteCompare currently uses Firebase Authentication and Firestore only. RFQs contain structured text and do not require Cloud Storage.

## Firestore structure

```text
users/{uid}
organizations/{organizationId}
organizations/{organizationId}/members/{uid}
organizations/{organizationId}/suppliers/{supplierId}
organizations/{organizationId}/purchaseRequests/{requestId}
organizations/{organizationId}/rfqs/{rfqId}
```

All operational records live under the organization that owns them. The membership document—not a hidden button—is the authorization source used by Firestore Rules.

## RFQ lifecycle

- **Draft** — editable supplier brief linked to an Open purchase request
- **Issued** — locked scope ready for supplier quotation intake
- **Closed** — quotation intake for the RFQ has ended

Issuance is intentionally irreversible in Phase 6. This prevents later edits from silently changing the scope suppliers were asked to price. Phase 7 will attach structured quotation records to Issued RFQs.

## Authorization behavior

- **Admin** — create/edit Drafts, issue RFQs, and close Issued RFQs
- **Procurement Manager** — create/edit Drafts, issue RFQs, and close Issued RFQs
- **Procurement Staff** — create and edit Drafts
- **Viewer** — read RFQs only

Firestore Rules also verify that the source purchase request belongs to the same organization, remains Open and non-archived during draft editing and issuance, and cannot be changed after the RFQ is created.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Test Phase 6

1. Deploy the Phase 6 Firestore rules.
2. Create or open a purchase request and mark it Open.
3. Ensure at least one supplier is Active.
4. Open **RFQs** and choose **Build an RFQ**.
5. Select the Open purchase request and confirm its items are copied into the RFQ draft.
6. Edit item specifications and add required/preferred criteria.
7. Set a valid quotation deadline on or before the purchase request's required date.
8. Enter delivery, payment, and evaluation expectations.
9. Select active suppliers and save the Draft.
10. Open the RFQ detail page and verify all saved information.
11. As Staff, confirm issuance is unavailable.
12. As Manager/Admin, issue the RFQ and confirm its content becomes locked.
13. Close the Issued RFQ and confirm lifecycle timestamps are recorded.
14. Confirm a Viewer can read but cannot write RFQ records.
15. Confirm Firestore rejects cross-organization reads, unauthorized issuance, draft edits after issuance, and RFQ deletion.
16. Test the register, builder, and detail screens on desktop and mobile widths.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
npm run format:check
```

## Readability standard

Visible metadata does not drop below 12px. Body text, helper text, form controls, requirements, supplier options, statuses, buttons, empty states, and mobile UI generally remain 13–16px or larger.

## Next phase

Phase 7 will add free-plan-compatible quotation intake. Local files may be parsed temporarily in the browser, while Firestore stores only structured quotation data and source metadata—not the original document.
