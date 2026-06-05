const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const readCookie = (request, name) => {
  const cookies = request.headers.cookie || "";
  const match = cookies
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
};

module.exports = async (request, response) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri =
    process.env.SPOTIFY_REDIRECT_URI ||
    "https://www.kinyash.site/api/spotify-callback";
  const { code, state, error } = request.query;

  response.setHeader("Cache-Control", "no-store");
  response.setHeader(
    "Set-Cookie",
    "spotify_auth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure",
  );

  if (error) {
    return response.status(400).send(`Spotify authorization failed: ${escapeHtml(error)}`);
  }

  if (!clientId || !clientSecret) {
    return response
      .status(500)
      .send("SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET is not configured.");
  }

  if (!code || !state || state !== readCookie(request, "spotify_auth_state")) {
    return response.status(400).send("Invalid or expired Spotify authorization request.");
  }

  try {
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.refresh_token) {
      return response
        .status(tokenResponse.status || 500)
        .send(`Spotify token request failed: ${escapeHtml(tokenData.error_description || tokenData.error)}`);
    }

    const refreshToken = escapeHtml(tokenData.refresh_token);
    return response.status(200).send(`<!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Spotify connected | Trevor</title>
          <style>
            body { margin: 0; padding: 8vw; background: #f8faf7; color: #17201b; font: 16px/1.6 Arial, sans-serif; }
            main { max-width: 680px; margin: auto; }
            textarea { width: 100%; min-height: 130px; padding: 12px; border: 1px solid #dce5df; border-radius: 8px; }
            code { color: #245644; }
          </style>
        </head>
        <body>
          <main>
            <h1>Spotify account connected</h1>
            <p>Copy the token below into Vercel as <code>SPOTIFY_REFRESH_TOKEN</code>. Treat it like a password and do not share or commit it.</p>
            <textarea readonly>${refreshToken}</textarea>
            <p>After saving the variable, redeploy the website and remove this token from your clipboard.</p>
          </main>
        </body>
      </html>`);
  } catch {
    return response.status(500).send("Spotify authorization could not be completed.");
  }
};
