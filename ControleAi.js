const AI = {
  messagesBox:null,
  API_URL:null,
  speed:12,

  init(boxId, api){
    this.messagesBox = document.getElementById(boxId);
    this.API_URL = api;
  },

  user(text){
    const div=document.createElement("div");
    div.className="msg user";
    div.innerHTML=text;
    this.messagesBox.appendChild(div);
  },

  thinking(){
    const div=document.createElement("div");
    div.className="msg ai";
    div.innerHTML=`
      <div class="thinking">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>`;
    this.messagesBox.appendChild(div);
    return div;
  },

  ai(text){
    const div=document.createElement("div");
    div.className="msg ai";
    this.messagesBox.appendChild(div);

    let i=0;
    div.innerHTML="";

    const interval=setInterval(()=>{
      div.innerHTML+=text[i];
      i++;
      if(i>=text.length) clearInterval(interval);
    },this.speed);
  },

  async ask(message){

    const loading=this.thinking();

    try{
      const res=await fetch(this.API_URL,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ message })
      });

      const data=await res.json();

      loading.remove();
      this.ai(data.reply || "No response");

    }catch(e){
      loading.remove();
      this.ai("Error connecting to AI ❌");
    }
  }
};
