/* SUPABASE */
const { createClient } = supabase;
const supabaseClient = createClient(
  "https://idjgsgtupuymysptxrbl.supabase.co",
  "sb_publishable_XLIIiXZRcS5hrvdQP_pkMA_w2I11xFH"
);

let loggedIn = false;

/* TOAST */
function notify(msg,type="success"){
  const t=document.createElement("div");
  t.className=`toast ${type}`;
  t.innerText=msg;
  document.body.appendChild(t);
  setTimeout(()=>t.classList.add("show"),10);
  setTimeout(()=>t.remove(),3000);
}

/* LOGIN */
async function login(){
  const email=document.getElementById("email").value;
  const password=document.getElementById("password").value;

  const {error} = await supabaseClient.auth.signInWithPassword({email,password});

  if(error){ notify(error.message,"error"); return; }

  saveUser(email);
  notify("Login success");

  document.getElementById("loginOverlay").style.display="none";
  document.getElementById("chat").classList.add("active");
  loggedIn=true;
}

/* SIGNUP */
async function signup(){
  const email=document.getElementById("email").value;
  const password=document.getElementById("password").value;

  const {error} = await supabaseClient.auth.signUp({email,password});

  if(error){ notify(error.message,"error"); return; }

  notify("Account created");
}

/* OWNER */
function ownerSkip(){
  const key=prompt("Owner key");
  if(key==="ADMIN123"){
    document.getElementById("loginOverlay").style.display="none";
    document.getElementById("chat").classList.add("active");
    loggedIn=true;
  }
}

/* SAVE USERS */
function saveUser(email){
  let users=JSON.parse(localStorage.getItem("users")||"[]");
  if(!users.includes(email)){
    users.push(email);
    localStorage.setItem("users",JSON.stringify(users));
  }
}

/* SETTINGS */
function openSettings(){
  document.getElementById("settingsPanel").style.display="flex";

  const users=JSON.parse(localStorage.getItem("users")||[]);
  document.getElementById("usersList").innerText=users.join("\n");
}

function closeSettings(){
  document.getElementById("settingsPanel").style.display="none";
}

/* CHAT */
function addMessage(text,type){
  const div=document.createElement("div");
  div.className="msg "+type;
  div.innerText=text;
  document.getElementById("messages").appendChild(div);
}

/* SEND */
async function send(){

  if(!loggedIn){
    notify("Login first","error");
    return;
  }

  const input=document.getElementById("input");
  const text=input.value.trim();
  if(!text) return;

  addMessage(text,"user");
  input.value="";

  try{
    const res=await fetch("/api/chat",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({message:text})
    });

    const data=await res.json();
    addMessage(data.reply || "No response","ai");

  }catch{
    notify("Chat error","error");
  }
}
