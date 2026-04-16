/**
 * AI Control Dashboard - 3 Agents System
 * Core Logic for managing 3 independent AI chat panels
 */

const AI_CONFIG = {
    builder: {
        name: "Builder",
        role: "المطور والمنفذ",
        color: "#f59e0b",
        welcome: "مرحباً! أنا Builder، مسؤول عن البرمجة والتنفيذ. كيف يمكنني مساعدتك في بناء مشروعك اليوم؟"
    },
    analyst: {
        name: "Analyst",
        role: "المحلل والمخطط",
        color: "#8b5cf6",
        welcome: "أهلاً بك، أنا Analyst. أقوم بتحليل الأفكار واقتراح التحسينات لضمان أفضل أداء وأمان. ما الذي تود تحليله؟"
    },
    tester: {
        name: "Tester",
        role: "المختبر والمساعد",
        color: "#10b981",
        welcome: "مرحباً، أنا Tester. وظيفتي مراجعة الكود، البحث عن الأخطاء، وتقديم المساعدة العامة. كيف أساعدك؟"
    }
};

// State management for each panel
const states = {
    builder: { history: [] },
    analyst: { history: [] },
    tester: { history: [] }
};

/**
 * Auto-resize textarea based on content
 */
function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
}

/**
 * Handle Enter key for sending messages
 */
function handleKeydown(event, agent) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage(agent);
    }
}

/**
 * Send message to a specific AI agent
 */
function sendMessage(agent) {
    const input = document.getElementById(`input-${agent}`);
    const text = input.value.trim();
    
    if (!text) return;

    // 1. Add user message to UI
    appendMessage(agent, 'user', text);
    
    // 2. Clear input
    input.value = "";
    input.style.height = 'auto';

    // 3. Show thinking effect
    const thinkingId = showThinking(agent);

    // 4. Simulate AI response (Parallel processing)
    setTimeout(() => {
        removeThinking(agent, thinkingId);
        const response = generateMockResponse(agent, text);
        appendMessage(agent, 'ai', response);
    }, 1500 + Math.random() * 1000);
}

/**
 * Append message to the chat area
 */
function appendMessage(agent, role, text) {
    const container = document.getElementById(`messages-${agent}`);
    const wrapper = document.createElement("div");
    wrapper.className = `msg-wrapper ${role}`;
    
    const msgDiv = document.createElement("div");
    msgDiv.className = `msg ${role}`;
    
    // Handle code blocks if present
    if (text.includes("```")) {
        msgDiv.innerHTML = formatMessage(text);
    } else {
        msgDiv.textContent = text;
    }
    
    wrapper.appendChild(msgDiv);
    container.appendChild(wrapper);
    
    // Scroll to bottom
    container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
    });

    // Save to state
    states[agent].history.push({ role, text, time: new Date() });
}

/**
 * Show thinking animation
 */
function showThinking(agent) {
    const container = document.getElementById(`messages-${agent}`);
    const thinkingDiv = document.createElement("div");
    const id = "thinking-" + Date.now();
    thinkingDiv.id = id;
    thinkingDiv.className = "thinking";
    thinkingDiv.innerHTML = "<span></span><span></span><span></span>";
    
    container.appendChild(thinkingDiv);
    container.scrollTop = container.scrollHeight;
    return id;
}

/**
 * Remove thinking animation
 */
function removeThinking(agent, id) {
    const thinkingDiv = document.getElementById(id);
    if (thinkingDiv) thinkingDiv.remove();
}

/**
 * Clear chat history for a panel
 */
function clearChat(agent) {
    const container = document.getElementById(`messages-${agent}`);
    container.innerHTML = "";
    states[agent].history = [];
    
    // Add welcome message back
    appendMessage(agent, 'ai', AI_CONFIG[agent].welcome);
}

/**
 * Simple markdown-like formatter for code blocks
 */
function formatMessage(text) {
    return text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const highlighted = highlightCode(code.trim());
        return `
            <div class="code-block">
                <div class="code-header">
                    <span>${lang || 'code'}</span>
                    <span style="cursor:pointer" onclick="copyCode(this)">Copy</span>
                </div>
                <pre><code>${highlighted}</code></pre>
            </div>
        `;
    });
}

/**
 * Basic syntax highlighting
 */
function highlightCode(code) {
    return code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/(\/\/.*)/g, '<span class="cmt">$1</span>')
        .replace(/(["\'`].*?["\'`])/g, '<span class="str">$1</span>')
        .replace(/\b(\d+)\b/g, '<span class="num">$1</span>')
        .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await)\b/g, '<span class="kw">$1</span>')
        .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\(/g, '<span class="fn">$1</span>(');
}

/**
 * Copy code to clipboard
 */
window.copyCode = function(btn) {
    const code = btn.parentElement.nextElementSibling.innerText;
    navigator.clipboard.writeText(code).then(() => {
        const originalText = btn.innerText;
        btn.innerText = "Copied!";
        setTimeout(() => btn.innerText = originalText, 2000);
    });
};

/**
 * Mock response generator based on agent role
 */
function generateMockResponse(agent, userText) {
    const responses = {
        builder: [
            "لقد قمت بتحليل طلبك البرمجي. إليك نموذج أولي للكود:\n```javascript\nfunction solveProblem() {\n  console.log('Building solution...');\n  return true;\n}\n```",
            "سأقوم بتنفيذ هذه الميزة فوراً. هل هناك تفاصيل تقنية أخرى تود إضافتها؟",
            "هذا التحدي البرمجي مثير للاهتمام. سأبدأ ببناء الهيكل الأساسي."
        ],
        analyst: [
            "من منظور تحليلي، هذه الفكرة قوية ولكنها تحتاج لبعض التحسينات في تجربة المستخدم (UX).",
            "لقد قمت بدراسة المتطلبات. أقترح تقسيم المشروع إلى 3 مراحل أساسية لضمان الجودة.",
            "هل فكرت في كيفية معالجة البيانات في هذه الحالة؟ التحليل الأولي يشير إلى ضرورة استخدام قاعدة بيانات موزعة."
        ],
        tester: [
            "لقد قمت بمراجعة الكود المقترح. يبدو سليماً ولكن يجب إضافة اختبارات الوحدات (Unit Tests).",
            "سأقوم باختبار حالات الحواف (Edge Cases) لهذا المدخل. هل تود رؤية تقرير الاختبار؟",
            "بشكل عام، الأداء جيد، ولكن يمكننا تحسين سرعة الاستجابة بنسبة 15%."
        ]
    };
    
    const agentResponses = responses[agent];
    return agentResponses[Math.floor(Math.random() * agentResponses.length)];
}
