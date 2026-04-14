const AI = {
  messagesBox: null,
  API_URL: null,

  /* =========================
     🎨 SYNTAX HIGHLIGHT (ENHANCED)
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
    const div = document.createElement("div");
    div.className = "msg user";
    div.textContent = text;
    this.messagesBox.appendChild(div);
    this.scroll();
  },

  thinking() {
    const div = document.createElement("div");
    div.className = "msg ai thinking-msg";
    div.innerHTML = `
        <div class="typing">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    `;
    this.messagesBox.appendChild(div);
    this.scroll();
    return div;
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
      
      // STREAMING EFFECT SIMULATION
      this.streamRender(data?.reply || "No response");

    } catch (e) {
      load.remove();
      const err = document.createElement("div");
      err.className = "msg ai error";
      err.textContent = "❌ API error. Please check your connection.";
      this.messagesBox.appendChild(err);
    }
  },

  /* =========================
     🌊 STREAMING RENDER SYSTEM
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
      // TEXT WITH TYPING EFFECT
      else {
        const textDiv = document.createElement("div");
        textDiv.className = "ai-text";
        container.appendChild(textDiv);
        
        const lines = part.split("\n");
        for (const line of lines) {
          if (line.trim()) {
            const p = document.createElement("p");
            textDiv.appendChild(p);
            
            // Type out characters
            const words = line.trim().split(" ");
            for (const word of words) {
                p.textContent += word + " ";
                this.scroll();
                await new Promise(r => setTimeout(r, 20)); // Typing speed
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
