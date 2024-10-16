import axios from "axios";

export default async function handler(req, res) {
  const { trackTitle, trackArtist } = req.query;

  console.log("trackTitle:", trackTitle);
  console.log("trackArtist:", trackArtist);

  const MUSIXMATCH_API_KEY = process.env.VITE_MUSIXMATCH_API_KEY;

  if (!MUSIXMATCH_API_KEY) {
    return res.status(500).json({ error: "No Musixmatch API key provided." });
  }

  try {
    // Step 1: Search for the track to get the song ID
    const searchResponse = await axios.get(
      `https://api.musixmatch.com/ws/1.1/track.search?q_track=${encodeURIComponent(
        trackTitle
      )}&q_artist=${encodeURIComponent(
        trackArtist
      )}&apikey=${MUSIXMATCH_API_KEY}`
    );

    const trackList = searchResponse.data.message.body.track_list;

    if (!trackList || trackList.length === 0) {
      return res.status(404).json({ message: "No matching track found." });
    }

    // Extracting the track ID from the first result
    const trackId = trackList[0].track.track_id;

    // Step 2: Use the track ID to get the lyrics
    const lyricsResponse = await axios.get(
      `https://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=${trackId}&apikey=${MUSIXMATCH_API_KEY}`
    );

    const lyrics = lyricsResponse.data.message.body.lyrics.lyrics_body;

    return res.status(200).json({ lyrics: lyrics || "Lyrics not found" });
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    if (error.response && error.response.status === 403) {
      return res
        .status(403)
        .json({ error: "API rate limit reached or invalid key." });
    } else {
      return res.status(500).json({ error: "Error fetching lyrics." });
    }
  }
}
