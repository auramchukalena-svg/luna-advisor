// api/chat.js — Vercel Serverless Function (Node 18+)
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST" });

  try {
    const { messages } = req.body || {};
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        // (не обязательно, но полезно)
        "HTTP-Referer": "https://vercel.app",
        "X-Title": "Luna Advisor"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        temperature: 0.8,
        max_tokens: 800,
        messages
      })
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);

    const text = data?.choices?.[0]?.message?.content || "Пустой ответ.";
    return res.status(200).json({ text });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e) });
  }
}
