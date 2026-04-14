const AI = {
  messagesBox: null,
  API_URL: null,

  /* =========================
     🎨 SYNTAX HIGHLIGHT
  ========================= */
  highlight(code){

    return code
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")

      .replace(/(\/\/.*)/g,'<span class="cmt">$1</span>')
      .replace(/(["'`].*?["'`])/g,'<span class="str">$1</span>')
      .replace(/\b(\d+)\b/g,'<span class="num">$1</span>')
      .replace(/\b(int|bool|return|if|else|for|while|function|const|let|var|class|new|async|await|try|catch|fetch|throw)\b/g,
        '<span class="kw">$1</span>')
      .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\(/g,
        '<span class="fn">$1</span>(');
  },

  init(box,api){
    this.messagesBox=document.getElementById(box);
    this.API_URL=api;
  },

  /* =========================
     👤 USER MESSAGE
  ========================= */
  user(text){
    const div=document.createElement("div");
    div.className="msg user";
    div.textContent=text;
    this.messagesBox.appendChild(div);
    this.scroll();
  },

  /* =========================
     🔄 DOTS LOADING (NEW)
  ========================= */
  thinking(){
    const div=document.createElement("div");
    div.className="msg ai";

    div.innerHTML=`
      <div class="dots">
        <span></span><span></span><span></span>
      </div>
    `;

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

      // 🔥 typing effect instead of instant render
      this.typeWriter(data?.reply || "No response");

    }catch(e){
      load.remove();

      const err=document.createElement("div");
      err.className="msg ai";
      err.textContent="❌ API error";
      this.messagesBox.appendChild(err);
    }
  },

  /* =========================
     ⌨️ TYPEWRITER EFFECT (NEW)
  ========================= */
  typeWriter(text){

    const container=document.createElement("div");
    container.className="msg ai";

    this.messagesBox.appendChild(container);

    let i=0;

    const interval=setInterval(()=>{

      container.textContent = text.slice(0,i);

      i++;

      this.scroll();

      if(i>text.length){
        clearInterval(interval);

        // بعد ما يسالي typing → render code formatting
        container.innerHTML = this.formatFinal(text);
      }

    },10);
  },

  /* =========================
     💻 FINAL FORMAT (reuse render logic)
  ========================= */
  formatFinal(text){

    const parts=text.split("```");
    let html="";

    parts.forEach((part,i)=>{

      if(i%2===1){

        html+=`
          <div class="code-box">
            <div class="code-header">
              <span class="code-lang">code</span>
              <button class="copy-btn"
                onclick="navigator.clipboard.writeText(\`${part.trim().replace(/`/g,'\\`')}\`)">
                Copy
              </button>
            </div>

            <pre><code>${this.highlight(part.trim())}</code></pre>
          </div>
        `;
      }
      else{
        part.split("\n").forEach(line=>{
          if(line.trim()){
            html+=`<div class="ai-text"><p>${line.trim()}</p></div>`;
          }
        });
      }

    });

    return html;
  },

  scroll(){
    setTimeout(()=>{
      this.messagesBox.scrollTop=this.messagesBox.scrollHeight;
    },20);
  }
};
