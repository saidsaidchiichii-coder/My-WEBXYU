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
   🧠 NORMALIZE MESSAGE
========================= */
function normalize(msg = "") {
  return msg
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================
   🖼️ IMAGE DETECTION (FIXED)
========================= */
function isImageRequest(msg) {
  const m = normalize(msg);

  const keywords = [
    "image",
    "img",
    "imge",
    "draw",
    "picture",
    "photo",
    "logo",
    "generate",
    "generate image",
    "create image",
    "make image",
    "ai image",
    "art"
  ];

  return keywords.some(k => m.includes(k));
}

/* =========================
   🖼️ PIXAZO GENERATOR
========================= */
async function generateImage(prompt) {
  console.log("\n================ PIXAZO DEBUG ================");
  console.log("🧠 PROMPT:", prompt);

  if (!process.env.PIXAZO_API_KEY) {
    console.log("❌ PIXAZO_API_KEY MISSING");
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
        prompt,
        width: 1024,
        height: 1024,
        steps: 25
      })
    });

    const raw = await response.text();

    console.log("📡 STATUS:", response.status);
    console.log("📦 RAW:", raw);

    if (!response.ok) {
      console.log("❌ PIXAZO FAILED REQUEST");
      return null;
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      console.log("❌ INVALID JSON FROM PIXAZO");
      return null;
    }

    console.log("🧾 DATA:", JSON.stringify(data, null, 2));

    const image =
      data?.image_url ||
      data?.url ||
      data?.data?.url ||
      data?.data?.images?.[0]?.url ||
      data?.result?.[0]?.url ||
      data?.output ||
      null;

    console.log("🖼️ FINAL IMAGE:", image);

    return image;

  } catch (err) {
    console.log("🔥 PIXAZO ERROR:", err);
    return null;
  }
}

/* =========================
   🚀 MAIN HANDLER
========================= */
export default async function handler(req, res) {
  console.log("\n==================================");
  console.log("🚀 REQUEST:", new Date().toISOString());
  console.log("METHOD:", req.method);

  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket?.remoteAddress ||
    "unknown";

  console.log("IP:", ip);

  if (!rateLimit(ip)) {
    return res.status(429).json({ error: "Too many requests" });
  }

  /* GET */
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "API WORKING ✔️"
    });
  }

  /* ONLY POST */
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    let body = req.body;

    if (typeof body === "string") {
      body = JSON.parse(body);
    }

    const message = body?.message;

    console.log("💬 MESSAGE:", message);

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    /* =========================
       ROUTING
    ========================= */
    const route = isImageRequest(message)
      ? "image"
      : "text";

    console.log("🚦 ROUTE:", route);

    /* =========================
       IMAGE FLOW
    ========================= */
    if (route === "image") {
      const image = await generateImage(message);

      if (!image) {
        return res.status(200).json({
          reply: "Image generation failed (Pixazo error or invalid response)",
          type: "error"
        });
      }

      return res.status(200).json({
        reply: image,
        type: "image"
      });
    }

    /* =========================
       TEXT FLOW (simple fallback)
    ========================= */
    return res.status(200).json({
      reply: "This endpoint is configured for image requests only in this version.",
      type: "text"
    });

  } catch (err) {
    console.log("🔥 GLOBAL ERROR:", err);

    return res.status(500).json({
      error: err.message || "Server crash"
    });
  }
}
