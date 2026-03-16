const TERMS = {
  ATH:      { title: 'ATH — All Time High',           desc: 'Bir varlığın tarihte ulaştığı en yüksek fiyat noktası.', up: 'Fiyat ATH\'e yaklaşıyorsa güçlü momentum var demektir.', dn: 'ATH\'den çok uzakta olmak hâlâ "dip"te olunduğuna işaret edebilir.' },
  hacim:    { title: 'İşlem Hacmi',                    desc: '24 saatte alınıp satılan toplam para miktarı.', up: 'Hacim artıyorsa piyasaya taze para giriyor — fiyat yükselişi daha sağlıklı olur.', dn: 'Düşen hacim ilgisizliğe işaret eder; fiyat hareketi güvenilmez hale gelebilir.' },
  risk:     { title: 'Risk İştahı',                    desc: 'Yatırımcıların ne kadar risk almaya istekli olduğu.', up: 'Yüksek risk iştahı büyük kazanç fırsatları sunabilir.', dn: 'Aynı zamanda büyük kayıp ihtimali de demektir.' },
  trend:    { title: 'Fiyat Trendi',                   desc: 'Varlığın fiyatının genel hareket yönü.', up: 'Yükseliş trendi: Alıcılar baskın, fiyat yukarı devam edebilir.', dn: 'Düşüş trendi: Satıcılar baskın, fiyat baskı altında kalabilir.' },
  seri:     { title: 'Fiyat Serisi',                   desc: 'Kaç gündür art arda aynı yönde kapandığı.', up: 'Uzun yükseliş serisi güçlü momentum sinyali verir.', dn: 'Uzun seri sonunda düzeltme riski artar.' },
  mcap:     { title: 'Piyasa Değeri',                  desc: 'Dolaşımdaki tüm varlıkların toplam değeri (Fiyat × Arz).', up: 'Büyük piyasa değeri daha stabil demektir.', dn: 'Küçük piyasa değeri yüksek volatilite anlamına gelir.' },
  cpi:      { title: 'CPI — Tüketici Fiyat Endeksi',  desc: 'Enflasyonun ana göstergesi. Tüketicilerin ödediği fiyatların ortalaması.', up: 'CPI düşüyorsa faiz indirimi yaklaşabilir — borsalar olumlu tepki verir.', dn: 'CPI yükseliyorsa faiz artışı gelebilir — borsalar ve kripto baskı altına girebilir.' },
  fed:      { title: 'Fed Faiz Oranı',                 desc: 'ABD Merkez Bankası\'nın kısa vadeli faiz oranı.', up: 'Faiz düşüyorsa borsa ve kripto için olumlu ortam oluşur.', dn: 'Faiz yükseliyorsa yatırımcılar daha güvenli varlıklara yönelir.' },
  issizlik: { title: 'İşsizlik Oranı',                 desc: 'İş arayan ama iş bulamayan nüfusun yüzdesi.', up: 'İşsizlik azalıyorsa ekonomi güçlü demektir.', dn: 'İşsizlik artıyorsa ekonomi yavaşlıyor — borsalar olumsuz etkilenir.' },
  gsyih:    { title: 'GSYİH Büyümesi',                 desc: 'Ülke ekonomisinin ne kadar büyüdüğü.', up: 'GSYİH artıyorsa şirket gelirleri yüksek — borsalar olumlu tepki verir.', dn: 'GSYİH düşüyorsa ekonomi yavaşlıyor.' },
  petrol:   { title: 'Ham Petrol Fiyatı (WTI)',        desc: 'Küresel enerji fiyatlarının temel göstergesi.', up: 'Petrol yükseliyorsa enerji hisseleri kazanır.', dn: 'Enflasyon baskısı artar, ulaşım sektörü zorlanır.' },
  altin:    { title: 'Altın Fiyatı',                   desc: 'Küresel belirsizlik dönemlerinde güvenli liman.', up: 'Altın yükseliyorsa belirsizlik ortamında değerini korur.', dn: 'Borsa ve kriptodan para çıkıyor olabilir.' },
  nfp:      { title: 'NFP — Tarım Dışı İstihdam',     desc: 'ABD\'de tarım dışında yaratılan yeni iş sayısı.', up: 'NFP beklentinin üzerindeyse ekonomi güçlü, dolar güçlenir.', dn: 'Faiz indirimi gecikebilir — borsa kısa vadede olumsuz tepki verebilir.' },
};

function term(key, label) {
  const t = TERMS[key];
  if (!t) return label;
  return `<span class="term">${label}<span class="info-dot">?</span>
    <span class="term-tip">
      <div class="term-tip-title">${t.title}</div>
      <div class="term-tip-desc">${t.desc}</div>
      <hr class="term-tip-divider">
      <div class="term-tip-row"><span class="tip-icon tip-up">▲</span><span class="tip-up">${t.up}</span></div>
      <div class="term-tip-row"><span class="tip-icon tip-dn">▼</span><span class="tip-dn">${t.dn}</span></div>
    </span>
  </span>`;
}
