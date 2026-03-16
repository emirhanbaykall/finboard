// ===== UYGULAMA DURUMU =====
let selectedMarket = 'crypto';
let selectedAsset  = null;
let priceChart     = null;
let ws             = null;
const liveData     = {};
SYMBOLS.forEach(s => { liveData[s] = { price: null, change: null, up: true, vol: null }; });

// ===== WEBSOCKET — CANLI FİYATLAR =====
function connectWS() {
  const streams = SYMBOLS.map(s => `${s.toLowerCase()}@ticker`).join('/');
  ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

  ws.onopen = () => {
    document.getElementById('connLabel').textContent = 'Canlı Veri';
  };

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (!msg.data) return;
    const d   = msg.data;
    const sym = d.s;
    if (!liveData[sym]) return;

    const newPrice = parseFloat(d.c);
    const oldPrice = liveData[sym].price;
    const chgPct   = parseFloat(d.P);

    liveData[sym].price  = newPrice;
    liveData[sym].change = chgPct;
    liveData[sym].up     = chgPct >= 0;
    liveData[sym].vol    = parseFloat(d.q);

    if (selectedMarket === 'crypto') {
      updateCardUI(sym, newPrice, oldPrice, chgPct);
      if (selectedAsset !== null && SYMBOLS[selectedAsset] === sym) {
        updateDetailPrice(newPrice, chgPct);
      }
    }
  };

  ws.onerror = () => {
    document.getElementById('connLabel').textContent = 'Bağlantı hatası';
  };

  ws.onclose = () => {
    document.getElementById('connLabel').textContent = 'Yeniden bağlanıyor...';
    setTimeout(connectWS, 3000);
  };
}

function fmtPrice(p) {
  if (p >= 1000) return '$' + p.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  if (p >= 1)    return '$' + p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return '$' + p.toFixed(4);
}

function updateCardUI(sym, newPrice, oldPrice, chgPct) {
  const priceEl = document.getElementById(`price-${sym}`);
  const chgEl   = document.getElementById(`chg-${sym}`);
  if (!priceEl || !chgEl) return;

  if (oldPrice !== null && newPrice !== oldPrice) {
    const cls = newPrice > oldPrice ? 'flash-up' : 'flash-dn';
    priceEl.classList.remove('flash-up', 'flash-dn');
    void priceEl.offsetWidth;
    priceEl.classList.add(cls);
  }

  priceEl.textContent = fmtPrice(newPrice);
  const up = chgPct >= 0;
  chgEl.textContent = (up ? '+' : '') + chgPct.toFixed(2) + '%';
  chgEl.className   = 'market-chg ' + (up ? 'change-up' : 'change-dn');
}

function updateDetailPrice(price, chgPct) {
  const el  = document.getElementById('live-detail-price');
  const cel = document.getElementById('live-detail-chg');
  if (el)  el.textContent  = fmtPrice(price);
  if (cel) {
    const up = chgPct >= 0;
    cel.textContent = (up ? '+' : '') + chgPct.toFixed(2) + '% (bugün)';
    cel.className   = 'market-chg ' + (up ? 'change-up' : 'change-dn');
  }
}

// ===== RENDER FONKSİYONLARI =====
function renderCountdown() {
  document.getElementById('countdownBar').innerHTML = EVENTS.map(ev => `
    <div class="cd-item">
      <span class="cd-event">${term(ev.termKey, ev.name)}</span>
      <div class="cd-clock">
        <span class="cd-unit">${String(ev.days).padStart(2, '0')}g</span>
        <span class="cd-sep">:</span>
        <span class="cd-unit">${String(ev.hours).padStart(2, '0')}s</span>
        <span class="cd-sep">:</span>
        <span class="cd-unit">${String(ev.minutes).padStart(2, '0')}d</span>
      </div>
    </div>
  `).join('');
  setTimeout(fixTooltipDirections, 100);
}

function renderMacro() {
  document.getElementById('macroGrid').innerHTML = MACRO_DATA.map(m => `
    <div class="macro-card">
      <div class="macro-top"><span class="macro-lbl">${term(m.termKey, m.label)}</span></div>
      <div class="macro-value">${m.value}</div>
      <div class="macro-sub">${m.sub}</div>
      ${m.up !== null ? `<div class="macro-sub ${m.up ? 'change-up' : 'change-dn'}" style="margin-top:4px;">${m.up ? '▲' : '▼'} ${Math.abs(parseFloat(m.change)).toFixed(1)} önceki dönemden</div>` : ''}
    </div>
  `).join('');
}

function getAssets() {
  return selectedMarket === 'crypto' ? SYMBOLS.map(s => META[s]) : STATIC_MARKETS[selectedMarket];
}

