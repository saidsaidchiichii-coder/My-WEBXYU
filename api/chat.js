
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
  const text = (msg || "").trim();
  return text.length > 0 ? text : "a highly detailed artistic illustration";
}

/* =========================
   🖼️ PIXAZO GENERATOR (EXACT ERROR VERSION)
========================= */
async function generateImage(prompt) {
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
        steps: 30
      })
    });

    const raw = await response.text();

    console.log("STATUS:", response.status);
    console.log("RAW:", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return {
        ok: false,
        error: "INVALID_JSON_FROM_API",
        raw
      };
    }

    /* =========================
       🔥 EXACT ERROR HANDLING
    ========================= */

    if (response.status === 401) {
      return {
        ok: false,
        error: "INVALID_API_KEY",
        hint: "Check PIXAZO_API_KEY in environment variables"
      };
    }

    if (response.status === 402) {
      return {
        ok: false,
        error: "NO_CREDITS",
        hint: "Your Pixazo account has no credits left"
      };
    }

    if (response.status === 403) {
      return {
        ok: false,
        error: "FORBIDDEN",
        hint: "API key not allowed"
      };
    }

    if (response.status >= 500) {
      return {
        ok: false,
        error: "PIXAZO_SERVER_ERROR",
        status: response.status,
        details: data
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        error: "REQUEST_FAILED",
        status: response.status,
        details: data
      };
    }

    /* =========================
       IMAGE EXTRACTION
    ========================= */
    const image =
      data?.image_url ||
      data?.url ||
      data?.data?.url ||
      data?.data?.images?.[0]?.url ||
      data?.result?.[0]?.url ||
      null;

    if (!image) {
      return {
        ok: false,
        error: "NO_IMAGE_RETURNED",
        details: data
      };
    }

    return {
      ok: true,
      image
    };

  } catch (err) {
    return {
      ok: false,
      error: "SERVER_CRASH",
      message: err.message,
      stack: err.stack
    };
  }
}

/* =========================
   🚀 MAIN HANDLER
========================= */
export default async function handler(req, res) {

  console.log("\n================ REQUEST ================");

  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket?.remoteAddress ||
    "unknown";

  if (!rateLimit(ip)) {
    return res.status(429).json({
      error: "TOO_MANY_REQUESTS"
    });
  }

  if (req.method === "GET") {
    return res.json({
      ok: true,
      message: "PIXAZO IMAGE API WORKING ✔️"
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "ONLY_POST_ALLOWED"
    });
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
       ERROR RESPONSE (CLEAR)
    ========================= */
    if (!result.ok) {
      return res.status(200).json({
        type: "error",
        reply: "IMAGE_GENERATION_FAILED",
        error: result.error,
        hint: result.hint || null,
        details: result.details || null,
        raw: result.raw || null
      });
    }

    /* =========================
       SUCCESS RESPONSE
    ========================= */
    return res.status(200).json({
      type: "image",
      reply: result.image
    });

  } catch (err) {
    return res.status(500).json({
      error: "GLOBAL_CRASH",
      message: err.message,
      stack: err.stack
    });
  }
}
