import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';
import { createCanvas } from 'canvas';

export default async function handler(req, res) {
  const profileId = req.query.id;
  if (!profileId) {
    return res.status(400).send('Missing profile id');
  }

  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(
      `https://www.codingame.com/profile/${profileId}`,
      { waitUntil: 'networkidle0' }
    );

    const rank = await page.$eval('.rankNumber-0-2-115', el => el.innerText);
    const percent = await page.$eval('.rankPercent-0-2-117', el => el.innerText);

    await browser.close();

    const width = 400;
    const height = 120;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1E1E1E';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#7CC576';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Rank: ${rank}`, width / 2, 50);

    ctx.font = '28px Arial';
    ctx.fillText(`(${percent})`, width / 2, 90);

    const buffer = canvas.toBuffer('image/png');

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.status(200).end(buffer);
  } catch (error) {
    if (browser !== null) {
      await browser.close();
    }
    res.status(500).json({ error: error.message });
  }
}
