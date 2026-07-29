const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: 'iguqsxhj',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const imagesDir = path.join(__dirname, 'amoo-web', 'public');

// All unique images referenced in the codebase (local path -> Cloudinary public_id)
const imagesToUpload = [
  // From /images/
  { local: 'images/logo-footer.png', id: 'amoo/images/logo-footer' },
  { local: 'images/trust-candles.png', id: 'amoo/images/trust-candles' },
  { local: 'images/deco-chakra-left.png', id: 'amoo/images/deco-chakra-left' },
  { local: 'images/deco-chakra-right.png', id: 'amoo/images/deco-chakra-right' },
  { local: 'images/deco-footer-right.png', id: 'amoo/images/deco-footer-right' },
  { local: 'images/deco-testi-left.png', id: 'amoo/images/deco-testi-left' },
  { local: 'images/deco-testi-right.png', id: 'amoo/images/deco-testi-right' },
  { local: 'images/guru-portrait.png', id: 'amoo/images/guru-portrait' },
  { local: 'images/hero-ico-1.png', id: 'amoo/images/hero-ico-1' },
  { local: 'images/hero-ico-2.png', id: 'amoo/images/hero-ico-2' },
  { local: 'images/hero-ico-3.png', id: 'amoo/images/hero-ico-3' },
  { local: 'images/svc-1.png', id: 'amoo/images/svc-1' },
  { local: 'images/svc-2.png', id: 'amoo/images/svc-2' },
  { local: 'images/svc-3.png', id: 'amoo/images/svc-3' },
  { local: 'images/svc-4.png', id: 'amoo/images/svc-4' },
  { local: 'images/svc-5.png', id: 'amoo/images/svc-5' },
  { local: 'images/svc-6.png', id: 'amoo/images/svc-6' },
  { local: 'images/sw-1.png', id: 'amoo/images/sw-1' },
  { local: 'images/sw-2.png', id: 'amoo/images/sw-2' },
  { local: 'images/sw-3.png', id: 'amoo/images/sw-3' },
  { local: 'images/sw-4.png', id: 'amoo/images/sw-4' },
  { local: 'images/sw-box.png', id: 'amoo/images/sw-box' },
  { local: 'images/t-1.png', id: 'amoo/images/t-1' },
  { local: 'images/t-2.png', id: 'amoo/images/t-2' },
  { local: 'images/t-3.png', id: 'amoo/images/t-3' },
  { local: 'images/t-4.png', id: 'amoo/images/t-4' },
  { local: 'images/chakra-1.png', id: 'amoo/images/chakra-1' },
  { local: 'images/chakra-2.png', id: 'amoo/images/chakra-2' },
  { local: 'images/chakra-3.png', id: 'amoo/images/chakra-3' },
  { local: 'images/chakra-4.png', id: 'amoo/images/chakra-4' },
  { local: 'images/chakra-5.png', id: 'amoo/images/chakra-5' },
  { local: 'images/chakra-6.png', id: 'amoo/images/chakra-6' },
  { local: 'images/chakra-7.png', id: 'amoo/images/chakra-7' },
  // From /imagesP/
  { local: 'imagesP/amooLadyP.png', id: 'amoo/imagesP/amooLadyP' },
  { local: 'imagesP/aboutHeroPN.png', id: 'amoo/imagesP/aboutHeroPN' },
  { local: 'imagesP/aboutLady2.png', id: 'amoo/imagesP/aboutLady2' },
  { local: 'imagesP/OmSignP.png', id: 'amoo/imagesP/OmSignP' },
  { local: 'imagesP/lotus_candles_no_bg.png', id: 'amoo/imagesP/lotus_candles_no_bg' },
  { local: 'imagesP/tarot_no_bg.png', id: 'amoo/imagesP/tarot_no_bg' },
  { local: 'imagesP/certificate_1.png', id: 'amoo/imagesP/certificate_1' },
  { local: 'imagesP/certificate_2.png', id: 'amoo/imagesP/certificate_2' },
  { local: 'imagesP/certificate_3.png', id: 'amoo/imagesP/certificate_3' },
  { local: 'imagesP/certificate_4.png', id: 'amoo/imagesP/certificate_4' },
  { local: 'imagesP/certificate_5.png', id: 'amoo/imagesP/certificate_5' },
  { local: 'imagesP/adminloginRightBg.jpg', id: 'amoo/imagesP/adminloginRightBg' },
  { local: 'imagesP/amooLogoPNew.png', id: 'amoo/imagesP/amooLogoPNew' },
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

async function uploadImage(localPath, publicId) {
  const fullPath = path.join(imagesDir, localPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`SKIP (not found): ${localPath}`);
    return null;
  }
  try {
    const result = await cloudinary.uploader.upload(fullPath, {
      public_id: publicId,
      overwrite: true,
      resource_type: 'image',
      folder: ''
    });
    console.log(`OK: ${localPath} -> ${result.secure_url}`);
    return { local: localPath, url: result.secure_url };
  } catch (err) {
    console.error(`FAIL: ${localPath} - ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('Starting upload of used images to Cloudinary...\n');
  const results = [];
  for (const img of imagesToUpload) {
    const r = await uploadImage(img.local, img.id);
    if (r) results.push(r);
  }
  // Write mapping file as {localPath: cloudUrl} — the format expected by
  // replace-local-images.js.  uploadImage returns {local, url} items, so we
  // convert the array to an object keyed by local path.
  const mapPath = path.join(__dirname, 'cloudinary-map.json');
  const mapping = Object.fromEntries(results.filter(Boolean).map((r) => [r.local, r.url]));
  fs.writeFileSync(mapPath, JSON.stringify(mapping, null, 2));
  console.log(`\nDone! ${Object.keys(mapping).length} images uploaded.`);
  console.log(`Mapping saved to: ${mapPath}`);
}

main().catch(console.error);