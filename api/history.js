export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const symbol = req.query?.symbol;
  const days   = req.query?.days;

  if (!symbol || !days) return res.status(400).json({ error: 'symbol ve days gerekli' });

  try {
    const limit = Math.min(parseInt(days), 365);
    const url   = new URL('https://api.binance.com/api/v3/klines');
    url.searchParams.set('symbol', symbol);
    url.searchParams.set('interval', '1d');
    url.searchParams.set('limit', String(limit));

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`Binance API hatası: ${response.status}`);
    const klines = await response.json();

    const prices = klines.map(k => parseFloat(k[4]));
    const labels = klines.map(k => {
      const d = new Date(k[0]);
      return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    });

    res.status(200).json({ prices, labels });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
