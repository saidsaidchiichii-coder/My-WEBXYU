const AI = {
  messagesBox: null,
  API_URL: null,

  init(box, api) {
    this.messagesBox = document.getElementById(box);
    this.API_URL = api;

    // memory init
    window.chatHistory = window.chatHistory || [];
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

    const thinkingDiv = document.createElement("div");
    thinkingDiv.className = "thinking-container";

    thinkingDiv.innerHTML = `
      <div class="loader-dots">
        <span></span><span></span><span></span>
      </div>
      <span class="thinking-text">Thinking...</span>
    `;

    wrapper.appendChild(thinkingDiv);
    this.messagesBox.appendChild(wrapper);

    this.scroll();
    return wrapper;
  },

  async ask(message) {
    const load = this.thinking();

    try {
      const res = await fetch(this.API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: window.chatHistory
        })
      });

      const data = await res.json();

      load.remove();

      const reply = data?.reply || "No response";

      // ======================
      // MEMORY STORE
      // ======================
      window.chatHistory.push(
        { role: "user", content: message },
        { role: "assistant", content: reply }
      );

      this.streamRender(reply);

    } catch (err) {
      load.remove();

      const wrapper = document.createElement("div");
      wrapper.className = "msg-wrapper ai";

      const div = document.createElement("div");
      div.className = "msg ai";
      div.textContent = "Error: API not reachable";

      wrapper.appendChild(div);
      this.messagesBox.appendChild(wrapper);
    }
  },

  async streamRender(text) {
    const wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper ai";

    const container = document.createElement("div");
    container.className = "msg ai";

    wrapper.appendChild(container);
    this.messagesBox.appendChild(wrapper);

    this.scroll();

    const parts = text.split("```");

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      // CODE BLOCK
      if (i % 2 === 1) {
        const codeBox = document.createElement("div");
        codeBox.className = "code-box";

        const header = document.createElement("div");
        header.className = "code-header";
        header.innerHTML = `
          <span class="code-lang">code</span>
          <button class="copy-btn">Copy</button>
        `;

        const btn = header.querySelector(".copy-btn");
        btn.onclick = () => {
          navigator.clipboard.writeText(part.trim());
          btn.textContent = "Copied!";
          setTimeout(() => (btn.textContent = "Copy"), 1200);
        };

        const pre = document.createElement("pre");
        const code = document.createElement("code");

        code.textContent = part.trim();

        pre.appendChild(code);
        codeBox.appendChild(header);
        codeBox.appendChild(pre);
        container.appendChild(codeBox);
      }

      // TEXT BLOCK
      else {
        const textDiv = document.createElement("div");
        container.appendChild(textDiv);

        const lines = part.split("\n");

        for (const line of lines) {
          if (!line.trim()) continue;

          const p = document.createElement("p");
          p.style.marginBottom = "6px";
          textDiv.appendChild(p);

          const words = line.split(" ");

          for (const w of words) {
            p.textContent += w + " ";
            this.scroll();
            await new Promise(r => setTimeout(r, 10));
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
