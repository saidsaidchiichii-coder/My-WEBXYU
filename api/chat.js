export default async function handler(req, res) {

  // GET test
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "Hugging Face API working ✔️ Use POST"
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

    // 🤖 HUGGING FACE CHAT MODEL
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.HF_API_KEY}`
        },
        body: JSON.stringify({
          inputs: `
You are a helpful assistant.

User: ${message}
Assistant:
          `
        })
      }
    );

    const data = await response.json();

    // ❌ handle errors
    if (!response.ok) {
      return res.status(500).json({
        error: data?.error || "Hugging Face API error"
      });
    }

    // 🧠 extract reply (HF format)
    let reply =
      data?.[0]?.generated_text ||
      data?.generated_text ||
      "No response";

    // remove prompt from output if repeated
    reply = reply.split("Assistant:").pop().trim();

    return res.status(200).json({
      reply
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message || "Server error"
    });
  }
}
