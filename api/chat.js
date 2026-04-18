export default async function handler(req, res) {

  // =========================
  // GET TEST
  // =========================
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "HF API working ✔️"
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {

    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    let message = body?.message || "";

    if (!message.trim()) {
      return res.status(400).json({ error: "Message required" });
    }

    // =========================
    // NORMALIZE
    // =========================
    message = message.toLowerCase().replace(/\s+/g, " ").trim();

    // =========================
    // ROUTER (IMAGE DETECT)
    // =========================
    const isImage =
      message.startsWith("image") ||
      message.includes("generate image") ||
      message.includes("create image") ||
      message.includes("make image");

    // =========================
    // 🎨 IMAGE (HUGGINGFACE)
    // =========================
    if (isImage) {

      let prompt = message
        .replace(/image|generate|create|make/gi, "")
        .trim();

      if (!prompt) prompt = "a cat";

      const hf = await fetch(
        "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.HF_TOKEN}`,
            "Content-Type": "application/json",
            "Accept": "image/png"
          },
          body: JSON.stringify({
            inputs: prompt,
            options: { wait_for_model: true }
          })
        }
      );

      const contentType = hf.headers.get("content-type") || "";

      if (!hf.ok || !contentType.includes("image")) {
        const err = await hf.text();
        return res.status(500).json({
          error: "HF image failed",
          details: err
        });
      }

      const buffer = await hf.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");

      return res.status(200).json({
        type: "image",
        reply: `data:image/png;base64,${base64}`
      });
    }

    // =========================
    // 🤖 TEXT (HF TEXT MODEL)
    // =========================
    const textRes = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: message,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.7
          }
        })
      }
    );

    const data = await textRes.json();

    if (!textRes.ok) {
      return res.status(500).json({
        error: "HF text failed",
        details: data
      });
    }

    const reply =
      Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;

    return res.status(200).json({
      type: "text",
      reply: reply || "No response"
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message || "Server error"
    });
  }
}
