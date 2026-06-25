const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed." });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number.parseInt(process.env.BREVO_LIST_ID, 10);

  if (!apiKey || !Number.isInteger(listId)) {
    console.error("Brevo environment variables are not configured.");
    return response.status(500).json({ error: "Waitlist signup is temporarily unavailable." });
  }

  const email = String(request.body?.email || "").trim().toLowerCase();
  const website = String(request.body?.website || "").trim();

  // Honeypot field: real visitors never fill this in.
  if (website) {
    return response.status(200).json({ message: "You're on the KINYASH waitlist." });
  }

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return response.status(400).json({ error: "Enter a valid email address." });
  }

  try {
    const brevoResponse = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email,
        listIds: [listId],
        updateEnabled: true,
      }),
    });

    if (!brevoResponse.ok) {
      const errorBody = await brevoResponse.text();
      console.error("Brevo signup failed:", brevoResponse.status, errorBody);
      return response.status(502).json({ error: "We couldn't save your email. Please try again." });
    }

    return response.status(200).json({ message: "You're on the KINYASH waitlist." });
  } catch (error) {
    console.error("Waitlist request failed:", error);
    return response.status(502).json({ error: "We couldn't save your email. Please try again." });
  }
};
