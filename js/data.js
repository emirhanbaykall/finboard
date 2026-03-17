// ===== KRİPTO (Binance WebSocket ile canlı) =====
const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'];

const META = {
  BTCUSDT: {
    symbol: 'BTC', name: 'Bitcoin',
    identity: {
      icon: '₿', iconBg: '#1a1540', sector: 'Kripto Para', sectorClass: 'itag-sector-crypto',
      desc: 'Dünyanın ilk ve en büyük kripto parası. Dijital altın olarak da bilinir — merkezi otorite olmadan çalışan, sınırlı arzı olan bir değer saklama aracı.',
      tags: [{ label: 'Kripto', cls: 'itag-sector-crypto' }, { label: 'Piyasa Lideri', cls: 'itag-positive' }, { label: 'Yüksek Volatilite', cls: 'itag-warning' }, { label: 'Kurumsal İlgi', cls: 'itag-prop' }]
    },
    detail: { mcap: '$1.33T', ath: '$73,780', athDays: 42, streak: '+8 gündür artışta', streakUp: true, riskAppetite: 'Yüksek', trend: 'Yükseliş' }
  },
  ETHUSDT: {
    symbol: 'ETH', name: 'Ethereum',
    identity: {
      icon: '⟠', iconBg: '#1a2040', sector: 'Kripto Para', sectorClass: 'itag-sector-crypto',
      desc: 'Akıllı sözleşme ve merkeziyetsiz uygulama altyapısı sunan blokzincir platformu. DeFi ve NFT ekosisteminin temel taşı.',
      tags: [{ label: 'Kripto', cls: 'itag-sector-crypto' }, { label: 'Akıllı Sözleşme', cls: 'itag-prop' }, { label: 'DeFi Altyapısı', cls: 'itag-positive' }, { label: 'Yüksek Volatilite', cls: 'itag-warning' }]
    },
    detail: { mcap: '$422B', ath: '$4,891', athDays: 148, streak: '+5 gündür artışta', streakUp: true, riskAppetite: 'Orta-Yüksek', trend: 'Yükseliş' }
  },
  BNBUSDT: {
    symbol: 'BNB', name: 'BNB',
    identity: {
      icon: 'B', iconBg: '#2e2010', sector: 'Kripto Para', sectorClass: 'itag-sector-crypto',
      desc: 'Binance borsasının yerel tokeni. İşlem ücretlerinde indirim sağlar, Binance ekosisteminin büyümesiyle değer kazanır.',
      tags: [{ label: 'Kripto', cls: 'itag-sector-crypto' }, { label: 'Exchange Token', cls: 'itag-prop' }, { label: 'Binance Ekosistemi', cls: 'itag-prop' }]
    },
    detail: { mcap: '$87B', ath: '$686', athDays: 95, streak: '-2 gündür düşüşte', streakUp: false, riskAppetite: 'Orta', trend: 'Yatay' }
  },
  SOLUSDT: {
    symbol: 'SOL', name: 'Solana',
    identity: {
      icon: '◎', iconBg: '#1a2535', sector: 'Kripto Para', sectorClass: 'itag-sector-crypto',
      desc: 'Yüksek hız ve düşük işlem maliyetiyle öne çıkan blokzincir platformu. NFT ve gaming alanında özellikle popüler.',
      tags: [{ label: 'Kripto', cls: 'itag-sector-crypto' }, { label: 'Yüksek Hız', cls: 'itag-positive' }, { label: 'NFT & Gaming', cls: 'itag-prop' }, { label: 'Yüksek Volatilite', cls: 'itag-warning' }]
    },
    detail: { mcap: '$82B', ath: '$260', athDays: 72, streak: '+11 gündür artışta', streakUp: true, riskAppetite: 'Yüksek', trend: 'Güçlü Yükseliş' }
  }
};

