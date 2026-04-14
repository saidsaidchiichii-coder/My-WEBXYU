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
    div.innerHTML = "🤖 Thinking...";

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

      const reply = data?.reply || "❌ No response from AI";
      this.render(reply, message);

    }catch(e){
      load.remove();
      this.error();
    }
  },

  render(text, prompt){

    const container = document.createElement("div");
    container.className = "msg ai";

    const parts = text.split("```");

    parts.forEach((part, i)=>{

      // 💻 CODE
      if(i % 2 === 1){

        const wrapper = document.createElement("div");
        wrapper.className = "code-box";

        const pre = document.createElement("pre");
        const code = document.createElement("code");

        code.textContent = part.trim();

        pre.appendChild(code);
        wrapper.appendChild(pre);

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

    // 🔥 buttons (important)
    ButtonProgram.attach(container, text, prompt);

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
    div.textContent = "❌ API error";

    this.messagesBox.appendChild(div);
  }
};
