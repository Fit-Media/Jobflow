# Deployment Guide

Use PostgreSQL, encrypted OAuth tokens, and server-side secrets.

Recommended production services:

- Next.js host with server actions/API routes.
- PostgreSQL.
- Redis for BullMQ background jobs.
- S3-compatible storage, Google Drive, or OneDrive for generated files.
- OAuth apps verified for the scopes used.

Deployment checklist:

- Set all environment variables.
- Run `npm run prisma:migrate`.
- Run `npm run build`.
- Confirm no secrets are exposed to the browser.
- Confirm Gmail draft scope is gated behind Andrew approval.
- Confirm guided browser apply runs only in visible/headed mode.
