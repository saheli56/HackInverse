# Quick Start Guide

## 5-Minute Setup

### 1. Get API Keys

**Groq (Primary LLM)**
- Visit: https://console.groq.com
- Create account → Get API key
- Free tier: 30 requests/minute

**Gemini (Fallback LLM)**
- Visit: https://makersuite.google.com/app/apikey
- Create API key
- Free tier: 60 requests/minute

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your keys:
```
VITE_GROQ_API_KEY=gsk_...
VITE_GEMINI_API_KEY=AIza...
```

### 3. Install & Build

```bash
npm install
npm run build
```

### 4. Load Extension

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `dist` folder

### 5. Test It

1. Open `test.html` in browser (or any terms of service page)
2. Press **Ctrl+Space** to activate
3. Say: **"scan page"**
4. Listen to the results

## Voice Commands

| Command | Action |
|---------|--------|
| "scan page" | Analyze current page for risky clauses |
| "list risks" | Show all high-risk clauses found |
| "explain clause" | Get plain English explanation |
| "help" | Learn available commands |

## Keyboard Shortcuts

- **Ctrl+Space** - Start/stop listening

## Troubleshooting

**No voice input?**
- Enable microphone permissions in Chrome
- Use Chrome or Edge (best support)
- Check microphone is not muted

**LLM not working?**
- Verify API keys in `.env`
- Check browser console for errors
- Test Groq API at console.groq.com

**Extension not loading?**
- Rebuild: `npm run build`
- Check for errors in Chrome extensions page
- Verify manifest.json exists in dist/

## Demo Workflow

1. Load test.html
2. Ctrl+Space → "scan page"
3. Wait for scan results
4. Click any high-risk clause
5. Ctrl+Space → "explain clause"
6. Listen to explanation

## Next Steps

- Test on real websites (Twitter ToS, Discord ToS, etc.)
- Customize clause patterns in `src/utils/clauseDetector.ts`
- Adjust UI styling in `src/components/PlainTermsUI.tsx`
- Read DEVELOPMENT.md for architecture details
