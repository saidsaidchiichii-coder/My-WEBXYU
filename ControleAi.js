const AI = {
  messagesBox:null,
  API_URL:null,
highlight(code){

  return code
    // comments
    .replace(/(\/\/.*)/g,'<span class="cmt">$1</span>')

    // strings
    .replace(/(["'`].*?["'`])/g,'<span class="str">$1</span>')

    // numbers
    .replace(/\b(\d+)\b/g,'<span class="num">$1</span>')

    // keywords
    .replace(/\b(int|bool|return|if|else|for|while|function|const|let|var|class|new|async|await)\b/g,
      '<span class="kw">$1</span>')

    // functions
    .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\(/g,
      '<span class="fn">$1</span>(');
},
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

      this.render(data?.reply || "No response");

    }catch(e){
      load.remove();

      const err=document.createElement("div");
      err.className="msg ai";
      err.textContent="❌ API error";
      this.messagesBox.appendChild(err);
    }
  },

  /* =========================
      🔥 FIXED RENDER SYSTEM
  ========================= */
  render(text){

    const container=document.createElement("div");
    container.className="msg ai";

    const parts=text.split("```");

    parts.forEach((part,i)=>{

      // 💻 CODE BLOCK
      if(i%2===1){

      const codeBox=document.createElement("div");
codeBox.className="code-box";

/* HEADER */
const header=document.createElement("div");
header.className="code-header";

/* LANGUAGE */
const lang=document.createElement("span");
lang.className="code-lang";
lang.textContent="code";

/* COPY BUTTON */
const copy=document.createElement("button");
copy.className="copy-btn";
copy.textContent="Copy";

copy.onclick=()=>{
  navigator.clipboard.writeText(part.trim());
  copy.textContent="Copied!";
  setTimeout(()=>copy.textContent="Copy",1500);
};

header.appendChild(lang);
header.appendChild(copy);

/* CODE */
const pre=document.createElement("pre");
const code=document.createElement("code");

code.textContent=part.trim();

pre.appendChild(code);

/* APPEND */
codeBox.appendChild(header);
codeBox.appendChild(pre);

container.appendChild(codeBox);
      }

      // 🧠 TEXT
      else{
        const textDiv=document.createElement("div");
        textDiv.className="ai-text";

        part.split("\n").forEach(line=>{
          if(line.trim()){
            const p=document.createElement("p");
            p.textContent=line.trim();
            textDiv.appendChild(p);
          }
        });

        container.appendChild(textDiv);
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
