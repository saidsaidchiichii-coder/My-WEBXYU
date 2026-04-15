import express from "express";

const app = express();
app.use(express.json());

// =========================
// 🧠 IMAGE DETECTION LOGIC
// =========================
function isImageRequest(text) {
  const t = text.toLowerCase();

  return (
    t.includes("image") ||
    t.includes("picture") ||
    t.includes("draw") ||
    t.includes("generate") ||
    t.includes("photo") ||
    t.includes("baby") ||
    t.includes("wallpaper")
  );
}

// =========================
// 🖼️ IMAGE GENERATION MOCK
// (بدلها بـ DALL·E / Stability / Replicate)
// =========================
function generateImage(prompt) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
}

// =========================
// 🤖 CHAT LOGIC (placeholder)
// =========================
function chatResponse(message) {
  return `AI response to: ${message}`;
}

// =========================
// 🚀 MAIN API
// =========================
app.post("/api/chat", async (req, res) => {
  const message = req.body.message || "";

  // 🖼️ IMAGE ROUTE
  if (isImageRequest(message)) {
    return res.json({
      type: "image",
      url: generateImage(message)
    });
  }

  // 💬 CHAT ROUTE
  return res.json({
    type: "chat",
    reply: chatResponse(message)
  });
});

// =========================
app.listen(3000, () => {
  console.log("API running on port 3000");
});
