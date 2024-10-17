import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post("/api/lyrics", async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    const { trackTitle, trackArtist } = req.body;

    console.log("trackTitle:", trackTitle);
    console.log("trackArtist:", trackArtist);

    const MUSIXMATCH_API_KEY = process.env.MUSIXMATCH_API_KEY;

    if (!MUSIXMATCH_API_KEY) {
      console.error("No Musixmatch API key provided.");
      return res.status(500).json({ error: "No Musixmatch API key provided." });
    }

    console.log("Sending request to Musixmatch API...");
    const searchResponse = await axios.get(
      `https://api.musixmatch.com/ws/1.1/track.search?q_track=${encodeURIComponent(
        trackTitle
      )}&q_artist=${encodeURIComponent(
        trackArtist
      )}&apikey=${MUSIXMATCH_API_KEY}`
    );

    console.log("Received response from Musixmatch API");
    const trackList = searchResponse.data.message.body.track_list;

    if (!trackList || trackList.length === 0) {
      console.log("No matching track found");
      return res.status(404).json({ message: "No matching track found." });
    }

    const trackId = trackList[0].track.track_id;
    console.log("Track ID:", trackId);

    console.log("Fetching lyrics...");
    const lyricsResponse = await axios.get(
      `https://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=${trackId}&apikey=${MUSIXMATCH_API_KEY}`
    );

    const lyrics = lyricsResponse.data.message.body.lyrics.lyrics_body;
    console.log("Lyrics fetched successfully");

    return res.status(200).json({ lyrics: lyrics || "Lyrics not found" });
  } catch (error) {
    console.error("Detailed error:", error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    } else if (error.request) {
      console.error("Error request:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    console.error("Error config:", error.config);

    if (error.response && error.response.status === 403) {
      return res
        .status(403)
        .json({ error: "API rate limit reached or invalid key." });
    } else {
      return res
        .status(500)
        .json({ error: "Error fetching lyrics.", details: error.message });
    }
  }
});

// Add a catch-all error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res
    .status(500)
    .json({ error: "An unexpected error occurred.", details: err.message });
});

export default app;
