export default async function handler(req, res) {

  // =========================
  // GET TEST
  // =========================
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "API working ✔️ (Groq + Pixazo)"
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
        m.includes("generate") ||
        m.includes("create image") ||
        m.includes("draw") ||
        m.includes("logo") ||
        m.includes("picture") ||
        m.includes("image of")
      );
    };

    // =========================
    // 🖼️ PIXAZO FUNCTION (SAFE)
    // =========================
    async function generateImage(prompt) {
      try {
        const response = await fetch("https://api.pixazo.ai/v1/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.PIXAZO_API_KEY}`
          },
          body: JSON.stringify({ prompt })
        });

        const data = await response.json();

        if (!response.ok) {
          console.log("Pixazo error:", data);
          return null;
        }

        return (
          data.image_url ||
          data.url ||
          data.data?.url ||
          data.result?.[0]?.url ||
          null
        );

      } catch (err) {
        console.log("Pixazo crash:", err);
        return null;
      }
    }

    // =========================
    // 🔀 ROUTING
    // =========================
    if (isImageRequest(message)) {

      const image = await generateImage(message);

      if (!image) {
        return res.status(200).json({
          reply: "Image generation failed",
          type: "text"
        });
      }

      return res.status(200).json({
        reply: image,
        type: "image"
      });
    }

    // =========================
    // 🤖 GROQ AI (STABLE)
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
        error: data?.error?.message || "Groq API error"
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "No response";

    return res.status(200).json({
      reply,
      type: "text"
    });

  } catch (err) {
    console.log("SERVER ERROR:", err);

    return res.status(500).json({
      error: "Server crashed"
    });
  }
}
