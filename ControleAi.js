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
      🔥 FIXED RENDER
  ========================= */
  render(text){

    const parts = text.split("```");

    parts.forEach((part, i)=>{

      // 💻 CODE BLOCK فقط داخل box
      if(i % 2 === 1){

        let code = part.trim();
        let langName = "Code";

        const firstLine = code.split("\n")[0];

        if(firstLine.length < 15 && !firstLine.includes(" ")){
          langName = firstLine.toUpperCase();
          code = code.substring(firstLine.length).trim();
        }

        const msg = document.createElement("div");
        msg.className = "msg ai";

        const wrapper = document.createElement("div");
        wrapper.className = "code-box";

        /* HEADER */
        const header = document.createElement("div");
        header.className = "code-header";

        const lang = document.createElement("div");
        lang.className = "code-lang";
        lang.textContent = langName;

        const copyBtn = document.createElement("button");
        copyBtn.className = "copy-btn";
        copyBtn.textContent = "📋";

        copyBtn.onclick = async () => {
          try{
            await navigator.clipboard.writeText(code);
            copyBtn.textContent = "✔";
          }catch{
            copyBtn.textContent = "❌";
          }
          setTimeout(()=>copyBtn.textContent="📋",1000);
        };

        header.appendChild(lang);
        header.appendChild(copyBtn);

        /* CODE */
        const pre = document.createElement("pre");
        const codeEl = document.createElement("code");
        codeEl.textContent = code;

        pre.appendChild(codeEl);

        /* ARROW */
        const arrow = document.createElement("div");
        arrow.className = "code-arrow";
        arrow.textContent = "⬇";

        setTimeout(()=>{
          if(pre.scrollHeight <= pre.clientHeight){
            arrow.style.display = "none";
          }
        },50);

        wrapper.appendChild(header);
        wrapper.appendChild(pre);
        wrapper.appendChild(arrow);

        msg.appendChild(wrapper);
        this.messagesBox.appendChild(msg);
      }

      // 🧠 TEXT خارج code box
      else{
        const clean = part.trim();
        if(!clean) return;

        const msg = document.createElement("div");
        msg.className = "msg ai-text";

        msg.innerHTML = clean.replace(/\n/g,"<br>");

        this.messagesBox.appendChild(msg);
      }

    });

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
