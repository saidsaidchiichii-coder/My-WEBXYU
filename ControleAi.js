const AI = {
  messagesBox: null,
  API_URL: null,
  currentMode: 'auto',

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

      if (!data) throw new Error("No response");

      // 🖼 IMAGE RESPONSE (FIXED)
      if (data.type === "image") {
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
      d.textContent = "API Error";

      w.appendChild(d);
      this.messagesBox.appendChild(w);
    }
  },

  renderImage(url) {
    const w = document.createElement("div");
    w.className = "msg-wrapper ai";

    const img = document.createElement("img");
    img.src = url;
    img.style.maxWidth = "100%";
    img.style.borderRadius = "12px";

    w.appendChild(img);
    this.messagesBox.appendChild(w);
    this.scroll();
  },

  async streamRender(text) {
    const w = document.createElement("div");
    w.className = "msg-wrapper ai";

    const c = document.createElement("div");
    c.className = "msg ai";

    w.appendChild(c);
    this.messagesBox.appendChild(w);

    const t = document.createElement("div");
    c.appendChild(t);

    for (const word of text.split(" ")) {
      t.textContent += word + " ";
      this.scroll();
      await new Promise(r => setTimeout(r, 10));
    }
  },

  scroll() {
    this.messagesBox.scrollTo({
      top: this.messagesBox.scrollHeight,
      behavior: "smooth"
    });
  }
};
