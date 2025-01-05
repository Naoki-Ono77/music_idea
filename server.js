const express = require("express");
const puppeteer = require("puppeteer-core");  // puppeteer-coreを使う場合
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
    // Puppeteerを使ってブラウザを起動
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/google-chrome-stable', // Renderのパスを指定
    });
    const page = await browser.newPage();

    // 指定されたURLを開く
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // メタデータを取得する
    const metadata = await page.evaluate(() => {
      const title =
        document
          .querySelector("meta[property='og:title']")
          ?.getAttribute("content") || document.title;
      const description =
        document
          .querySelector("meta[property='og:description']")
          ?.getAttribute("content") || "";
      const image =
        document
          .querySelector("meta[property='og:image']")
          ?.getAttribute("content") || "";
      const pageUrl =
        document
          .querySelector("meta[property='og:url']")
          ?.getAttribute("content") || window.location.href;

      return {
        title,
        description,
        image,
        url: pageUrl,
      };
    });

    // ブラウザを閉じる
    await browser.close();

    // メタデータをレスポンスとして返す
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
