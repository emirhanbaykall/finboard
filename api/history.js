export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { symbol, days } = req.query;
  if (!symbol || !days) return res.status(400).json({ error: 'symbol ve days gerekli' });

  try {
    const limit    = Math.min(parseInt(days), 365);
    const interval = limit <= 30 ? '1d' : limit <= 90 ? '1d' : '1d';
    const url      = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;

    const response = await fetch(url);
    const klines   = await response.json();

    // [openTime, open, high, low, close, volume, ...]
    const prices = klines.map(k => parseFloat(k[4])); // kapanış fiyatları
    const labels = klines.map(k => {
      const d = new Date(k[0]);
      return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    });

    res.status(200).json({ prices, labels });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
