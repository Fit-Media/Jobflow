# OAuth Setup Guide

## Google

1. Create a Google Cloud project.
2. Configure the OAuth consent screen.
3. Add redirect URI: `http://localhost:3000/api/auth/callback/google`.
4. Enable Gmail API, Drive API, and Docs API.
5. Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI`.

Start with read-only Gmail ingestion scopes. Request Gmail compose only when Andrew enables draft creation.

## Microsoft

1. Create an Azure app registration.
2. Add redirect URI: `http://localhost:3000/api/auth/callback/microsoft`.
3. Add delegated permissions for profile, email, offline access, and Files.ReadWrite when Word Online is enabled.
4. Add `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, and `MICROSOFT_REDIRECT_URI`.

Tokens must be encrypted using `ENCRYPTION_KEY`.
