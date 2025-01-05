const express = require("express");
const axios = require("axios");  // axiosを使う
const cheerio = require("cheerio"); // cheerioを使ってHTMLをパース
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
    // HTTPリクエストでURLのHTMLを取得
    const { data } = await axios.get(url);

    // cheerioでHTMLをパース
    const $ = cheerio.load(data);

    // メタデータを取得
    const title =
      $("meta[property='og:title']").attr("content") || $("title").text();
    const description =
      $("meta[property='og:description']").attr("content") || "";
    const image = $("meta[property='og:image']").attr("content") || "";
    const pageUrl =
      $("meta[property='og:url']").attr("content") || url;

    // メタデータを返す
    const metadata = {
      title,
      description,
      image,
      url: pageUrl,
    };

    res.json(metadata);
  } catch (error) {
    console.error("Error fetching metadata:", error.message);
    res.status(500).json({ error: "Failed to fetch metadata" });
  }
});

// サーバーの起動
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
