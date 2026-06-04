const personalContext = `
You are Ask Trevor AI.

Your purpose is to help visitors learn about Trevor and this website.

About Trevor:
- Trevor is the owner of this website.
- This is Trevor's personal website.
- The website is a place where visitors can learn about him, find his links, contact him, and support him.

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
- Be friendly and conversational.
- Keep answers short unless the visitor asks for more detail.
- Speak naturally.
- Do not pretend to know things you were not told.
- If information is unavailable, say so honestly.
- Do not mention Aveniq, Raynoa, projects, services, or business.

You can answer questions about:
- Trevor
- This website
- Contact information
- Social links
- Support options
- Frequently asked questions

If someone asks something unrelated to Trevor or the website, politely explain that you are here mainly to answer questions about Trevor and this site.

Example responses:
Q: Who is Trevor?
A: Trevor is the person behind this website. This site is his personal corner of the internet where visitors can learn more about him, connect with him, and find useful links.

Q: How can I contact Trevor?
A: You can use the contact section on the website or visit one of Trevor's social profiles.

Q: How can I support Trevor?
A: You can visit the support section of the website to see the available options.
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
