const AI = {
  messagesBox: null,
  API_URL: null,
  speed: 3, // ⚡ fast typing

  /* INIT */
  init(boxId, api){
    this.messagesBox = document.getElementById(boxId);
    this.API_URL = api;

    this.enableKeyboard();
  },

  /* 👤 USER MESSAGE */
  user(text){
    const div = document.createElement("div");
    div.className = "msg user";
    div.innerHTML = "👤 " + this.escape(text);

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

  /* 🧠 DETECT TYPE */
  detect(text){

    const t = text.toLowerCase();

    if(text.includes("```")) return "code";

    if(
      t.includes("?") ||
      t.startsWith("how") ||
      t.startsWith("what") ||
      t.startsWith("why") ||
      t.includes("explain")
    ){
      return "request";
    }

    return "chat";
  },

  /* 🚀 ASK AI */
  async ask(message){

    const type = this.detect(message);

    const loading = this.thinking();

    try{
      const res = await fetch(this.API_URL,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ message, type })
      });

      const data = await res.json();

      loading.remove();

      this.render(data.reply || "No response", type);

    }catch(e){
      loading.remove();
      this.error("AI connection error ❌");
    }
  },

  /* 🎨 RENDER ENGINE */
  render(text, type){

    const div = document.createElement("div");
    div.className = "msg ai";

    const parts = text.split("```");
    let html = "";

    parts.forEach((part, i) => {

      // 💻 CODE BLOCK (CLEAN ONLY)
      if(i % 2 === 1){
        html += `<pre><code>${this.cleanCode(part)}</code></pre>`;
      }

      // 🧠 TEXT BLOCK
      else{

        let cleanText = this.cleanText(part);

        if(type === "request"){
          html += `<p>🔎 ${cleanText}</p>`;
        } else {
          html += `<p>🤖 ${cleanText}</p>`;
        }

      }

    });

    div.innerHTML = html;

    this.messagesBox.appendChild(div);
    this.scroll();
  },

  /* ✨ TEXT CLEAN + EMOJIS */
  cleanText(text){
    return text
      .replace(/code/gi,"💻 code")
      .replace(/ai/gi,"🤖 AI")
      .replace(/python/gi,"🐍 python")
      .replace(/money/gi,"💰 money");
  },

  /* 💻 CLEAN CODE (NO EMOJIS EVER) */
  cleanCode(text){
    return text
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
      .replace(/🤖|💰|💻|🔎|👤|📧/g, "")
      .trim();
  },

  /* ⚡ ESCAPE HTML */
  escape(str){
    return str
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;");
  },

  /* 📍 SCROLL */
  scroll(){
    setTimeout(()=>{
      this.messagesBox.scrollTop = this.messagesBox.scrollHeight;
    },30);
  },

  /* ❌ ERROR */
  error(msg){
    const div = document.createElement("div");
    div.className = "msg ai";
    div.innerHTML = "❌ " + msg;

    this.messagesBox.appendChild(div);
  },

  /* ⌨ KEYBOARD FIX (100% CORRECT) */
  enableKeyboard(){

    document.addEventListener("keydown",(e)=>{

      const chatInput = document.getElementById("chatInput");
      const homeInput = document.getElementById("homeInput");

      // ✔ SHIFT + ENTER = NEW LINE (DO NOTHING)
      if(e.key === "Enter" && e.shiftKey){
        return;
      }

      // ❌ ENTER = SEND ONLY
      if(e.key === "Enter" && !e.shiftKey){

        if(document.activeElement === chatInput){
          e.preventDefault();
          if(typeof send === "function") send();
        }

        if(document.activeElement === homeInput){
          e.preventDefault();
          if(typeof startChat === "function") startChat();
        }
      }

    });

  }
};
