/* =========================================
   BUTTON PROGRAM SYSTEM - ILYASS AI
   COPY | LIKE | REFRESH | DOWNLOAD
========================================= */

const ButtonProgram = {

  /* 🔗 attach buttons to each AI message */
  attach(messageDiv, text, userPrompt){

    const box = document.createElement("div");
    box.className = "ai-actions";

    // 📋 COPY
    const copyBtn = document.createElement("button");
    copyBtn.innerText = "📋 Copy";
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(text);
      copyBtn.innerText = "✔ Copied";
      setTimeout(()=> copyBtn.innerText = "📋 Copy", 1500);
    };

    // 👍 LIKE
    const likeBtn = document.createElement("button");
    likeBtn.innerText = "👍 Like";
    likeBtn.onclick = () => {
      likeBtn.style.color = "#10a37f";
      likeBtn.innerText = "Liked";
    };

    // 🔁 REFRESH (regen AI answer)
    const refreshBtn = document.createElement("button");
    refreshBtn.innerText = "🔁 Refresh";
    refreshBtn.onclick = async () => {
      refreshBtn.innerText = "⏳...";
      await ButtonProgram.refresh(userPrompt, messageDiv);
      refreshBtn.innerText = "🔁 Refresh";
    };

    // 📥 DOWNLOAD
    const downloadBtn = document.createElement("button");
    downloadBtn.innerText = "📥 Download";
    downloadBtn.onclick = () => {
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "ilyass-ai-response.txt";
      a.click();

      URL.revokeObjectURL(url);
    };

    box.appendChild(copyBtn);
    box.appendChild(likeBtn);
    box.appendChild(refreshBtn);
    box.appendChild(downloadBtn);

    messageDiv.appendChild(box);
  },


  /* 🔁 REFRESH AI RESPONSE */
  async refresh(prompt, messageDiv){

    try{
      messageDiv.innerHTML = "🤖 regenerating...";

      const res = await fetch(AI.API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt })
      });

      const data = await res.json();

      messageDiv.innerHTML = data.reply || "No response";

      // re-add buttons after refresh
      ButtonProgram.attach(messageDiv, data.reply, prompt);

    }catch(err){
      messageDiv.innerHTML = "❌ error while refreshing";
    }
  }

};
