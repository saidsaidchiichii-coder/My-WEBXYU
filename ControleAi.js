const API_URL = "https://my-webxyu.vercel.app/api/chat";

const messagesBox = document.getElementById("messages");

/* START CHAT */
function startChat(){
  const text = document.getElementById("homeInput").value.trim();
  if(!text) return;

  document.getElementById("home").style.display="none";
  document.getElementById("chat").style.display="flex";

  addMsg(text,"user");
  document.getElementById("homeInput").value="";

  askAI(text);
}

/* SEND */
function send(){
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if(!text) return;

  addMsg(text,"user");
  input.value="";

  askAI(text);
}

/* ADD MESSAGE */
function addMsg(text,type){
  const div = document.createElement("div");
  div.className = "msg "+type;
  div.textContent = text;
  messagesBox.appendChild(div);
  scroll();
}

/* THINKING */
function thinking(){
  const div = document.createElement("div");
  div.className = "msg ai";
  div.innerHTML = "🤖 Thinking...";
  messagesBox.appendChild(div);
  scroll();
  return div;
}

/* API CALL (SAFE) */
async function askAI(message){
  const load = thinking();

  try{
    const res = await fetch(API_URL,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ message })
    });

    if(!res.ok) throw new Error("API FAIL");

    const data = await res.json();

    load.remove();

    render(data.reply || "No response");

  }catch(e){
    load.remove();
    render("❌ AI server error / offline");
  }
}

/* RENDER RESPONSE */
function render(text){

  const container = document.createElement("div");
  container.className = "msg ai";

  const parts = text.split("```");

  parts.forEach((part,i)=>{

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

  messagesBox.appendChild(container);
  scroll();
}

/* SCROLL */
function scroll(){
  setTimeout(()=>{
    messagesBox.scrollTop = messagesBox.scrollHeight;
  },50);
}
