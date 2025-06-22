import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Claude API proxy endpoint
app.post('/api/claude', async (req, res) => {
  try {
    const { prompt, maxTokens = 2000 } = req.body;
    
    const apiKey = process.env.VITE_CLAUDE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'Claude API key not configured'
      });
    }

    console.log(`Processing Claude request: ${prompt.length} characters`);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Claude API error: ${response.status} - ${errorText}`);
      return res.status(response.status).json({
        success: false,
        error: `Claude API error: ${response.status} - ${errorText}`
      });
    }

    const data = await response.json();
    
    if (data.content && data.content[0] && data.content[0].type === 'text') {
      const responseText = data.content[0].text;
      console.log(`Claude response: ${responseText.length} characters`);
      
      return res.json({
        success: true,
        response: responseText
      });
    } else {
      console.error('Unexpected Claude response format:', data);
      return res.status(500).json({
        success: false,
        error: 'Unexpected response format from Claude API'
      });
    }

  } catch (error) {
    console.error('Error in Claude proxy:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Claude proxy server is running' });
});

app.listen(port, () => {
  console.log(`🚀 Claude proxy server running on http://localhost:${port}`);
  console.log(`🔑 Claude API key configured: ${!!process.env.VITE_CLAUDE_API_KEY}`);
});