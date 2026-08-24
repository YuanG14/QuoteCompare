# QuoteCompare

QuoteCompare is an organization-secured procurement workspace that carries a documented internal need through RFQ preparation, supplier quotation comparison, and an auditable purchasing decision.

## Phase 7 — Quotation Intake

Phase 7 records supplier responses against Issued RFQs without depending on Firebase Storage. A source document may be read temporarily in the browser, but Firestore stores only the structured quotation, original filename, source type, and optional SHA-256 checksum.

### Included

- Quotation register with search and Draft / Needs Review / Verified filters
- Manual entry tied to one Issued RFQ and one invited supplier
- Quantity, unit, specifications, unit price, and deterministic line totals
- Separate discount, shipping, installation, and tax amounts in PHP
- Warranty, delivery commitment, payment terms, and internal notes
- Browser-local CSV parsing with deterministic header matching
- Local PDF and Excel source identification for guided manual entry
- Browser-generated SHA-256 checksum metadata
- No document bytes saved to Firestore or Firebase Storage
- Procurement Staff entry and review submission; Manager/Admin verification
- Organization-scoped Firestore persistence and Security Rules
- Responsive editorial screens with the existing readability baseline
- Existing Authentication, organizations, suppliers, purchase requests, and RFQs preserved

## Firebase free-plan setup

1. Enable Email/Password in **Firebase Authentication**.
2. Create a **Cloud Firestore** database.
3. Copy `.env.example` to `.env.local` and add the Firebase web app values.
4. Deploy the current Firestore rules before testing Phase 7.

```bash
npx firebase-tools login
npx firebase-tools use --add
npx firebase-tools deploy --only firestore:rules
```

QuoteCompare uses Firebase Authentication and Firestore only. It does not depend on Firebase Storage.

## Firestore structure

```text
users/{uid}
organizations/{organizationId}
organizations/{organizationId}/members/{uid}
organizations/{organizationId}/suppliers/{supplierId}
organizations/{organizationId}/purchaseRequests/{requestId}
organizations/{organizationId}/rfqs/{rfqId}
organizations/{organizationId}/quotations/{rfqId_supplierId}
```

Quotation IDs enforce one record per RFQ and supplier. All records live under the organization that owns them. Membership and role checks are enforced by Firestore Rules rather than hidden UI alone.

## Quotation lifecycle

- **Draft** — editable structured values still being entered
- **Needs Review** — submitted for a human check and still correctable
- **Verified** — approved by a Procurement Manager or Admin and locked for comparison

Verification is not an award decision. A human remains responsible for review and eventual supplier selection.

## Local source handling

- **CSV** — parsed locally when headers include `item`/`name` and `unit_price`/`price`; optional `quantity` and `unit` fields are matched to RFQ lines.
- **PDF / Excel** — identified and checksummed locally; Phase 7 uses guided manual entry for their values.
- **Manual** — no source file is required.

The selected file is never uploaded. Reloading the page cannot retrieve it from Firebase. The saved checksum can help confirm which local document was used.

## Authorization behavior

- **Admin** — create/edit, submit, and verify quotations
- **Procurement Manager** — create/edit, submit, and verify quotations
- **Procurement Staff** — create/edit Draft or Needs Review records and submit for review
- **Viewer** — read organization quotation records only

Firestore Rules require an Issued RFQ on creation, require the supplier to exist in the same organization, protect associations and audit fields, and prevent edits after verification.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Test Phase 7

1. Deploy the Phase 7 Firestore rules.
2. Create a purchase request, mark it Open, build an RFQ, and issue it.
3. Open **Quotations** and add a quotation.
4. Confirm only Issued RFQs and their selected suppliers are available.
5. Enter item prices and commercial terms manually.
6. Select a CSV with `item,quantity,unit,unit_price` headers and review the matched values.
7. Select a local PDF or Excel file and confirm only filename, source type, and checksum appear.
8. Save the Draft and confirm its deterministic subtotal and grand total.
9. Edit the Draft, submit it for review, and correct a Needs Review record.
10. Confirm Procurement Staff cannot verify it.
11. As Manager/Admin, verify it and confirm it becomes locked.
12. Confirm cross-organization access, deletion, and unauthorized status changes are rejected.
13. Test the register, intake form, and detail screen on desktop and mobile widths.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
npm run format:check
```

## Readability standard

Visible metadata does not drop below 12px. Body text, helper text, form controls, quotation lines, statuses, buttons, empty states, and mobile UI generally remain 13–16px or larger.

## Next phase

Phase 8 will expand quotation review with side-by-side source context where locally available, confidence and missing-field indicators, correction history, reviewer attribution, and stronger verification gates.
