const ButtonProgram = {

  attach(messageDiv, text, userPrompt){

    const box = document.createElement("div");
    box.className = "ai-actions";

    // 📋 COPY
    const copyBtn = document.createElement("button");
    copyBtn.innerText = "📋";
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(text);
      copyBtn.innerText = "✔";
      setTimeout(()=> copyBtn.innerText = "📋", 1000);
    };

    // 🔁 REFRESH (FIXED)
    const refreshBtn = document.createElement("button");
    refreshBtn.innerText = "🔁";

    refreshBtn.onclick = async () => {

      refreshBtn.innerText = "⏳";

      try{
        const res = await fetch(AI.API_URL,{
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({ message: userPrompt })
        });

        const data = await res.json();

        const reply = data?.reply || "No response";

        // ❗ بدل remove → غير بدل المحتوى
        messageDiv.innerHTML = "";

        AI.render(reply, userPrompt);

      }catch(e){
        messageDiv.innerText = "❌ refresh error";
      }

      refreshBtn.innerText = "🔁";
    };

    // 👍 LIKE
    const likeBtn = document.createElement("button");
    likeBtn.innerText = "👍";
    likeBtn.onclick = () => {
      likeBtn.style.color = "#10a37f";
    };

    // 📥 DOWNLOAD
    const downloadBtn = document.createElement("button");
    downloadBtn.innerText = "📥";
    downloadBtn.onclick = () => {
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "response.txt";
      a.click();

      URL.revokeObjectURL(url);
    };

    box.appendChild(copyBtn);
    box.appendChild(refreshBtn);
    box.appendChild(likeBtn);
    box.appendChild(downloadBtn);

    messageDiv.appendChild(box);
  }

};
