const AI = {
  messagesBox: null,
  API_URL: null,

  init(boxId, api){
    this.messagesBox = document.getElementById(boxId);
    this.API_URL = api;
  },

  /* 👤 USER */
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
    div.innerHTML = "🤖 Thinking...";

    this.messagesBox.appendChild(div);
    this.scroll();
    return div;
  },

  /* 🚀 ASK AI (FIXED) */
  async ask(message){
    const load = this.thinking();

    try{
      const res = await fetch(this.API_URL,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ message })
      });

      if(!res.ok){
        throw new Error("Server not OK");
      }

      let data;

      try{
        data = await res.json();
      }catch{
        const raw = await res.text();
        console.log("RAW RESPONSE:", raw);
        throw new Error("Not JSON");
      }

      console.log("API DATA:", data);

      load.remove();

      const reply =
        data?.reply ||
        data?.message ||
        "🤖 AI did not return anything";

      this.render(reply, message);

    }catch(e){
      load.remove();

      console.error("API ERROR:", e);

      const div = document.createElement("div");
      div.className = "msg ai";
      div.textContent = "❌ AI server مشكلة (check console)";

      this.messagesBox.appendChild(div);
    }
  },

  /* 🎨 RENDER */
  render(text, prompt){

    const container = document.createElement("div");
    container.className = "msg ai";

    const parts = text.split("```");

    parts.forEach((part, i)=>{

      // 💻 CODE
      if(i % 2 === 1){

        const wrapper = document.createElement("div");
        wrapper.className = "code-box";

        const header = document.createElement("div");
        header.className = "code-header";

        const lang = document.createElement("div");
        lang.className = "code-lang";
        lang.textContent = "Code";

        const copyBtn = document.createElement("button");
        copyBtn.className = "copy-btn";
        copyBtn.textContent = "📋";

        copyBtn.onclick = () => {
          navigator.clipboard.writeText(part.trim());
          copyBtn.textContent = "✔";
          setTimeout(()=>copyBtn.textContent="📋",1000);
        };

        header.appendChild(lang);
        header.appendChild(copyBtn);

        const pre = document.createElement("pre");
        const code = document.createElement("code");

        code.textContent = part.trim();

        pre.appendChild(code);

        wrapper.appendChild(header);
        wrapper.appendChild(pre);

        container.appendChild(wrapper);
      }

      // 🧠 TEXT
      else{
        const clean = part.trim();
        if(clean){
          const p = document.createElement("div");
          p.className = "ai-text";
          p.textContent = clean;
          container.appendChild(p);
        }
      }

    });

    this.messagesBox.appendChild(container);

    // 🔥 BUTTONS
    ButtonProgram.attach(container, text, prompt);

    this.scroll();
  },

  scroll(){
    setTimeout(()=>{
      this.messagesBox.scrollTop = this.messagesBox.scrollHeight;
    },20);
  }
};