function renderGrid() {
  const assets = getAssets();
  document.getElementById('marketGrid').innerHTML = assets.map((a, i) => {
    const isCrypto = selectedMarket === 'crypto';
    const sym      = isCrypto ? SYMBOLS[i] : null;
    const price    = isCrypto ? `<span id="price-${sym}">Yükleniyor...</span>` : a.price;
    const chg      = isCrypto
      ? `<span id="chg-${sym}" style="color:#5a6478">—</span>`
      : `<span class="${a.up ? 'change-up' : 'change-dn'}">${a.change}</span>`;
    return `
      <div class="market-card ${selectedAsset === i ? 'selected' : ''}" onclick="selectAsset(${i})">
        <div class="market-name">${a.symbol} <span style="font-size:10px;color:#5a6478;">${a.name}</span></div>
        <div class="market-price">${price}</div>
        <div class="market-chg">${chg}</div>
      </div>`;
  }).join('');
}

function generatePriceData() {
  let p = 100 + Math.random() * 20, arr = [];
  for (let i = 0; i < 30; i++) { p += (Math.random() - 0.48) * 4; arr.push(parseFloat(p.toFixed(2))); }
  return arr;
}

function generatePriceDataAround(currentPrice) {
  const volatility = currentPrice * 0.018;
  const decimals   = currentPrice >= 100 ? 0 : 2;
  let arr = [];
  let p   = currentPrice * (0.88 + Math.random() * 0.12);
  for (let i = 0; i < 29; i++) {
    p += (Math.random() - 0.47) * volatility;
    p  = Math.max(p, currentPrice * 0.5);
    arr.push(parseFloat(p.toFixed(decimals)));
  }
  arr.push(parseFloat(currentPrice.toFixed(decimals)));
  return arr;
}

// ===== VARLIK SEÇİMİ =====
function selectAsset(i) {
  selectedAsset = i;
  renderGrid();

  const assets   = getAssets();
  const a        = assets[i];
  const isCrypto = selectedMarket === 'crypto';
  const d        = a.detail;
  const id       = a.identity;

  let priceStr, chgStr, isUp, volStr;
  if (isCrypto) {
    const sym  = SYMBOLS[i];
    const pEl  = document.getElementById(`price-${sym}`);
    const cEl  = document.getElementById(`chg-${sym}`);
    priceStr   = pEl ? pEl.textContent : '...';
    chgStr     = cEl ? cEl.textContent : '...';
    isUp       = cEl ? cEl.classList.contains('change-up') : true;
    volStr     = d.mcap;
  } else {
    priceStr = a.price; chgStr = a.change; isUp = a.up; volStr = a.vol;
  }

  const riskColor  = d.riskAppetite === 'Yüksek' ? 'badge-red' : d.riskAppetite.includes('Düşük') ? 'badge-green' : 'badge-yellow';
  const trendColor = d.trend.includes('Yükseliş') ? 'badge-green' : d.trend === 'Yatay' ? 'badge-yellow' : 'badge-red';
  const mktLabel   = selectedMarket === 'bist' ? 'Borsa İstanbul' : selectedMarket === 'crypto' ? 'Kripto Para' : 'Nasdaq';

  const priceId = isCrypto ? 'id="live-detail-price"' : '';
  const chgId   = isCrypto ? 'id="live-detail-chg"' : '';

  document.getElementById('detailPanel').innerHTML = `
    <div class="detail-panel fadein">
      <div class="identity-card">
        <div class="identity-icon" style="background:${id.iconBg};">${id.icon}</div>
        <div class="identity-body">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:14px;font-weight:500;color:#e2e8f0;">${a.name}</span>
            <span class="itag ${id.sectorClass}">${id.sector}</span>
          </div>
          <div class="identity-desc">${id.desc}</div>
          <div class="identity-tags">${id.tags.map(t => `<span class="itag ${t.cls}">${t.label}</span>`).join('')}</div>
        </div>
      </div>

      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px;">
        <div style="font-size:12px;color:#5a6478;">${mktLabel} · ${a.symbol}</div>
        <div style="text-align:right;">
          <div style="font-size:26px;font-weight:500;color:#e2e8f0;" ${priceId}>${priceStr}</div>
          <div class="market-chg ${isUp ? 'change-up' : 'change-dn'}" style="font-size:13px;" ${chgId}>${chgStr} (bugün)</div>
        </div>
      </div>

      <div class="tab-bar">
        <button class="tab active">Genel Bakış</button>
        <button class="tab">Teknik</button>
        <button class="tab">Haberler</button>
      </div>

      <div class="detail-grid">
        <div class="stat-card"><div class="stat-lbl">${term('mcap', 'Piyasa Değeri')}</div><div class="stat-value">${d.mcap}</div></div>
        <div class="stat-card"><div class="stat-lbl">${term('hacim', '24s Hacim')}</div><div class="stat-value">${volStr}</div></div>
        <div class="stat-card">
          <div class="stat-lbl">${term('ATH', "ATH'den bu yana")}</div>
          <div class="stat-value">${d.ath}</div>
          <div style="font-size:11px;color:#f87171;margin-top:3px;">${d.athDays} gündür ATH altında</div>
        </div>
        <div class="stat-card"><div class="stat-lbl">${term('risk', 'Risk İştahı')}</div><div style="margin-top:4px;"><span class="badge ${riskColor}">${d.riskAppetite}</span></div></div>
        <div class="stat-card"><div class="stat-lbl">${term('trend', 'Trend')}</div><div style="margin-top:4px;"><span class="badge ${trendColor}">${d.trend}</span></div></div>
        <div class="stat-card"><div class="stat-lbl">${term('seri', 'Fiyat Serisi')}</div><div class="stat-value" style="font-size:13px;color:${d.streakUp ? '#34d399' : '#f87171'};">${d.streak}</div></div>
      </div>

      <div class="chart-wrap"><canvas id="priceChart"></canvas></div>

      <div class="ai-box">
        <div class="ai-header">
          <div class="ai-label"><div class="ai-dot" id="ai-dot"></div>AI Analiz</div>
          <button class="ai-refresh" id="ai-refresh" onclick="refreshAI()">Yenile</button>
        </div>
        <div class="ai-text" id="ai-text"></div>
      </div>
    </div>`;

  if (priceChart) { priceChart.destroy(); priceChart = null; }
  const ctx = document.getElementById('priceChart');
  if (ctx) {
    // Gerçekçi fiyat verisi üret — mevcut fiyatın etrafında dalgalan
    const basePrice = isCrypto
      ? (liveData[SYMBOLS[i]]?.price || 100)
      : parseFloat(a.price.replace(/[^0-9.]/g, '')) || 100;
    const priceHistory = generatePriceDataAround(basePrice);
    const lineColor = isUp ? '#34d399' : '#f87171';
    const fillColor = isUp ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)';
    const currency  = priceStr.includes('₺') ? '₺' : '$';

    priceChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: 30 }, (_, k) => `${30 - k}g`).reverse(),
        datasets: [{ data: priceHistory, borderColor: lineColor, backgroundColor: fillColor, borderWidth: 1.5, pointRadius: 0, pointHoverRadius: 4, pointHoverBackgroundColor: lineColor, fill: true, tension: 0.4 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a1f2e',
            borderColor: '#3d4a6a',
            borderWidth: 1,
            titleColor: '#5a6478',
            bodyColor: '#e2e8f0',
            padding: 10,
            displayColors: false,
            callbacks: {
              title: (items) => items[0].label,
              label: (item) => {
                const val = item.raw;
                if (val >= 1000) return currency + val.toLocaleString('en-US', { maximumFractionDigits: 0 });
                if (val >= 1)    return currency + val.toFixed(2);
                return currency + val.toFixed(4);
              }
            }
          }
        },
        scales: {
          x: { ticks: { color: '#5a6478', font: { size: 10 }, maxTicksLimit: 6 }, grid: { color: '#1e2535' } },
          y: {
            ticks: {
              color: '#5a6478', font: { size: 10 },
              callback: (val) => {
                if (val >= 1000) return currency + (val / 1000).toFixed(1) + 'K';
                if (val >= 1)    return currency + val.toFixed(1);
                return currency + val.toFixed(3);
              }
            },
            grid: { color: '#1e2535' }
          }
        }
      }
    });
  }

  fetchAIAnalysis(a.name, a.symbol, mktLabel, d, priceStr, chgStr);
}

