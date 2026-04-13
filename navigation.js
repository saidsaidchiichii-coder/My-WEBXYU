/* 🌐 NAVIGATION SYSTEM - FULL VERSION */

function go(page){

  // hide all sections
  const sections = ["home", "earn", "settings"];

  sections.forEach(id => {
    const el = document.getElementById(id);
    if(el){
      el.style.display = "none";
    }
  });

  // show selected section
  const active = document.getElementById(page);
  if(active){
    active.style.display = "flex";
  }

  // active button highlight
  const buttons = document.querySelectorAll(".nav button");
  buttons.forEach(btn => btn.classList.remove("active"));

  const activeBtn = document.querySelector(`[onclick="go('${page}')"]`);
  if(activeBtn){
    activeBtn.classList.add("active");
  }
}
