export default async function handler(req, res) {

  // ✅ allow GET (fix 405 on preview / browser)
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "API is working ✔️ Use POST /api/chat"
    });
  }

  // ❌ block other methods
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST allowed"
    });
  }

  try {

    // 📦 safe body parsing (Vercel fix)
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const message = body?.message;

    // ❌ validation
    if (!message) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    // 🧠 response (for now mock / safe)
    return res.status(200).json({
      reply: `🤖 AI: received -> ${message}`
    });

  } catch (err) {

    console.error("API ERROR:", err);

    return res.status(500).json({
      error: err?.message || "Internal Server Error"
    });
  }
}
