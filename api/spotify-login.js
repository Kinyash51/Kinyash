const crypto = require("crypto");

module.exports = (request, response) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri =
    process.env.SPOTIFY_REDIRECT_URI ||
    "https://www.kinyash.site/api/spotify-callback";

  if (!clientId) {
    return response.status(500).send("SPOTIFY_CLIENT_ID is not configured.");
  }

  const state = crypto.randomBytes(18).toString("hex");
  const secure = request.headers["x-forwarded-proto"] === "https" ? "; Secure" : "";
  response.setHeader(
    "Set-Cookie",
    `spotify_auth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${secure}`,
  );

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    state,
    scope: "user-read-currently-playing user-read-recently-played user-top-read",
    show_dialog: "true",
  });

  return response.redirect(`https://accounts.spotify.com/authorize?${params}`);
};
