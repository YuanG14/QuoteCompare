# QuoteCompare

QuoteCompare is a procurement decision workspace that turns supplier quotations into structured, comparable, auditable purchasing decisions.

## Phase 1

This phase establishes the production-minded foundation:

- Next.js App Router + TypeScript
- Tailwind CSS v4 foundation
- Professional responsive application shell
- Reusable UI primitives and design tokens
- Empty/loading/error state patterns
- Feature-oriented project structure
- Firebase-ready environment and client scaffolding
- ESLint, Prettier, strict TypeScript, and secure `.gitignore`

Firebase is intentionally **not connected to live credentials in Phase 1**. Authentication, Firestore, Storage, and security rules are introduced in Phase 2+.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
npm run format:check
```

## Environment

Copy `.env.example` to `.env.local` only when Phase 2 begins and you have a Firebase project.

Never commit `.env.local`, service-account JSON, private keys, or other secrets.

## Visual direction

Phase 1 uses an editorial procurement design language: warm neutral surfaces, serif display typography, controlled orange accents, high-contrast black decision panels, generous spacing, and readable data-first components. The visual system is inspired by premium editorial/logistics interfaces without copying any single reference layout.
