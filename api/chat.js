export default async function handler(req, res) {

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
    // NORMALIZE INPUT
    // =========================
    const cleaned = message
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

    // =========================
    // 🎯 INTENT DETECTOR
    // =========================
    let score = 0;

    if (cleaned.includes("image")) score += 2;
    if (cleaned.includes("create")) score += 1;
    if (cleaned.includes("generate")) score += 1;
    if (cleaned.includes("make")) score += 1;
    if (cleaned.includes("draw")) score += 1;

    const isImage = score >= 2;

    // =========================
    // 🎨 IMAGE ROUTE (HF)
    // =========================
    if (isImage) {

      let prompt = cleaned
        .replace(/image|create|generate|make|draw|a|an|of/gi, "")
        .trim();

      if (!prompt) prompt = "a cute cat";

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
            options: {
              wait_for_model: true
            }
          })
        }
      );

      const contentType = hf.headers.get("content-type") || "";

      if (!hf.ok || !contentType.includes("image")) {
        const err = await hf.text();
        return res.status(500).json({
          error: "HF image generation failed",
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
    // 🤖 TEXT ROUTE (HF MISTRAL)
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
        error: "HF text model failed",
        details: data
      });
    }

    const reply = Array.isArray(data)
      ? data[0]?.generated_text
      : data?.generated_text;

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
