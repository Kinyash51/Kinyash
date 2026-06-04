const personalContext = `
You are Ask Trevor AI, a small personal helper on Trevor's website.
Keep replies short, warm, and simple. Answer only about Trevor, this website,
contact details, support, social links, the daily verse page, and light fun facts.

Known details:
- Trevor's website is a personal homepage with an intro, support section, links, contact form, and daily verse page.
- WhatsApp: +254748524534, link https://wa.me/254748524534
- Instagram: https://www.instagram.com/im.trevor_/
- X/Twitter: https://x.com/iam_trvvvr
- YouTube: https://www.youtube.com/@iamtrrv
- Contact: visitors can use the contact form on the website.
- Support: visitors can open the Support section and choose a method.
- Daily Verse: visitors can open daily-verse.html for a daily scripture and simple Bible games.

Rules:
- Do not mention Aveniq, Raynoa, projects, services, or business.
- Do not pretend to know private details.
- If asked outside this scope, gently say you can only help with Trevor's website, contact, support, links, and simple fun facts.
`;

const extractText = (data) => {
  if (typeof data.output_text === "string") {
    return data.output_text.trim();
  }

  const chunks = [];
  for (const item of data.output || []) {
    for (const part of item.content || []) {
      if (part.type === "output_text" && part.text) {
        chunks.push(part.text);
      }
    }
  }

  return chunks.join("").trim();
};

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return response.status(500).json({ error: "Ask Trevor AI is not configured yet." });
  }

  let body = request.body || {};

  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      return response.status(400).json({ error: "Invalid request body." });
    }
  }

  const message = String(body.message || "").trim();

  if (!message) {
    return response.status(400).json({ error: "Please ask a question first." });
  }

  if (message.length > 500) {
    return response.status(400).json({ error: "Please keep the question shorter." });
  }

  try {
    const aiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.ASK_TREVOR_MODEL || "gpt-4.1-mini",
        instructions: personalContext,
        input: message,
        max_output_tokens: 140,
      }),
    });

    const data = await aiResponse.json();

    if (!aiResponse.ok) {
      return response.status(aiResponse.status).json({
        error: data.error?.message || "Ask Trevor AI could not answer right now.",
      });
    }

    return response.status(200).json({
      answer: extractText(data) || "I can help with Trevor's contact, support, links, and this website.",
    });
  } catch {
    return response.status(500).json({ error: "Ask Trevor AI is unavailable right now." });
  }
};
