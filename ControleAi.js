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
     MAIN RENDER ENGINE FIX
  ========================= */
  render(text){

    const container = document.createElement("div");
    container.className = "msg ai";

    const parts = text.split("```");

    parts.forEach((part, i) => {

      // 💻 CODE BLOCK
      if(i % 2 === 1){

        const code = part.trim();

        const wrapper = document.createElement("div");
        wrapper.className = "code-box";

        const pre = document.createElement("pre");
        const codeEl = document.createElement("code");

        codeEl.textContent = code;

        pre.appendChild(codeEl);

        // buttons
        const actions = document.createElement("div");
        actions.className = "code-actions";

        // COPY BUTTON
        const copyBtn = document.createElement("button");
        copyBtn.textContent = "📋 Copy";
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(code);
        };

        // DOWNLOAD BUTTON
        const downloadBtn = document.createElement("button");
        downloadBtn.textContent = "⬇ Download";
        downloadBtn.onclick = () => {
          const blob = new Blob([code], {type:"text/plain"});
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "code.txt";
          a.click();
        };

        actions.appendChild(copyBtn);
        actions.appendChild(downloadBtn);

        wrapper.appendChild(actions);
        wrapper.appendChild(pre);

        container.appendChild(wrapper);
      }

      // 🧠 TEXT BLOCK
      else{
        const textLines = part.trim().split("\n");

        textLines.forEach(line => {
          if(line.trim()){
            const p = document.createElement("p");
            p.className = "ai-text";
            p.textContent = line;
            container.appendChild(p);
          }
        });
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
