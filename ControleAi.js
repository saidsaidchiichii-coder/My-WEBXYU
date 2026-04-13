const AI = {
  messagesBox: null,
  API_URL: null,
  speed: 4, // ⚡ VERY FAST typing

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

    div.innerHTML = "👤 " + this.escape(this.addEmojis(text));

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
    if(text.includes("```")) return "code";
    if(/how|what|why|explain|\?/.test(text.toLowerCase())) return "request";
    return "response";
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

  /* 🎨 MAIN RENDER ENGINE */
  render(text, type){

    const div = document.createElement("div");
    div.className = "msg ai";

    const parts = text.split("```");
    let html = "";

    parts.forEach((part, i) => {

      // 💻 CODE BLOCK (NO EMOJIS)
      if(i % 2 === 1){
        html += `<pre><code>${this.escape(part)}</code></pre>`;
      }

      // 📝 TEXT BLOCK (WITH EMOJIS)
      else{
        let clean = this.addEmojis(part);

        if(type === "request"){
          html += `<p>🔎 ${clean}</p>`;
        } else {
          html += `<p>🤖 ${clean}</p>`;
        }
      }

    });

    div.innerHTML = html;

    this.messagesBox.appendChild(div);
    this.scroll();
  },

  /* ⚡ EMOJIS ONLY IN TEXT */
  addEmojis(text){
    return text
      .replace(/hello/gi,"👋 hello")
      .replace(/money/gi,"💰 money")
      .replace(/code/gi,"💻 code")
      .replace(/ai/gi,"🤖 AI")
      .replace(/python/gi,"🐍 python");
  },

  /* ⚡ ESCAPE HTML (SAFE CODE) */
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
    },50);
  },

  /* ❌ ERROR */
  error(msg){
    const div = document.createElement("div");
    div.className = "msg ai";
    div.innerHTML = "❌ " + msg;

    this.messagesBox.appendChild(div);
  },

  /* ⌨ KEYBOARD SYSTEM (SHIFT + ENTER SUPPORT) */
  enableKeyboard(){

    document.addEventListener("keydown",(e)=>{

      const chatInput = document.getElementById("chatInput");
      const homeInput = document.getElementById("homeInput");

      if(e.key === "Enter"){

        // SHIFT + ENTER = NEW LINE
        if(e.shiftKey){
          return;
        }

        // CHAT INPUT
        if(document.activeElement === chatInput){
          e.preventDefault();
          if(typeof send === "function") send();
        }

        // HOME INPUT
        if(document.activeElement === homeInput){
          e.preventDefault();
          if(typeof startChat === "function") startChat();
        }
      }

    });

  }
};