function refreshAI() {
  if (selectedAsset === null) return;
  const a        = getAssets()[selectedAsset];
  const isCrypto = selectedMarket === 'crypto';
  const mktLabel = selectedMarket === 'bist' ? 'Borsa İstanbul' : selectedMarket === 'crypto' ? 'Kripto Para' : 'Nasdaq';
  let priceStr = '—', chgStr = '—';
  if (isCrypto) {
    const sym = SYMBOLS[selectedAsset];
    const pEl = document.getElementById(`price-${sym}`);
    const cEl = document.getElementById(`chg-${sym}`);
    priceStr  = pEl ? pEl.textContent : '—';
    chgStr    = cEl ? cEl.textContent : '—';
  } else { priceStr = a.price; chgStr = a.change; }
  fetchAIAnalysis(a.name, a.symbol, mktLabel, a.detail, priceStr, chgStr);
}

function switchMarket(key, btn) {
  selectedMarket = key; selectedAsset = null;
  document.querySelectorAll('.mkt-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (priceChart) { priceChart.destroy(); priceChart = null; }
  document.getElementById('detailPanel').innerHTML = '';
  const grid = document.getElementById('marketGrid');
  grid.style.opacity = '0'; grid.style.transform = 'translateY(6px)';
  setTimeout(() => {
    renderGrid();
    grid.style.transition = 'opacity 0.2s, transform 0.2s';
    grid.style.opacity    = '1';
    grid.style.transform  = 'translateY(0)';
  }, 80);
}

// ===== TOOLTIP YÖN ALGILA =====
function fixTooltipDirections() {
  document.querySelectorAll('.term').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const rect = el.getBoundingClientRect();
      if (rect.top < 220) {
        el.classList.add('tip-down');
      } else {
        el.classList.remove('tip-down');
      }
    });
  });
}

// ===== BAŞLAT =====
renderCountdown();
renderMacro();
renderGrid();
connectWS();
setTimeout(fixTooltipDirections, 300);
