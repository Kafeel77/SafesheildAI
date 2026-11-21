# ScamShield AI 🛡️

An AI-powered scam-protection web app for senior citizens in Malaysia, built for an AI hackathon.

## What it does

- **Home screen** — large buttons, blue/white theme, "Your Safety Matters. We Are Here to Protect You."
- **Scam Message Detector** — paste WhatsApp/SMS text or upload a screenshot (OCR via Tesseract.js); returns HIGH RISK / POTENTIAL RISK / NO OBVIOUS WARNING SIGNS with simple explanations and advice.
- **TikTok Job & Investment Checker** — detects guaranteed returns, daily-earnings promises, advance registration fees, personal-account payments, pressure tactics.
- **Suspicious Link Checker** — inspects link text without opening it (phishing tricks, brand impersonation of Malaysian banks, bad TLDs). Never declares an unchecked site safe.
- **Ask AI** — chatbot for questions like "Someone is asking for my OTP. What should I do?"
- **Emergency guide** — bank first, Malaysia NSRC **997**, preserve evidence; tel: links to call.
- **Accessibility** — English / Bahasa Malaysia toggle, voice input (Web Speech API), read-aloud (text-to-speech), large text.

## Running

```
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Then open http://localhost:8899/

## Enabling genuine AI analysis (optional)

The frontend works fully offline using built-in safety rules; results are always clearly labelled as offline checks. To enable real AI analysis through the backend, set environment variables before starting the server:

```
set SCAMSHIELD_API_KEY=your-key-here
set SCAMSHIELD_API_URL=https://api.openai.com/v1/chat/completions   (optional; any OpenAI-compatible endpoint)
set SCAMSHIELD_MODEL=gpt-4o-mini                                     (optional)
powershell -ExecutionPolicy Bypass -File serve.ps1
```

The API key lives only in the server's environment — it is never exposed to the frontend.

## Files

| File | Purpose |
|---|---|
| `index.html` | UI (senior-friendly, mobile-responsive) |
| `app.js` | Frontend logic, i18n, AI calls + offline fallback |
| `rules.js` | On-device scam-detection rules (EN + BM) |
| `serve.ps1` | Local server + secure AI proxy (`/api/*`) |
| `sw.js`, `manifest.json`, `icon.svg` | PWA support |

No sensitive financial information is stored; analysis inputs stay in memory only.
