const AI = {
  messagesBox: null,
  API_URL: null,
  lastPrompt: "",

  init(boxId, api){
    this.messagesBox = document.getElementById(boxId);
    this.API_URL = api;
  },

  /* 👤 USER MESSAGE */
  user(text){
    const div = document.createElement("div");
    div.className = "msg user";
    div.textContent = "👤 " + text;

    this.messagesBox.appendChild(div);
    this.scroll();
  },

  /* 🤖 THINKING */
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

  /* 🚀 ASK AI */
  async ask(message){

    this.lastPrompt = message; // 🔥 important for refresh

    const load = this.thinking();

    try{
      const res = await fetch(this.API_URL,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ message })
      });

      const data = await res.json();

      load.remove();

      this.render(data.reply || "No response", message);

    }catch(e){
      load.remove();
      this.error();
    }
  },

  /* 🎯 MAIN RENDER (CHATGPT STYLE SPLIT) */
  render(text, prompt){

    const div = document.createElement("div");
    div.className = "msg ai";

    const parts = text.split("```");

    let html = "";

    parts.forEach((part, i)=>{

      /* 💻 CODE BLOCK */
      if(i % 2 === 1){

        const cleanCode = this.cleanCode(part);

        html += `
          <div class="code-box">
            <div class="code-label">💻 Code / Prompt</div>
            <pre><code>${cleanCode}</code></pre>
          </div>
        `;
      }

      /* 🧾 TEXT / RESPONSE */
      else{

        const clean = this.cleanText(part);

        const lines = clean.split("\n");

        lines.forEach(line=>{
          const t = line.trim();
          if(!t) return;

          html += `<div class="text-box">🤖 ${t}</div>`;
        });

      }

    });

    /* 💣 BUTTON SYSTEM ATTACH */
    div.innerHTML = html;

    this.messagesBox.appendChild(div);
    this.scroll();

    // 🔥 attach buttons (copy / like / refresh / download)
    if(window.ButtonProgram){
      ButtonProgram.attach(div, text, prompt);
    }
  },

  /* 🧹 CLEAN TEXT (ALLOW EMOJIS) */
  cleanText(t){
    return t
      .replace(/\*\*/g,"")
      .replace(/```/g,"")
      .trim();
  },

  /* 💻 CLEAN CODE (NO EMOJIS) */
  cleanCode(t){
    return t
      .replace(/🤖|💻|👤|✔|❌|💰|🔎|📌|🔥/g,"")
      .trim();
  },

  /* 📍 SCROLL */
  scroll(){
    setTimeout(()=>{
      this.messagesBox.scrollTop = this.messagesBox.scrollHeight;
    },20);
  },

  /* ❌ ERROR */
  error(){
    const div = document.createElement("div");
    div.className = "msg ai";
    div.textContent = "❌ AI error";

    this.messagesBox.appendChild(div);
  }
};
