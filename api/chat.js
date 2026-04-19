import { sanitizeInput } from "../utils/security.js";
import { SYSTEM_PROMPTS } from "../config/prompts.js";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {

    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    let { message, history = [], mode = "default" } = body;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    // ======================
    // SECURITY
    // ======================
    message = sanitizeInput(message);

    const isImage =
      message.toLowerCase().startsWith("image:");

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
    // SYSTEM PROMPT
    // ======================
    const systemPrompt =
      SYSTEM_PROMPTS?.[mode] || SYSTEM_PROMPTS.default;

    // ======================
    // BUILD MESSAGES (MEMORY)
    // ======================
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10), // last 10 messages memory
      { role: "user", content: message }
    ];

    // ======================
    // GROQ REQUEST
    // ======================
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

    const reply = data?.choices?.[0]?.message?.content;

    return res.status(200).json({
      type: "text",
      reply,
      usage: data?.usage || null
    });

  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      message: err.message
    });
  }
}
