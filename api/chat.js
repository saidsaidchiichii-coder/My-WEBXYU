export default async function handler(req, res) {

  // =========================
  // GET TEST
  // =========================
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "API working ✔️ (STABLE ROUTER MODE)"
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

    console.log("🟢 USER:", message);

    // =========================
    // SIMPLE STABLE ROUTER (NO AI)
    // =========================
    const isImageRequest = (msg) => {
      const m = msg.toLowerCase();
      return (
        m.includes("image") ||
        m.includes("generate") ||
        m.includes("draw") ||
        m.includes("picture") ||
        m.includes("logo") ||
        m.includes("create image")
      );
    };

    const route = {
      type: isImageRequest(message) ? "image" : "text",
      prompt: message
    };

    console.log("🚦 ROUTE:", route);

    // =========================
    // PIXAZO IMAGE API
    // =========================
    async function generateImage(prompt) {
      console.log("🖼️ PROMPT:", prompt);

      const response = await fetch("https://api.pixazo.ai/v1/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.PIXAZO_API_KEY}`
        },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();

      console.log("🖼️ PIXAZO RESPONSE:", JSON.stringify(data, null, 2));

      if (!response.ok) {
        console.log("❌ PIXAZO ERROR:", data);
        return null;
      }

      return (
        data.image_url ||
        data.url ||
        data.data?.url ||
        data.result?.[0]?.url ||
        data.output?.[0] ||
        data.output ||
        null
      );
    }

    // =========================
    // IMAGE FLOW
    // =========================
    if (route.type === "image") {

      const image = await generateImage(route.prompt);

      console.log("🖼️ FINAL IMAGE:", image);

      if (!image) {
        return res.status(200).json({
          reply: "Image generation failed (API returned empty result)",
          type: "error"
        });
      }

      return res.status(200).json({
        reply: image,
        type: "image"
      });
    }

    // =========================
    // GROQ TEXT FLOW
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

    console.log("💬 GROQ:", data);

    return res.status(200).json({
      reply: data?.choices?.[0]?.message?.content || "No response",
      type: "text"
    });

  } catch (err) {
    console.log("🔥 SERVER ERROR:", err);

    return res.status(500).json({
      error: err.message || "Server error"
    });
  }
}
