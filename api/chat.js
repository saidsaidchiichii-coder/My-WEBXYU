async function generateImage(prompt) {
  try {
    const response = await fetch("https://api.pixazo.ai/v1/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.PIXAZO_API_KEY}`
      },
      body: JSON.stringify({
        prompt: prompt,

        /* =========================
           🔥 IMPORTANT FIX (FORMAT)
        ========================= */

        model: "default",        // مهم فبعض النسخ
        width: 1024,
        height: 1024,
        steps: 30,
        guidance_scale: 7.5,

        /* optional تحسين الجودة */
        quality: "high",
        style: "realistic"
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
        error: "INVALID_JSON",
        raw
      };
    }

    /* =========================
       ❌ ERROR HANDLING
    ========================= */
    if (!response.ok) {
      return {
        ok: false,
        error: "API_ERROR",
        status: response.status,
        details: data
      };
    }

    /* =========================
       🖼️ IMAGE EXTRACTION
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
      error: "CRASH",
      message: err.message
    };
  }
}
