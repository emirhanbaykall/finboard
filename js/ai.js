async function fetchAIAnalysis(assetName, symbol, market, detail, currentPrice, change) {
  const aiText = document.getElementById('ai-text');
  const aiDot  = document.getElementById('ai-dot');
  const aiBtn  = document.getElementById('ai-refresh');
  if (!aiText) return;

  aiText.innerHTML = '<span class="shimmer">Analiz hazırlanıyor...</span>';
  aiText.className = 'ai-text loading';
  if (aiDot) aiDot.classList.add('pulsing');
  if (aiBtn) aiBtn.disabled = true;

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetName, symbol, market, detail, currentPrice, change })
    });

    const parsed = await res.json();
    if (parsed.error) throw new Error(parsed.error);

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
