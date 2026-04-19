const AI = {
  messagesBox: null,
  API_URL: null,
  currentMode: 'auto',

  /* =========================
     🎨 SYNTAX HIGHLIGHT
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

  /* ========================= */
  user(text) {
    const w = document.createElement("div");
    w.className = "msg-wrapper";

    const d = document.createElement("div");
    d.className = "msg user";
    d.textContent = text;

    w.appendChild(d);
    this.messagesBox.appendChild(w);
    this.scroll();
  },

  thinking() {
    const w = document.createElement("div");
    w.className = "msg-wrapper ai";

    const t = document.createElement("div");
    t.className = "thinking-container";
    t.innerHTML = `
      <div class="loader-dots"><span></span><span></span><span></span></div>
      <span class="thinking-text">Thinking...</span>
    `;

    w.appendChild(t);
    this.messagesBox.appendChild(w);
    this.scroll();
    return w;
  },

  /* =========================
     MODE DETECTION (API SIDE HELP)
  ========================= */
  detectMode(message) {
    if (this.currentMode !== 'auto') return this.currentMode;

    const m = message.toLowerCase();

    if (m.includes("image:") || m.includes("create image")) return "thinking";
    if (m.length > 120 || /explain|analyze|compare|why|how/i.test(m)) return "thinking";

    return "fast";
  },

  /* =========================
     🚀 MAIN API CALL (MERGED)
  ========================= */
  async ask(message) {
    const load = this.thinking();

    try {
      const mode = this.detectMode(message);

      // 📦 FINAL PAYLOAD (MATCH YOUR API)
      const payload = {
        message,
        mode,
        timestamp: Date.now()
      };

      const res = await fetch(this.API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      load.remove();

      if (!data) throw new Error("No response");

      // 🖼 IMAGE RESPONSE
      if (data.reply?.startsWith("data:image")) {
        this.renderImage(data.reply);
        return;
      }

      // 💬 TEXT RESPONSE
      this.streamRender(data.reply || "No response");

    } catch (err) {
      load.remove();

      const w = document.createElement("div");
      w.className = "msg-wrapper ai";

      const d = document.createElement("div");
      d.className = "msg ai";
      d.textContent = "API Error: Not reachable";

      w.appendChild(d);
      this.messagesBox.appendChild(w);
    }
  },

  /* ========================= */
  renderImage(base64) {
    const w = document.createElement("div");
    w.className = "msg-wrapper ai";

    const img = document.createElement("img");
    img.src = base64;
    img.style.maxWidth = "100%";
    img.style.borderRadius = "12px";

    w.appendChild(img);
    this.messagesBox.appendChild(w);
    this.scroll();
  },

  /* =========================
     🌊 STREAM RENDER
  ========================= */
  async streamRender(text) {
    const w = document.createElement("div");
    w.className = "msg-wrapper ai";

    const c = document.createElement("div");
    c.className = "msg ai";

    w.appendChild(c);
    this.messagesBox.appendChild(w);

    const parts = text.split("```");

    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];

      if (i % 2 === 1) {
        const box = document.createElement("div");
        box.className = "code-box";

        const header = document.createElement("div");
        header.className = "code-header";
        header.innerHTML = `<span class="code-lang">code</span><button class="copy-btn">Copy</button>`;

        const btn = header.querySelector("button");
        btn.onclick = () => {
          navigator.clipboard.writeText(p);
          btn.textContent = "Copied!";
          setTimeout(() => btn.textContent = "Copy", 1200);
        };

        const pre = document.createElement("pre");
        const code = document.createElement("code");
        code.innerHTML = this.highlight(p);

        pre.appendChild(code);
        box.appendChild(header);
        box.appendChild(pre);
        c.appendChild(box);
      } else {
        const t = document.createElement("div");
        c.appendChild(t);

        const lines = p.split("\n");

        for (const l of lines) {
          if (!l.trim()) continue;

          const ptag = document.createElement("p");
          ptag.style.marginBottom = "6px";
          t.appendChild(ptag);

          for (const word of l.split(" ")) {
            ptag.textContent += word + " ";
            this.scroll();
            await new Promise(r => setTimeout(r, 10));
          }
        }
      }
    }

    this.scroll();
  },

  scroll() {
    this.messagesBox.scrollTo({
      top: this.messagesBox.scrollHeight,
      behavior: "smooth"
    });
  }
};
