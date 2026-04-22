export default async function handler(req, res) {

  // GET test
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "API working ✔️ (Groq + Pixazo enabled)"
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {

    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const message = body?.message;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    // =========================
    // 🧠 IMAGE DETECTION
    // =========================
    const isImageRequest = (msg) => {
      const m = msg.toLowerCase();
      return (
        m.includes("image") ||
        m.includes("generate") ||
        m.includes("logo") ||
        m.includes("draw") ||
        m.includes("picture")
      );
    };

    // =========================
    // 🖼️ PIXAZO IMAGE GENERATION
    // =========================
    async function generateImage(prompt) {
      const response = await fetch(
        "https://api.pixazo.ai/v1/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.PIXAZO_API_KEY}`
          },
          body: JSON.stringify({
            prompt
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Pixazo error");
      }

      return data.image_url || data.data?.url;
    }

    // =========================
    // 🧠 ROUTING LOGIC
    // =========================

    if (isImageRequest(message)) {

      const image = await generateImage(message);

      return res.status(200).json({
        reply: image,
        type: "image"
      });
    }

    // =========================
    // 🤖 GROQ API (UNCHANGED LOGIC)
    // =========================

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant."
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 1024
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: data.error?.message || "Groq API error"
      });
    }

    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "No response",
      type: "text"
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message || "Server error"
    });
  }
}
