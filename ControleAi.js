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
  },

  thinking(){
    const div=document.createElement("div");
    div.className="msg ai";
    div.textContent="🤖 Thinking...";
    this.messagesBox.appendChild(div);
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

      const div=document.createElement("div");
      div.className="msg ai";
      div.textContent=reply;

      this.messagesBox.appendChild(div);

    }catch(e){
      load.remove();

      const div=document.createElement("div");
      div.className="msg ai";
      div.textContent="❌ API error";

      this.messagesBox.appendChild(div);
    }
  }
};
