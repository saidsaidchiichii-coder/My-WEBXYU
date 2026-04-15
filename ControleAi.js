const AI = {
  messagesBox: null,
  API_URL: null,
  isLoading: false,

  highlight(code) {
    return code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/(\/\/.*)/g, '<span class="cmt">$1</span>')
      .replace(/(["'`].*?["'`])/g, '<span class="str">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="num">$1</span>')
      .replace(
        /\b(int|bool|return|if|else|for|while|function|const|let|var|class|new|async|await|try|catch|fetch|throw)\b/g,
        '<span class="kw">$1</span>'
      )
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

  thinking() {
    const wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper ai";

    const el = document.createElement("div");
    el.className = "thinking-container";
    el.innerHTML = `
      <div class="loader-dots"><span></span><span></span><span></span></div>
      <span class="thinking-text">Thinking...</span>
    `;

    wrapper.appendChild(el);
    this.messagesBox.appendChild(wrapper);
    this.scroll();

    return wrapper;
  },

  renderImage(url) {
    const wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper ai";

    const img = document.createElement("img");
    img.className = "ai-image";
    img.src = url;

    wrapper.appendChild(img);
    this.messagesBox.appendChild(wrapper);
    this.scroll();
  },

  renderText(text) {
    const wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper ai";

    const div = document.createElement("div");
    div.className = "msg ai";
    div.textContent = text;

    wrapper.appendChild(div);
    this.messagesBox.appendChild(wrapper);
    this.scroll();
  },

  async ask(message) {
    if (this.isLoading) return;
    this.isLoading = true;

    const self = this;
    const loader = this.thinking();

    try {
      const res = await fetch(this.API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      const data = await res.json();
      loader.remove();

      if (data.type === "image") {
        const url =
          data.url ||
          (data.images && data.images[0]) ||
          null;

        if (url) {
          self.renderImage(url);
        } else {
          self.renderText("Image generation failed (no URL returned).");
        }
        return;
      }

      self.streamRender(data.reply || "No response");

    } catch (err) {
      loader.remove();
      this.renderText("System Error: API Connection Failed.");
    } finally {
      this.isLoading = false;
    }
  },

  async streamRender(fullText) {
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

        const header = document.createElement("div");
        header.className = "code-header";
        header.innerHTML = `<span class="code-lang">code</span><button class="copy-btn">Copy</button>`;

        const btn = header.querySelector(".copy-btn");
        btn.onclick = () => {
          navigator.clipboard.writeText(part.trim());
          btn.textContent = "Copied!";
          setTimeout(() => (btn.textContent = "Copy"), 1500);
        };

        const pre = document.createElement("pre");
        const code = document.createElement("code");
        code.innerHTML = this.highlight(part.trim());

        pre.appendChild(code);
        codeBox.appendChild(header);
        codeBox.appendChild(pre);
        container.appendChild(codeBox);

      } else {
        const textDiv = document.createElement("div");
        container.appendChild(textDiv);

        const paragraphs = part.split("\n");

        for (const para of paragraphs) {
          if (!para.trim()) continue;

          const p = document.createElement("p");
          p.style.marginBottom = "0.5rem";
          textDiv.appendChild(p);

          const words = para.split(" ");
          for (const w of words) {
            p.textContent += w + " ";
            await new Promise(r => setTimeout(r, 8));
            this.scroll();
          }
        }
      }

      this.scroll();
    }
  },

  scroll() {
    this.messagesBox.scrollTo({
      top: this.messagesBox.scrollHeight,
      behavior: "smooth"
    });
  }
};
