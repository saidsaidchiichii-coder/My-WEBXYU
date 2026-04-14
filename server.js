/**
 * ============================================================================
 * 🚀 BACKEND API SERVER - NODE.JS + EXPRESS
 * ============================================================================
 * 
 * This server provides:
 * 1. AI Chat integration with OpenAI
 * 2. Advanced Darija (Moroccan Dialect) processing
 * 3. Franco-Arabic (Arabizi) to Arabic conversion
 * 4. Language detection and routing
 * 5. Dynamic System Prompt management
 * 6. Response formatting for MSA and Darija
 * 
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// ==================== LANGUAGE PROCESSING UTILITIES ====================

/**
 * Detect language of input text
 */
function detectLanguage(text) {
    const arabicRegex = /[\u0600-\u06FF]/g;
    const englishRegex = /[a-zA-Z]/g;
    const numberRegex = /[0-9]/g;

    const arabicCount = (text.match(arabicRegex) || []).length;
    const englishCount = (text.match(englishRegex) || []).length;
    const numberCount = (text.match(numberRegex) || []).length;

    // Check for Franco (numbers with English letters)
    if (numberCount > 0 && englishCount > 0 && arabicCount === 0) {
        return 'franco';
    }

    // Check for Darija keywords
    const darijaKeywords = ['بزاف', 'شنو', 'علاش', 'فين', 'كيفاش', 'إييه', 'واش', 'دابا', 'غادي', 'كاين'];
    let darijaScore = 0;
    for (const keyword of darijaKeywords) {
        if (text.includes(keyword)) darijaScore++;
    }

    if (darijaScore > 0 || (arabicCount > 0 && text.includes('g'))) {
        return 'darija';
    }

    if (arabicCount > englishCount) return 'arabic';
    return 'english';
}

/**
 * Convert Franco to Arabic script (Simplified)
 */
function convertFranco(text) {
    const map = {
        '3': 'ع', '7': 'ح', '9': 'ق', '2': 'ء', '5': 'خ', '8': 'ف', '4': 'أ', '6': 'ط'
    };
    let result = text.toLowerCase();
    for (const [num, char] of Object.entries(map)) {
        result = result.replace(new RegExp(num, 'g'), char);
    }
    return result;
}

// ==================== SYSTEM PROMPT GENERATOR ====================

function getSystemPrompt(language) {
    const basePrompt = `
You are an advanced AI assistant named Grok. 
You are friendly, helpful, and intelligent.
`;

    if (language === 'darija' || language === 'franco') {
        return `
${basePrompt}
IMPORTANT: The user is speaking in Moroccan Darija (or Arabizi).
- YOU MUST RESPOND IN MOROCCAN DARIJA ONLY.
- DO NOT translate.
- DO NOT explain the sentence.
- DO NOT say "I see you are typing in Darija".
- Be natural, like a real Moroccan person.
- Keep responses short, clear, and friendly.
- Use common Moroccan expressions (e.g., "إييه", "مزيان", "بزاف", "واخا").
`;
    }

    if (language === 'arabic') {
        return `
${basePrompt}
IMPORTANT: The user is speaking in Modern Standard Arabic (MSA).
- YOU MUST RESPOND IN MODERN STANDARD ARABIC ONLY.
- Use professional and clear Arabic.
- Do not mix with English or other languages unless necessary for technical terms.
`;
    }

    return `
${basePrompt}
- Respond in the language used by the user.
- If the user asks for Arabic, use Modern Standard Arabic.
- If the user asks for Darija, use Moroccan Darija.
`;
}

// ==================== API ENDPOINTS ====================

/**
 * Chat Endpoint
 */
app.post('/api/chat', async (req, res) => {
    const { message, config } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        // 1. Preprocessing
        const lang = detectLanguage(message);
        let processedMessage = message;
        if (lang === 'franco') {
            processedMessage = convertFranco(message);
        }

        // 2. Determine System Prompt
        const systemPrompt = getSystemPrompt(lang);

        // 3. Call OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: processedMessage }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        const reply = response.choices[0].message.content;

        // 4. Return Response
        res.json({
            reply: reply,
            language: lang,
            processed: processedMessage !== message ? processedMessage : null
        });

    } catch (error) {
        console.error('Error in chat API:', error);
        res.status(500).json({ 
            reply: "عذراً، وقع خطأ في الاتصال. حاول مرة أخرى لاحقاً.",
            error: error.message 
        });
    }
});

/**
 * Status Endpoint
 */
app.get('/api/status', (req, res) => {
    res.json({ status: 'online', version: '2.0.0' });
});

// Start Server
app.listen(port, () => {
    console.log(`🚀 Grok API Server running on port ${port}`);
});
