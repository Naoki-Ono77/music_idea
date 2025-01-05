const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();

// CORSの設定
app.use(cors());

const puppeteer = require("puppeteer");

app.get("/fetch-metadata", async (req, res) => {
  const { url } = req.query;

  if (!url || !/^https?:\/\//.test(url)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    console.log("Launching browser...");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    console.log("Navigating to:", url);
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const metadata = await page.evaluate(() => {
      console.log("Extracting metadata...");
      const title = document.querySelector("meta[property='og:title']")?.content || document.title;
      const description = document.querySelector("meta[property='og:description']")?.content ||
        document.querySelector("meta[name='description']")?.content;
      const image = document.querySelector("meta[property='og:image']")?.content;
      const url = document.querySelector("meta[property='og:url']")?.content || window.location.href;

      console.log("Extracted metadata:", { title, description, image, url });
      return { title, description, image, url };
    });

    await browser.close();
    console.log("Metadata fetched:", metadata);
    res.json(metadata);
  } catch (error) {
    console.error("Error fetching metadata:", error);
    res.status(500).json({ error: "Failed to fetch metadata" });
  }
});



// サーバーの起動
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
