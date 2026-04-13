const AI = {
  messagesBox: null,
  API_URL: null,
  speed: 5, // ⚡ FAST typing

  /* INIT */
  init(boxId, api){
    this.messagesBox = document.getElementById(boxId);
    this.API_URL = api;

    this.enableShiftEnter();
  },

  /* 👤 USER MESSAGE (with emojis) */
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

  /* 🤖 AI RESPONSE */
  ai(text, type="response"){
    const div = document.createElement("div");
    div.className = "msg ai";

    this.messagesBox.appendChild(div);

    // separate response vs request
    if(type === "request"){
      this.type(div, "🔎 " + this.addEmojis(text));
    }
    else{
      this.type(div, "🤖 " + this.addEmojis(text));
    }

    this.scroll();
  },

  /* ⚡ FAST TYPE EFFECT */
  type(el, text){
    let i = 0;
    el.innerHTML = "";

    const interval = setInterval(() => {
      el.innerHTML += text[i];
      i++;

      if(i >= text.length){
        clearInterval(interval);
      }
    }, this.speed);
  },

  /* 🧠 DETECT TYPE */
  detect(text){
    if(text.includes("```")) return "code";
    if(text.includes("?") || /how|what|why|explain/i.test(text)) return "request";
    if(text.includes("@") && text.includes(".")) return "email";
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
      this.ai("❌ Connection error");
    }
  },

  /* 🎨 RENDER */
  render(text, type){

    // CODE
    if(type === "code" || text.includes("```")){

      const parts = text.split("```");
      let html = "";

      parts.forEach((part,i)=>{
        if(i % 2 === 1){
          html += `<pre><code>${this.escape(part)}</code></pre>`;
        }else{
          html += `<p>${this.addEmojis(part)}</p>`;
        }
      });

      const div = document.createElement("div");
      div.className = "msg ai";
      div.innerHTML = "💻 " + html;

      this.messagesBox.appendChild(div);
      this.scroll();
      return;
    }

    // REQUEST
    if(type === "request"){
      this.ai(text, "request");
      return;
    }

    // RESPONSE NORMAL
    this.ai(text, "response");
  },

  /* ⚡ EMOJIS SYSTEM */
  addEmojis(text){
    return text
      .replace(/hello/gi,"👋 hello")
      .replace(/money/gi,"💰 money")
      .replace(/code/gi,"💻 code")
      .replace(/ai/gi,"🤖 AI")
      .replace(/settings/gi,"⚙️ settings");
  },

  /* 📜 ESCAPE */
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

  /* ⌨ SHIFT + ENTER SUPPORT */
  enableShiftEnter(){

    document.addEventListener("keydown",(e)=>{

      const input = document.getElementById("chatInput");
      const homeInput = document.getElementById("homeInput");

      if(!input && !homeInput) return;

      if(e.key === "Enter" && e.shiftKey){
        // allow new line
        return;
      }

      if(e.key === "Enter"){

        if(document.activeElement === input){
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
