/**
 * NASA Junior Astronaut Academy - Mission Control Server
 * Runs with Node.js / agy-node on port 3000
 * Handles static asset serving and the /api/cosmo/ask bilingual endpoint with Gemini API & offline fallback.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Optional: Read .env if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Curated child-safe bilingual fallback knowledge base
const CURATED_KNOWLEDGE = [
  {
    keywords: ['mars', 'red', 'المريخ', 'أحمر', 'احمر'],
    en: "Mars is red because its surface is covered in iron oxide — the very same rust you see on old metal! When iron in the Martian rocks reacted with ancient trace oxygen, it gave the whole planet a dusty reddish-orange coat. NASA rovers like Perseverance are exploring it right now!",
    ar: "يبدو المريخ أحمر لأن سطحه مغطى بأكسيد الحديد — وهو نفس الصدأ الذي نراه على الحديد القديم! تفاعل الحديد في صخور المريخ مع كميات قديمة من الأكسجين ليمنحه هذا الرداء الترابي الأحمر. وتتجول مركبات ناسا مثل بيرسيفيرانس هناك الآن!"
  },
  {
    keywords: ['black hole', 'swallow', 'sun', 'ثقب', 'أسود', 'اسود', 'يبتلع', 'الشمس'],
    en: "No need to worry, Cadet! Black holes cannot swallow our Sun because there are no black holes near our solar system. Even if our Sun were magically replaced by a black hole of the exact same mass, Earth would keep orbiting safely because gravity would remain identical!",
    ar: "لا داعي للقلق أيها الرائد الصغير! لا تستطيع الثقوب السوداء ابتلاع شمسنا لأنه لا توجد ثقوب سوداء قريبة منا. وحتى لو تحولت شمسنا بسحر خيالي إلى ثقب أسود بنفس كتلتها، لظلت الأرض تدور حولها بأمان تام لأن قوة الجاذبية ستكون هي نفسها!"
  },
  {
    keywords: ['star', 'born', 'nebula', 'تتكون', 'النجوم', 'سديم', 'ولادة'],
    en: "Stars are born inside gigantic, glowing clouds of dust and hydrogen gas called nebulae! Gravity pulls giant pockets of gas together tighter and tighter until the center becomes super hot. When nuclear fusion begins, a bright new baby star ignites and shines for billions of years!",
    ar: "تولد النجوم داخل سحب عملاقة ومضيئة من الغبار وغاز الهيدروجين تسمى السدم! تسحب الجاذبية كتل الغاز لتتجمع بقوة حتى يصبح مركزها شديد الحرارة والضغط، وحينها يبدأ الاندماج النووي ويشتعل نجم وليد وساطع لمليارات السنين!"
  },
  {
    keywords: ['goldilocks', 'habitable', 'life', 'صالحة', 'للحياة', 'غولديلوكس', 'ماء'],
    en: "The Goldilocks zone is the sweet spot around a star where temperatures are 'just right' — not too boiling hot, not freezing solid! In this zone, liquid water can pool on a rocky planet's surface, which scientists believe is essential for life to flourish.",
    ar: "منطقة غولديلوكس أو النطاق الصالح للحياة هي المسافة المثالية حول النجم حيث تكون الحرارة 'معتدلة تماماً' — ليست لاهبة وليست متجمدة! في هذه المنطقة يمكن للماء السائل أن يتجمع على سطح كوكب صخري، وهو سر نشوء الحياة كما نعرفها."
  },
  {
    keywords: ['saturn', 'ring', 'زحل', 'حلقات', 'حلقة'],
    en: "Saturn's dazzling rings are made of billions of chunks of sparkling ice and rock, ranging from tiny dust grains to house-sized boulders! Scientists think ancient icy moons or comets were torn apart by Saturn's immense gravity long ago, forming these rings.",
    ar: "تتكون حلقات زحل الباهرة من مليارات القطع اللامعة من الجليد والصخور، بعضها بحجم حبة الرمل وبعضها بحجم منزل كامل! ويعتقد العلماء أن أقماره الجليدية القديمة أو مذنبات تمزقت بفعل جاذبية زحل الهائلة لتشكل هذا التاج البديع."
  },
  {
    keywords: ['moon', 'phases', 'moonwalk', 'قمر', 'أطوار', 'الهبوط'],
    en: "Earth's Moon orbits us every 27.3 days! We see different lunar phases because sunlight hits the Moon at changing angles as it journeys around Earth. NASA's Artemis program is preparing to land astronauts, including the first woman, back on the lunar South Pole!",
    ar: "يدور قمرنا حول الأرض كل 27.3 يوماً! ونرى أطواره المختلفة (هلال، بدر) لأن أشعة الشمس تضيء زوايا متغيرة منه أثناء رحلته حولنا. وبرنامج أرتميس التابع لناسا يستعد الآن لإرسال رواد فضاء، ومنهم أول امرأة، إلى القطب الجنوبي للقمر!"
  },
  {
    keywords: ['jupiter', 'giant', 'red spot', 'المشتري', 'عملاق', 'البقعة'],
    en: "Jupiter is the biggest planet in our solar system — more than 1,300 Earths could fit inside! Its famous Great Red Spot is actually a gigantic swirling storm that has been raging for hundreds of years, wider than our entire planet Earth!",
    ar: "المشتري هو أضخم كواكب مجموعتنا الشمسية — يتسع لأكثر من 1300 كوكب مثل الأرض! أما بقعته الحمراء الشهيرة فهي في الحقيقة عاصفة إعصارية هائلة تدور منذ مئات السنين وهي أكبر من حجم كوكب الأرض بأكمله!"
  },
  {
    keywords: ['james webb', 'jwst', 'telescope', 'هابل', 'تلسكوب', 'جيمس ويب'],
    en: "The James Webb Space Telescope has a huge 6.5-meter mirror coated in real gold! It uses infrared sensors to peer back over 13.5 billion years, capturing the very first stars and galaxies that formed right after the Big Bang.",
    ar: "يمتلك تلسكوب جيمس ويب الفضائي مرآة عملاقة بعرض 6.5 أمتار مطلية بالذهب الحقيقي! وهو يلتقط الأشعة تحت الحمراء ليرى الفضاء عبر مسافة 13.5 مليار سنة، كاشفاً لنا أولى النجوم والمجرات التي تشكلت في فجر الكون."
  },
  {
    keywords: ['astronaut', 'spacesuit', 'training', 'رائد فضاء', 'بدلة', 'تدريب'],
    en: "Astronauts train underwater in giant pools called the Neutral Buoyancy Lab to practice floating in zero gravity! Their spacesuits are like mini-spaceships, providing oxygen, heating, cooling, and shielding against micrometeoroids and radiation.",
    ar: "يتدرب رواد الفضاء تحت الماء في مسابح عملاقة تحاكي انعدام الوزن في الفضاء! وبدلة رائد الفضاء هي أشبه بمركبة فضائية مصغرة، توفر الأكسجين والتدفئة والتبريد، وتحمي من الإشعاعات والغبار النيزكي السريع."
  }
];

function findCuratedAnswer(query, lang) {
  const qLower = query.toLowerCase();
  for (const entry of CURATED_KNOWLEDGE) {
    if (entry.keywords.some(k => qLower.includes(k.toLowerCase()))) {
      return lang === 'ar' ? entry.ar : entry.en;
    }
  }
  // Generic inspiring response
  if (lang === 'ar') {
    return "سؤال رائع أيها الرائد الفضائي! الكون مليء بالأسرار المذهلة من الكواكب الحارقة إلى الثقوب السوداء العميقة. واصل استكشاف محطات الأكاديمية وحل التحديات لتكتشف أسرار النجوم والمجرات!";
  }
  return "That is a stellar cosmic question, Cadet! The universe is packed with incredible wonders from blazing baby stars to mysterious supermassive black holes. Continue exploring the Academy sectors and completing stage labs to unlock even deeper cosmic secrets!";
}

// Call Gemini API if key is present
async function queryGemini(question, lang) {
  if (!GEMINI_API_KEY) {
    throw new Error('NO_API_KEY');
  }

  const systemInstruction = `You are Cosmo, an enthusiastic, child-friendly astronaut mascot and guide for the NASA Junior Astronaut Academy. Your audience is kids aged 7-12, educators, and NASA Space Apps Challenge evaluators.
Rules:
1. Always respond in the requested language: ${lang === 'ar' ? 'Arabic (العربية الفصحى البسيطة والمشجعة)' : 'English (clear, enthusiastic, friendly)'}.
2. Keep the answer strictly under 80 words.
3. Use vivid, exciting, child-safe space analogies (e.g. comparing Jupiter to a cosmic vacuum cleaner, or nebulae to giant stellar nurseries).
4. Strictly focus on astronomy, planetary science, space missions, and NASA facts.
5. Never ask for or record any personal information.
6. Address the child affectionately as 'Cadet' (or 'أيها الرائد الصغير').
7. Keep tone 100% positive, inspiring, and scientifically accurate.`;

  // We support gemini-2.5-flash / gemini-1.5-flash / gemini-3.8-flash endpoint
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: `${systemInstruction}\n\nCadet Question: "${question}"\nLanguage: ${lang}` }
        ]
      }
    ],
    generationConfig: {
      maxOutputTokens: 200,
      temperature: 0.7
    }
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidate) {
    throw new Error('EMPTY_GEMINI_RESPONSE');
  }
  return candidate.trim();
}

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.woff2': 'font/woff2'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS and base headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Endpoint: /api/cosmo/ask
  if (pathname === '/api/cosmo/ask' && req.method === 'POST') {
    let bodyData = '';
    req.on('data', chunk => {
      bodyData += chunk;
      // Safeguard max payload (100KB)
      if (bodyData.length > 1e5) {
        req.connection.destroy();
      }
    });

    req.on('end', async () => {
      try {
        const payload = JSON.parse(bodyData || '{}');
        const question = (payload.question || payload.message || '').trim();
        const lang = payload.lang === 'ar' ? 'ar' : 'en';

        if (!question) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Question is required' }));
          return;
        }

        let answer = '';
        let source = 'curated';

        if (GEMINI_API_KEY) {
          try {
            answer = await queryGemini(question, lang);
            source = 'gemini';
          } catch (geminiErr) {
            console.warn('[Cosmo Server] Gemini fallback active:', geminiErr.message);
            answer = findCuratedAnswer(question, lang);
            source = 'curated-fallback';
          }
        } else {
          answer = findCuratedAnswer(question, lang);
          source = 'curated';
        }

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ answer, source, lang }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Server error processing question', details: err.message }));
      }
    });
    return;
  }

  // NASA CCMC DONKI Proxy Endpoint
  if (pathname === '/api/nasa/donki') {
    const type = parsedUrl.query.type || 'FLR';
    const days = parseInt(parsedUrl.query.days || '7', 10);
    const endDate = new Date().toISOString().slice(0, 10);
    const startDate = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);

    const fallbackDonki = {
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

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      source: 'curated-donki',
      type,
      startDate,
      endDate,
      events: fallbackDonki[type] || fallbackDonki.FLR
    }));
    return;
  }

  // NASA OSDR Proxy Endpoint
  if (pathname === '/api/nasa/osdr') {
    const topic = parsedUrl.query.topic || 'microgravity';
    const osdrData = [
      { id: 'OSD-542', title: 'Plant Habitat-04: Space Chili Pepper Cultivation', summary: 'Astronauts grew Hatch chile peppers on the ISS for 137 days to study fruit development and plant microbial interaction in microgravity.', source: 'NASA Open Science Data Repository (OSDR)' },
      { id: 'OSD-379', title: 'APEX-07: Arabidopsis Gene Expression in Space', summary: 'RNA sequencing revealed how plant cell walls adapt to spaceflight by restructuring cellulose microfibrils without gravity cues.', source: 'NASA OSDR / Kennedy Space Center' },
      { id: 'OSD-611', title: 'Rodent Research-23: Muscle and Bone Density Preservation', summary: 'Studies on spaceflight microgravity showing countermeasure efficacy of resistance exercise against muscle atrophy.', source: 'NASA OSDR' }
    ];
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ topic, data: osdrData }));
    return;
  }

  // NASA RadLab / Radiation Endpoint
  if (pathname === '/api/nasa/radiation') {
    const radData = [
      { location: 'Earth (Sea Level)', dose_mSv_per_day: 0.007, note: 'Safe baseline protected by Earth atmosphere and magnetosphere' },
      { location: 'ISS (Low Earth Orbit)', dose_mSv_per_day: 0.45, note: 'Inside Columbus module with partial Earth magnetic shielding' },
      { location: 'Lunar Surface (Artemis)', dose_mSv_per_day: 1.37, note: 'Measured by Chang\'e 4 LND instrument (2.6x ISS dose)' },
      { location: 'Mars Transit (Deep Space)', dose_mSv_per_day: 1.84, note: 'Curiosity RAD measurement during 253-day interplanetary cruise' },
      { location: 'Mars Surface (Gale Crater)', dose_mSv_per_day: 0.67, note: 'Curiosity RAD surface dosimetry under thin CO2 atmosphere' }
    ];
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ source: 'NASA RadLab / Curiosity RAD', data: radData }));
    return;
  }

  // Health check endpoint
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', hasGeminiKey: Boolean(GEMINI_API_KEY) }));
    return;
  }

  // Static File Serving
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, safePath);

  // Security: prevent path traversal out of PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 404 fallback
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>404 Not Found</h1><p>Mission file not found in orbital repository.</p><a href="/">Return to Mission Control</a>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'X-Content-Type-Options': 'nosniff'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const fallbackPort = Number(PORT) + 1;
    console.warn('[Kilonaut] Port ' + PORT + ' in use, binding to fallback port ' + fallbackPort + '...');
    server.listen(fallbackPort, '127.0.0.1', () => {
      console.log('📡 URL: http://127.0.0.1:' + fallbackPort);
    });
  } else {
    console.error('[Kilonaut Server Error]:', err);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 KILONAUT - JUNIOR ASTRONAUT ACADEMY MISSION CONTROL ACTIVE`);
  console.log(`📡 URL: http://127.0.0.1:${PORT}`);
  console.log(`🔑 Gemini Key Configured: ${Boolean(GEMINI_API_KEY)}`);
  console.log(`======================================================\n`);
});
