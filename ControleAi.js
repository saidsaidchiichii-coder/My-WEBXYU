const AI = {
  messagesBox: null,
  API_URL: null,
  speed: 12,

  init(boxId, api){
    this.messagesBox = document.getElementById(boxId);
    this.API_URL = api;
  },

  /* 👤 USER MESSAGE */
  user(text){
    const div = document.createElement("div");
    div.className = "msg user";

    div.innerHTML = this.formatUser(text);

    this.messagesBox.appendChild(div);
  },

  /* 🤖 AI MESSAGE */
  ai(text){
    const div = document.createElement("div");
    div.className = "msg ai";
    this.messagesBox.appendChild(div);

    this.type(div, text);
  },

  /* ✨ FORMAT USER TEXT (EMOJIS ONLY HERE) */
  formatUser(text){
    return this.addEmojis(text);
  },

  /* 😎 ADD EMOJIS ONLY IN CHAT TEXT */
  addEmojis(text){
    return text
      .replace(/hello/gi,"👋 hello")
      .replace(/money/gi,"💰 money")
      .replace(/settings/gi,"⚙️ settings")
      .replace(/ai/gi,"🤖 AI");
  },

  /* ⌨ TYPE EFFECT (NO EMOJIS INSIDE CODE) */
  type(el, text){
    let i = 0;
    el.innerHTML = "";

    const interval = setInterval(() => {
      el.innerHTML += text[i];
      i++;
      if(i >= text.length) clearInterval(interval);
    }, this.speed);
  },

  /* ⏳ THINKING */
  thinking(){
    const div = document.createElement("div");
    div.className = "msg ai";
    div.innerHTML = `
      <div class="thinking">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    `;
    this.messagesBox.appendChild(div);
    return div;
  },

  /* 🧠 DETECT TYPE (prompt / code / email / request) */
  detectType(text){
    if(text.includes("```") || text.includes("code")) return "code";
    if(text.includes("@") && text.includes(".")) return "email";
    if(text.includes("how") || text.includes("what") || text.includes("why")) return "request";
    return "prompt";
  },

  /* 🚀 ASK AI */
  async ask(message){

    const type = this.detectType(message);

    const loading = this.thinking();

    try{
      const res = await fetch(this.API_URL,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ message, type })
      });

      const data = await res.json();

      loading.remove();

      this.renderAI(data.reply || "No response", type);

    }catch(e){
      loading.remove();
      this.ai("Error connecting to AI ❌");
    }
  },

  /* 📦 RENDER AI BY TYPE */
  renderAI(text, type){

    const div = document.createElement("div");
    div.className = "msg ai";

    if(type === "code"){
      div.innerHTML = `<pre><code>${text}</code></pre>`;
    }
    else if(type === "email"){
      div.innerHTML = `📧 ${text}`;
    }
    else if(type === "request"){
      div.innerHTML = `🔎 ${text}`;
    }
    else{
      this.messagesBox.appendChild(div);
      this.type(div, text);
      return;
    }

    this.messagesBox.appendChild(div);
  }
};
