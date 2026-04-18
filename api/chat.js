export default async function handler(req, res) {

  // GET test
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "API working ✔️ Use POST"
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

    /* =========================
       🎯 DETECT MODE
    ========================= */

    const isImage = message.toLowerCase().startsWith("image:");

    /* =========================
       🎨 IMAGE (HUGGING FACE FIXED)
    ========================= */
    if (isImage) {

      const prompt = message.replace(/^image:/i, "").trim();

      const response = await fetch(
        "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.HF_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            inputs: prompt
          })
        }
      );

      if (!response.ok) {
        const err = await response.text();
        return res.status(500).json({
          error: err || "HF Image error"
        });
      }

      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");

      return res.status(200).json({
        reply: `data:image/png;base64,${base64}`
      });
    }

    /* =========================
       🤖 TEXT (GROQ)
    ========================= */

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
      reply: data.choices?.[0]?.message?.content || "No response"
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message || "Server error"
    });
  }
}
