# ClauseGuard

Voice-first Chrome extension that detects risky legal clauses on web pages and explains them in plain English.

## Tech Stack

- TypeScript
- React
- Vite
- Chrome Extension Manifest V3
- Groq API (primary LLM)
- Gemini API (fallback LLM)
- Web Speech API (voice input)
- SpeechSynthesis API (voice output)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your API keys to `.env`:
   - Get Groq API key from: https://console.groq.com
   - Get Gemini API key from: https://makersuite.google.com/app/apikey

4. Build the extension:
```bash
npm run build
```

5. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## Usage

1. Navigate to any page with terms of service or legal text
2. The ClauseGuard UI appears in the top-right corner
3. Press Ctrl+Space or click the button to activate voice
4. Say commands like:
   - "scan page"
   - "list risks"
   - "explain clause"
   - "help"

## Features

- Deterministic clause detection using pattern matching
- Voice-first interaction
- LLM-powered explanations (Groq/Gemini)
- Risk categorization (HIGH/MEDIUM/LOW)
- Clean, premium UI design
