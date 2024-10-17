import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

app.post("/api/lyrics", async (req, res) => {
  const { trackTitle, trackArtist } = req.body; // Extract track title and artist from the request body

  console.log("trackTitle:", trackTitle);
  console.log("trackArtist:", trackArtist);

  const MUSIXMATCH_API_KEY = process.env.MUSIXMATCH_API_KEY;

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
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
