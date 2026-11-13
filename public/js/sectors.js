/**
 * Kilonaut: Space Science Mission Control & Academy
 * Sector & Stage Specifications
 * 3 Sectors, 9 Progressive Stages, Badges & Astronomy Telemetry
 */

window.ACADEMY_SECTORS = [
  {
    id: 1,
    titleKey: "sector1_title",
    descKey: "sector1_desc",
    themeKey: "sector1_theme",
    color: "#F59E0B",
    glowColor: "rgba(245, 158, 11, 0.4)",
    icon: "🪐",
    stages: [
      {
        id: "s1_1",
        stageNum: 1,
        titleKey: "s1_1_title",
        subKey: "s1_1_sub",
        briefKey: "s1_1_brief",
        fact1Key: "s1_1_fact1",
        fact2Key: "s1_1_fact2",
        challengeKey: "s1_1_challenge",
        instructionKey: "s1_1_instruction",
        xpReward: 120,
        badge: {
          id: "badge_s1_1",
          icon: "☀️",
          nameEn: "8-Planet Solar Alignment Master",
          nameAr: "خبير محاذاة الكواكب الثمانية",
          descEn: "Aligned all eight planets from Mercury to Neptune by orbital distance.",
          descAr: "أتقن ترتيب كواكب المجموعة الشمسية الثمانية كاملة حسب بعدها عن الشمس."
        }
      },
      {
        id: "s1_2",
        stageNum: 2,
        titleKey: "s1_2_title",
        subKey: "s1_2_sub",
        briefKey: "s1_2_brief",
        fact1Key: "s1_2_fact1",
        fact2Key: "s1_2_fact2",
        challengeKey: "s1_2_challenge",
        instructionKey: "s1_2_instruction",
        xpReward: 140,
        badge: {
          id: "badge_s1_2",
          icon: "🪨",
          nameEn: "Asteroid Lane Ace",
          nameAr: "ملاح مسارات الكويكبات",
          descEn: "Steered probe safely past Ceres using precision mouse and touch controls.",
          descAr: "قاد المسبار بمهارة عبر حزام الكويكبات وجمع المنارات الذهبية."
        }
      },
      {
        id: "s1_3",
        stageNum: 3,
        titleKey: "s1_3_title",
        subKey: "s1_3_sub",
        briefKey: "s1_3_brief",
        fact1Key: "s1_3_fact1",
        fact2Key: "s1_3_fact2",
        challengeKey: "s1_3_challenge",
        instructionKey: "s1_3_instruction",
        xpReward: 160,
        badge: {
          id: "badge_s1_3",
          icon: "🚀",
          nameEn: "Planetary Expedition Ace",
          nameAr: "رائد استكشاف كواكب المجموعة",
          descEn: "Completed interactive science expeditions across 7 planetary worlds.",
          descAr: "أنجز المهمات الاستكشافية التفاعلية عبر كواكب المجموعة الشمسية السبعة."
        }
      }
    ]
  },
  {
    id: 2,
    titleKey: "sector2_title",
    descKey: "sector2_desc",
    themeKey: "sector2_theme",
    color: "#A855F7",
    glowColor: "rgba(168, 85, 247, 0.4)",
    icon: "🕳️",
    stages: [
      {
        id: "s2_1",
        stageNum: 1,
        titleKey: "s2_1_title",
        subKey: "s2_1_sub",
        briefKey: "s2_1_brief",
        fact1Key: "s2_1_fact1",
        fact2Key: "s2_1_fact2",
        challengeKey: "s2_1_challenge",
        instructionKey: "s2_1_instruction",
        xpReward: 130,
        badge: {
          id: "badge_s2_1",
          icon: "🌊",
          nameEn: "Ocean Moon Cartographer",
          nameAr: "راسم خرائط الأقمار المحيطية",
          descEn: "Mapped the hidden seas of Europa, volcanic Io, and cryogeysers of Enceladus.",
          descAr: "حدد محيطات أوروبا الباطنية، وبراكين إيو، وينابيع إنسيلادوس."
        }
      },
      {
        id: "s2_2",
        stageNum: 2,
        titleKey: "s2_2_title",
        subKey: "s2_2_sub",
        briefKey: "s2_2_brief",
        fact1Key: "s2_2_fact1",
        fact2Key: "s2_2_fact2",
        challengeKey: "s2_2_challenge",
        instructionKey: "s2_2_instruction",
        xpReward: 160,
        badge: {
          id: "badge_s2_2",
          icon: "🌀",
          nameEn: "Gravity Slingshot Master",
          nameAr: "قناص المقلاع الجاذبي",
          descEn: "Harnessed spacetime curvature to slingshot past the event horizon.",
          descAr: "سخر انحناء الزمكان للمناورة بأمان حول أفق الحدث الكوني."
        }
      },
      {
        id: "s2_3",
        stageNum: 3,
        titleKey: "s2_3_title",
        subKey: "s2_3_sub",
        briefKey: "s2_3_brief",
        fact1Key: "s2_3_fact1",
        fact2Key: "s2_3_fact2",
        challengeKey: "s2_3_challenge",
        instructionKey: "s2_3_instruction",
        xpReward: 160,
        badge: {
          id: "badge_s2_3",
          icon: "🔭",
          nameEn: "JWST Optical Wavefront Engineer",
          nameAr: "مهندس بصريات جيمس ويب",
          descEn: "Calibrated 6 gold hexagonal mirror laser reflection beams onto the central detector.",
          descAr: "حاذى حزم انعكاس مرايا الذهب السداسية لتركز الضوء في البؤرة المركزية."
        }
      }
    ]
  },
  {
    id: 3,
    titleKey: "sector3_title",
    descKey: "sector3_desc",
    themeKey: "sector3_theme",
    color: "#38BDF8",
    glowColor: "rgba(56, 189, 248, 0.4)",
    icon: "🌌",
    stages: [
      {
        id: "s3_1",
        stageNum: 1,
        titleKey: "s3_1_title",
        subKey: "s3_1_sub",
        briefKey: "s3_1_brief",
        fact1Key: "s3_1_fact1",
        fact2Key: "s3_1_fact2",
        challengeKey: "s3_1_challenge",
        instructionKey: "s3_1_instruction",
        xpReward: 140,
        badge: {
          id: "badge_s3_1",
          icon: "🧭",
          nameEn: "Galactic Radar Triangulator",
          nameAr: "ملاح رادار درب التبانة",
          descEn: "Triangulated Orion Spur pulsar beacons and central Sagittarius A* core radio source.",
          descAr: "رصد منارات ذراع الجبار اللاسلكية وإشارات الثقب الأسود في قلب المجرة."
        }
      },
      {
        id: "s3_2",
        stageNum: 2,
        titleKey: "s3_2_title",
        subKey: "s3_2_sub",
        briefKey: "s3_2_brief",
        fact1Key: "s3_2_fact1",
        fact2Key: "s3_2_fact2",
        challengeKey: "s3_2_challenge",
        instructionKey: "s3_2_instruction",
        xpReward: 150,
        badge: {
          id: "badge_s3_2",
          icon: "💥",
          nameEn: "Stellar Alchemist",
          nameAr: "خيميائي النجوم والمستعرات",
          descEn: "Chronicle star births in nebulae through supernovae, neutron stars, and white dwarfs.",
          descAr: "سجل مراحل ولادة النجوم وتحولها إلى مستعرات عظمى وأقزام بيضاء."
        }
      },
      {
        id: "s3_3",
        stageNum: 3,
        titleKey: "s3_3_title",
        subKey: "s3_3_sub",
        briefKey: "s3_3_brief",
        fact1Key: "s3_3_fact1",
        fact2Key: "s3_3_fact2",
        challengeKey: "s3_3_challenge",
        instructionKey: "s3_3_instruction",
        xpReward: 200,
        badge: {
          id: "badge_s3_3",
          icon: "👑",
          nameEn: "Kilonaut Academy Master Commander",
          nameAr: "قائد أسطول كيلونوت الفضائي",
          descEn: "Discovered habitable alien worlds and graduated with the highest Commander rank.",
          descAr: "اكتشف العوالم الصالحة للحياة وتخرج بأعلى رتبة قيادية في أكاديمية كيلونوت."
        }
      }
    ]
  }
];

window.getStageById = function(stageId) {
  for (const sector of window.ACADEMY_SECTORS) {
    for (const stage of sector.stages) {
      if (stage.id === stageId) {
        return { sector, stage };
      }
    }
  }
  return null;
};
