/* SUPABASE */
const { createClient } = supabase;

const supabaseClient = createClient(
  "https://idjgsgtupuymysptxrbl.supabase.co",
  "sb_publishable_XLIIiXZRcS5hrvdQP_pkMA_w2I11xFH"
);

let loggedIn = false;

/* LOGIN */
async function login(){
  const email=document.getElementById("email").value;
  const password=document.getElementById("password").value;

  const {error} = await supabaseClient.auth.signInWithPassword({email,password});

  if(error){ alert(error.message); return; }

  document.getElementById("loginOverlay").style.display="none";
  document.getElementById("chat").classList.add("active");

  loggedIn=true;
}

/* كمل باقي الكود ديالك هنا */
