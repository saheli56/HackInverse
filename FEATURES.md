# ClauseGuard - Feature Overview

## Core Features

### 1. Voice Interface
- **Speech-to-Text**: Browser Web Speech API
- **Text-to-Speech**: Browser SpeechSynthesis API
- **Keyboard Shortcut**: Ctrl+Space activation
- **Intent Recognition**: Pattern-based voice command parsing

### 2. Clause Detection
- **Pattern-Based**: Regex matching for common risky clauses
- **Risk Levels**: HIGH, MEDIUM, LOW
- **Categories**:
  - Data Privacy
  - Arbitration
  - Liability
  - Modification Rights
  - Termination
  - Indemnification
  - Warranty Disclaimers
  - Jurisdiction

### 3. LLM Integration
- **Primary**: Groq API (llama-3.3-70b-versatile)
- **Fallback**: Gemini API (gemini-pro)
- **Usage**: Clause explanations only (not full-doc analysis)
- **Output**: Plain English + risks + alternatives

### 4. Chrome Extension
- **Manifest V3**: Modern extension architecture
- **Content Script**: Injected React UI
- **Background Worker**: Message routing & storage
- **Permissions**: activeTab, storage

### 5. Premium UI
- **Design Philosophy**: Clean, minimal, professional
- **Inspired By**: Stripe, Linear, Notion, Arc
- **Color Palette**: Neutral grays, subtle accents
- **No**: Purple gradients, glassmorphism, neon

## Architecture

### File Structure
```
src/
├── components/
│   └── ClauseGuardUI.tsx          Main React UI
├── services/
│   ├── voiceInterface.ts          Speech APIs wrapper
│   └── llmService.ts              Groq/Gemini integration
├── utils/
│   ├── clauseDetector.ts          Pattern-based detection
│   ├── voiceParser.ts             Intent recognition
│   ├── storage.ts                 Chrome storage helpers
│   ├── sampleTerms.ts             Test data
│   └── testPage.ts                Dev utilities
├── types/
│   ├── index.ts                   Core types
│   └── llm.ts                     LLM configs
├── content/
│   └── index.tsx                  Content script entry
├── background/
│   └── service-worker.ts          Background worker
└── vite-env.d.ts                  Type definitions
```

### Tech Stack
- **Language**: TypeScript (100%)
- **UI Framework**: React 18
- **Build Tool**: Vite
- **Runtime**: Chrome Extension MV3
- **LLM**: Groq (primary), Gemini (fallback)
- **Voice**: Web Speech API, SpeechSynthesis

### Data Flow
1. User activates voice (Ctrl+Space)
2. Web Speech API captures speech
3. Voice parser determines intent
4. Clause detector scans page (deterministic)
5. Results displayed in UI
6. User selects clause
7. LLM explains clause (Groq/Gemini)
8. SpeechSynthesis reads explanation

## Detection Patterns

### High Risk
- Data selling to third parties
- Forced arbitration clauses
- Class action waiver
- Indemnification requirements

### Medium Risk
- Modification without notice
- At-will termination
- Liability exclusions

### Low Risk
- "As is" warranties
- Standard disclaimers

## Voice Commands

| Intent | Patterns | Action |
|--------|----------|--------|
| SCAN_PAGE | "scan page", "check page", "find clauses" | Analyze current page |
| EXPLAIN_CLAUSE | "explain clause", "what does this mean" | LLM explanation |
| LIST_RISKS | "list risks", "show risks" | Display high-risk clauses |
| HELP | "help", "what can you do" | Show available commands |

## API Integration

### Groq
- Endpoint: `https://api.groq.com/openai/v1/chat/completions`
- Model: `llama-3.3-70b-versatile`
- Temperature: 0.3
- Max tokens: 500

### Gemini
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- Temperature: 0.3
- Max tokens: 500

## Development

### Prerequisites
- Node.js 18+
- npm 9+
- Chrome/Edge browser

### Build Commands
```bash
npm install          # Install dependencies
npm run build        # Production build
npm run dev          # Development mode
./build.sh          # Build + instructions
```

### Testing
1. Load extension in Chrome
2. Open test.html
3. Use voice commands
4. Verify detection accuracy
5. Test LLM explanations

## Deployment

### Chrome Web Store
1. Build production version
2. Create developer account
3. Upload dist/ folder
4. Submit for review

### Local Testing
1. Build: `npm run build`
2. Load unpacked from dist/
3. Test on various websites

## Future Enhancements

### Potential Features
- PDF clause analysis
- Export findings to JSON
- Comparison view (before/after)
- Risk score calculation
- Multi-language support
- Custom pattern templates

### Performance
- Lazy load LLM service
- Cache explanations
- Optimize pattern matching
- Reduce bundle size

### UI Improvements
- Dark mode
- Clause highlighting on page
- Keyboard navigation
- Accessibility (ARIA)

## License & Usage

This project is built for hackathons and demonstrations.
Review LICENSE file for details.

## Credits

Built with modern web technologies:
- React + TypeScript
- Vite
- Groq API
- Gemini API
- Chrome Extensions API
- Web Speech API
