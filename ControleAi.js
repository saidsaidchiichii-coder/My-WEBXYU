/* 🤖 CONTROLE AI SYSTEM (PRO VERSION) */

const AI = {
  messagesBox: null,
  API_URL: null,
  typingSpeed: 12,

  init(boxId, apiUrl){
    this.messagesBox = document.getElementById(boxId);
    this.API_URL = apiUrl;
  },

  /* USER MESSAGE */
  user(text){
    this.add(text, "user");
  },

  /* AI MESSAGE (typed) */
  ai(text){
    const div = document.createElement("div");
    div.className = "msg ai";
    this.messagesBox.appendChild(div);
    this.type(div, text);
  },

  /* ADD SIMPLE MESSAGE */
  add(text, type){
    const div = document.createElement("div");
    div.className = "msg " + type;
    div.innerHTML = text;
    this.messagesBox.appendChild(div);
  },

  /* TYPE EFFECT */
  type(el, text){
    let i = 0;
    el.innerHTML = "";

    const interval = setInterval(() => {
      el.innerHTML += text[i];
      i++;

      if(i >= text.length){
        clearInterval(interval);
      }
    }, this.typingSpeed);
  },

  /* THINKING ANIMATION */
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
    return div;
  },

  /* ASK AI */
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

    }catch(err){
      loading.remove();
      this.add("AI error ❌", "ai");
    }
  }
};
