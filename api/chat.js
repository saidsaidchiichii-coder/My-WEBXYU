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
   🧠 IMAGE DETECTION
========================= */
function isImageRequest(msg = "") {
  const m = msg.toLowerCase();

  return (
    m.includes("image") ||
    m.includes("imge") ||
    m.includes("draw") ||
    m.includes("picture") ||
    m.includes("photo") ||
    m.includes("generate") ||
    m.includes("create")
  );
}

/* =========================
   🖼️ PIXAZO (FULL ERROR DEBUG)
========================= */
async function generateImage(prompt) {
  console.log("\n================ PIXAZO DEBUG ================");
  console.log("🧠 PROMPT:", prompt);

  if (!process.env.PIXAZO_API_KEY) {
    const err = "PIXAZO_API_KEY is missing";
    console.log("❌", err);
    return { error: err };
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

    const raw = await response.text();

    console.log("📡 STATUS:", response.status);
    console.log("📦 RAW RESPONSE:", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.log("❌ JSON PARSE ERROR");
      return {
        error: "Invalid JSON from API",
        raw
      };
    }

    console.log("🧾 PARSED DATA:", data);

    /* ❌ SHOW REAL API ERROR */
    if (!response.ok) {
      console.log("❌ API ERROR RESPONSE DETECTED");

      return {
        error: "Pixazo API failed",
        status: response.status,
        details: data || raw
      };
    }

    const image =
      data?.image_url ||
      data?.url ||
      data?.data?.url ||
      data?.data?.images?.[0]?.url ||
      data?.result?.[0]?.url ||
      data?.output ||
      null;

    if (!image) {
      return {
        error: "No image returned from API",
        data
      };
    }

    return { image };

  } catch (err) {
    console.log("🔥 CRASH:", err);

    return {
      error: err.message,
      stack: err.stack
    };
  }
}

/* =========================
   🚀 MAIN HANDLER
========================= */
export default async function handler(req, res) {
  console.log("\n================ NEW REQUEST ================");

  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket?.remoteAddress ||
    "unknown";

  console.log("IP:", ip);

  if (!rateLimit(ip)) {
    return res.status(429).json({
      error: "Too many requests"
    });
  }

  if (req.method === "GET") {
    return res.json({ ok: true });
  }

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
       IMAGE FLOW
    ========================= */
    if (isImageRequest(message)) {
      const result = await generateImage(message);

      /* ❌ RETURN FULL ERROR TO CLIENT */
      if (result.error) {
        return res.status(200).json({
          type: "error",
          reply: "IMAGE ERROR",
          debug: result
        });
      }

      return res.json({
        type: "image",
        reply: result.image
      });
    }

    return res.json({
      type: "text",
      reply: "Only image mode active in debug version"
    });

  } catch (err) {
    console.log("🔥 GLOBAL ERROR:", err);

    return res.status(500).json({
      error: err.message,
      stack: err.stack
    });
  }
}
