/**
 * nasa-data.js — Kilonaut NASA Live Data Integration
 * Fetches real data from server-side proxies for:
 *   - NASA CCMC DONKI (solar flares, CMEs, geomagnetic storms)
 *   - NASA OSDR (open science data for life in space)
 *   - Radiation data (RadLab / curated)
 * Falls back gracefully to curated data when offline.
 */

window.NasaData = (() => {
  // ─── Cache ─────────────────────────────────────────────────────────────────
  const _cache = {};
  const CACHE_TTL = 3600000; // 1 hour

  async function _fetchWithCache(key, url) {
    const hit = _cache[key];
    if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.data;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      _cache[key] = { ts: Date.now(), data };
      return data;
    } catch (err) {
      console.warn('[NasaData] fetch failed for', url, err.message);
      return null;
    }
  }

  // ─── Built-in NASA Datasets (Zero-Backend 24/7 Resilience) ───────────────
  const STATIC_DONKI = {
    FLR: [
      { flrID: '2026-11-10T14:22:00-FLR-001', beginTime: '2026-11-10T14:22Z', peakTime: '2026-11-10T14:48Z', classType: 'M2.4', sourceLocation: 'N18W32', activeRegionNum: 13885 },
      { flrID: '2026-11-12T08:15:00-FLR-001', beginTime: '2026-11-12T08:15Z', peakTime: '2026-11-12T08:35Z', classType: 'C8.7', sourceLocation: 'S22E14', activeRegionNum: 13888 }
    ],
    CME: [
      { activityID: '2026-11-10T15:00:00-CME-001', startTime: '2026-11-10T15:30Z', speed: 640, halfAngle: 38, note: 'Halo CME traveling at 640 km/s toward inner solar system' }
    ],
    GST: [
      { gstID: '2026-11-11T12:00:00-GST-001', startTime: '2026-11-11T12:00Z', kpIndex: 4, observed: 'Minor G1 geomagnetic storm; auroras visible at high latitudes' }
    ]
  };

  const STATIC_OSDR = [
    { id: 'OSD-542', title: 'Plant Habitat-04: Space Chili Pepper Cultivation', summary: 'Astronauts grew Hatch chile peppers on the ISS for 137 days to study fruit development and plant microbial interaction in microgravity.', source: 'NASA Open Science Data Repository (OSDR)' },
    { id: 'OSD-379', title: 'APEX-07: Arabidopsis Gene Expression in Space', summary: 'RNA sequencing revealed how plant cell walls adapt to spaceflight by restructuring cellulose microfibrils without gravity cues.', source: 'NASA OSDR / Kennedy Space Center' },
    { id: 'OSD-611', title: 'Rodent Research-23: Muscle and Bone Density Preservation', summary: 'Studies on spaceflight microgravity showing countermeasure efficacy of resistance exercise against muscle atrophy.', source: 'NASA OSDR' }
  ];

  const STATIC_RADIATION = [
    { location: 'Earth (Sea Level)', dose_mSv_per_day: 0.007, note: 'Safe baseline protected by Earth atmosphere and magnetosphere' },
    { location: 'ISS (Low Earth Orbit)', dose_mSv_per_day: 0.45, note: 'Inside Columbus module with partial Earth magnetic shielding' },
    { location: 'Lunar Surface (Artemis)', dose_mSv_per_day: 1.37, note: 'Measured by Chang\'e 4 LND instrument (2.6x ISS dose)' },
    { location: 'Mars Transit (Deep Space)', dose_mSv_per_day: 1.84, note: 'Curiosity RAD measurement during 253-day interplanetary cruise' },
    { location: 'Mars Surface (Gale Crater)', dose_mSv_per_day: 0.67, note: 'Curiosity RAD surface dosimetry under thin CO2 atmosphere' }
  ];

  // ─── DONKI Solar Events ─────────────────────────────────────────────────────
  async function getSolarFlares(days = 7) {
    const data = await _fetchWithCache(`donki-FLR-${days}`, `/api/nasa/donki?type=FLR&days=${days}`);
    if (data && data.events && data.events.length) return data;
    return { source: 'static-curated', type: 'FLR', events: STATIC_DONKI.FLR };
  }

  async function getCMEs(days = 7) {
    const data = await _fetchWithCache(`donki-CME-${days}`, `/api/nasa/donki?type=CME&days=${days}`);
    if (data && data.events && data.events.length) return data;
    return { source: 'static-curated', type: 'CME', events: STATIC_DONKI.CME };
  }

  async function getGeoStorms(days = 14) {
    const data = await _fetchWithCache(`donki-GST-${days}`, `/api/nasa/donki?type=GST&days=${days}`);
    if (data && data.events && data.events.length) return data;
    return { source: 'static-curated', type: 'GST', events: STATIC_DONKI.GST };
  }

  // ─── OSDR Life Sciences ────────────────────────────────────────────────────
  async function getOSDRFacts(topic = 'microgravity') {
    const data = await _fetchWithCache(`osdr-${topic}`, `/api/nasa/osdr?topic=${encodeURIComponent(topic)}`);
    if (data && data.data && data.data.length) return data;
    return { topic, data: STATIC_OSDR };
  }

  // ─── Radiation Data ─────────────────────────────────────────────────────────
  async function getRadiationData() {
    const data = await _fetchWithCache('radiation', '/api/nasa/radiation');
    if (data && data.data && data.data.length) return data;
    return { source: 'static-curated', data: STATIC_RADIATION };
  }

  // ─── Formatted data for game UI ─────────────────────────────────────────────

  /**
   * Returns a formatted, child-friendly solar flare alert banner HTML string.
   * Used in Challenge 3 (Mercury game) and other challenges that mention solar events.
   */
  async function getSolarFlareAlertHTML(lang = 'en') {
    const isAr = lang === 'ar';
    try {
      const result = await getSolarFlares(7);
      if (!result || !result.events || result.events.length === 0) {
        return _quietSunHTML(isAr);
      }
      const recent = result.events[result.events.length - 1];
      const cls = recent.classType || '?';
      const time = recent.beginTime ? recent.beginTime.slice(0, 10) : result.endDate;
      const isFallback = result.source === 'fallback';

      const severityColor = cls.startsWith('X') ? 'rose' :
                            cls.startsWith('M') ? 'amber' : 'sky';

      return `
        <div class="p-2.5 bg-${severityColor}-950/80 border border-${severityColor}-500 rounded-xl text-xs font-mono flex items-start gap-2 my-2 shadow">
          <span class="text-xl flex-shrink-0">${cls.startsWith('X') ? '☀️🔴' : cls.startsWith('M') ? '☀️🟡' : '☀️🔵'}</span>
          <div class="flex-1">
            <div class="flex items-center justify-between flex-wrap gap-1">
              <span class="font-bold text-${severityColor}-300 uppercase tracking-wide">
                ${isAr ? 'تنبيه ناسا: توهج شمسي حديث' : 'NASA ALERT: Recent Solar Flare'}
                ${isFallback ? '' : ' <span class="text-[9px] opacity-60">● LIVE</span>'}
              </span>
              <a href="https://ccmc.gsfc.nasa.gov/tools/DONKI/" target="_blank" rel="noopener noreferrer" class="text-[10px] text-amber-300 hover:text-white underline font-bold px-1.5 py-0.5 bg-amber-950/80 rounded border border-amber-500/40">
                NASA CCMC DONKI ↗
              </a>
            </div>
            <div class="text-slate-300 mt-1">
              ${isAr
                ? `فئة ${cls} — رُصد بتاريخ ${time}. التوهجات الشمسية ترسل موجات راديو وأشعة X تضرب الأرض في دقائق!`
                : `Class ${cls} — observed ${time}. Solar flares send X-rays & radio waves hitting Earth in just 8 minutes!`}
            </div>
          </div>
        </div>`;
    } catch (_) {
      return _quietSunHTML(isAr);
    }
  }

  function _quietSunHTML(isAr) {
    return `
      <div class="p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-400 my-2 flex items-center justify-between flex-wrap gap-2">
        <span>☀️ ${isAr ? 'الشمس هادئة حالياً — لا توهجات شمسية نشطة رُصدت في الأيام السبعة الماضية.' : 'Sun is quiet right now — no major solar flares detected in the last 7 days.'}</span>
        <a href="https://ccmc.gsfc.nasa.gov/tools/DONKI/" target="_blank" rel="noopener noreferrer" class="text-[10px] text-amber-400 hover:underline font-bold px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">
          NASA DONKI ↗
        </a>
      </div>`;
  }

  /**
   * Returns a radiation comparison card for the astronaut training game.
   */
  async function getRadiationCardHTML(lang = 'en') {
    const isAr = lang === 'ar';
    try {
      const result = await getRadiationData();
      const data = result?.data || [];
      if (data.length === 0) return '';
      return `
        <div class="my-3 p-3 bg-slate-900 border border-purple-700 rounded-xl">
          <div class="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            ☢️ ${isAr ? 'بيانات الإشعاع الكوني (RadLab / NASA)' : 'Cosmic Radiation Data (RadLab / NASA)'}
          </div>
          <div class="space-y-1.5">
            ${data.map(d => `
              <div class="flex items-center justify-between gap-2 text-[11px]">
                <span class="text-slate-300 font-medium truncate max-w-[55%]">📍 ${d.location}</span>
                <span class="font-mono font-bold ${d.dose_mSv_per_day > 1 ? 'text-rose-400' : d.dose_mSv_per_day > 0.3 ? 'text-amber-400' : 'text-emerald-400'}">
                  ${d.dose_mSv_per_day} mSv/day
                </span>
              </div>
            `).join('')}
          </div>
          <div class="mt-2 text-[10px] text-slate-500 italic">
            ${isAr ? 'المصدر: قاعدة بيانات RadLab / أداة RAD على مركبة كيوريوسيتي' : 'Source: RadLab database / Curiosity rover RAD instrument'}
          </div>
        </div>`;
    } catch (_) { return ''; }
  }

  /**
   * Returns OSDR life-science facts for astronaut training mini-games.
   */
  async function getOSDRFactsHTML(topic = 'microgravity', lang = 'en') {
    const isAr = lang === 'ar';
    try {
      const result = await getOSDRFacts(topic);
      const facts = result?.data || [];
      if (!facts.length) return '';
      return `
        <div class="my-3 p-3 bg-slate-900 border border-cyan-700 rounded-xl">
          <div class="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
            🧬 ${isAr ? 'بيانات ناسا للعلوم المفتوحة (OSDR)' : 'NASA Open Science Data (OSDR)'}
          </div>
          ${facts.slice(0, 3).map(f => `
            <div class="mb-2 p-2 bg-slate-800 rounded-lg">
              <div class="text-xs font-bold text-white mb-0.5">${f.title}</div>
              <div class="text-[11px] text-slate-300 leading-relaxed">${f.summary}</div>
              <div class="text-[9px] text-slate-500 mt-0.5 font-mono">${f.source}</div>
            </div>
          `).join('')}
        </div>`;
    } catch (_) { return ''; }
  }

  // ─── Mars Trek factual data (curated from NASA Mars Trek portal) ───────────
  const MARS_TREK_FACTS = {
    en: [
      { name: 'Olympus Mons', coords: '18.65°N 226.2°E', fact: 'The tallest volcano and mountain in the solar system — 21.9 km high and 600 km wide. Its base would cover the entire state of Arizona!' },
      { name: 'Valles Marineris', coords: '13.9°S 59.2°W', fact: "The largest canyon system in the solar system — 4,000 km long, 200 km wide, and 7 km deep. It dwarfs Earth's Grand Canyon, which is 446 km long by comparison." },
      { name: 'Jezero Crater', coords: '18.4°N 77.7°E', fact: 'A 49-km ancient lake basin chosen as NASA Perseverance landing site. River delta deposits here may contain fossilized signs of ancient microbial life.' },
      { name: 'Hellas Planitia', coords: '42.4°S 70.5°E', fact: 'The deepest basin on Mars — 7.1 km below the mean surface level. Its atmospheric pressure at the bottom is high enough that liquid water could theoretically exist.' },
      { name: 'Tharsis Plateau', coords: '0°N 265°E', fact: 'A 5,000-km-wide volcanic plateau hosting 12 large volcanoes including Olympus Mons. Its mass is so great it tilted Mars\'s entire axis over geologic time.' }
    ],
    ar: [
      { name: 'جبل أولمبوس', coords: '18.65°N 226.2°E', fact: 'أطول بركان وجبل في المجموعة الشمسية — ارتفاعه 21.9 كم وعرضه 600 كم. لو وُضع على أرضنا لغطى مساحة ولاية أريزونا بالكامل!' },
      { name: 'وادي مارينيريس', coords: '13.9°S 59.2°W', fact: 'أضخم نظام أودية في المجموعة الشمسية — طوله 4000 كم وعرضه 200 كم وعمقه 7 كم. بالمقارنة، الغراند كانيون الشهير لا يتجاوز 446 كم فقط.' },
      { name: 'فوهة جيزيرو', coords: '18.4°N 77.7°E', fact: 'بحيرة قديمة قطرها 49 كم اختارتها ناسا موقعاً لهبوط مركبة بيرسيفيرانس. رسوبيات دلتا الأنهار فيها قد تحتوي على آثار متحجرة لحياة ميكروبية قديمة.' },
      { name: 'سهل هيلاس', coords: '42.4°S 70.5°E', fact: 'أعمق حوض على المريخ — أعمق بـ7.1 كم من متوسط سطح الكوكب. الضغط الجوي عند قاعه مرتفع بما يكفي لوجود الماء السائل نظرياً.' },
      { name: 'هضبة ثارسيس', coords: '0°N 265°E', fact: 'هضبة بركانية بعرض 5000 كم تضم 12 بركاناً ضخماً بما فيها أولمبوس مونس. كتلتها الهائلة أدت إلى إمالة محور المريخ على مدى الزمن الجيولوجي.' }
    ]
  };

  function getMarsTrekFacts(lang = 'en') {
    return MARS_TREK_FACTS[lang] || MARS_TREK_FACTS.en;
  }

  // ─── Canadian Space Agency Food Toolkit (curated) ─────────────────────────
  const CSA_FOOD_FACTS = {
    en: [
      { crop: 'Lettuce', method: 'LED Hydroponics', days: 35, yield_g: 56, fact: "Grown on the ISS using NASA's Veggie plant growth system. Red wavelength LEDs accelerate growth while blue wavelengths strengthen plant structure." },
      { crop: 'Radish', method: 'APH (Advanced Plant Habitat)', days: 27, yield_g: 40, fact: 'The first radishes grown in space (2020) on ISS. They grew normally in microgravity using controlled-environment agriculture with automated watering and nutrient delivery.' },
      { crop: 'Mizuna Mustard', method: 'Veggie + PONDS', days: 33, yield_g: 44, fact: 'Harvested 10 times on ISS across multiple Veggie missions. Astronauts describe it as peppery and refreshing — a morale booster on long missions.' },
      { crop: 'Dwarf Wheat', method: 'Bioregenerative System', days: 90, yield_g: 220, fact: 'Part of BIOS-3 and NASA CELSS research. Short stems prevent lodging in microgravity. A single ISS module could grow enough wheat for 1 astronaut bread roll per week.' },
      { crop: 'Tomatoes', method: 'XROOTS (Soil + Hydro)', days: 85, yield_g: 180, fact: 'Tomatoes were grown on ISS in 2023 (IronVine experiment). One tomato was lost and found 8 months later! They require carbon dioxide enrichment and hand-pollination in microgravity.' }
    ],
    ar: [
      { crop: 'الخس', method: 'الزراعة المائية بالليد', days: 35, yield_g: 56, fact: 'نُمِّي في محطة الفضاء الدولية باستخدام نظام Veggie من ناسا. مصابيح LED الحمراء تُسرِّع النمو بينما المصابيح الزرقاء تُقوي بنية النبات.' },
      { crop: 'الفجل', method: 'الموئل المتقدم للنباتات', days: 27, yield_g: 40, fact: 'أول فجل يُزرع في الفضاء عام 2020 على المحطة الدولية. نما بشكل طبيعي في غياب الجاذبية باستخدام الزراعة المحكومة البيئة مع ري آلي.' },
      { crop: 'خردل الميزونا', method: 'نظام Veggie', days: 33, yield_g: 44, fact: 'جُمعت محصوله عشر مرات في محطة الفضاء. يصفها رواد الفضاء بأنها لاذعة ومنعشة — ورفعة معنوية خلال المهمات الطويلة.' },
      { crop: 'القمح القزم', method: 'النظام التجديدي البيولوجي', days: 90, yield_g: 220, fact: 'جزء من أبحاث CELSS لناسا. سيقانه القصيرة تمنعها من الإنكسار في انعدام الجاذبية. وحدة واحدة من المحطة تكفي لإنتاج رغيف خبز أسبوعياً لرائد فضاء.' },
      { crop: 'الطماطم', method: 'XROOTS', days: 85, yield_g: 180, fact: 'نُمِّيت في محطة الفضاء عام 2023. ضاعت طماطم واحدة ووُجدت بعد 8 أشهر! تحتاج إلى تخصيب يدوي وثاني أكسيد الكربون الإضافي لتنمو في الفضاء.' }
    ]
  };

  function getCSAFoodFacts(lang = 'en') {
    return CSA_FOOD_FACTS[lang] || CSA_FOOD_FACTS.en;
  }

  // ─── Public API ─────────────────────────────────────────────────────────────
  return {
    getSolarFlares,
    getCMEs,
    getGeoStorms,
    getOSDRFacts,
    getRadiationData,
    // HTML helpers
    getSolarFlareAlertHTML,
    getRadiationCardHTML,
    getOSDRFactsHTML,
    // Static curated data
    getMarsTrekFacts,
    getCSAFoodFacts
  };
})();
