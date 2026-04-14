const AI = {
  messagesBox:null,
  API_URL:null,

  init(box,api){
    this.messagesBox=document.getElementById(box);
    this.API_URL=api;
  },

  user(text){
    const div=document.createElement("div");
    div.className="msg user";
    div.textContent=text;
    this.messagesBox.appendChild(div);
    this.scroll();
  },

  thinking(){
    const div=document.createElement("div");
    div.className="msg ai";
    div.textContent="🤖 Thinking...";
    this.messagesBox.appendChild(div);
    this.scroll();
    return div;
  },

  async ask(message){
    const load=this.thinking();

    try{
      const res=await fetch(this.API_URL,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({message})
      });

      const data=await res.json();

      load.remove();

      const reply=data?.reply || "No response";

      this.aiReply(reply);

    }catch(e){
      load.remove();

      const div=document.createElement("div");
      div.className="msg ai";
      div.textContent="❌ API error";
      this.messagesBox.appendChild(div);
    }
  },

  /* =========================
     🆕 SMART AI RESPONSE UI
  ========================= */
  aiReply(text){

    const container=document.createElement("div");
    container.className="msg ai";

    const parts=text.split("```");

    parts.forEach((part,i)=>{

      // 💻 CODE BLOCK
      if(i%2===1){
        const pre=document.createElement("pre");
        const code=document.createElement("code");

        code.textContent=part.trim();

        pre.style.background="#111";
        pre.style.color="#0f0";
        pre.style.padding="10px";
        pre.style.borderRadius="10px";
        pre.style.overflowX="auto";

        pre.appendChild(code);
        container.appendChild(pre);
      }

      // 🧠 TEXT
      else{
        const p=document.createElement("div");
        p.textContent=part.trim();
        container.appendChild(p);
      }

    });

    this.messagesBox.appendChild(container);
    this.scroll();
  },

  scroll(){
    setTimeout(()=>{
      this.messagesBox.scrollTop=this.messagesBox.scrollHeight;
    },20);
  }
};
