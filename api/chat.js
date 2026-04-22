// If you're on Node < 18:
// import fetch from "node-fetch";

const ipHits = new Map();

function rateLimit(ip) {
  const now = Date.now();
  const windowMs = 10_000;
  const limit = 5;

  if (!ipHits.has(ip)) ipHits.set(ip, []);

  const hits = ipHits.get(ip).filter(t => now - t < windowMs);

  hits.push(now);
  ipHits.set(ip, hits);

  return hits.length <= limit;
}

export default async function handler(req, res) {

  console.log("==================================");
  console.log("🚀 NEW REQUEST:", new Date().toISOString());
  console.log("METHOD:", req.method);
  console.log("==================================");

  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";

  if (!rateLimit(ip)) {
    return res.status(429).json({ error: "Too many requests" });
  }

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

    let body = req.body;

    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: "Invalid JSON body" });
      }
    }

    const message = body?.message;

    console.log("🟢 RAW BODY:", body);
    console.log("💬 USER MESSAGE:", message);

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    // =========================
    // ROUTER
    // =========================
    const isImageRequest = (msg) => {
      const m = msg.toLowerCase();
      const keywords = ["image", "draw", "picture", "logo", "photo", "generate image"];
      return keywords.some(k => m.includes(k));
    };

    const route = {
      type: isImageRequest(message) ? "image" : "text",
      prompt: message
    };

    console.log("🚦 ROUTE RESULT:", route);

    // =========================
    // PIXAZO IMAGE
    // =========================
    async function generateImage(prompt) {
      console.log("🖼️ CALLING PIXAZO...");

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
        console.log("🖼️ PIXAZO RESPONSE:", JSON.stringify(data, null, 2));

        if (!response.ok || !data) {
          console.log("❌ PIXAZO ERROR");
          return null;
        }

        const image =
          data.image_url ||
          data.url ||
          data.data?.url ||
          data.result?.[0]?.url ||
          data.output ||
          null;

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

      const image = await generateImage(route.prompt);

      if (!image) {
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

    const data = await response.json();

    console.log("🟡 GROQ RESPONSE:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.log("❌ GROQ ERROR:", data);
      return res.status(500).json({
        error: "Groq API failed",
        details: data
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      "No response from AI";

    return res.status(200).json({
      reply,
      type: "text"
    });

  } catch (err) {

    console.log("🔥 GLOBAL CRASH:", err);

    return res.status(500).json({
      error: err.message || "Server crash"
    });
  }
}
