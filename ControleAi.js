export default async function handler(req, res) {
  const debug = [];
  const log = (step, data) => debug.push({ step, data });

  // =========================
  // GET TEST
  // =========================
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "Gemini API working ✔️",
      test: "send POST { message: 'hi' }"
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST allowed",
      debug
    });
  }

  try {
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const message = body?.message;

    if (!message) {
      return res.status(400).json({
        error: "Message required",
        debug
      });
    }

    log("message", message);

    // =========================
    // GEMINI API CALL
    // =========================
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: message }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    log("status", response.status);
    log("raw_response", data);

    if (!response.ok) {
      return res.status(500).json({
        error: "Gemini failed",
        detail: data,
        debug
      });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini";

    return res.status(200).json({
      reply,
      debug
    });

  } catch (err) {
    return res.status(500).json({
      error: "Server crash",
      message: err.message,
      debug
    });
  }
}
