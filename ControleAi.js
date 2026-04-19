export default async function handler(req, res) {
  try {

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    let { message, history = [] } = body;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    const lower = message.toLowerCase();

    const isImage =
      lower.startsWith("image:");

    // ======================
    // IMAGE MODE
    // ======================
    if (isImage) {

      const prompt = message.replace(/^image:/i, "").trim();

      if (!prompt) {
        return res.status(400).json({ error: "Empty prompt" });
      }

      const hf = await fetch(
        "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HF_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ inputs: prompt })
        }
      );

      if (!hf.ok) {
        const err = await hf.text();
        return res.status(500).json({ error: err });
      }

      const buffer = await hf.arrayBuffer();

      return res.status(200).json({
        type: "image",
        reply: `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`
      });
    }

    // ======================
    // TEXT MODE (GROQ + MEMORY)
    // ======================
    const messages = [
      { role: "system", content: "You are a helpful AI assistant." },
      ...history.slice(-10),
      { role: "user", content: message }
    ];

    const groq = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages
        })
      }
    );

    const data = await groq.json();

    if (!groq.ok) {
      return res.status(500).json({
        error: "Groq failed",
        detail: data
      });
    }

    return res.status(200).json({
      type: "text",
      reply: data?.choices?.[0]?.message?.content
    });

  } catch (err) {
    return res.status(500).json({
      error: "Server crash",
      message: err.message
    });
  }
}