// ===== BIST & NASDAQ (statik — ileride API ile değiştirilecek) =====
const STATIC_MARKETS = {
  bist: [
    { symbol: 'XU100', name: 'BIST 100', price: '9,842', change: '+0.8%', up: true, vol: '52.4M ₺', identity: { icon: 'T', iconBg: '#0d2e22', sector: 'Endeks', sectorClass: 'itag-sector-index', desc: 'Borsa İstanbul\'daki en büyük 100 şirketin ağırlıklı ortalaması. Türk hisse senedi piyasasının genel sağlığını yansıtır.', tags: [{ label: 'Endeks', cls: 'itag-sector-index' }, { label: 'Geniş Pazar', cls: 'itag-prop' }] }, detail: { mcap: '—', ath: '11,248', athDays: 120, streak: '+3 gündür artışta', streakUp: true, riskAppetite: 'Orta', trend: 'Yükseliş' } },
    { symbol: 'THYAO', name: 'Türk Hava Yolları', price: '285.6 ₺', change: '+1.2%', up: true, vol: '1.8M ₺', identity: { icon: '✈', iconBg: '#1a2040', sector: 'Ulaşım', sectorClass: 'itag-sector-index', desc: 'Türkiye\'nin milli havayolu, dünyanın en fazla ülkeye uçuş yapan havayollarından biri.', tags: [{ label: 'Ulaşım', cls: 'itag-sector-index' }, { label: 'BIST 30', cls: 'itag-prop' }, { label: 'Büyüme Hissesi', cls: 'itag-positive' }] }, detail: { mcap: '249B ₺', ath: '312 ₺', athDays: 65, streak: '+4 gündür artışta', streakUp: true, riskAppetite: 'Orta', trend: 'Yükseliş' } },
    { symbol: 'EREGL', name: 'Ereğli Demir Çelik', price: '47.2 ₺', change: '-1.4%', up: false, vol: '890K ₺', identity: { icon: '⚙', iconBg: '#2e2010', sector: 'Sanayi', sectorClass: 'itag-sector-industry', desc: 'Türkiye\'nin en büyük çelik üreticisi. Yüksek temettü ödemeleriyle tanınır.', tags: [{ label: 'Sanayi', cls: 'itag-sector-industry' }, { label: 'Temettü Veriyor', cls: 'itag-positive' }, { label: 'Döngüsel Hisse', cls: 'itag-warning' }] }, detail: { mcap: '118B ₺', ath: '71 ₺', athDays: 210, streak: '-3 gündür düşüşte', streakUp: false, riskAppetite: 'Orta-Düşük', trend: 'Yatay' } },
    { symbol: 'AKBNK', name: 'Akbank', price: '51.8 ₺', change: '+0.4%', up: true, vol: '1.1M ₺', identity: { icon: 'A', iconBg: '#0d2e22', sector: 'Finans', sectorClass: 'itag-sector-finance', desc: 'Türkiye\'nin köklü özel sektör bankalarından biri, düzenli temettü dağıtır.', tags: [{ label: 'Finans', cls: 'itag-sector-finance' }, { label: 'Temettü Veriyor', cls: 'itag-positive' }, { label: 'BIST 30', cls: 'itag-prop' }] }, detail: { mcap: '207B ₺', ath: '58 ₺', athDays: 44, streak: '+2 gündür artışta', streakUp: true, riskAppetite: 'Orta', trend: 'Yatay' } },
  ],
  nasdaq: [
    { symbol: 'QQQ', name: 'Nasdaq 100 ETF', price: '$448.2', change: '+0.6%', up: true, vol: '$18.4B', identity: { icon: 'Q', iconBg: '#1a2040', sector: 'ETF / Endeks', sectorClass: 'itag-sector-index', desc: 'Nasdaq\'taki en büyük 100 teknoloji şirketine tek işlemle yatırım.', tags: [{ label: 'ETF', cls: 'itag-sector-index' }, { label: 'Çeşitlendirilmiş', cls: 'itag-positive' }] }, detail: { mcap: '—', ath: '$503', athDays: 89, streak: '+5 gündür artışta', streakUp: true, riskAppetite: 'Orta', trend: 'Yükseliş' } },
    { symbol: 'AAPL', name: 'Apple', price: '$178.6', change: '+0.9%', up: true, vol: '$12.1B', identity: { icon: '', iconBg: '#1e2535', sector: 'Teknoloji', sectorClass: 'itag-sector-tech', desc: 'Dünyanın en değerli şirketi. iPhone, Mac ve hizmetler.', tags: [{ label: 'Teknoloji', cls: 'itag-sector-tech' }, { label: 'Temettü Veriyor', cls: 'itag-positive' }, { label: 'Düşük Volatilite', cls: 'itag-positive' }] }, detail: { mcap: '$2.74T', ath: '$198', athDays: 112, streak: '+3 gündür artışta', streakUp: true, riskAppetite: 'Düşük-Orta', trend: 'Yatay' } },
    { symbol: 'NVDA', name: 'NVIDIA', price: '$875', change: '+2.8%', up: true, vol: '$34.2B', identity: { icon: 'N', iconBg: '#0d2e22', sector: 'Teknoloji', sectorClass: 'itag-sector-tech', desc: 'Yapay zeka ve GPU alanının tartışmasız lideri.', tags: [{ label: 'Teknoloji', cls: 'itag-sector-tech' }, { label: 'Yapay Zeka Lideri', cls: 'itag-positive' }, { label: 'Yüksek Volatilite', cls: 'itag-warning' }] }, detail: { mcap: '$2.16T', ath: '$974', athDays: 58, streak: '+12 gündür artışta', streakUp: true, riskAppetite: 'Yüksek', trend: 'Güçlü Yükseliş' } },
    { symbol: 'MSFT', name: 'Microsoft', price: '$415', change: '+0.3%', up: true, vol: '$9.8B', identity: { icon: 'M', iconBg: '#1a2040', sector: 'Teknoloji', sectorClass: 'itag-sector-tech', desc: 'Bulut bilişim ve yapay zeka alanında küresel teknoloji devi.', tags: [{ label: 'Teknoloji', cls: 'itag-sector-tech' }, { label: 'Temettü Veriyor', cls: 'itag-positive' }, { label: 'Düşük Risk', cls: 'itag-positive' }] }, detail: { mcap: '$3.08T', ath: '$430', athDays: 31, streak: '+6 gündür artışta', streakUp: true, riskAppetite: 'Düşük', trend: 'Yükseliş' } },
  ]
};

