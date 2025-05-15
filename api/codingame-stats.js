import cheerio from 'cheerio';

export default async function handler(req, res) {
  const profileId = req.query.profile;
  if (!profileId) return res.status(400).json({ error: 'Missing profile' });

  const url = `https://www.codingame.com/profile/${profileId}`;
  try {
    const response = await fetch(url); // built-in fetch, no import needed
    if (!response.ok) throw new Error('Failed to fetch');

    const html = await response.text();
    const $ = cheerio.load(html);

    const rankContainer = $('.rankContainer-0-2-112');
    if (!rankContainer.length) return res.status(404).json({ error: 'Rank info not found' });

    const rankNumber = rankContainer.find('.rankNumber-0-2-115').text();
    const rankPercent = rankContainer.find('.rankPercent-0-2-117').text();

    res.json({ rank: rankNumber, percent: rankPercent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

