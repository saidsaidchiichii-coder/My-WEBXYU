const AI = {
  messagesBox: null,
  API_URL: null,
  uploadedFiles: [],

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
     🧠 ADVANCED THINKING EFFECT
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
      // Prepare form data with files
      const formData = new FormData();
      formData.append('message', message);
      
      // Add uploaded files if any
      const fileInput = document.getElementById('chatFileInput') || document.getElementById('homeFileInput');
      if (fileInput && fileInput.files.length > 0) {
        Array.from(fileInput.files).forEach((file, index) => {
          formData.append(`file_${index}`, file);
        });
      }

      const res = await fetch(this.API_URL, {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      load.remove();
      
      let reply = data?.reply || "I'm sorry, I couldn't process that.";

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

  /* =========================
     🌊 PIXEL-PERFECT STREAMING
  ========================= */
  async streamRender(fullText) {
    const wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper ai";
    
    const container = document.createElement("div");
    container.className = "msg ai";
    wrapper.appendChild(container);
    this.messagesBox.appendChild(wrapper);
    
    const parts = fullText.split("```");
    let textContent = '';
    
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
      // TEXT WITH NATURAL TYPING
      else {
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
                textContent += word + " ";
                this.scroll();
                await new Promise(r => setTimeout(r, 15 + Math.random() * 20));
            }
          }
        }
      }
      this.scroll();
    }
    
    // Add voice button after streaming is complete
    if (textContent.trim()) {
      setTimeout(() => {
        this.addVoiceButton(container, textContent.trim());
      }, 300);
    }
  },

  addVoiceButton(messageElement, text) {
    const voiceContainer = document.createElement('div');
    voiceContainer.className = 'voice-message';
    voiceContainer.style.animation = 'slideIn 0.3s ease-out';
    
    const playBtn = document.createElement('button');
    playBtn.className = 'voice-btn-play';
    playBtn.innerHTML = '<i data-lucide="volume-2"></i>';
    playBtn.onclick = () => this.speakText(text);
    
    const duration = document.createElement('span');
    duration.className = 'voice-duration';
    duration.textContent = 'Listen';
    
    voiceContainer.appendChild(playBtn);
    voiceContainer.appendChild(duration);
    
    messageElement.appendChild(voiceContainer);
    lucide.createIcons();
  },

  speakText(text) {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.lang = 'en-US';
      
      window.speechSynthesis.speak(utterance);
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
