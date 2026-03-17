export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API anahtarı eksik' });

  try {
    const { assetName, symbol, market, detail, currentPrice, change } = req.body;

    const prompt = `Sen FinBoard adlı yatırım platformunun AI analiz asistanısın. Hedef kitlen yeni başlayan veya orta seviye yatırımcılar — teknik jargondan kaçın, sade ve anlaşılır Türkçe kullan. Yatırım tavsiyesi değil, eğitici bir analiz yap.

Varlık: ${assetName} (${symbol})
Piyasa: ${market}
Günlük değişim: ${change}
Trend: ${detail.trend}
Risk iştahı: ${detail.riskAppetite}
Fiyat serisi: ${detail.streak}
ATH'den bu yana: ${detail.athDays} gün

Şu 3 bölümü yaz (her biri 2-3 cümle, toplam maksimum 120 kelime):
1. GENEL DURUM: Varlık şu an ne durumda?
2. DİKKAT EDİLMESİ GEREKENLER: Yeni başlayan biri ne bilmeli?
3. SİNYAL: Sadece "İzle", "Alım Fırsatı Olabilir" veya "Temkinli Ol" seçeneklerinden birini seç ve tek cümle gerekçe yaz.

Sadece JSON döndür, başka hiçbir şey yazma: {"durum":"...","dikkat":"...","sinyal":"İzle","sinyal_aciklama":"..."}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic API hatası: ${response.status} — ${errText}`);
    }

    const data   = await response.json();
    const raw    = data.content?.[0]?.text || '';
    const clean  = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
