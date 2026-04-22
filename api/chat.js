// If you're on Node < 18:
// import fetch from "node-fetch";

const ipHits = new Map();

/* =========================
   🔒 RATE LIMIT
========================= */
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

/* =========================
   🖼️ PIXAZO IMAGE GENERATOR (DEBUG MODE)
========================= */
async function generateImage(prompt) {
  console.log("\n================ PIXAZO DEBUG ================");
  console.log("🧠 PROMPT:", prompt);

  if (!process.env.PIXAZO_API_KEY) {
    console.log("❌ PIXAZO_API_KEY IS MISSING");
    return null;
  }

  try {
    const response = await fetch("https://api.pixazo.ai/v1/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.PIXAZO_API_KEY}`
      },
      body: JSON.stringify({
        prompt
      })
    });

    const rawText = await response.text();

    console.log("📡 STATUS:", response.status);
    console.log("📦 RAW RESPONSE:", rawText);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      console.log("❌ RESPONSE IS NOT JSON");
      return null;
    }

    console.log("🧾 PARSED DATA:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.log("❌ PIXAZO ERROR RESPONSE");
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
    console.log("==============================================\n");

    return image;

  } catch (err) {
    console.log("🔥 PIXAZO CRASH ERROR:", err);
    return null;
  }
}

/* =========================
   🚀 MAIN HANDLER
========================= */
export default async function handler(req, res) {

  console.log("\n==================================");
  console.log("🚀 NEW REQUEST:", new Date().toISOString());
  console.log("METHOD:", req.method);

  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket?.remoteAddress ||
    "unknown";

  console.log("IP:", ip);
  console.log("==================================\n");

  /* RATE LIMIT */
  if (!rateLimit(ip)) {
    console.log("⛔ RATE LIMIT HIT");
    return res.status(429).json({ error: "Too many requests" });
  }

  /* GET */
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "API WORKING ✔️ (DEBUG MODE ACTIVE)"
    });
  }

  /* ONLY POST */
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    let body = req.body;

    /* JSON SAFE PARSE */
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.log("❌ INVALID JSON BODY");
        return res.status(400).json({ error: "Invalid JSON body" });
      }
    }

    const message = body?.message;

    console.log("📩 BODY:", body);
    console.log("💬 MESSAGE:", message);

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    /* =========================
       ROUTER (TEXT / IMAGE)
    ========================= */
    const isImageRequest = (msg) => {
      const m = msg.toLowerCase();
      const keywords = ["image", "draw", "picture", "logo", "photo", "generate image"];
      return keywords.some(k => m.includes(k));
    };

    const route = {
      type: isImageRequest(message) ? "image" : "text",
      prompt: message
    };

    console.log("🚦 ROUTE:", route);

    /* =========================
       IMAGE FLOW
    ========================= */
    if (route.type === "image") {
      const image = await generateImage(route.prompt);

      if (!image) {
        console.log("❌ IMAGE GENERATION FAILED FINAL");
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

    /* =========================
       GROQ TEXT FLOW
    ========================= */
    if (!process.env.GROQ_API_KEY) {
      console.log("❌ GROQ_API_KEY MISSING");
      return res.status(500).json({ error: "Missing GROQ API KEY" });
    }

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

    const raw = await response.text();

    console.log("🟡 GROQ RAW:", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.log("❌ GROQ NOT JSON");
      return res.status(500).json({ error: "Invalid Groq response" });
    }

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
