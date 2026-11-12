# Hazelwood Solutions website — setup & security guide

A static, single-page site for GitHub Pages with a secure contact form (Formspree) and a privacy notice.
Work through the parts in order. Total time: about an hour, plus waiting for DNS.

---

## What's in this folder

| File | What it does |
|---|---|
| `index.html` | The homepage (services, case study, about, contact form) |
| `privacy.html` | UK GDPR privacy notice — required because the form collects personal data |
| `404.html` | Friendly "page not found" page |
| `assets/css/style.css` | All styling (no inline styles — needed for the security policy) |
| `assets/js/main.js` | Menu, animations, form sending, clickjacking defence |
| `assets/fonts/` | Poppins & Inter, self-hosted (no Google tracking, no cookies) |
| `.well-known/security.txt` | Tells security researchers how to report problems to you |
| `CNAME` | Your custom domain (`hazelwoodsolutions.co.uk`) |
| `.nojekyll` | Tells GitHub to publish files as-is (needed for `.well-known`) |
| `robots.txt` | Lets search engines index the site |

## What's been done for security

- **Strict Content Security Policy** on every page: only files from your own site can load, scripts can't be injected, and the form can only send to Formspree. Even if someone slipped code into the page, the browser would refuse to run it.
- **No third-party scripts, fonts or trackers.** Nothing loads from Google or anywhere else, so there's nothing external to be compromised — and no cookie banner needed.
- **Clickjacking defence**: the site refuses to be displayed inside another website's frame.
- **Contact form hardening**: hidden honeypot field + "too fast to be human" check to drop bots, length limits on every field, no `innerHTML` (so nothing typed in the form can run as code), and a note asking people not to send sensitive information.
- **Referrer policy** so full page addresses aren't leaked to other sites.
- **HTTPS enforced** (Part 4) and **domain verified** with GitHub (Part 3) so nobody can hijack your domain.
- **security.txt** and a privacy notice — signs of a professional, security-literate business.

---

## Part 1 — Lock down your accounts first

The site is only as secure as the accounts that control it.

1. **GitHub**: Settings → Password and authentication → turn on **two-factor authentication** (use a passkey or an authenticator app, not SMS). Save the recovery codes somewhere safe.
2. **GitHub email privacy**: Settings → Emails → tick **Keep my email addresses private**, so your personal address doesn't appear in public commit history.
3. **GoDaddy**: turn on two-step verification, and make sure **Domain Lock** (transfer lock) is on for `hazelwoodsolutions.co.uk`.
4. **Formspree**: use a strong, unique password (a password manager is ideal) and turn on two-factor if it's offered.

## Part 2 — Set up the contact form (Formspree)

1. Sign up at formspree.io and click **+ New Form**. Name it "Hazelwood website" and set the recipient to the inbox you check (e.g. `hello@...`).
2. Copy the form ID — the bit after `/f/` in the endpoint, e.g. `https://formspree.io/f/abcdwxyz` → `abcdwxyz`.
3. Open `index.html`, find `YOUR_FORM_ID` and replace it with your ID. Save.
4. In the form's **Settings** in Formspree:
   - If your plan offers **Restrict to domain**, set it to `hazelwoodsolutions.co.uk` so only your site can use the form.
   - Leave spam filtering on. The site already includes a `_gotcha` honeypot field that Formspree recognises.
   - If test submissions from the site fail with a reCAPTCHA error, turn off Formspree's default reCAPTCHA for this form — the site sends submissions in the background, and the honeypot and timing check handle basic bots.

Until you add a real form ID, the form shows a friendly "please email us instead" message rather than breaking.

## Part 3 — Create the repository and upload

1. On GitHub: **+ → New repository**. Name it `yourusername.github.io` (your exact username). Set it to **Public** (required for free GitHub Pages). Don't add a README or licence. Click **Create repository**.
2. Click **uploading an existing file**. Open this folder on your computer, select **everything inside it** (not the folder itself), and drag it onto the page. Commit to `main`.
3. **Check the hidden files arrived.** Mac and Windows often hide files starting with a dot, so they may not upload. In the repository's file list, check you can see `.nojekyll` and the `.well-known` folder. If either is missing:
   - **Add file → Create new file**, name it `.nojekyll`, leave it empty, commit.
   - **Add file → Create new file**, name it `.well-known/security.txt` (typing the `/` creates the folder), paste in the contents of that file from this folder, commit.

> Prefer an easier route? **GitHub Desktop** (free) uploads hidden files reliably and makes future updates a drag-and-drop.

## Part 4 — Verify your domain, then switch on Pages

Verify the domain **before** pointing it at GitHub. This stops anyone else on GitHub from hijacking your domain if your site is ever switched off.

