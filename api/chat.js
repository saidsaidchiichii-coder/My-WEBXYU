export default async function handler(req, res) {

  // 👇 مهم باش ما يبانش error فالبراوزر
  if (req.method === "GET") {
    return res.status(200).json({
      message: "API is working ✔️ Use POST"
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

    return res.status(200).json({
      reply: "received: " + message
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
