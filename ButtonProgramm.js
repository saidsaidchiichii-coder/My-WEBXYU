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

    // 👍 LIKE
    const likeBtn = document.createElement("button");
    likeBtn.innerText = "👍";
    likeBtn.onclick = () => {
      likeBtn.style.color = "#10a37f";
    };

    // 🔁 REFRESH
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

        let data;

        try{
          data = await res.json();
        }catch{
          throw new Error("Bad JSON");
        }

        const reply = data?.reply || "No response";

        messageDiv.innerHTML = "";
        AI.render(reply, userPrompt);

      }catch(e){
        messageDiv.innerText = "❌ refresh error";
      }

      refreshBtn.innerText = "🔁";
    };

    // 📥 DOWNLOAD
    const downloadBtn = document.createElement("button");
    downloadBtn.innerText = "📥";
    downloadBtn.onclick = () => {
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "ilyass-ai.txt";
      a.click();

      URL.revokeObjectURL(url);
    };

    box.appendChild(copyBtn);
    box.appendChild(likeBtn);
    box.appendChild(refreshBtn);
    box.appendChild(downloadBtn);

    messageDiv.appendChild(box);
  }

};
