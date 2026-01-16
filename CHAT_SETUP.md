# Chat-Based Email Validation - Setup Guide

## Overview

The landing page has been transformed into a modern chat interface powered by Ollama (local LLM). Users can now validate emails through natural conversation with an AI assistant.

## What's New

### For Non-Authenticated Users

- Clean landing page with AI-powered chat messaging
- Simple sign up / sign in buttons
- Feature showcase

### For Authenticated Users

- Full chat interface replacing the traditional dashboard
- Natural language email validation
- CSV file upload through chat
- Real-time validation results displayed as rich cards
- Credit balance shown in the header

## Prerequisites

### 1. Install Ollama

Download and install Ollama from: https://ollama.com/

### 2. Pull the Llama 3.2 Model

After installing Ollama, open a terminal and run:

```bash
ollama pull llama3.2
```

This will download the Llama 3.2 model (default model configured in the system).

### 3. Start Ollama Service

Ollama should start automatically after installation. Verify it's running:

```bash
curl http://localhost:11434/api/tags
```

You should see a list of available models.

## Running the Application

### 1. Start Backend (Already Running)

The backend is already configured and running on port 4000.

### 2. Start Frontend

In a new terminal:

```bash
cd /Users/jrb/dev/coldmailer/frontend
npm run dev
```

The frontend will run on http://localhost:3000

## How to Use the Chat Interface

### Basic Conversation Examples

**User:** "Hi"
**AI:** Responds with a greeting and explains what it can do

**User:** "Validate john@example.com"
**AI:** Validates the email and shows detailed results including:

- Status (valid/invalid/risky/unknown)
- Risk score (0-100)
- Detailed checks (DNS, MX, SMTP, etc.)
- Execution time

**User:** "Check these emails: test@gmail.com, admin@company.com"
**AI:** Validates all provided emails and displays results for each

### File Upload

1. Click the upload button (📎 icon) in the chat input
2. Select a CSV file with email addresses
3. The AI will confirm the upload and start bulk validation
4. You can ask about job status by referencing the job ID

### How It Works

1. **User sends a message** → Chat API receives it
2. **Message forwarded to Ollama** with conversation history
3. **Ollama analyzes the message** and detects if validation is needed
4. **If emails detected** → Ollama returns a JSON function call
5. **Backend executes validation** using existing validation microservice
6. **Results returned** to the chat as rich validation cards

## Architecture

### Backend Changes

- **New Route:** `/api/chat` (POST)
  - Accepts user messages
  - Forwards to Ollama with system prompt
  - Detects validation requests via JSON function calls
  - Executes validations using existing `validateEmail()` function
  - Returns results with updated credit balance

### Frontend Changes

- **New Components:**
  - `ChatMessage.vue` - Message bubbles with validation result cards
  - `ChatInput.vue` - Input field with file upload button

- **New Composable:**
  - `useChat.ts` - Manages chat state and API calls

- **Updated Pages:**
  - `index.vue` - Chat interface for authenticated users, simple landing for guests

### Integration

- Uses **existing validation APIs** (`/api/validate`, `/api/bulk/upload`)
- No changes to validation logic or microservices
- Ollama acts as an intelligent conversation layer
- All validation still tracked in MongoDB

## Configuration

### Environment Variables (backend/.env)

```env
# Ollama Configuration
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### Switching to OpenAI or Other LLM APIs

To switch from Ollama to OpenAI in the future, modify `/backend/routes/chat.js`:

1. Replace the Ollama API call with OpenAI API:

```javascript
// Instead of
const ollamaResponse = await fetch(`${OLLAMA_API_URL}/api/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: OLLAMA_MODEL,
    messages,
    stream: false,
  }),
})

// Use OpenAI
const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages,
    temperature: 0.7,
  }),
})
```

2. Update environment variables:

```env
# OpenAI Configuration
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=gpt-4
```

## Testing

### Manual Testing Checklist

1. ✅ Backend server starts without errors
2. ⏳ Visit http://localhost:3000 (not logged in) - see landing page
3. ⏳ Sign up / Log in
4. ⏳ Chat interface appears with greeting message
5. ⏳ Send "Hi" - get response from AI
6. ⏳ Send "Validate test@example.com" - see validation results
7. ⏳ Send multiple emails - see multiple results
8. ⏳ Upload CSV file - bulk validation starts
9. ⏳ Check credits decrease after validation

## System Prompt

The AI assistant uses this system prompt to understand its role:

```
You are an email validation assistant. You help users validate email addresses.

When a user asks to validate an email or provides email addresses, you should:
1. Identify the email addresses in their message
2. Respond with a JSON function call in this exact format:
   {"function": "validate_emails", "emails": ["email1@example.com", "email2@example.com"]}

For other queries like:
- Greetings: Respond naturally and explain what you can do
- Questions about credits: Ask them to check their dashboard
- General help: Explain that you can validate email addresses

Keep responses friendly, concise, and helpful.
```

## Troubleshooting

### Ollama Connection Error

**Error:** "AI service temporarily unavailable"

**Solution:**

1. Check if Ollama is running: `curl http://localhost:11434/api/tags`
2. Restart Ollama
3. Verify the model is pulled: `ollama list`

### No Response from Chat

**Issue:** Messages send but no response

**Solution:**

1. Check browser console for errors
2. Verify backend logs
3. Ensure you're logged in (check localStorage for token)

### Validation Not Working

**Issue:** AI responds but doesn't validate emails

**Solution:**

1. Check if Ollama is detecting emails correctly
2. Review backend logs for function call parsing
3. Verify the email format in the message

## Next Steps

- Add support for job status queries in chat
- Implement conversation history persistence
- Add more natural language commands (e.g., "show my history", "buy credits")
- Enhance UI with typing indicators and better loading states
- Add support for more LLM providers (Anthropic Claude, Google Gemini, etc.)

## Notes

- The chat does not persist conversation history across page refreshes (feature to add)
- File uploads are processed immediately and create bulk jobs
- All existing APIs remain unchanged - chat is purely a new interface layer
- Credits are still deducted the same way (1 per email validation)
