# cPanel Deployment Guide

How to build NobzLearn and put it live on cPanel shared hosting.

Last verified: 2026-07-16 (build tested end-to-end against `dist/` before writing).

> The other cPanel notes in this folder (`CPANEL_DEPLOYMENT_FINAL.md`) are older and
> describe a build that no longer matches the app — prefer this file.

---

## 1. Build

```bash
npm ci          # or: npm install
npm run build   # outputs to dist/
```

**A `.env` must exist at the project root before you build.** Vite inlines `VITE_*`
values into the bundle at build time — there is no runtime config on static hosting,
so a missing/incorrect `.env` produces a build that fails on load, and no amount of
cPanel configuration will fix it afterwards. You must rebuild.

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

The anon key is designed to be public and is safe to ship in the bundle — it is not a
secret. Access is controlled by Supabase Row Level Security, not by hiding this key.
Never put a `service_role` key in a `VITE_*` variable: that one *is* a secret, and
anything prefixed `VITE_` ends up readable in the JavaScript any visitor can download.

## 2. Upload

Upload **the contents of `dist/`** (not the `dist` folder itself) into your domain's
document root, usually `public_html/`:

```
public_html/
├── index.html
├── .htaccess          <- REQUIRED, see below
├── assets/            <- hashed .js / .css
├── favicon.ico
├── robots.txt
└── (logo / image files)
```

`nobzlearn-cpanel-upload.zip` at the repo root is exactly these files zipped. Upload it
via cPanel File Manager and use **Extract** — far faster and more reliable than
uploading hundreds of files individually.

### The .htaccess is the part people miss

`.htaccess` lives in `public/` and Vite copies it into `dist/` automatically, so it is
already in the build and in the zip. Two things to watch:

- **It is a dotfile.** cPanel File Manager hides dotfiles by default — enable
  *Settings → Show Hidden Files (dotfiles)* or you will think it failed to upload.
  Some zip tools also silently drop dotfiles; if you rebuild the zip yourself, confirm
  `.htaccess` is actually inside it.
- **It needs `mod_rewrite`.** This is on by default on virtually all cPanel hosts.

Without it, the site's home page works but **any deep link or refresh 404s**
(e.g. reloading `/courses`), because Apache looks for a real `/courses` directory.
The rewrite rule sends unmatched paths to `index.html` so React Router can handle them.

## 3. Point Supabase at the live domain

Client-side auth redirects are built from `window.location.origin`, so on the live site
they resolve to your real domain. Supabase rejects any redirect not on its allow-list,
so **Google sign-in and password reset will fail in production until you add it**, even
though both work fine on localhost.

In the Supabase dashboard → **Authentication → URL Configuration**:

- **Site URL**: `https://your-domain.co.za`
- **Redirect URLs** — add both:
  - `https://your-domain.co.za/dashboard` (Google OAuth lands here)
  - `https://your-domain.co.za/login?reset=true` (password reset lands here)

If you use Google as the provider, that same origin must also be an authorised redirect
URI in the Google Cloud console for the OAuth client.

## 4. SSL

Enable AutoSSL / Let's Encrypt for the domain in cPanel. `.htaccess` force-redirects
HTTP to HTTPS, so **without a valid certificate the site becomes unreachable rather
than merely insecure** — the redirect sends visitors to an HTTPS URL that cannot be
served. Install the certificate before (or at the same time as) uploading.

## Caching — why you do not need to tell users to hard-refresh

`.htaccess` already sets this up correctly:

| Asset | Cache | Why it is safe |
|---|---|---|
| `index.html` | **0 seconds** | Always revalidated, so it always names the newest assets |
| `assets/*.js`, `assets/*.css` | 1 year | Vite hashes the filename, so a new build produces a new URL |

Every deploy changes the asset hashes, and the uncached `index.html` points at the new
ones. Returning visitors pick up changes on their next page load with no hard-refresh.
Do not add caching for `index.html` — that is precisely what would strand users on an
old stylesheet.

## Post-deploy checks

- [ ] `https://your-domain.co.za` loads (padlock, no mixed-content warnings)
- [ ] **Reload directly on `/courses`** — this is the .htaccess test; a 404 means the
      rewrite is not active
- [ ] Sign in with email, then with Google (Google exercises step 3)
- [ ] Open a lesson: headings bold, code blocks in grey boxes and inside the card
- [ ] Admin panel loads for an admin account
- [ ] `/verify/<some-cert-id>` resolves

## Troubleshooting

**404 on refresh / deep links** — `.htaccess` missing (check hidden files) or
`mod_rewrite` off.

**Blank page, console says "Missing Supabase environment variables"** — built without a
`.env`. Fix `.env` and rebuild; re-uploading the same `dist` will not help.

**Google sign-in returns to the site logged out, or errors on redirect** — the domain
is not in the Supabase redirect allow-list (step 3).

**Site unreachable after enabling HTTPS redirect** — certificate not installed yet.

**Old version still showing** — normally impossible given the cache table above. If it
happens, confirm `index.html` was actually replaced and that no host-level or Cloudflare
cache is sitting in front of it.
