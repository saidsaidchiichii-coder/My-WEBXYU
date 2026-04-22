export default async function handler(req, res) {

  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "API working ✔️ (DEBUG MODE ON)"
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

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    console.log("🟢 USER MESSAGE:", message);

    // =========================
    // ROUTER (AI DECISION)
    // =========================
    const responseRouter = await fetch(
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
              content: `
Return ONLY JSON:
{
  "type": "image" or "text",
  "prompt": "clean image prompt if image else empty"
}
If user wants anything visual → image
Else → text
              `
            },
            { role: "user", content: message }
          ],
          temperature: 0,
          max_tokens: 100
        })
      }
    );

    const routerData = await responseRouter.json();

    console.log("🧠 ROUTER RAW:", routerData);

    let routeText =
      routerData?.choices?.[0]?.message?.content || "{}";

    console.log("🧠 ROUTER TEXT:", routeText);

    let route;

    try {
      route = JSON.parse(routeText);
    } catch (e) {
      console.log("❌ ROUTER JSON PARSE ERROR:", e);
      route = { type: "text" };
    }

    console.log("🚦 FINAL ROUTE:", route);

    // =========================
    // PIXAZO IMAGE GENERATION
    // =========================
    async function generateImage(prompt) {
      console.log("🖼️ PIXAZO PROMPT:", prompt);

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

      if (!response.ok) {
        console.log("❌ PIXAZO ERROR RESPONSE:", data);
        return null;
      }

      return (
        data.image_url ||
        data.url ||
        data.data?.url ||
        data.result?.[0]?.url ||
        null
      );
    }

    // =========================
    // IMAGE FLOW
    // =========================
    if (route.type === "image") {

      const image = await generateImage(route.prompt || message);

      console.log("🖼️ FINAL IMAGE RESULT:", image);

      if (!image) {
        return res.status(200).json({
          reply: "Image generation failed (check logs)",
          type: "text"
        });
      }

      return res.status(200).json({
        reply: image,
        type: "image"
      });
    }

    // =========================
    // TEXT FLOW (GROQ)
    // =========================
    const textResponse = await fetch(
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

    const textData = await textResponse.json();

    console.log("💬 GROQ RESPONSE:", textData);

    return res.status(200).json({
      reply:
        textData?.choices?.[0]?.message?.content ||
        "No response",
      type: "text"
    });

  } catch (err) {
    console.log("🔥 SERVER CRASH:", err);

    return res.status(500).json({
      error: err.message || "Server error"
    });
  }
}
