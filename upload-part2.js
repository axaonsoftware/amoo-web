const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: 'iguqsxhj',
  api_key: '732515548126786',
  api_secret: 'XebKr-5iUJtLO3s0czO67hblXDU'
});

const imagesDir = path.join(__dirname, 'amoo-web', 'public');

const imagesToUpload = [
  { local: 'imagesP/amooLogoP.png', id: 'amoo/imagesP/amooLogoP' },
  { local: 'imagesP/blogPageHeroBgN.png', id: 'amoo/imagesP/blogPageHeroBgN' },
  { local: 'imagesP/consultation_pricing.png', id: 'amoo/imagesP/consultation_pricing' },
  { local: 'imagesP/serviceHeroBg.png', id: 'amoo/imagesP/serviceHeroBg' },
  { local: 'imagesP/userRightSideLogin.png', id: 'amoo/imagesP/userRightSideLogin' },
  { local: 'imagesP/amooHomeHeroBgP.png', id: 'amoo/imagesP/amooHomeHeroBgP' },
  { local: 'imagesP/chakra_1.png', id: 'amoo/imagesP/chakra_1' },
  { local: 'imagesP/chakra_2.png', id: 'amoo/imagesP/chakra_2' },
  { local: 'imagesP/chakra_3.png', id: 'amoo/imagesP/chakra_3' },
  { local: 'imagesP/chakra_4.png', id: 'amoo/imagesP/chakra_4' },
  { local: 'imagesP/chakra_5.png', id: 'amoo/imagesP/chakra_5' },
  { local: 'imagesP/chakra_6.png', id: 'amoo/imagesP/chakra_6' },
  { local: 'imagesP/chakra_7.png', id: 'amoo/imagesP/chakra_7' },
  { local: 'imagesP/badge_1.png', id: 'amoo/imagesP/badge_1' },
  { local: 'imagesP/badge_2.png', id: 'amoo/imagesP/badge_2' },
  { local: 'imagesP/badge_3.png', id: 'amoo/imagesP/badge_3' },
  { local: 'imagesP/badge_4.png', id: 'amoo/imagesP/badge_4' },
  { local: 'imagesP/badge_5.png', id: 'amoo/imagesP/badge_5' },
  { local: 'imagesP/circle_1.png', id: 'amoo/imagesP/circle_1' },
  { local: 'imagesP/circle_2.png', id: 'amoo/imagesP/circle_2' },
  { local: 'imagesP/circle_3.png', id: 'amoo/imagesP/circle_3' },
  { local: 'imagesP/circle_4.png', id: 'amoo/imagesP/circle_4' },
  { local: 'imagesP/circle_5.png', id: 'amoo/imagesP/circle_5' },
  { local: 'imagesP/circle_6.png', id: 'amoo/imagesP/circle_6' },
  { local: 'imagesP/name_numerology.png', id: 'amoo/imagesP/name_numerology' },
  { local: 'imagesP/tarot_reading.png', id: 'amoo/imagesP/tarot_reading' },
  { local: 'imagesP/kundli_generator.png', id: 'amoo/imagesP/kundli_generator' },
  { local: 'imagesP/reiki_healer.png', id: 'amoo/imagesP/reiki_healer' },
  { local: 'imagesP/vastu_analyzer.png', id: 'amoo/imagesP/vastu_analyzer' },
  { local: 'imagesP/ai_astro_chat.png', id: 'amoo/imagesP/ai_astro_chat' },
  { local: 'imagesP/past_life_analysis.png', id: 'amoo/imagesP/past_life_analysis' },
  { local: 'imagesP/aura_scanner.png', id: 'amoo/imagesP/aura_scanner' },
  { local: 'imagesP/numerologyHeroP.png', id: 'amoo/imagesP/numerologyHeroP' },
  { local: 'imagesP/softwareHero.jpg', id: 'amoo/imagesP/softwareHero' },
  { local: 'imagesP/tarotSoftwareHero.jpg', id: 'amoo/imagesP/tarotSoftwareHero' },
  { local: 'imagesP/numerology_software.png', id: 'amoo/imagesP/numerology_software' },
  { local: 'imagesP/daily_horoscope.png', id: 'amoo/imagesP/daily_horoscope' },
];

const results = {};

async function uploadOne(img) {
  const fullPath = path.join(imagesDir, img.local);
  if (!fs.existsSync(fullPath)) {
    console.log(`SKIP: ${img.local}`);
    return;
  }
  try {
    const result = await cloudinary.uploader.upload(fullPath, {
      public_id: img.id,
      overwrite: true,
      resource_type: 'image'
    });
    results[img.local] = result.secure_url;
    console.log(`OK: ${img.local}`);
  } catch (err) {
    console.log(`FAIL: ${img.local} - ${err.message}`);
  }
}

async function main() {
  // Upload in batches of 5
  const batchSize = 5;
  for (let i = 0; i < imagesToUpload.length; i += batchSize) {
    const batch = imagesToUpload.slice(i, i + batchSize);
    await Promise.all(batch.map(uploadOne));
  }
  const mapPath = path.join(__dirname, 'cloudinary-map.json');
  fs.writeFileSync(mapPath, JSON.stringify(results, null, 2));
  console.log(`\nDone! ${Object.keys(results).length} images uploaded.`);
}

main();