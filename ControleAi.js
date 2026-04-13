const AI = {
  messagesBox: null,
  API_URL: null,
  speed: 12,

  /* INIT */
  init(boxId, api){
    this.messagesBox = document.getElementById(boxId);
    this.API_URL = api;
  },

  /* USER MESSAGE */
  user(text){
    const div = document.createElement("div");
    div.className = "msg user";
    div.innerHTML = this.escape(text);
    this.messagesBox.appendChild(div);
    this.scroll();
  },

  /* THINKING */
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
    this.scroll();
    return div;
  },

  /* MAIN AI RESPONSE */
  ai(text){
    const div = document.createElement("div");
    div.className = "msg ai";

    this.messagesBox.appendChild(div);
    this.render(div, text);

    this.scroll();
  },

  /* TYPE EFFECT (TEXT ONLY) */
  type(el, text){
    let i = 0;
    el.innerHTML = "";

    const interval = setInterval(() => {
      el.innerHTML += text[i];
      i++;
      if(i >= text.length) clearInterval(interval);
    }, this.speed);
  },

  /* DETECT TYPE */
  detect(text){
    if(text.includes("```")) return "code";
    if(text.includes("@") && text.includes(".")) return "email";
    if(/how|what|why|explain/i.test(text)) return "request";
    return "text";
  },

  /* RENDER AI */
  render(el, text){

    const type = this.detect(text);

    // CODE BLOCK HANDLING
    if(type === "code"){
      const parts = text.split("```");
      let html = "";

      parts.forEach((part, i) => {

        if(i % 2 === 1){
          html += `<pre><code>${this.escape(part)}</code></pre>`;
        }else{
          html += `<p>${this.escape(part)}</p>`;
        }

      });

      el.innerHTML = html;
      return;
    }

    // EMAIL TYPE
    if(type === "email"){
      el.innerHTML = "📧 " + this.escape(text);
      return;
    }

    // REQUEST TYPE (animated)
    if(type === "request"){
      this.type(el, "🔎 " + text);
      return;
    }

    // NORMAL TEXT
    this.type(el, text);
  },

  /* CALL API */
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
      this.ai(data.reply || "No response");

    }catch(e){
      loading.remove();
      this.ai("❌ AI connection error");
    }
  },

  /* SCROLL */
  scroll(){
    setTimeout(() => {
      this.messagesBox.scrollTop = this.messagesBox.scrollHeight;
    }, 50);
  },

  /* ESCAPE HTML (IMPORTANT SECURITY + CLEAN DISPLAY) */
  escape(str){
    return str
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;");
  }
};
