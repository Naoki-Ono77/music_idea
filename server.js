const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();
const PORT = 5000;

app.use(cors());

app.get("/fetch-youtube-metadata", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  // YouTubeの動画IDを抽出するための正規表現
  const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^&\n]{11})/);
  
  if (!videoIdMatch) {
    return res.status(400).json({ error: "Invalid YouTube URL" });
  }

  const videoId = videoIdMatch[1];
  const apiKey = "AIzaSyCUvpBCi5gicDMKfpigcxLjquJLk62YRU4"; // YouTube Data APIキーをここに入力

  try {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
      params: {
        part: "snippet",
        id: videoId,
        key: apiKey
      }
    });

    const videoData = response.data.items[0];
    
    if (!videoData) {
      return res.status(404).json({ error: "Video not found" });
    }

    const metadata = {
      title: videoData.snippet.title,
      description: videoData.snippet.description,
      image: videoData.snippet.thumbnails.high.url,
    };

    res.json(metadata);
  } catch (error) {
    console.error("Error fetching YouTube metadata:", error);
    res.status(500).json({ error: "Failed to fetch metadata" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
