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

      if(!res.ok) throw new Error("API ERROR");

      const data = await res.json();

      load.remove();

      const reply = data?.reply || data?.message || "No response";

      this.render(reply);

    }catch(err){
      load.remove();
      this.error();
      console.error(err);
    }
  },

  render(text){

    const container = document.createElement("div");
    container.className = "msg ai";

    const parts = text.split("```");

    parts.forEach((part, i)=>{

      if(i % 2 === 1){
        const pre = document.createElement("pre");
        const code = document.createElement("code");
        code.textContent = part;
        pre.appendChild(code);
        container.appendChild(pre);
      }else{
        const div = document.createElement("div");
        div.textContent = part;
        container.appendChild(div);
      }

    });

    this.messagesBox.appendChild(container);
    this.scroll();
  },

  scroll(){
    setTimeout(()=>{
      this.messagesBox.scrollTop = this.messagesBox.scrollHeight;
    },30);
  },

  error(){
    const div = document.createElement("div");
    div.className = "msg ai";
    div.textContent = "❌ API error";
    this.messagesBox.appendChild(div);
  }
};
