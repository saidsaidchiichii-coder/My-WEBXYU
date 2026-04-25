export default async function handler(req, res) {

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

    // 🤖 HUGGING FACE API CALL
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.HF_TOKEN}`
        },
        body: JSON.stringify({
          inputs: message
        })
      }
    );

    const data = await response.json();

    // ❌ error handling
    if (!response.ok) {
      return res.status(500).json({
        error: data.error || "Hugging Face API error"
      });
    }

    // ✅ extract reply
    let reply = "No response";

    if (Array.isArray(data)) {
      reply = data?.[0]?.generated_text;
    } else if (data?.generated_text) {
      reply = data.generated_text;
    } else if (data?.error) {
      reply = data.error;
    }

    return res.status(200).json({
      reply
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message || "Server error"
    });
  }
}
