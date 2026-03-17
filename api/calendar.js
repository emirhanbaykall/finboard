export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Finnhub API anahtarı eksik' });

  try {
    // Bugünden 60 gün sonrasına kadar takvim çek
    const today = new Date();
    const future = new Date();
    future.setDate(future.getDate() + 60);

    const from = today.toISOString().split('T')[0];
    const to   = future.toISOString().split('T')[0];

    const url = `https://finnhub.io/api/v1/calendar/economic?from=${from}&to=${to}&token=${apiKey}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });

    if (!response.ok) throw new Error(`Finnhub hatası: ${response.status}`);

    const data = await response.json();
    const events = (data.economicCalendar || []);

    // Önemli olayları filtrele ve formatla
    const important = [
      'fed', 'fomc', 'interest rate', 'cpi', 'consumer price',
      'nfp', 'non-farm', 'unemployment', 'gdp', 'gross domestic',
      'pce', 'inflation', 'jobs', 'payroll'
    ];

    const filtered = events
      .filter(e => {
        const name = (e.event || '').toLowerCase();
        return important.some(k => name.includes(k));
      })
      .slice(0, 9) // max 9 olay (3x3 grid)
      .map(e => {
        const eventDate = new Date(e.date);
        const now       = new Date();
        const diffMs    = eventDate - now;
        const diffDays  = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        const diffHours = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
        const diffMins  = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));

        // Türkçe isim map
        const nameMap = {
          'fed': 'Fed Faiz Kararı',
          'fomc': 'FOMC Toplantısı',
          'interest rate': 'Fed Faiz Kararı',
          'cpi': 'ABD CPI Verisi',
          'consumer price': 'ABD CPI Verisi',
          'nfp': 'NFP (İstihdam)',
          'non-farm': 'NFP (İstihdam)',
          'unemployment': 'ABD İşsizlik',
          'gdp': 'ABD GSYİH',
          'gross domestic': 'ABD GSYİH',
          'pce': 'PCE Enflasyonu',
          'inflation': 'Enflasyon Verisi',
          'jobs': 'İstihdam Verisi',
          'payroll': 'NFP (İstihdam)'
        };

        const eventLower = (e.event || '').toLowerCase();
        let turkishName  = e.event;
        for (const [key, val] of Object.entries(nameMap)) {
          if (eventLower.includes(key)) { turkishName = val; break; }
        }

        // termKey map
        const termKeyMap = {
          'Fed Faiz Kararı': 'fed', 'FOMC Toplantısı': 'fed',
          'ABD CPI Verisi': 'cpi', 'NFP (İstihdam)': 'nfp',
          'ABD İşsizlik': 'issizlik', 'ABD GSYİH': 'gsyih',
          'PCE Enflasyonu': 'cpi', 'Enflasyon Verisi': 'cpi',
          'İstihdam Verisi': 'nfp'
        };

        return {
          name:    turkishName,
          termKey: termKeyMap[turkishName] || 'fed',
          date:    e.date,
          days:    diffDays,
          hours:   diffHours,
          minutes: diffMins,
          actual:  e.actual,
          estimate:e.estimate,
          prev:    e.prev
        };
      });

    res.status(200).json({ events: filtered });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
