const AI = {
  messagesBox: null,
  API_URL: null,
  currentMode: 'auto', // 'auto', 'fast', 'thinking'

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

  init(box, api) {
    this.messagesBox = document.getElementById(box);
    this.API_URL = api;
    this.setupModeSelector();
  },

  setupModeSelector() {
    const modeSelectors = document.querySelectorAll('.mode-selector');
    modeSelectors.forEach(selector => {
      selector.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showModeMenu(selector);
      });
    });
  },

  showModeMenu(selector) {
    const existingMenu = document.querySelector('.mode-menu');
    if (existingMenu) existingMenu.remove();

    const menu = document.createElement('div');
    menu.className = 'mode-menu';
    menu.innerHTML = `
      <div class="mode-option ${this.currentMode === 'auto' ? 'active' : ''}" data-mode="auto">
        <span class="mode-name">Auto</span>
        <span class="mode-desc">Smart selection</span>
      </div>
      <div class="mode-option ${this.currentMode === 'fast' ? 'active' : ''}" data-mode="fast">
        <span class="mode-name">Faster AI</span>
        <span class="mode-desc">Quick responses</span>
      </div>
      <div class="mode-option ${this.currentMode === 'thinking' ? 'active' : ''}" data-mode="thinking">
        <span class="mode-name">Thinking Longer</span>
        <span class="mode-desc">Deep analysis</span>
      </div>
    `;

    menu.querySelectorAll('.mode-option').forEach(option => {
      option.addEventListener('click', () => {
        this.currentMode = option.dataset.mode;
        selector.querySelector('span').textContent =
          option.querySelector('.mode-name').textContent;
        menu.remove();
      });
    });

    document.body.appendChild(menu);

    const rect = selector.getBoundingClientRect();
    menu.style.top = (rect.bottom + 8) + 'px';
    menu.style.left = (rect.left - 50) + 'px';
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
      const payload = {
        message: message,
        files: [],
        mode: this.currentMode,
        timestamp: new Date().toISOString()
      };

      const fileInput = document.getElementById('chatFileInput') || document.getElementById('homeFileInput');
      if (fileInput && fileInput.files.length > 0) {
        for (let file of fileInput.files) {
          const reader = new FileReader();
          await new Promise((resolve) => {
            reader.onload = (e) => {
              payload.files.push({
                name: file.name,
                type: file.type,
                data: e.target.result,
                isImage: file.type.startsWith('image/')
              });
              resolve();
            };
            reader.readAsDataURL(file);
          });
        }

        payload.hasImages = true;
        payload.imageCount = fileInput.files.length;
      }

      const res = await fetch(this.API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000)
      });

      const data = await res.json();
      load.remove();

      let reply = data?.reply || "No response";

      this.streamRender(reply);

    } catch (e) {
      load.remove();

      const wrapper = document.createElement("div");
      wrapper.className = "msg-wrapper ai";

      const err = document.createElement("div");
      err.className = "msg ai";
      err.textContent = "System Error: API Connection Failed.";

      wrapper.appendChild(err);
      this.messagesBox.appendChild(wrapper);
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

        const pre = document.createElement("pre");
        const code = document.createElement("code");
        code.innerHTML = this.highlight(part);

        pre.appendChild(code);
        codeBox.appendChild(pre);
        container.appendChild(codeBox);
      } else {
        const textDiv = document.createElement("div");
        textDiv.textContent = part;
        container.appendChild(textDiv);
      }
    }

    this.scroll();
  },

  scroll() {
    this.messagesBox.scrollTo({
      top: this.messagesBox.scrollHeight,
      behavior: 'smooth'
    });
  }
};
