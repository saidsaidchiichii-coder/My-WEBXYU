export default async function handler(req, res) {

  const debug = [];
  const log = (step, data) => debug.push({ step, data });

  // =========================
  // GET TEST
  // =========================
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

    // =========================
    // SAFE BODY PARSE
    // =========================
    let body;

    try {
      body = typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

      log("body", body);

    } catch (e) {
      return res.status(400).json({
        error: "Invalid JSON",
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

    log("message", message);

    const isImage = message.toLowerCase().startsWith("image:");

    // =========================
    // IMAGE GENERATION (HF SAFE)
    // =========================
    if (isImage) {

      const prompt = message.replace(/^image:/i, "").trim();
      log("image_prompt", prompt);

      const modelURL =
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1";

      let response = null;
      let lastErrorText = "";

      for (let i = 0; i < 3; i++) {

        response = await fetch(modelURL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.HF_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ inputs: prompt })
        });

        log("hf_status_try_" + i, response.status);

        const contentType = response.headers.get("content-type") || "";

        // success image
        if (response.ok && contentType.includes("image")) {
          break;
        }

        // try read error
        const text = await response.text();
        lastErrorText = text;

        // if not loading -> stop immediately
        if (!text.includes("loading")) {
          return res.status(500).json({
            error: "HF error",
            detail: text,
            debug
          });
        }

        // wait before retry
        await new Promise(r => setTimeout(r, 3000));
      }

      if (!response) {
        return res.status(500).json({
          error: "No response from HF",
          debug
        });
      }

      const contentType = response.headers.get("content-type") || "";
      log("content_type", contentType);

      if (!response.ok || !contentType.includes("image")) {
        const text = await response.text().catch(() => lastErrorText);

        return res.status(500).json({
          error: "Model did not return image",
          detail: text,
          debug
        });
      }

      const buffer = await response.arrayBuffer();

      return res.status(200).json({
        reply: `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`,
        debug
      });
    }

    // =========================
    // TEXT (GROQ SAFE)
    // =========================
    const groqRes = await fetch(
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

    let data;
    try {
      data = await groqRes.json();
    } catch (e) {
      const text = await groqRes.text();
      return res.status(500).json({
        error: "Invalid Groq response",
        detail: text,
        debug
      });
    }

    log("groq_status", groqRes.status);

    if (!groqRes.ok) {
      return res.status(500).json({
        error: data?.error?.message || "Groq error",
        debug
      });
    }

    return res.status(200).json({
      reply: data?.choices?.[0]?.message?.content || "No response",
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
