import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateEmail } from '../services/validator/index.js';
import User from '../models/User.js';
import Validation from '../models/Validation.js';

const router = express.Router();

// Ollama API configuration
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

// System prompt for the email validation assistant
const SYSTEM_PROMPT = `You are an email validation assistant. You help users validate email addresses.

When a user asks to validate an email or provides email addresses, you should:
1. Identify the email addresses in their message
2. Respond with a JSON function call in this exact format:
   {"function": "validate_emails", "emails": ["email1@example.com", "email2@example.com"]}

For other queries like:
- Greetings: Respond naturally and explain what you can do
- Questions about credits: Ask them to check their dashboard
- General help: Explain that you can validate email addresses

Keep responses friendly, concise, and helpful. When you detect emails to validate, ALWAYS respond with the JSON function call format.`;

/**
 * POST /api/chat
 * Send a message to the chat assistant
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get user for credit information (already attached by authenticate middleware)
    const user = req.user;

    // Build messages for Ollama
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: `${message}\n\n[User has ${user.credits} credits remaining]`
      }
    ];

    // Call Ollama API
    const ollamaResponse = await fetch(`${OLLAMA_API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: false
      })
    });

    if (!ollamaResponse.ok) {
      const error = await ollamaResponse.text();
      console.error('Ollama API error:', error);
      return res.status(500).json({
        error: 'AI service temporarily unavailable',
        details: error
      });
    }

    const ollamaData = await ollamaResponse.json();
    const assistantMessage = ollamaData.message.content;

    // Check if the response contains a function call
    let functionCall = null;
    let validationResults = null;

    try {
      // Try to parse JSON function call from response
      const jsonMatch = assistantMessage.match(/\{[\s\S]*"function"[\s\S]*\}/);
      if (jsonMatch) {
        functionCall = JSON.parse(jsonMatch[0]);

        if (functionCall.function === 'validate_emails' && functionCall.emails) {
          // Execute email validations
          const emails = functionCall.emails;

          // Check if user has enough credits
          if (user.credits < emails.length) {
            return res.json({
              message: `I found ${emails.length} email(s) to validate, but you only have ${user.credits} credit(s) remaining. Please purchase more credits to continue.`,
              functionCall: null,
              validationResults: null,
              creditsRemaining: user.credits
            });
          }

          // Validate each email
          validationResults = [];
          for (const email of emails) {
            const result = await validateEmail(email.trim());

            // Save validation to database
            await Validation.create({
              userId: user._id,
              email: email.trim(),
              status: result.status,
              riskScore: result.riskScore,
              checks: result.checks,
              reason: result.reason,
              creditsUsed: 1,
              executionTime: result.executionTime
            });

            validationResults.push(result);
          }

          // Deduct credits
          user.credits -= emails.length;
          await user.save();

          // Generate a natural response about the validation
          const resultSummary = validationResults.map((r, i) =>
            `${emails[i]}: ${r.status.toUpperCase()} (Risk: ${r.riskScore}/100)`
          ).join('\n');

          return res.json({
            message: `I've validated ${emails.length} email(s):\n\n${resultSummary}\n\nYou have ${user.credits} credits remaining.`,
            functionCall,
            validationResults,
            creditsRemaining: user.credits
          });
        }
      }
    } catch (parseError) {
      // Not a function call, just return the message
      console.log('No function call detected');
    }

    // Return normal chat response
    return res.json({
      message: assistantMessage,
      functionCall: null,
      validationResults: null,
      creditsRemaining: user.credits
    });

  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({
      error: 'Failed to process chat message',
      details: error.message
    });
  }
});

export default router;
