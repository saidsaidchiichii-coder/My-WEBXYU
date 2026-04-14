const AI = {
  messagesBox: null,
  API_URL: null,

  /* =========================
     🎨 SYNTAX HIGHLIGHT (ULTRA-PRO)
  ========================= */
  highlight(code) {
    return code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/(\/\/.*)/g, '<span class="cmt">$1</span>')
      .replace(/(["'`].*?["'`])/g, '<span class="str">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="num">$1</span>')
      .replace(/\b(int|bool|return|if|else|for|while|function|const|let|var|class|new|async|await|try|catch|fetch|throw)\b/g, '<span class="kw">$1</span>')
      .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\(/g, '<span class="fn">$1</span>(');
  },

  init(box, api) {
    this.messagesBox = document.getElementById(box);
    this.API_URL = api;
  },

  user(text) {
    const wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper";
    const div = document.createElement("div");
    div.className = "msg user";
    div.textContent = text;
    wrapper.appendChild(div);
    this.messagesBox.appendChild(wrapper);
    this.scroll();
  },

  /* =========================
     🧠 3D ENHANCED THINKING
  ========================= */
  thinking() {
    const wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper ai";
    
    const thinkingDiv = document.createElement("div");
    thinkingDiv.className = "thinking-container";
    thinkingDiv.innerHTML = `
        <div class="loader-dots">
            <span></span><span></span><span></span>
        </div>
        <span class="thinking-text">Grok is analyzing...</span>
    `;
    
    wrapper.appendChild(thinkingDiv);
    this.messagesBox.appendChild(wrapper);
    this.scroll();
    return wrapper;
  },

  /* =========================
     ✨ DYNAMIC EMOJI INJECTION
  ========================= */
  injectEmojis(text) {
    const emojis = ["✨", "🚀", "🤖", "💡", "🧠", "🔥", "✅", "⚡", "🌟", "🛡️"];
    let lines = text.split("\n");
    
    // Inject emoji at the end of key paragraphs if none present
    return lines.map(line => {
        if (line.trim().length > 20 && !line.match(/[\u{1F300}-\u{1F6FF}]/u)) {
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            return line + " " + randomEmoji;
        }
        return line;
    }).join("\n");
  },

  async ask(message) {
    const load = this.thinking();

    try {
      const res = await fetch(this.API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      const data = await res.json();
      load.remove();
      
      let reply = data?.reply || "I encountered a glitch in the matrix. 🛸";
      
      // Apply Emoji Magic
      reply = this.injectEmojis(reply);

      this.streamRender(reply);

    } catch (e) {
      load.remove();
      const err = document.createElement("div");
      err.className = "msg ai error";
      err.style.color = "#f91880";
      err.textContent = "❌ Connection Lost. Re-establishing link... 📡";
      this.messagesBox.appendChild(err);
    }
  },

  /* =========================
     🌊 CINEMATIC STREAMING
  ========================= */
  async streamRender(fullText) {
    const container = document.createElement("div");
    container.className = "msg ai";
    this.messagesBox.appendChild(container);
    
    const parts = fullText.split("```");
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      // CODE BLOCK
      if (i % 2 === 1) {
        const codeBox = document.createElement("div");
        codeBox.className = "code-box";
        
        const header = document.createElement("div");
        header.className = "code-header";
        header.innerHTML = `<span class="code-lang">code</span><button class="copy-btn">Copy</button>`;
        
        const copyBtn = header.querySelector(".copy-btn");
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(part.trim());
          copyBtn.textContent = "Copied!";
          setTimeout(() => copyBtn.textContent = "Copy", 1500);
        };

        const pre = document.createElement("pre");
        const code = document.createElement("code");
        code.innerHTML = this.highlight(part.trim());
        
        pre.appendChild(code);
        codeBox.appendChild(header);
        codeBox.appendChild(pre);
        container.appendChild(codeBox);
      } 
      // TEXT WITH SMOOTH TYPING
      else {
        const textDiv = document.createElement("div");
        textDiv.className = "ai-text";
        container.appendChild(textDiv);
        
        const paragraphs = part.split("\n");
        for (const para of paragraphs) {
          if (para.trim()) {
            const p = document.createElement("p");
            p.style.marginBottom = "1.25rem";
            textDiv.appendChild(p);
            
            const words = para.trim().split(" ");
            for (const word of words) {
                p.textContent += word + " ";
                this.scroll();
                // Random typing delay for "Thinking" feel
                await new Promise(r => setTimeout(r, 10 + Math.random() * 25));
            }
          }
        }
      }
      this.scroll();
    }
  },

  scroll() {
    const box = this.messagesBox;
    box.scrollTo({
        top: box.scrollHeight,
        behavior: 'smooth'
    });
  }
};
