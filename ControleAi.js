/* 🤖 AI ENGINE (Typing + Thinking + Animations) */

let messagesBox;
let API_URL;

/* INIT */
function initAI(boxId, api){
  messagesBox = document.getElementById(boxId);
  API_URL = api;
}

/* ADD MESSAGE */
function addMessage(text, type){
  const div = document.createElement("div");
  div.className = "msg " + type;
  messagesBox.appendChild(div);

  if(type === "ai"){
    typeText(div, text);
  }else{
    div.innerHTML = text;
  }
}

/* TYPE EFFECT */
function typeText(el, text){
  let i = 0;
  el.innerHTML = "";

  const interval = setInterval(() => {
    el.innerHTML += text[i];
    i++;

    if(i >= text.length){
      clearInterval(interval);
    }
  }, 15);
}

/* THINKING ANIMATION */
function showThinking(){
  const div = document.createElement("div");
  div.className = "msg ai";
  div.innerHTML = `
    <div class="thinking">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>
  `;

  messagesBox.appendChild(div);
  return div;
}

/* ASK AI */
async function askAI(message){

  const thinkingBox = showThinking();

  try{
    const res = await fetch(API_URL,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();

    thinkingBox.remove();
    addMessage(data.reply || "No response", "ai");

  }catch(err){
    thinkingBox.remove();
    addMessage("AI connection error ❌", "ai");
  }
}
