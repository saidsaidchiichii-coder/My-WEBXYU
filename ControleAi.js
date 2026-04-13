const AI = {
  messagesBox: null,
  API_URL: null,

  init(boxId, api){
    this.messagesBox = document.getElementById(boxId);
    this.API_URL = api;
  },

  user(text){
    const div = document.createElement("div");
    div.className = "msg user";
    div.textContent = "👤 " + text;

    this.messagesBox.appendChild(div);
    this.scroll();
  },

  thinking(){
    const div = document.createElement("div");
    div.className = "msg ai";

    div.innerHTML = `
      🤖 Thinking...
      <div class="thinking">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    `;

    this.messagesBox.appendChild(div);
    this.scroll();
    return div;
  },

  async ask(message){
    const load = this.thinking();

    try{
      const res = await fetch(this.API_URL,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ message })
      });

      const data = await res.json();

      load.remove();
      this.render(data.reply || "No response");

    }catch(e){
      load.remove();
      this.error();
    }
  },

  /* =========================
      🔥 FINAL CODE BLOCK UI
  ========================= */
  render(text){

    const container = document.createElement("div");
    container.className = "msg ai";

    const parts = text.split("```");

    parts.forEach((part, i)=>{

      // 💻 CODE BLOCK
      if(i % 2 === 1){

        const code = part.trim();

        const wrapper = document.createElement("div");
        wrapper.className = "code-box";

        /* HEADER */
        const header = document.createElement("div");
        header.className = "code-header";

        const lang = document.createElement("div");
        lang.className = "code-lang";
        lang.textContent = "C++";

        const copyBtn = document.createElement("button");
        copyBtn.className = "copy-btn";
        copyBtn.textContent = "📋";

        copyBtn.onclick = () => {
          navigator.clipboard.writeText(code);
          copyBtn.textContent = "✔";
          setTimeout(()=>copyBtn.textContent="📋",1000);
        };

        header.appendChild(lang);
        header.appendChild(copyBtn);

        /* CODE BODY */
        const pre = document.createElement("pre");
        const codeEl = document.createElement("code");

        codeEl.textContent = code;

        pre.appendChild(codeEl);

        /* ARROW */
        const arrow = document.createElement("div");
        arrow.className = "code-arrow";
        arrow.textContent = "⬇";

        wrapper.appendChild(header);
        wrapper.appendChild(pre);
        wrapper.appendChild(arrow);

        container.appendChild(wrapper);
      }

      // 🧠 TEXT
      else{
        const p = document.createElement("div");
        p.className = "ai-text";
        p.textContent = part.trim();
        container.appendChild(p);
      }

    });

    this.messagesBox.appendChild(container);
    this.scroll();
  },

  scroll(){
    setTimeout(()=>{
      this.messagesBox.scrollTop = this.messagesBox.scrollHeight;
    },20);
  },

  error(){
    const div = document.createElement("div");
    div.className = "msg ai";
    div.textContent = "❌ AI error";
    this.messagesBox.appendChild(div);
  }
};
