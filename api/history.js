export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const symbol = req.query?.symbol;
  const days   = req.query?.days;
  if (!symbol || !days) return res.status(400).json({ error: 'symbol ve days gerekli' });

  const limit = Math.min(parseInt(days), 365);

  // CoinGecko coin ID map
  const geckoMap = {
    BTCUSDT: 'bitcoin', ETHUSDT: 'ethereum',
    BNBUSDT: 'binancecoin', SOLUSDT: 'solana'
  };

  // Önce Binance dene
  try {
    const url = new URL('https://api.binance.com/api/v3/klines');
    url.searchParams.set('symbol', symbol);
    url.searchParams.set('interval', '1d');
    url.searchParams.set('limit', String(limit));

    const response = await fetch(url.toString(), { signal: AbortSignal.timeout(4000) });
    if (response.ok) {
      const klines = await response.json();
      const prices = klines.map(k => parseFloat(k[4]));
      const labels = klines.map(k => {
        const d = new Date(k[0]);
        return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
      });
      return res.status(200).json({ prices, labels, source: 'binance' });
    }
  } catch (e) {}

  // Binance olmadı, CoinGecko dene
  const geckoId = geckoMap[symbol];
  if (geckoId) {
    try {
      const geckoUrl = `https://api.coingecko.com/api/v3/coins/${geckoId}/market_chart?vs_currency=usd&days=${limit}&interval=daily`;
      const response = await fetch(geckoUrl, { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        const data = await response.json();
        const prices = data.prices.map(p => parseFloat(p[1].toFixed(2)));
        const labels = data.prices.map(p => {
          const d = new Date(p[0]);
          return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
        });
        return res.status(200).json({ prices, labels, source: 'coingecko' });
      }
    } catch (e) {}
  }

  // İkisi de olmadı, hata döndür — frontend sahte veri üretir
  return res.status(503).json({ error: 'Veri kaynağına ulaşılamıyor' });
}
