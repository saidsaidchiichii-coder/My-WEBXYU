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
   🧠 PROMPT CLEANER
========================= */
function cleanPrompt(msg = "") {
  const text = msg.trim();

  return text.length > 0
    ? text
    : "a highly detailed artistic illustration";
}

/* =========================
   🖼️ PIXAZO GENERATOR ONLY
========================= */
async function generateImage(prompt) {
  console.log("\n================ PIXAZO ================");
  console.log("PROMPT:", prompt);

  if (!process.env.PIXAZO_API_KEY) {
    return { error: "Missing PIXAZO_API_KEY" };
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
        height: 1024
      })
    });

    const raw = await response.text();

    console.log("STATUS:", response.status);
    console.log("RAW:", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return { error: "Invalid JSON response", raw };
    }

    if (!response.ok) {
      return {
        error: "Pixazo API failed",
        status: response.status,
        details: data
      };
    }

    const image =
      data?.image_url ||
      data?.url ||
      data?.data?.url ||
      data?.data?.images?.[0]?.url ||
      data?.result?.[0]?.url ||
      null;

    if (!image) {
      return { error: "No image returned", data };
    }

    return { image };

  } catch (err) {
    return {
      error: err.message,
      stack: err.stack
    };
  }
}

/* =========================
   🚀 MAIN HANDLER (IMAGE ONLY)
========================= */
export default async function handler(req, res) {
  console.log("\n================ REQUEST ================");

  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket?.remoteAddress ||
    "unknown";

  if (!rateLimit(ip)) {
    return res.status(429).json({ error: "Too many requests" });
  }

  if (req.method === "GET") {
    return res.json({
      ok: true,
      message: "PIXAZO IMAGE API ONLY ✔️"
    });
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

    console.log("MESSAGE:", message);

    const prompt = cleanPrompt(message);

    const result = await generateImage(prompt);

    /* =========================
       ERROR RETURN
    ========================= */
    if (result.error) {
      return res.status(200).json({
        type: "error",
        reply: "IMAGE GENERATION FAILED",
        debug: result
      });
    }

    /* =========================
       SUCCESS
    ========================= */
    return res.status(200).json({
      type: "image",
      reply: result.image
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message,
      stack: err.stack
    });
  }
}