// ===== MAKRO VERİLER =====
const MACRO_DATA = [
  { label: 'ABD Enflasyonu', termKey: 'cpi',      value: '%3.2',   sub: 'Şubat 2024',  change: '-0.1', up: false },
  { label: 'Fed Faiz Oranı', termKey: 'fed',      value: '%5.25',  sub: 'Mevcut oran', change: '0',    up: null  },
  { label: 'ABD İşsizlik',   termKey: 'issizlik', value: '%3.7',   sub: 'Şubat 2024',  change: '+0.1', up: true  },
  { label: 'ABD GSYİH',      termKey: 'gsyih',    value: '%3.2',   sub: 'Q4 2023',     change: '+0.4', up: true  },
  { label: 'Petrol (WTI)',   termKey: 'petrol',   value: '$82.4',  sub: 'Varil/USD',   change: '+1.2', up: true  },
  { label: 'Altın',          termKey: 'altin',    value: '$2,184', sub: 'Ons/USD',     change: '+0.8', up: true  },
];

// ===== EKONOMİK TAKVİM — 2026 Gerçek Tarihler =====
// Tarihler: Fed (federalreserve.gov), CPI/NFP (bls.gov), TCMB (tcmb.gov.tr)
const CALENDAR_2026 = [
  // Fed FOMC Toplantıları
  { name: 'Fed Faiz Kararı',     termKey: 'fed',      date: '2026-03-19T18:00:00Z' },
  { name: 'Fed Faiz Kararı',     termKey: 'fed',      date: '2026-05-07T18:00:00Z' },
  { name: 'Fed Faiz Kararı',     termKey: 'fed',      date: '2026-06-18T18:00:00Z' },
  { name: 'Fed Faiz Kararı',     termKey: 'fed',      date: '2026-07-30T18:00:00Z' },
  { name: 'Fed Faiz Kararı',     termKey: 'fed',      date: '2026-09-17T18:00:00Z' },
  { name: 'Fed Faiz Kararı',     termKey: 'fed',      date: '2026-10-29T18:00:00Z' },
  { name: 'Fed Faiz Kararı',     termKey: 'fed',      date: '2026-12-10T18:00:00Z' },
  // ABD CPI (BLS)
  { name: 'ABD CPI Verisi',      termKey: 'cpi',      date: '2026-04-10T12:30:00Z' },
  { name: 'ABD CPI Verisi',      termKey: 'cpi',      date: '2026-05-13T12:30:00Z' },
  { name: 'ABD CPI Verisi',      termKey: 'cpi',      date: '2026-06-11T12:30:00Z' },
  { name: 'ABD CPI Verisi',      termKey: 'cpi',      date: '2026-07-14T12:30:00Z' },
  { name: 'ABD CPI Verisi',      termKey: 'cpi',      date: '2026-08-12T12:30:00Z' },
  { name: 'ABD CPI Verisi',      termKey: 'cpi',      date: '2026-09-11T12:30:00Z' },
  // ABD NFP (İstihdam)
  { name: 'NFP (İstihdam)',      termKey: 'nfp',      date: '2026-04-03T12:30:00Z' },
  { name: 'NFP (İstihdam)',      termKey: 'nfp',      date: '2026-05-01T12:30:00Z' },
  { name: 'NFP (İstihdam)',      termKey: 'nfp',      date: '2026-06-05T12:30:00Z' },
  { name: 'NFP (İstihdam)',      termKey: 'nfp',      date: '2026-07-02T12:30:00Z' },
  { name: 'NFP (İstihdam)',      termKey: 'nfp',      date: '2026-08-07T12:30:00Z' },
  // TCMB Para Politikası
  { name: 'TCMB Faiz Kararı',   termKey: 'fed',      date: '2026-03-20T11:00:00Z' },
  { name: 'TCMB Faiz Kararı',   termKey: 'fed',      date: '2026-04-17T11:00:00Z' },
  { name: 'TCMB Faiz Kararı',   termKey: 'fed',      date: '2026-05-22T11:00:00Z' },
  { name: 'TCMB Faiz Kararı',   termKey: 'fed',      date: '2026-06-19T11:00:00Z' },
  // ABD GSYİH
  { name: 'ABD GSYİH (Q1)',      termKey: 'gsyih',    date: '2026-04-29T12:30:00Z' },
  { name: 'ABD GSYİH (Q2)',      termKey: 'gsyih',    date: '2026-07-29T12:30:00Z' },
  // ABD İşsizlik
  { name: 'ABD İşsizlik',        termKey: 'issizlik', date: '2026-04-03T12:30:00Z' },
  { name: 'ABD İşsizlik',        termKey: 'issizlik', date: '2026-05-01T12:30:00Z' },
];

// Bugünden sonraki olayları hesapla, en yakın 9'unu al
function getUpcomingEvents() {
  const now = new Date();
  return CALENDAR_2026
    .map(ev => {
      const evDate = new Date(ev.date);
      const diffMs = evDate - now;
      if (diffMs < 0) return null; // geçmiş olayları atla
      const days    = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours   = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return { ...ev, days, hours, minutes };
    })
    .filter(Boolean)
    .sort((a, b) => a.days - b.days || a.hours - b.hours)
    .slice(0, 9);
}

const EVENTS = getUpcomingEvents();

