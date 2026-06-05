const getAccessToken = async () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    const error = new Error("Spotify is not fully configured.");
    error.code = "NOT_CONFIGURED";
    throw error;
  }

  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok || !tokenData.access_token) {
    throw new Error("Spotify access token request failed.");
  }

  return tokenData.access_token;
};

const mapTrack = (track) => ({
  id: track.id || "",
  title: track.name,
  artist: track.artists?.map((artist) => artist.name).join(", ") || "Unknown artist",
  duration: Math.round((track.duration_ms || 0) / 1000),
  image: track.album?.images?.[0]?.url || "",
  url: track.external_urls?.spotify || "",
  embedUrl: track.id ? `https://open.spotify.com/embed/track/${track.id}` : "",
});

module.exports = async (_request, response) => {
  response.setHeader("Cache-Control", "s-maxage=20, stale-while-revalidate=40");

  try {
    const accessToken = await getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    const [currentResponse, recentResponse] = await Promise.all([
      fetch("https://api.spotify.com/v1/me/player/currently-playing", { headers }),
      fetch("https://api.spotify.com/v1/me/player/recently-played?limit=5", { headers }),
    ]);

    if (![200, 204].includes(currentResponse.status) || !recentResponse.ok) {
      return response.status(502).json({ error: "Spotify data is temporarily unavailable." });
    }

    const currentData =
      currentResponse.status === 204 ? null : await currentResponse.json();
    const recentData = await recentResponse.json();
    const recent = (recentData.items || [])
      .map((item) => item.track)
      .filter(Boolean)
      .map(mapTrack);

    return response.status(200).json({
      current: currentData?.item
        ? {
            ...mapTrack(currentData.item),
            progress: Math.round((currentData.progress_ms || 0) / 1000),
            isPlaying: Boolean(currentData.is_playing),
          }
        : null,
      recent,
    });
  } catch (error) {
    const status = error.code === "NOT_CONFIGURED" ? 503 : 500;
    return response.status(status).json({ error: error.message });
  }
};
