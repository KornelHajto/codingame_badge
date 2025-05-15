import fetch from 'node-fetch';
import cheerio from 'cheerio';

export default async function handler(req, res) {
  const profileId = req.query.profile;
  if (!profileId) {
    return res.status(400).json({ error: 'Missing profile ID' });
  }

  const url = `https://www.codingame.com/profile/${profileId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);

    // Example: select rank container and extract data
    const rankContainer = $('.rankContainer-0-2-112');
    if (!rankContainer.length) {
      return res.status(404).json({ error: 'Rank info not found' });
    }

    const rankNumber = rankContainer.find('.rankNumber-0-2-115').text();
    const rankPercent = rankContainer.find('.rankPercent-0-2-117').text();

    res.json({ rank: rankNumber, percent: rankPercent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

