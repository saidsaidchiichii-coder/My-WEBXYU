export default async function handler(req, res) {

  const debug = [];
  const log = (step, data) => debug.push({ step, data });

  // =========================
  // GET TEST
  // =========================
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "API working ✔️",
      test: "send POST { message: 'image: a cat in space' }"
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
    // BODY
    // =========================
    let body = typeof req.body === "string"
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
    // ROUTER
    // =========================
    const lower = message.toLowerCase();

    const isImage =
      lower.startsWith("image:") ||
      lower.includes("generate image") ||
      lower.includes("create image") ||
      lower.includes("image of");

    log("isImage", isImage);

    // =========================
    // HF TEST FUNCTION (IMPORTANT)
    // =========================
    async function testHF(prompt) {
      const res = await fetch(
        "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.HF_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ inputs: prompt })
        }
      );

      const type = res.headers.get("content-type");
      const text = await res.clone().text();

      return {
        status: res.status,
        type,
        preview: text.slice(0, 200)
      };
    }

    // =========================
    // IMAGE
    // =========================
    if (isImage) {

      const prompt = message.replace(/^image:/i, "").trim();

      if (!prompt) {
        return res.status(400).json({
          error: "Empty image prompt",
          debug
        });
      }

      log("prompt", prompt);

      // 🔥 TEST HF FIRST (IMPORTANT)
      const hfTest = await testHF(prompt);
      log("hf_test", hfTest);

      const response = await fetch(
        "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.HF_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ inputs: prompt })
        }
      );

      const contentType = response.headers.get("content-type") || "";

      log("content_type", contentType);

      // ❌ ERROR CASE
      if (!response.ok) {
        const text = await response.text();
        return res.status(500).json({
          error: "HF failed",
          detail: text,
          debug
        });
      }

      // ❌ NOT IMAGE
      if (!contentType.includes("image")) {
        const text = await response.text();
        return res.status(500).json({
          error: "Not image response",
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
    // GROQ TEST (TEXT)
    // =========================
    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "user", content: message }
          ]
        })
      }
    );

    const data = await groqRes.json();

    log("groq_status", groqRes.status);

    if (!groqRes.ok) {
      return res.status(500).json({
        error: "Groq failed",
        detail: data,
        debug
      });
    }

    return res.status(200).json({
      reply: data?.choices?.[0]?.message?.content,
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
