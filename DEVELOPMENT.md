# Development Guide

## Architecture

### Core Components

1. **Content Script** (`src/content/index.tsx`)
   - Injects React UI into web pages
   - Runs on all URLs
   - Manages DOM manipulation

2. **Background Service Worker** (`src/background/service-worker.ts`)
   - Handles Chrome extension lifecycle
   - Manages storage for API keys
   - Routes messages between components

3. **React UI** (`src/components/PlainTermsUI.tsx`)
   - Main user interface
   - Voice interaction controls
   - Displays scan results

### Services

1. **VoiceInterface** (`src/services/voiceInterface.ts`)
   - Wraps Web Speech API for speech-to-text
   - Wraps SpeechSynthesis API for text-to-speech
   - Manages listening and speaking state

2. **LLMService** (`src/services/llmService.ts`)
   - Primary: Groq API
   - Fallback: Gemini API
   - Explains clauses in plain English

### Utilities

1. **clauseDetector** (`src/utils/clauseDetector.ts`)
   - Pattern-based clause detection
   - No LLM required for detection
   - Categorizes risk levels

2. **voiceParser** (`src/utils/voiceParser.ts`)
   - Parses voice commands into intents
   - Deterministic pattern matching
   - Maps to VoiceIntent enum

## Data Flow

1. User presses Ctrl+Space or clicks button
2. VoiceInterface starts listening
3. User says command (e.g., "scan page")
4. voiceParser determines intent
5. clauseDetector scans page text
6. Results displayed in UI
7. User selects clause
8. LLMService explains clause
9. VoiceInterface speaks explanation

## Design Principles

### Deterministic First
- Clause detection uses regex patterns
- Voice parsing uses pattern matching
- LLM only for explanations

### Premium UI
- No purple gradients
- No glassmorphism
- Clean, minimal design
- Inspired by Stripe, Linear, Notion

### Voice-First
- Ctrl+Space shortcut
- All features accessible via voice
- Text-to-speech feedback

## Development Workflow

1. Make changes to source files
2. Run `npm run build`
3. Reload extension in Chrome
4. Test on sample legal pages

## Testing

### Test URLs
- https://www.termsfeed.com/blog/sample-terms-conditions-template/
- Privacy policies
- Terms of service pages

### Voice Commands
- "scan page"
- "list risks"
- "explain clause"
- "help"

## Common Issues

### Voice not working
- Check browser supports Web Speech API
- Enable microphone permissions
- Chrome/Edge recommended

### LLM errors
- Verify API keys in .env
- Check network connectivity
- Groq fallback to Gemini

### Build errors
- Clear dist folder
- Run `npm install`
- Check TypeScript errors
