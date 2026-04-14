const ButtonProgram = {

  attach(messageDiv, text, userPrompt){

    const box = document.createElement("div");
    box.className = "ai-actions";

    // 📋 COPY
    const copyBtn = document.createElement("button");
    copyBtn.innerText = "📋 Copy";
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(text);
      copyBtn.innerText = "✔";
      setTimeout(()=> copyBtn.innerText = "📋 Copy", 1200);
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

      const res = await fetch(AI.API_URL,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ message: userPrompt })
      });

      const data = await res.json();

      messageDiv.remove();
      AI.render(data.reply || "No response", userPrompt);

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
