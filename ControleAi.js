const AI = {
  messagesBox: null,
  API_URL: "/api/chat",

  init(boxId) {
    this.messagesBox = document.getElementById(boxId);
  },

  user(text) {
    const div = document.createElement("div");
    div.className = "msg user";
    div.textContent = text;
    this.messagesBox.appendChild(div);
  },

  thinking() {
    const div = document.createElement("div");
    div.className = "msg ai";
    div.textContent = "Thinking...";
    this.messagesBox.appendChild(div);
    return div;
  },

  async ask(message) {
    const loader = this.thinking();

    try {
      const res = await fetch(this.API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      const data = await res.json();
      loader.remove();

      const reply = data.reply || "No response";

      const div = document.createElement("div");
      div.className = "msg ai";
      div.textContent = reply;

      this.messagesBox.appendChild(div);

    } catch (err) {
      loader.textContent = "API Error";
    }
  }
};
