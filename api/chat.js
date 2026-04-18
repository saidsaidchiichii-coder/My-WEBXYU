export default async function handler(req, res) {

  const debug = [];

  function log(step, data) {
    debug.push({ step, data });
  }

  // GET test
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "API working ✔️ Use POST"
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST allowed",
      debug
    });
  }

  try {

    /* =========================
       PARSE BODY SAFELY
    ========================= */

    let body;
    try {
      body = typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

      log("body_parsed", body);

    } catch (e) {
      log("body_error", e.message);

      return res.status(400).json({
        error: "Invalid JSON body",
        debug
      });
    }

    const message = body?.message;

    if (!message) {
      return res.status(400).json({
        error: "Message required",
        debug
      });
    }

    log("message_received", message);

    const isImage = message.toLowerCase().startsWith("image:");

    /* =========================
       🎨 IMAGE (HF DEBUG MODE)
    ========================= */

    if (isImage) {

      const prompt = message.replace(/^image:/i, "").trim();

      log("image_prompt", prompt);

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

      log("hf_status", response.status);

      const contentType = response.headers.get("content-type");
      log("hf_content_type", contentType);

      // ❌ MODEL LOADING
      if (response.status === 503) {
        return res.status(503).json({
          error: "Model is loading (HF 503)",
          debug
        });
      }

      // ❌ HF JSON ERROR
      if (contentType && contentType.includes("application/json")) {
        const err = await response.json();

        log("hf_json_error", err);

        return res.status(500).json({
          error: err.error || "HF JSON error",
          debug
        });
      }

      // ❌ NON-OK
      if (!response.ok) {
        const text = await response.text();

        log("hf_raw_error", text);

        return res.status(500).json({
          error: "HF request failed",
          debug
        });
      }

      // ✅ IMAGE SUCCESS
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");

      log("image_generated", "success");

      return res.status(200).json({
        reply: `data:image/png;base64,${base64}`,
        debug
      });
    }

    /* =========================
       🤖 GROQ (DEBUG MODE)
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
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 1024
        })
      }
    );

    log("groq_status", response.status);

    const data = await response.json();

    if (!response.ok) {
      log("groq_error", data);

      return res.status(500).json({
        error: data.error?.message || "Groq API error",
        debug
      });
    }

    const reply = data.choices?.[0]?.message?.content;

    log("groq_success", true);

    return res.status(200).json({
      reply: reply || "No response",
      debug
    });

  } catch (err) {

    log("server_crash", err.message);

    return res.status(500).json({
      error: "Server crash",
      message: err.message,
      debug
    });
  }
}