1. Click your profile picture → **Settings → Pages** (your *account* settings, not the repository's).
2. Under **Verified domains**, click **Add a domain**, enter `hazelwoodsolutions.co.uk`.
3. GitHub shows a **TXT record** (name like `_github-pages-challenge-yourusername`, plus a value). Add it in GoDaddy DNS (Part 5), wait a few minutes, then click **Verify**. **Never delete this TXT record** — it has to stay to keep the domain verified.
4. Now go to the **repository → Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
5. Under **Custom domain** enter `hazelwoodsolutions.co.uk` and save (the `CNAME` file already contains it).

## Part 5 — DNS records in GoDaddy

My Products → `hazelwoodsolutions.co.uk` → **DNS**.

1. Delete any existing **A** records with name `@` (GoDaddy's parking page).
2. Add these records:

| Type | Name | Value | Why |
|---|---|---|---|
| A | `@` | `185.199.108.153` | GitHub Pages |
| A | `@` | `185.199.109.153` | GitHub Pages |
| A | `@` | `185.199.110.153` | GitHub Pages |
| A | `@` | `185.199.111.153` | GitHub Pages |
| CNAME | `www` | `yourusername.github.io` | Makes `www.` work |
| TXT | `_github-pages-challenge-yourusername` | *(value from Part 4)* | Domain verification |
| CAA | `@` | `0 issue "letsencrypt.org"` | Only GitHub's certificate provider may issue certificates for your domain |

Optional: add AAAA records for IPv6 — `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`.

3. If GoDaddy offers **DNSSEC** for your domain, switch it on — it stops attackers forging your DNS answers.

## Part 6 — Enforce HTTPS

Once the DNS check in **repository → Settings → Pages** goes green (usually under an hour), tick **Enforce HTTPS**. If it's greyed out, wait 15 minutes and refresh. This can take up to 24 hours for the certificate.

## Part 7 — Protect your email domain (strongly recommended)

A new business domain is an easy target for people sending phishing emails pretending to be you. In Microsoft 365 admin (Settings → Domains), add your domain and create the **SPF**, **DKIM** and **DMARC** records it gives you in GoDaddy. Start DMARC at `p=none`, then move to `p=quarantine` once you've confirmed your own emails pass.

## Part 8 — Test it

- [ ] `https://hazelwoodsolutions.co.uk` loads with a padlock; `www.` and `http://` versions redirect to it
- [ ] Menu, links and the mobile menu work
- [ ] Send a test enquiry — it arrives in your inbox, and the page shows the green "Thanks" message
- [ ] `https://hazelwoodsolutions.co.uk/.well-known/security.txt` shows your contact details
- [ ] `https://hazelwoodsolutions.co.uk/privacy.html` loads
- [ ] In Chrome, press F12 → **Console** on the homepage: there should be **no red "Content Security Policy" errors**
- [ ] Run a scan at **developer.mozilla.org/observatory**

**About scanner scores:** GitHub Pages doesn't let you set custom HTTP headers, so tools like securityheaders.com will report some headers "missing" (X-Frame-Options, Permissions-Policy, etc.). The site compensates in-page — the security policy is set in each page's `<meta>` tag and clickjacking is handled in the script — but scanners only read headers. If you want a top score later, put the free tier of **Cloudflare** in front of the site and add those headers there. Not essential for a brochure site.

---

## Keeping it secure

- **Making changes**: edit files on GitHub (pencil icon) or re-upload. Don't add `<script>` tags, inline `style="..."` attributes, or embeds from other sites — the security policy will block them. If you ever need something external (e.g. a booking widget), update the `Content-Security-Policy` line in the `<head>` of each page to allow that one domain only.
- **Never put secrets in the repository.** It's public. Your Formspree form ID isn't a secret (it's visible in every visitor's browser), but passwords, API keys and client data must never go in.
- **Every November**: update the `Expires:` date in `.well-known/security.txt` (it must be under a year ahead) and review the privacy notice date.
- **Check Formspree submissions** occasionally for spam trends; tighten spam settings if needed.
- **ICO fee**: most UK businesses that process personal data (including client contact details) must pay the ICO data protection fee — check at ico.org.uk if you haven't already.

## Before you go live — check these

1. **Email address vs domain**: the site uses `hello@hazelwoodsolutions.com`, but the domain is `hazelwoodsolutions.co.uk`. Make sure the address is real and receiving mail, or change it in `index.html`, `privacy.html` and `.well-known/security.txt`.
2. **Privacy notice**: it's a sensible starting template, not legal advice. Check the retention period (12 months) suits you.
3. **Fonts**: Poppins and Inter are used under the SIL Open Font License; keep `assets/fonts/OFL.txt` alongside them.
