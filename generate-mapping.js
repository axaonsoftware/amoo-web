const path = require('path');
const fs = require('fs');

const base = 'https://res.cloudinary.com/iguqsxhj/image/upload';

const allImages = [
  'images/logo-footer.png', 'images/trust-candles.png',
  'images/deco-chakra-left.png', 'images/deco-chakra-right.png',
  'images/deco-footer-right.png', 'images/deco-testi-left.png',
  'images/deco-testi-right.png', 'images/guru-portrait.png',
  'images/hero-ico-1.png', 'images/hero-ico-2.png', 'images/hero-ico-3.png',
  'images/svc-1.png', 'images/svc-2.png', 'images/svc-3.png',
  'images/svc-4.png', 'images/svc-5.png', 'images/svc-6.png',
  'images/sw-1.png', 'images/sw-2.png', 'images/sw-3.png', 'images/sw-4.png',
  'images/sw-box.png',
  'images/t-1.png', 'images/t-2.png', 'images/t-3.png', 'images/t-4.png',
  'images/chakra-1.png', 'images/chakra-2.png', 'images/chakra-3.png',
  'images/chakra-4.png', 'images/chakra-5.png', 'images/chakra-6.png', 'images/chakra-7.png',
  'imagesP/amooLadyP.png', 'imagesP/aboutHeroPN.png', 'imagesP/aboutLady2.png',
  'imagesP/OmSignP.png', 'imagesP/lotus_candles_no_bg.png', 'imagesP/tarot_no_bg.png',
  'imagesP/certificate_1.png', 'imagesP/certificate_2.png', 'imagesP/certificate_3.png',
  'imagesP/certificate_4.png', 'imagesP/certificate_5.png',
  'imagesP/adminloginRightBg.jpg',
  'imagesP/amooLogoP.png', 'imagesP/blogPageHeroBgN.png',
  'imagesP/consultation_pricing.png', 'imagesP/serviceHeroBg.png',
  'imagesP/userRightSideLogin.png', 'imagesP/amooHomeHeroBgP.png',
  'imagesP/chakra_1.png', 'imagesP/chakra_2.png', 'imagesP/chakra_3.png',
  'imagesP/chakra_4.png', 'imagesP/chakra_5.png', 'imagesP/chakra_6.png', 'imagesP/chakra_7.png',
  'imagesP/badge_1.png', 'imagesP/badge_2.png', 'imagesP/badge_3.png',
  'imagesP/badge_4.png', 'imagesP/badge_5.png',
  'imagesP/circle_1.png', 'imagesP/circle_2.png', 'imagesP/circle_3.png',
  'imagesP/circle_4.png', 'imagesP/circle_5.png', 'imagesP/circle_6.png',
  'imagesP/name_numerology.png', 'imagesP/tarot_reading.png',
  'imagesP/kundli_generator.png', 'imagesP/reiki_healer.png',
  'imagesP/vastu_analyzer.png', 'imagesP/ai_astro_chat.png',
  'imagesP/past_life_analysis.png', 'imagesP/aura_scanner.png',
  'imagesP/numerologyHeroP.png', 'imagesP/softwareHero.jpg',
  'imagesP/tarotSoftwareHero.jpg', 'imagesP/numerology_software.png',
  'imagesP/daily_horoscope.png',
];

const mapping = {};
for (const local of allImages) {
  const ext = path.extname(local);
  const name = path.basename(local, ext);
  if (local.startsWith('images/')) {
    mapping[local] = `${base}/amoo/images/${name}${ext}`;
  } else {
    mapping[local] = `${base}/amoo/imagesP/${name}${ext}`;
  }
}

const mapPath = path.join(__dirname, 'cloudinary-map.json');
fs.writeFileSync(mapPath, JSON.stringify(mapping, null, 2));
console.log(`Mapping saved with ${Object.keys(mapping).length} entries.`);
console.log('Sample:', mapping['images/logo-footer.png']);
console.log('Sample:', mapping['imagesP/amooLogoP.png']);