/* SUPABASE */
const supabaseClient = supabase.createClient(
  "https://idjgsgtupuymysptxrbl.supabase.co",
  "sb_publishable_XLIIiXZRcS5hrvdQP_pkMA_w2I11xFH"
);

let loggedIn = false;

/* LOGIN */
async function login(){
  const email=document.getElementById("email").value;
  const password=document.getElementById("password").value;

  if(!email || !password){
    alert("Fill all fields");
    return;
  }

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if(error){
    alert(error.message);
    return;
  }

  saveUser(email);

  document.getElementById("loginOverlay").style.display="none";
  document.getElementById("chat").classList.add("active");

  loggedIn = true;
}

/* SIGNUP */
async function signup(){
  const email=document.getElementById("email").value;
  const password=document.getElementById("password").value;

  const { error } = await supabaseClient.auth.signUp({
    email,
    password
  });

  if(error){
    alert(error.message);
  }else{
    alert("Account created");
  }
}

/* OWNER SKIP */
function ownerSkip(){
  const key = prompt("Owner key");
  if(key === "ADMIN123"){
    document.getElementById("loginOverlay").style.display="none";
    document.getElementById("chat").classList.add("active");
    loggedIn = true;
  }else{
    alert("Wrong key");
  }
}

/* SAVE USERS */
function saveUser(email){
  let users = JSON.parse(localStorage.getItem("users") || "[]");

  if(!users.includes(email)){
    users.push(email);
    localStorage.setItem("users", JSON.stringify(users));
  }
}

/* SETTINGS */
function openSettings(){
  document.getElementById("settingsPanel").style.display="flex";

  const users = JSON.parse(localStorage.getItem("users") || []);
  document.getElementById("usersList").innerText =
    users.length ? users.join("\n") : "No users yet";
}

function closeSettings(){
  document.getElementById("settingsPanel").style.display="none";
}

/* CHAT */
function addMessage(text,type){
  const div=document.createElement("div");
  div.className="msg "+type;
  div.innerText=text;

  const box=document.getElementById("messages");
  box.appendChild(div);
  box.scrollTop=box.scrollHeight;
}

/* SEND */
async function send(){

  if(!loggedIn){
    alert("Login first");
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

  }catch(err){
    alert("Chat error");
  }
}
