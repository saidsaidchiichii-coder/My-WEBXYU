export default async function handler(req, res) {

  console.log("==================================");
  console.log("🚀 NEW REQUEST:", new Date().toISOString());
  console.log("METHOD:", req.method);
  console.log("==================================");

  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "API WORKING ✔️ (DEBUG MODE ACTIVE)"
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

    console.log("🟢 RAW BODY:", body);
    console.log("💬 USER MESSAGE:", message);

    if (!message) {
      console.log("❌ NO MESSAGE RECEIVED");
      return res.status(400).json({ error: "Message required" });
    }

    // =========================
    // SIMPLE ROUTER
    // =========================
    const isImageRequest = (msg) => {
      const m = msg.toLowerCase();
      return (
        m.includes("image") ||
        m.includes("generate") ||
        m.includes("draw") ||
        m.includes("picture") ||
        m.includes("logo") ||
        m.includes("photo")
      );
    };

    const route = {
      type: isImageRequest(message) ? "image" : "text",
      prompt: message
    };

    console.log("🚦 ROUTE RESULT:", route);

    // =========================
    // PIXAZO IMAGE GENERATOR
    // =========================
    async function generateImage(prompt) {

      console.log("🖼️ CALLING PIXAZO...");
      console.log("🖼️ PROMPT:", prompt);

      try {

        const response = await fetch("https://api.pixazo.ai/v1/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.PIXAZO_API_KEY}`
          },
          body: JSON.stringify({ prompt })
        });

        const data = await response.json();

        console.log("🖼️ PIXAZO STATUS:", response.status);
        console.log("🖼️ PIXAZO RESPONSE FULL:");
        console.log(JSON.stringify(data, null, 2));

        if (!response.ok) {
          console.log("❌ PIXAZO ERROR DETECTED");
          return null;
        }

        const image =
          data.image_url ||
          data.url ||
          data.data?.url ||
          data.result?.[0]?.url ||
          data.output ||
          null;

        console.log("🖼️ EXTRACTED IMAGE:", image);

        return image;

      } catch (err) {
        console.log("🔥 PIXAZO CRASH:", err);
        return null;
      }
    }

    // =========================
    // IMAGE FLOW
    // =========================
    if (route.type === "image") {

      console.log("🟣 IMAGE FLOW ACTIVATED");

      const image = await generateImage(route.prompt);

      console.log("🟣 FINAL IMAGE RESULT:", image);

      if (!image) {
        console.log("❌ IMAGE GENERATION FAILED");

        return res.status(200).json({
          reply: "Image generation failed (check server logs)",
          type: "error"
        });
      }

      return res.status(200).json({
        reply: image,
        type: "image"
      });
    }

    // =========================
    // GROQ TEXT FLOW
    // =========================
    console.log("🟡 TEXT FLOW ACTIVATED");

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
            {
              role: "system",
              content: "You are a helpful assistant."
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 1024
        })
      }
    );

    const data = await response.json();

    console.log("🟡 GROQ RESPONSE:");
    console.log(JSON.stringify(data, null, 2));

    const reply =
      data?.choices?.[0]?.message?.content ||
      "No response from AI";

    console.log("🟡 FINAL REPLY:", reply);

    return res.status(200).json({
      reply,
      type: "text"
    });

  } catch (err) {

    console.log("🔥 GLOBAL CRASH:");
    console.log(err);

    return res.status(500).json({
      error: err.message || "Server crash"
    });
  }
}
