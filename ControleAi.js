const AI = {
  messagesBox: null,
  API_URL: '/api/chat',
  currentMode: 'chat', // 'chat' or 'image'
  
  conversations: {
    chat: [],
    image: []
  },

  /* =========================
     🎨 SYNTAX HIGHLIGHT
  ========================= */
  highlight(code) {
    return code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/(\/\/.*)/g, '<span class="cmt">$1</span>')
      .replace(/(["\'`].*?["\'`])/g, '<span class="str">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="num">$1</span>')
      .replace(/\b(int|bool|return|if|else|for|while|function|const|let|var|class|new|async|await|try|catch|fetch|throw)\b/g, '<span class="kw">$1</span>')
      .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\(/g, '<span class="fn">$1</span>(');
  },

  init(boxId) {
    this.messagesBox = document.getElementById(boxId);
    this.loadInitialMessage();
  },

  loadInitialMessage() {
    const welcomeText = this.currentMode === 'image' 
      ? "Welcome to Image Studio. Describe the image you want to create, and I'll generate it for you instantly."
      : "Welcome to AI Chat. How can I help you today?";
    
    this.aiMessage(welcomeText, false);
  },

  setMode(mode) {
    if (this.currentMode === mode) return;

    this.currentMode = mode;
    this.messagesBox.innerHTML = '';
    
    const chatInput = document.getElementById('chatInput');
    chatInput.placeholder = mode === 'image' ? "What image do you want to create?" : "How can I help you today?";
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        const isImageBtn = btn.innerText.toLowerCase().includes('imagine');
        const isChatBtn = btn.innerText.toLowerCase().includes('chat');
        
        if ((mode === 'image' && isImageBtn) || (mode === 'chat' && isChatBtn)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    if (this.conversations[mode].length === 0) {
        this.loadInitialMessage();
    } else {
        this.conversations[mode].forEach(msg => {
            if (msg.type === 'user') this.user(msg.text, false);
            else if (msg.type === 'ai') {
                if (msg.imageUrl) this.renderImage(msg.text, msg.imageUrl, false);
                else this.aiMessage(msg.text, false);
            }
        });
    }
    
    this.scroll();
  },

  user(text, save = true) {
    if (save) this.conversations[this.currentMode].push({ type: 'user', text });
    
    const wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper user";
    
    const div = document.createElement("div");
    div.className = "msg user";
    div.textContent = text;
    
    wrapper.appendChild(div);
    this.messagesBox.appendChild(wrapper);
    this.scroll();
  },

  aiMessage(text, save = true) {
    if (save) this.conversations[this.currentMode].push({ type: 'ai', text });
    
    const wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper ai";
    
    const div = document.createElement("div");
    div.className = "msg ai";
    div.textContent = text;
    
    wrapper.appendChild(div);
    this.messagesBox.appendChild(wrapper);
    this.scroll();
  },

  thinking() {
    const wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper ai";
    
    const thinkingDiv = document.createElement("div");
    thinkingDiv.className = "thinking-container msg ai";
    thinkingDiv.innerHTML = `
        <div class="loader-dots">
            <span></span><span></span><span></span>
        </div>
        <span class="thinking-text">${this.currentMode === 'image' ? 'Generating Image...' : 'Thinking...'}</span>
    `;
    
    wrapper.appendChild(thinkingDiv);
    this.messagesBox.appendChild(wrapper);
    this.scroll();
    return wrapper;
  },

  handleSend() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (text) {
        this.user(text);
        input.value = '';
        this.ask(text);
    }
  },

  async ask(message) {
    const load = this.thinking();

    try {
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, mode: this.currentMode })
      });

      const data = await response.json();
      load.remove();
      
      if (this.currentMode === 'image' && data.image_url) {
        // Image mode: render the generated image
        this.renderImage(data.reply, data.image_url);
      } else if (data.reply) {
        // Chat mode or fallback
        this.streamRender(data.reply);
      } else {
        this.aiMessage("The AI returned an empty response.");
      }
    } catch (e) {
      load.remove();
      this.aiMessage("System Error: Could not connect to the backend server.");
    }
  },

  renderImage(text, url, save = true) {
    if (save) this.conversations[this.currentMode].push({ type: 'ai', text, imageUrl: url });
    
    const wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper ai";
    
    const card = document.createElement("div");
    card.className = "image-card";
    
    card.innerHTML = `
        <div class="image-header">
            <p>AI Generated Masterpiece</p>
        </div>
        <div class="image-container skeleton">
            <img src="${url}" class="generated-img" alt="AI Artwork" style="opacity: 0; transition: opacity 0.8s ease;">
        </div>
        <div class="image-actions">
            <button class="action-btn" onclick="window.open('${url}', '_blank')">
                <i data-lucide="maximize-2"></i> View Full
            </button>
            <button class="action-btn primary" onclick="AI.downloadImage('${url}')">
                <i data-lucide="download"></i> Save Image
            </button>
            <button class="action-btn" onclick="navigator.clipboard.writeText('${text}')">
                <i data-lucide="copy"></i> Copy Prompt
            </button>
        </div>
    `;
    
    const img = card.querySelector('.generated-img');
    const container = card.querySelector('.image-container');
    
    img.onload = () => {
        img.style.opacity = '1';
        container.classList.remove('skeleton');
        this.scroll();
    };

    wrapper.appendChild(card);
    this.messagesBox.appendChild(wrapper);
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
    
    this.scroll();
  },

  async downloadImage(url) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `ai-studio-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
        window.open(url, '_blank');
    }
  },

  async streamRender(fullText, save = true) {
    if (save) this.conversations[this.currentMode].push({ type: 'ai', text: fullText });
    
    const wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper ai";
    
    const container = document.createElement("div");
    container.className = "msg ai";
    wrapper.appendChild(container);
    this.messagesBox.appendChild(wrapper);
    
    const parts = fullText.split("```");
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (i % 2 === 1) {
        const codeBox = document.createElement("div");
        codeBox.className = "code-box";
        codeBox.innerHTML = `
            <div class="code-header">
                <span>code</span>
                <button class="copy-btn" onclick="navigator.clipboard.writeText(\`${part.trim().replace(/`/g, '\\`')}\`)">Copy</button>
            </div>
            <pre><code>${this.highlight(part.trim())}</code></pre>
        `;
        container.appendChild(codeBox);
      } else {
        const textDiv = document.createElement("div");
        container.appendChild(textDiv);
        const paragraphs = part.split("\n");
        for (const para of paragraphs) {
          if (para.trim()) {
            const p = document.createElement("p");
            p.style.marginBottom = "0.5rem";
            textDiv.appendChild(p);
            const words = para.trim().split(" ");
            for (const word of words) {
                p.textContent += word + " ";
                this.scroll();
                await new Promise(r => setTimeout(r, 10 + Math.random() * 10));
            }
          }
        }
      }
      this.scroll();
    }
  },

  scroll() {
    const box = this.messagesBox;
    if (box) {
        box.scrollTo({
            top: box.scrollHeight,
            behavior: 'smooth'
        });
    }
  }
};
