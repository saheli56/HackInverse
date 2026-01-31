# ClauseGuard

Text-first Chrome extension that analyzes risky legal clauses on web pages and explains them in plain English.

## Tech Stack

- TypeScript
- React
- Vite
- Chrome Extension Manifest V3
- Groq API (llama-3.1-8b)
- Gemini API (gemini-2.5-flash)
- Web Speech API (optional voice assistance)
- SpeechSynthesis API (optional voice output)

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
2. The ClauseGuard panel appears in the top-right corner
3. View the automatic analysis:
   - Document type and overall risk level
   - Key takeaways in plain English
   - Important clauses grouped by category
   - Common questions with one-click answers
4. Click any clause to expand and see detailed explanation
5. Optionally use voice assistance for hands-free interaction

## Features

- Automatic page scanning on load
- Text-first interface (fully usable without voice)
- Document type detection
- Overall risk assessment
- Key takeaways extraction
- Clause categorization and grouping
- Expandable clause details with AI explanations
- Suggested questions based on detected clauses
- Optional voice assistance for accessibility
- Clean, premium UI design
