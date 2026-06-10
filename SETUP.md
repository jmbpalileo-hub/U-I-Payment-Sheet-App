# U&I Payment Sheet Generator — Setup Guide

## Prerequisites

- Node.js 18+
- A Google Cloud project with OAuth 2.0 credentials
- Access to the U&I student register Google Sheet

---

## 1. Google Cloud Setup

### Create OAuth credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Authorised redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.com/api/auth/callback/google` (production)
5. Copy the **Client ID** and **Client Secret**

### Enable APIs

In **APIs & Services** → **Library**, enable:
- Google Sheets API
- Google Drive API
- Gmail API

### OAuth Consent Screen

1. Go to **OAuth consent screen**
2. Add scopes:
   - `https://www.googleapis.com/auth/spreadsheets.readonly`
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/gmail.compose`
3. Add test users (your team's Google accounts) while in testing mode

---

## 2. Environment Variables

Edit `.env.local`:

```env
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=<generated-secret>

GOOGLE_CLIENT_ID=<from-google-cloud>
GOOGLE_CLIENT_SECRET=<from-google-cloud>

NEXTAUTH_URL=http://localhost:3000

# These are pre-configured for U&I:
STUDENT_REGISTER_SHEET_ID=16lSsznjhAa2TBTwXeIMxBvkbbnwTa-rwR9Fp4yse8KY
STUDENT_FOLDERS_PARENT_ID=1XNYHNM3jqOtW5W_bkNWAbCW8XKq5HVqK
ACCOUNTS_EMAIL=accounts@uandiedu.com
STAFF_INITIAL=JMP
NEXT_PUBLIC_STAFF_INITIAL=JMP
```

---

## 3. Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

---

## 4. How It Works

### 3-Step Workflow

**Step 1 — Select Student**
- Type ≥2 characters to search across name, file number, school
- Click a student to proceed

**Step 2 — Payment Details**
- Fill in the payment form (date, amount, type are required)
- Optionally drag & drop the bank transfer screenshot
- The screenshot dropzone shows the renamed filename preview

**Step 3 — Generate & Send**
All four actions are independent and can be run in any order:

| Action | What it does |
|--------|-------------|
| 🖨️ Print / Save as PDF | Opens payment sheet HTML in a new tab → use browser Print → Save as PDF |
| ☁️ Upload Payment Sheet | Generates PDF via Puppeteer, finds student's Drive folder, uploads |
| 📸 Upload Screenshot | Compresses image (sharp), renames, finds Payment subfolder, uploads |
| ✉️ Create Gmail Draft | Creates draft in Gmail with standard template to accounts@uandiedu.com |

After the draft is created, a **reminder banner** appears — you must attach files from Drive manually before sending.

---

## 5. Drive Folder Logic

The app searches for the student folder inside the parent folder configured in `STUDENT_FOLDERS_PARENT_ID`:

1. First tries: folder name **contains** the file number (e.g. `JF235A`)
2. Falls back to: folder name **contains** the surname
3. If still not found: uploads to the parent root and shows a warning

For screenshots, it also looks for a subfolder named "Payment" inside the student folder.

---

## 6. Deployment (Vercel)

```bash
npm i -g vercel
vercel
```

Set all environment variables in the Vercel dashboard under **Settings → Environment Variables**. Update `NEXTAUTH_URL` to your production domain and add the production redirect URI to your Google OAuth credentials.

---

## 7. Configuring Staff Initial

Currently hardcoded in `.env.local` as `STAFF_INITIAL=JMP`. To make it per-user:

- A future **Settings** page can store the initial in `localStorage` or a server-side user profile
- The `/api/payment-sheet/preview` route accepts `staffInitial` as a query param, so the client can pass it through

---

## 8. File Naming Conventions

| File | Format | Example |
|------|--------|---------|
| Payment sheet PDF | `Payment Sheet - DDMMYYYY - Surname FirstName - Type.pdf` | `Payment Sheet - 10062026 - Sandoy Kyla Keith - DD.pdf` |
| Screenshot | `DDMMYYYY - Surname, FirstName - Payment Confirmation.jpg` | `10062026 - Sandoy, Kyla Keith - Payment Confirmation.jpg` |
| Email subject | `Payment Sheet - DDMMYYYY - FirstName Surname - Type` | `Payment Sheet - 10062026 - Kyla Keith Sandoy - DD` |
