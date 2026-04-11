export default async function handler(req, res) {
  try {

    // ✅ CORS / safe GET check (important for Vercel testing)
    if (req.method === "GET") {
      return res.status(200).json({
        message: "API is working ✅ Use POST to chat"
      });
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    // ✅ safe body parsing
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const message = body?.message;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 🚀 OpenAI request
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: message }
        ]
      })
    });

    // ❗ IMPORTANT FIX: handle OpenAI errors properly
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI API error",
        details: data
      });
    }

    // ✅ send only what frontend needs (clean)
    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "No response"
    });

  } catch (err) {
    console.error("API ERROR:", err);

    return res.status(500).json({
      error: err.message || "Server error"
    });
  }
}
