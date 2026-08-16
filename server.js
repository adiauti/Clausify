const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Check if API key is configured
if (!ANTHROPIC_API_KEY) {
  console.error('ERROR: ANTHROPIC_API_KEY not found in .env file');
  process.exit(1);
}

// ── ANALYSE ENDPOINT ──
app.post('/api/analyse', async (req, res) => {
  try {
    const { document } = req.body;

    if (!document || document.trim() === '') {
      return res.status(400).json({ error: 'Document text is required' });
    }

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANTHROPIC_API_KEY}`,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `You are a legal document analyser. Analyse this document and respond ONLY with a valid JSON object — no markdown, no backticks, no extra text. Structure:
{"summary":"2-3 sentence plain English summary","riskLevel":"high or medium or low","riskScore":0-100,"riskSummary":"one sentence on overall risk","clauses":[{"text":"exact short phrase max 8 words","risk":"high or med or low","name":"clause name","explanation":"plain English explanation 1-2 sentences"}],"highlightedDoc":"document text with risky phrases wrapped as <HL class=\\"high\\">phrase</HL> or <HL class=\\"med\\">phrase</HL> or <HL class=\\"low\\">phrase</HL>"}
Document: ${document}`
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'Failed to analyse document'
      });
    }

    // Extract and parse the response
    let result;
    try {
      const content = data.content[0].text;
      result = JSON.parse(content.replace(/```json|```/g, '').trim());
    } catch (parseError) {
      return res.status(500).json({
        error: 'Failed to parse API response',
        details: parseError.message
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: 'Server error during analysis',
      details: error.message
    });
  }
});

// ── CHAT ENDPOINT ──
app.post('/api/chat', async (req, res) => {
  try {
    const { question, documentContext } = req.body;

    if (!question || question.trim() === '') {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!documentContext || documentContext.trim() === '') {
      return res.status(400).json({ error: 'Document context is required' });
    }

    // Call Anthropic API for chat
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANTHROPIC_API_KEY}`,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `You are a helpful legal assistant. Document: "${documentContext}". Answer in plain English, 2-4 sentences. Suggest consulting a lawyer for serious matters. Question: ${question}`
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'Failed to process question'
      });
    }

    res.json({
      answer: data.content[0].text
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Server error during chat',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Clausify backend server running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/analyse - Analyse document`);
  console.log(`   POST http://localhost:${PORT}/api/chat - Chat about document`);
  console.log(`   GET  http://localhost:${PORT}/api/health - Health check`);
});
