const express = require("express");
const axios = require("axios");
const cors = require("cors");
const cheerio = require("cheerio"); // cheerioをインポート
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
  
  if (videoIdMatch) {
    const videoId = videoIdMatch[1];
    const apiKey = process.env.YOUTUBE_API_KEY; // YouTube Data APIキーをここに入力

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

      return res.json(metadata);
    } catch (error) {
      console.error("Error fetching YouTube metadata:", error);
      return res.status(500).json({ error: "Failed to fetch metadata" });
    }
  } else {
    // YouTube以外のURLの場合
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      const title = $('meta[property="og:title"]').attr('content') || $('title').text();
      const description = $('meta[property="og:description"]').attr('content') || '';
      const image = $('meta[property="og:image"]').attr('content') || '';

      const metadata = {
        title: title || "No title found",
        description: description || "No description found",
        image: image || "No image found",
      };

      return res.json(metadata);
    } catch (error) {
      console.error("Error fetching metadata from non-YouTube URL:", error);
      return res.status(500).json({ error: "Failed to fetch metadata from the provided URL" });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
