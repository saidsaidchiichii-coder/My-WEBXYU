export default async function handler(req, res) {

  // =========================
  // GET TEST
  // =========================
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "API working ✔️"
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {

    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    let message = body?.message || "";

    if (!message.trim()) {
      return res.status(400).json({ error: "Message required" });
    }

    // =========================
    // NORMALIZE INPUT
    // =========================
    message = message.toLowerCase().replace(/\s+/g, " ").trim();

    // =========================
    // ROUTER DETECTION
    // =========================
    const isImage =
      message.startsWith("image:") ||
      message.startsWith("image :") ||
      message.startsWith("image ");

    // =========================
    // 🎨 IMAGE ROUTE (HF)
    // =========================
    if (isImage) {

      let prompt = message
        .replace(/^image\s*:\s*/i, "")
        .replace(/^image\s+/i, "")
        .trim();

      // safety fallback
      if (!prompt) prompt = "cat";

      const response = await fetch(
        "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.HF_TOKEN}`,
            "Content-Type": "application/json",
            "Accept": "image/png"
          },
          body: JSON.stringify({
            inputs: prompt,
            options: { wait_for_model: true }
          })
        }
      );

      const contentType = response.headers.get("content-type") || "";

      if (!response.ok || !contentType.includes("image")) {
        const err = await response.text();
        return res.status(500).json({
          error: "Image generation failed",
          details: err
        });
      }

      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");

      return res.status(200).json({
        reply: `data:image/png;base64,${base64}`
      });
    }

    // =========================
    // 🤖 TEXT ROUTE (GROQ)
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
              content: `
You are a helpful AI assistant.
- Answer clearly and directly.
- No ASCII art unless asked.
- No image generation in text mode.
              `
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
      reply: data.choices?.[0]?.message?.content || "No response"
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message || "Server error"
    });
  }
}
