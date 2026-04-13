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

    const loading = this.thinking();

    try{
      const res = await fetch(this.API_URL,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ message })
      });

      const data = await res.json();

      loading.remove();

      this.render(data.reply || "No response");

    }catch(e){
      loading.remove();
      this.error();
    }
  },

  /* 🚀 CLEAN RENDER SYSTEM */
  render(text){

    const div = document.createElement("div");
    div.className = "msg ai";

    const parts = text.split("```");

    let html = "";

    parts.forEach((part, i)=>{

      // 💻 CODE BLOCK
      if(i % 2 === 1){
        html += `
          <pre><code>${this.cleanCode(part)}</code></pre>
        `;
      }

      // 🧠 TEXT BLOCK
      else{

        const lines = part.split("\n");

        lines.forEach(line=>{
          const clean = line.trim();
          if(!clean) return;

          if(clean.includes(":")){
            html += `<p>🔎 ${this.cleanText(clean)}</p>`;
          }else{
            html += `<p>${this.cleanText(clean)}</p>`;
          }
        });

      }

    });

    div.innerHTML = html;
    this.messagesBox.appendChild(div);
    this.scroll();
  },

  cleanText(t){
    return t
      .replace(/```/g,"")
      .replace(/🤖|💻|👤|✔|❌/g,"")
      .replace(/\*\*/g,"")
      .trim();
  },

  cleanCode(t){
    return t
      .replace(/```/g,"")
      .replace(/🤖|💻|👤|✔|❌/g,"")
      .trim();
  },

  scroll(){
    setTimeout(()=>{
      this.messagesBox.scrollTop = this.messagesBox.scrollHeight;
    },20);
  },

  error(){
    const div = document.createElement("div");
    div.className = "msg ai";
    div.textContent = "❌ AI Error";
    this.messagesBox.appendChild(div);
  }
};
