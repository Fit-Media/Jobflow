# Testing Guide

Run unit tests:

```bash
npm test
```

Run lint:

```bash
npm run lint
```

Run type checking:

```bash
npx tsc --noEmit
```

Run a production build:

```bash
npm run build
```

Future integration suites should cover:

- Gmail OAuth and search queries.
- Gmail draft creation without sending.
- Google Docs creation and PDF export.
- Microsoft OneDrive upload and Word Online links.
- Headed Playwright form fill with final-submit blocking.
- Voice fallback, transcript consent, audio consent, and delete controls.
