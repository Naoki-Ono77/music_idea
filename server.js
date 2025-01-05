const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();

// CORSの設定
app.use(cors());

// メタデータ取得エンドポイント
app.get("/fetch-metadata", async (req, res) => {
  const { url } = req.query;

  // URLの検証
  if (!url || !/^https?:\/\//.test(url)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    // リンク先のHTMLを取得
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    const html = response.data;

    // cheerioを使ってHTMLを解析
    const $ = cheerio.load(html);

    // メタデータを抽出
    const metadata = {
      title:
        $("meta[property='og:title']").attr("content") || $("title").text(),
      description:
        $("meta[property='og:description']").attr("content") ||
        $("meta[name='description']").attr("content"),
      image: $("meta[property='og:image']").attr("content"),
      url: $("meta[property='og:url']").attr("content") || url,
    };

    res.json(metadata);
  } catch (error) {
    console.error("Error fetching metadata:", error.message);
    res.status(500).json({ error: "Failed to fetch metadata" });
  }
});

// サーバーの起動
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
