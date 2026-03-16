// =============================================
// AI ANALİZ MODÜLÜ
// Anthropic API anahtarını buraya ekle:
// const ANTHROPIC_API_KEY = 'sk-ant-...';
// NOT: Gerçek sitede bu key backend'de tutulmalı!
// =============================================

async function fetchAIAnalysis(assetName, symbol, market, detail, currentPrice, change) {
  const aiText  = document.getElementById('ai-text');
  const aiDot   = document.getElementById('ai-dot');
  const aiBtn   = document.getElementById('ai-refresh');
  if (!aiText) return;

  aiText.innerHTML = '<span class="shimmer">Analiz hazırlanıyor...</span>';
  aiText.className = 'ai-text loading';
  if (aiDot) aiDot.classList.add('pulsing');
  if (aiBtn) aiBtn.disabled = true;

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

JSON formatında döndür: {"durum":"...","dikkat":"...","sinyal":"İzle|Alım Fırsatı Olabilir|Temkinli Ol","sinyal_aciklama":"..."}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await res.json();
    const raw  = data.content?.[0]?.text || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    const signalClass = parsed.sinyal === 'Alım Fırsatı Olabilir' ? 'signal-buy' : parsed.sinyal === 'Temkinli Ol' ? 'signal-sell' : 'signal-watch';
    const signalIcon  = parsed.sinyal === 'Alım Fırsatı Olabilir' ? '▲' : parsed.sinyal === 'Temkinli Ol' ? '▼' : '→';

    aiText.className = 'ai-text';
    aiText.innerHTML = `
      <div class="ai-sections">
        <div class="ai-section">
          <div class="ai-section-title" style="color:#7c8cf8;">Genel Durum</div>
          <div class="ai-section-body">${parsed.durum}</div>
        </div>
        <div class="ai-section">
          <div class="ai-section-title" style="color:#fbbf24;">Dikkat Edilmesi Gerekenler</div>
          <div class="ai-section-body">${parsed.dikkat}</div>
        </div>
        <div class="ai-section">
          <div class="ai-section-title" style="color:#a0aabb;">Sinyal</div>
          <div class="ai-section-body">${parsed.sinyal_aciklama}</div>
          <div class="ai-signal ${signalClass}">${signalIcon} ${parsed.sinyal}</div>
        </div>
      </div>
      <div class="ai-disclaimer">Bu analiz yatırım tavsiyesi değildir. Yatırım kararlarınızı kendiniz alın.</div>`;
  } catch (e) {
    aiText.className = 'ai-text';
    aiText.innerHTML = '<span style="color:#5a6478;">Analiz yüklenemedi. Tekrar denemek için yenile butonuna tıklayın.</span>';
  }

  if (aiDot) aiDot.classList.remove('pulsing');
  if (aiBtn) aiBtn.disabled = false;
}
