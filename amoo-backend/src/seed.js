require("dotenv").config();
const logger = require("./utils/logger");

// SECURITY: this script inserts demo accounts with well-known passwords. It must
// never run against production data. Checked before ./config/db is required, so
// we neither load production config nor open a connection.
if (process.env.NODE_ENV === "production") {
  logger.error(
    "Refusing to seed: NODE_ENV=production. This script inserts demo accounts with known passwords."
  );
  process.exit(1);
}

const bcrypt = require("bcryptjs");
const { pool, testConnection } = require("./config/db");

async function seed() {
  logger.info("Seeding database...");

  // Admin
  // SECURITY: `id = id` is a deliberate no-op. Re-seeding must never overwrite
  // an existing admin's password hash — updating it here would reset a strong
  // password back to the well-known seed value.
  const adminHash = await bcrypt.hash("admin123", 12);
  await pool.query(
    `INSERT INTO admins (name, email, password_hash, role)
     VALUES ('Admin', 'admin@amooguru.com', ?, 'admin')
     ON DUPLICATE KEY UPDATE id = id`,
    [adminHash]
  );

  // Users
  const userHash = await bcrypt.hash("user123", 12);
  const users = [
    ["Vedika Desai", "vedika.desai@gmail.com", "+91 98765 43210", "premium", "active", 1],
    ["Rahul Sharma", "rahulsharma@gmail.com", "+91 87654 32109", "premium", "active", 1],
    ["Neha Verma", "neha.verma@gmail.com", "+91 91234 56789", "free", "active", 0],
    ["Amit Patel", "amit.patel@gmail.com", "+91 99887 76655", "consultant", "active", 1],
    ["Pooja Mehta", "pooja.mehta@gmail.com", "+91 88776 65544", "premium", "blocked", 1],
  ];
  for (const u of users) {
    const row = [u[0], u[1], u[2], userHash, u[3], u[4], u[5]];
    await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, role, status, verified)
       VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      row
    );
  }

  // Experts
  const expertHash = await bcrypt.hash("expert123", 12);
  const experts = [
    ["Ast. Neha Sharma", "neha@amooguru.com", "Vedic Astrology", "vedic", 4.8],
    ["Ast. Pooja Mehta", "pooja@amooguru.com", "Tarot Expert", "tarot", 4.7],
    ["Ast. Vikram Joshi", "vikram@amooguru.com", "Numerology Expert", "numerology", 4.9],
    ["Ast. Anjali Singh", "anjali@amooguru.com", "Vastu Expert", "vastu", 4.6],
  ];
  for (const e of experts) {
    await pool.query(
      `INSERT INTO experts (name, email, password_hash, verified, role_title, specialties, rating)
       VALUES (?,?,?,1,?,?,?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), verified = 1`,
      [e[0], e[1], expertHash, e[2], e[3], e[4]]
    );
  }

  // Services
  const services = [
    ["Numerology Report", "Complete life path analysis", "/imagesP/name_numerology.png", "Numerology", "Report", 999, "Instant", "Active", 325],
    ["Tarot Reading", "3 Card Spread", "/imagesP/tarot_reading.png", "Tarot", "Consultation", 799, "30 mins", "Active", 286],
    ["Kundli Reading", "Vedic Birth Chart Analysis", "/imagesP/kundli_generator.png", "Astrology", "Consultation", 1499, "60 mins", "Active", 412],
    ["Reiki Healing Session", "Distance Healing Therapy", "/imagesP/reiki_healer.png", "Healing", "Consultation", 999, "45 mins", "Active", 198],
    ["Vastu Consultation", "Home & Office Vastu", "/imagesP/vastu_analyzer.png", "Vastu", "Consultation", 1299, "60 mins", "Active", 167],
    ["AI Astro Chat", "Ask Any Astrology Question", "/imagesP/ai_astro_chat.png", "AI Services", "Chat", 199, "Per Chat", "Active", 642],
    ["Past Life Reading", "Past Life Analysis", "/imagesP/past_life_analysis.png", "Spiritual", "Report", 1199, "Instant", "Inactive", 54],
    ["Aura Report", "Energy Aura Analysis", "/imagesP/aura_scanner.png", "Healing", "Report", 599, "Instant", "Active", 213],
  ];
  for (const s of services) {
    await pool.query(
      `INSERT INTO services (name, sub, img, category, type, price, duration, status, bookings)
       VALUES (?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      s
    );
  }

  // Slots for expert 1
  for (let d = 0; d < 3; d++) {
    const date = new Date(Date.now() + d * 86400000).toISOString().slice(0, 10);
    for (const [start, end] of [["09:00:00", "09:30:00"], ["10:00:00", "10:30:00"], ["11:00:00", "11:30:00"]]) {
      await pool.query(
        "INSERT INTO slots (expert_id, date, start_time, end_time, status) VALUES (?,?,?,?, 'available') ON DUPLICATE KEY UPDATE status = status",
        [1, date, start, end]
      );
    }
  }

  // Packages
  await pool.query(
    `INSERT INTO packages (name, description, price, duration_days, status)
     VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    ["Premium Healing Package", "Unlimited reiki + tarot for 3 months", 4999, 90, "Active"]
  );

  // Coupons
  await pool.query(
    `INSERT INTO coupons (code, description, discount_type, discount_value, min_amount, max_uses, expires_at, active)
     VALUES ('WELCOME20', '20% off first booking', 'percent', 20, 0, 1000, DATE_ADD(NOW(), INTERVAL 60 DAY), 1)
     ON DUPLICATE KEY UPDATE code = code`
  );

  // Wallet for first user
  await pool.query(
    `INSERT INTO wallets (user_id, balance) VALUES (1, 1500) ON DUPLICATE KEY UPDATE balance = VALUES(balance)`
  );
  await pool.query(
    "INSERT INTO wallet_transactions (wallet_id, amount, type, reason) SELECT id, 1500, 'credit', 'Welcome bonus' FROM wallets WHERE user_id = 1 AND NOT EXISTS (SELECT 1 FROM wallet_transactions wt WHERE wt.wallet_id = wallets.id)"
  );

  // Subscription for first user
  await pool.query(
    `INSERT INTO subscriptions (user_id, package_id, plan_name, expires_at)
     VALUES (1, 1, 'Premium Healing Package', DATE_ADD(NOW(), INTERVAL 90 DAY))
     ON DUPLICATE KEY UPDATE plan_name = VALUES(plan_name)`
  );

  // Notifications
  await pool.query(
    `INSERT INTO notifications (user_id, title, message, type) VALUES
     (1, 'Booking confirmed', 'Your Kundli Reading is confirmed.', 'booking'),
     (1, 'New report ready', 'Your Numerology report is ready to download.', 'report'),
     (NULL, 'Festive offer', 'Get 20% off on all Tarot readings this week!', 'offer')`
  );

  // Contacts
  await pool.query(
    `INSERT INTO contacts (name, email, phone, subject, message) VALUES
     ('Guest User', 'guest@example.com', '+91 90000 00000', 'Service query', 'Want to know about Reiki healing.')`
  );

  // Testimonials
  await pool.query(
    `INSERT INTO testimonials (name, comment, rating, status) VALUES
     ('Riya Kapoor', 'The numerology report was spot on and transformative.', 5, 'Active'),
     ('Arjun Mehta', 'Tarot reading gave me clarity about my career path.', 5, 'Active')
     ON DUPLICATE KEY UPDATE comment = comment`
  );

  // Blogs
  const blogs = [
    ["what-is-spiritual-awakening", "What is Spiritual Awakening? Signs, Stages & How to Embrace It", "Spiritual awakening is the first step towards understanding your true self and the universe. Learn the signs, stages and ways to embrace this beautiful journey.", "<h2>What is Spiritual Awakening?</h2><p>Spiritual awakening is a profound shift in consciousness where you begin to perceive life beyond the material world. It is the process of recognising your deeper self and your connection to the universe.</p><h2>Signs of Spiritual Awakening</h2><ul><li>Heightened intuition and inner knowing</li><li>Seeing synchronicities everywhere</li><li>A deep sense of inner peace and joy</li><li>Increased compassion and empathy</li><li>A strong desire for truth and self-discovery</li><li>Questioning old beliefs and patterns</li><li>Detachment from negativity and toxic people</li><li>A deep connection with nature and the universe</li></ul><h2>Stages of Spiritual Awakening</h2><p><strong>Stage 1 — Seeking:</strong> A deep inner search begins. You start asking fundamental questions about life, purpose and meaning.</p><p><strong>Stage 2 — Awakening:</strong> You start noticing the signs — synchronicities, heightened awareness and a shift in perspective.</p><p><strong>Stage 3 — Transformation:</strong> Old patterns start to fade. You release what no longer serves you and embrace change.</p><p><strong>Stage 4 — Growth:</strong> You embrace your higher self. Meditation, mindfulness and spiritual practices become part of your daily life.</p><p><strong>Stage 5 — Alignment:</strong> You live in harmony and purpose. Your actions align with your spiritual values.</p><h2>How to Embrace Spiritual Awakening</h2><ol><li>Meditate daily and connect with your inner self</li><li>Practice gratitude and mindfulness</li><li>Let go of fear, guilt and limiting beliefs</li><li>Surround yourself with positive and uplifting energy</li><li>Listen to your intuition and trust the journey</li></ol><h2>Benefits of Spiritual Awakening</h2><p>Spiritual awakening brings clarity, peace, purpose and a deeper understanding of yourself and the world around you. It transforms how you relate to others and handle challenges.</p><h2>Final Thoughts</h2><p>Embrace the journey with an open heart. Every step, even the difficult ones, brings you closer to your true self.</p>", "Spirituality", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", "Surinder Kaur Sehgal", "/images/t-1.png", "8 min read"],
    ["life-path-numbers-1-to-9", "Life Path Numbers 1 to 9: Meaning and Characteristics", "Discover what your life path number reveals about your personality, strengths and life purpose.", "<h2>Understanding Life Path Numbers</h2><p>Your Life Path Number is calculated from your date of birth and reveals your core personality, strengths and the challenges you may face.</p><h2>Life Path 1 — The Leader</h2><p>Independent, ambitious and determined. Path 1 individuals are natural born leaders who forge their own path.</p><h2>Life Path 2 — The Peacemaker</h2><p>Sensitive, cooperative and diplomatic. Path 2 people bring harmony and build meaningful relationships.</p><h2>Life Path 3 — The Creative</h2><p>Expressive, optimistic and imaginative. Path 3 individuals thrive in creative fields and social settings.</p><h2>Life Path 4 — The Builder</h2><p>Practical, disciplined and hardworking. Path 4 people create lasting foundations through dedication.</p><h2>Life Path 5 — The Freedom Seeker</h2><p>Adventurous, versatile and curious. Path 5 individuals crave variety and new experiences.</p><h2>Life Path 6 — The Nurturer</h2><p>Responsible, caring and harmonious. Path 6 people are devoted to family and community.</p><h2>Life Path 7 — The Seeker</h2><p>Analytical, introspective and spiritual. Path 7 individuals pursue deep knowledge and understanding.</p><h2>Life Path 8 — The Achiever</h2><p>Ambitious, confident and material-focused. Path 8 people are driven toward success and abundance.</p><h2>Life Path 9 — The Humanitarian</h2><p>Compassionate, generous and idealistic. Path 9 individuals are called to serve the greater good.</p>", "Numerology", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80", "Vikram Joshi", "/images/t-1.png", "6 min read"],
    ["how-tarot-cards-guide-daily-life", "How Tarot Cards Can Guide You in Daily Life", "Learn how to use tarot cards as a powerful tool for daily guidance, self-reflection and decision making.", "<h2>Tarot Beyond Fortune Telling</h2><p>Tarot cards are not just for predicting the future. They are a powerful mirror for self-reflection and daily guidance.</p><h2>Morning Card Pull</h2><p>Start your day by pulling a single card. Reflect on how its message might apply to your day ahead. This simple practice builds intuition over time.</p><h2>Decision Making with Tarot</h2><p>When facing a decision, draw cards representing your options. The imagery can help you access your subconscious wisdom and see situations from new angles.</p><h2>Journaling with Tarot</h2><p>Keep a tarot journal. Record your daily cards, your interpretations and how they connected to your experiences. Over time, patterns emerge that deepen your understanding.</p><h2>Tips for Beginners</h2><ul><li>Start with a simple three-card spread</li><li>Trust your first impressions of the imagery</li><li>Study one card at a time</li><li>Use tarot as a conversation with your inner self</li></ul>", "Tarot", "https://images.unsplash.com/photo-1598919021353-e3f39f3ecbab?w=600&q=80", "Pooja Mehta", "/images/t-1.png", "7 min read"],
    ["understanding-your-kundali", "Understanding Your Kundali: Planets & Their Impact", "A beginner-friendly guide to reading your kundali and understanding how planetary positions shape your life.", "<h2>What is a Kundali?</h2><p>A Kundali (birth chart) is a celestial map of the planets at the exact moment of your birth. It reveals your personality, career, relationships and life events.</p><h2>The Nine Planets</h2><p><strong>Sun (Surya):</strong> Represents your core identity, confidence and leadership.</p><p><strong>Moon (Chandra):</strong> Governs emotions, intuition and nurturing qualities.</p><p><strong>Mars (Mangal):</strong> Drives energy, courage and ambition.</p><p><strong>Mercury (Budh):</strong> Rules communication, intelligence and analytical thinking.</p><p><strong>Jupiter (Guru):</strong> Brings wisdom, expansion and good fortune.</p><p><strong>Venus (Shukra):</strong> Governs love, beauty and creativity.</p><p><strong>Saturn (Shani):</strong> Teaches discipline, patience and responsibility.</p><p><strong>Rahu:</strong> Represents ambition, illusion and material desires.</p><p><strong>Ketu:</strong> Signifies spiritual growth, detachment and past life karma.</p><h2>How to Read Your Kundali</h2><p>Each planet sits in a specific house and sign, creating unique combinations. A professional astrologer can interpret these combinations to provide life guidance.</p>", "Kundali", "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4d5?w=600&q=80", "Neha Sharma", "/images/t-1.png", "9 min read"],
    ["reiki-healing-benefits", "Reiki Healing Benefits for Mind, Body and Soul", "Explore the transformative benefits of Reiki healing for stress relief, emotional balance and overall wellbeing.", "<h2>What is Reiki?</h2><p>Reiki is a Japanese energy healing technique that promotes relaxation, stress reduction and healing through gentle touch or distance healing.</p><h2>Benefits for Mind</h2><ul><li>Reduces stress and anxiety</li><li>Improves focus and mental clarity</li><li>Promotes emotional release and balance</li><li>Enhances meditation practice</li></ul><h2>Benefits for Body</h2><ul><li>Supports natural healing processes</li><li>Relieves tension and chronic pain</li><li>Improves sleep quality</li><li>Boosts the immune system</li></ul><h2>Benefits for Soul</h2><ul><li>Deepens spiritual connection</li><li>Brings a sense of purpose and meaning</li><li>Facilitates personal transformation</li><li>Cultivates inner peace and compassion</li></ul><h2>What to Expect in a Session</h2><p>A typical Reiki session lasts 45-60 minutes. You lie comfortably while the practitioner channels healing energy. Many people feel warmth, tingling or deep relaxation.</p>", "Reiki & Healing", "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80", "Anjali Singh", "/images/t-1.png", "6 min read"],
    ["vastu-tips-wealth-health-happiness", "Vastu Tips for Wealth, Health and Happiness", "Simple Vastu tips for your home and office that can invite prosperity, good health and harmony into your life.", "<h2>Introduction to Vastu</h2><p>Vastu Shastra is the ancient Indian science of architecture that harmonises your living space with natural energies.</p><h2>Wealth Tips</h2><ul><li>Keep the north-east corner of your home clean and clutter-free</li><li>Place a water fountain in the north direction</li><li>Use earthy tones in the south-west area</li><li>Maintain a clean and organised kitchen</li></ul><h2>Health Tips</h2><ul><li>Sleep with your head pointing south or east</li><li>Ensure proper ventilation in all rooms</li><li>Place healthy plants in the east sector</li><li>Avoid mirrors facing the bed</li></ul><h2>Happiness Tips</h2><ul><li>Place family photos in the north-west</li><li>Use warm lighting in the living room</li><li>Keep the entrance well-lit and welcoming</li><li>Maintain a balanced five-element presence</li></ul>", "Vastu", "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80", "Anjali Singh", "/images/t-1.png", "5 min read"],
    ["daily-spiritual-practices", "5 Daily Spiritual Practices for Inner Peace", "Incorporate these five simple spiritual practices into your daily routine for lasting inner peace and clarity.", "<h2>The Power of Daily Practice</h2><p>Consistency is the key to spiritual growth. Even small daily practices can transform your life over time.</p><h2>1. Morning Meditation</h2><p>Begin each day with 10-15 minutes of stillness. Focus on your breath and set a positive intention for the day.</p><h2>2. Gratitude Journaling</h2><p>Write down three things you are grateful for each morning. This shifts your mindset toward abundance and positivity.</p><h2>3. Mindful Breathing</h2><p>Take three conscious breaths before each meal. This simple act brings you back to the present moment.</p><h2>4. Evening Reflection</h2><p>Before bed, reflect on your day. What went well? What can you improve? End with a moment of forgiveness and peace.</p><h2>5. Nature Connection</h2><p>Spend at least 10 minutes in nature daily. Walk barefoot on grass, watch the sunrise or simply observe the trees.</p>", "Spirituality", "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=600&q=80", "Surinder Kaur Sehgal", "/images/t-1.png", "6 min read"],
    ["master-numbers-11-22-33", "Master Numbers 11, 22, 33: Hidden Powers Revealed", "Unlock the secrets of master numbers in numerology and discover the extraordinary potential they carry.", "<h2>What Are Master Numbers?</h2><p>Master numbers 11, 22 and 33 carry a higher spiritual vibration than other numbers. They represent immense potential but also greater challenges.</p><h2>Master Number 11 — The Intuitive</h2><p>Number 11 represents intuition, spiritual insight and illumination. These individuals are often old souls with deep inner wisdom.</p><h2>Master Number 22 — The Master Builder</h2><p>Number 22 combines visionary dreaming with practical building. These individuals can manifest grand visions into reality.</p><h2>Master Number 33 — The Master Teacher</h2><p>Number 33 represents compassion, healing and spiritual teaching. These individuals are here to uplift and inspire humanity.</p><h2>Embracing Your Master Number</h2><p>If you have a master number in your chart, embrace the extra responsibility it brings. Your path is one of service and transformation.</p>", "Numerology", "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&q=80", "Vikram Joshi", "/images/t-1.png", "7 min read"],
    ["major-arcana-explained", "Major Arcana Explained: The Fool to The World", "A comprehensive guide to all 22 Major Arcana cards and their deep spiritual meanings.", "<h2>The Major Arcana Journey</h2><p>The 22 Major Arcana cards tell the story of the soul's journey — from innocence to spiritual completion.</p><h2>Key Cards Explained</h2><p><strong>The Fool (0):</strong> New beginnings, innocence and taking a leap of faith.</p><p><strong>The Magician (I):</strong> Manifestation, power and resourcefulness.</p><p><strong>The High Priestess (II):</strong> Intuition, mystery and inner knowledge.</p><p><strong>The Empress (III):</strong> Abundance, nurturing and feminine energy.</p><p><strong>The Emperor (IV):</strong> Authority, structure and stability.</p><p><strong>The Hierophant (V):</strong> Tradition, spiritual wisdom and teaching.</p><p><strong>The Lovers (VI):</strong> Love, harmony and meaningful choices.</p><p><strong>The Chariot (VII):</strong> Determination, willpower and triumph.</p><p><strong>Strength (VIII):</strong> Inner courage, patience and compassion.</p><p><strong>The Hermit (IX):</strong> Soul-searching, solitude and inner guidance.</p><p><strong>Wheel of Fortune (X):</strong> Change, cycles and destiny.</p><p><strong>Justice (XI):</strong> Fairness, truth and karmic balance.</p><p><strong>The Hanged Man (XII):</strong> Surrender, new perspective and patience.</p><p><strong>Death (XIII):</strong> Transformation, endings and new beginnings.</p><p><strong>Temperance (XIV):</strong> Balance, moderation and patience.</p><p><strong>The Devil (XV):</strong> Shadow work, attachment and breaking free.</p><p><strong>The Tower (XVI):</strong> Sudden change, upheaval and revelation.</p><p><strong>The Star (XVII):</strong> Hope, inspiration and renewal.</p><p><strong>The Moon (XVIII):</strong> Illusion, fear and the subconscious.</p><p><strong>The Sun (XIX):</strong> Joy, success and vitality.</p><p><strong>Judgement (XX):</strong> Reflection, reckoning and calling.</p><p><strong>The World (XXI):</strong> Completion, integration and accomplishment.</p>", "Tarot", "https://images.unsplash.com/photo-1614574340774-268d1beafa2a?w=600&q=80", "Pooja Mehta", "/images/t-1.png", "10 min read"],
    ["saturn-sade-sati", "How Saturn Sade Sati Affects Your Life", "Understanding the seven-and-a-half-year Saturn cycle and how to navigate its challenges with grace.", "<h2>What is Sade Sati?</h2><p>Sade Sati is a 7.5-year period when Saturn transits through the 12th, 1st and 2nd houses from your Moon sign. It is considered one of the most impactful cycles in Vedic astrology.</p><h2>The Three Phases</h2><p><strong>Phase 1 (12th house):</strong> Loss of sleep, expenses increase, spiritual growth begins.</p><p><strong>Phase 2 (1st house):</strong> Health challenges, self-reflection, career shifts.</p><p><strong>Phase 3 (2nd house):</strong> Financial adjustments, family matters, resolution.</p><h2>How to Navigate Sade Sati</h2><ul><li>Practice patience and discipline</li><li>Chant Hanuman Chalisa regularly</li><li>Donate to the needy on Saturdays</li><li>Wear a blue sapphire after proper consultation</li><li>Maintain a consistent spiritual practice</li></ul><h2>The Silver Lining</h2><p>While challenging, Sade Sati is also a period of tremendous growth. Saturn rewards those who work hard, stay humble and embrace discipline.</p>", "Kundali", "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&q=80", "Neha Sharma", "/images/t-1.png", "8 min read"],
    ["chakra-healing", "Chakra Healing: Unblock Your Energy Centers", "Learn about the seven major chakras and practical techniques to restore balance and flow in your energy system.", "<h2>Understanding the Chakras</h2><p>The seven chakras are energy centres along the spine. When balanced, they support physical, emotional and spiritual health.</p><h2>The Seven Chakras</h2><p><strong>Root Chakra (Muladhara):</strong> Foundation, safety and grounding. Red.</p><p><strong>Sacral Chakra (Svadhisthana):</strong> Creativity, pleasure and emotions. Orange.</p><p><strong>Solar Plexus (Manipura):</strong> Confidence, personal power and will. Yellow.</p><p><strong>Heart Chakra (Anahata):</strong> Love, compassion and healing. Green.</p><p><strong>Throat Chakra (Vishuddha):</strong> Communication, truth and expression. Blue.</p><p><strong>Third Eye (Ajna):</strong> Intuition, insight and imagination. Indigo.</p><p><strong>Crown Chakra (Sahasrara):</strong> Spiritual connection and divine awareness. Violet.</p><h2>Healing Techniques</h2><ul><li>Chakra meditation and visualisation</li><li>Crystal healing and aromatherapy</li><li>Sound healing with singing bowls</li><li>Yoga and breathwork</li><li>Reiki energy healing</li></ul>", "Reiki & Healing", "https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&q=80", "Anjali Singh", "/images/t-1.png", "7 min read"],
    ["vastu-for-home", "Vastu for Home: Room-by-Room Guide", "A practical room-by-room Vastu guide to create harmony, prosperity and positive energy in every corner of your home.", "<h2>Vastu for Every Room</h2><p>Apply these simple Vastu principles to transform your home into a space of positivity and abundance.</p><h2>Entrance</h2><p>North or east-facing entrances are ideal. Keep the area well-lit, clean and clutter-free. Place auspicious symbols near the door.</p><h2>Living Room</h2><p>Position furniture in the south or west. Keep the centre of the room open. Use warm, inviting colours.</p><h2>Kitchen</h2><p>Place the stove in the south-east. The cook should face east. Keep the kitchen clean and well-ventilated.</p><h2>Bedroom</h2><p>Sleep with your head south. Avoid mirrors facing the bed. Use calming colours for walls.</p><h2>Puja Room</h2><p>Place in the north-east or east. Keep it clean and well-lit. Face east or north while praying.</p><h2>Bathroom</h2><p>Locate in the south or north-west. Keep the door closed and maintain hygiene.</p>", "Vastu", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80", "Anjali Singh", "/images/t-1.png", "6 min read"],
    ["meditation-techniques-beginners", "Meditation Techniques for Beginners", "Start your meditation journey with these simple yet powerful techniques designed for absolute beginners.", "<h2>Why Meditate?</h2><p>Meditation reduces stress, improves focus, enhances self-awareness and brings lasting inner peace. It is one of the simplest yet most transformative practices.</p><h2>Technique 1: Breath Awareness</h2><p>Sit comfortably, close your eyes and focus on your breathing. When your mind wanders, gently bring it back to your breath. Start with 5 minutes daily.</p><h2>Technique 2: Body Scan</h2><p>Starting from your toes, slowly bring awareness to each part of your body. Notice sensations without judgement. This technique deeply relaxes the body.</p><h2>Technique 3: Mantra Meditation</h2><p>Choose a meaningful word or phrase (like \"Om\" or \"Peace\"). Repeat it silently with each breath. The mantra anchors your attention.</p><h2>Technique 4: Guided Visualisation</h2><p>Listen to a guided meditation that leads you through a peaceful scene — a forest, beach or mountain. This is perfect for beginners.</p><h2>Tips for Success</h2><ul><li>Start small — even 5 minutes counts</li><li>Be consistent — same time each day</li><li>Don't judge your practice</li><li>Create a dedicated meditation space</li><li>Be patient with yourself</li></ul>", "Spirituality", "https://images.unsplash.com/photo-1529693662653-9d480530a697?w=600&q=80", "Surinder Kaur Sehgal", "/images/t-1.png", "5 min read"],
  ];

  for (const b of blogs) {
    await pool.query(
      `INSERT INTO blogs (slug, title, excerpt, content, category, image, author, author_avatar, read_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE title = VALUES(title)`,
      b
    );
  }

  // FAQs
  const faqs = [
    ["What services does Amoo Guru offer?", "We offer Numerology, Tarot Reading, Reiki Healing, Kundali Analysis, Chakra Healing, and Spiritual Guidance consultations via Audio Call, Video Call, Chat, Distance Healing, and In-Person meetings.", "General", 1],
    ["How do I book a consultation?", "Visit our Consultation page, select your preferred service and expert, choose a time slot, and complete the booking. You will receive confirmation via WhatsApp and email.", "Booking", 1],
    ["What payment methods are accepted?", "We accept UPI, credit/debit cards, net banking, and popular wallets through our secure payment gateway. All transactions are encrypted and safe.", "Payment", 1],
    ["Can I reschedule or cancel my booking?", "Yes, you can reschedule or cancel up to 24 hours before your scheduled consultation. Please check our Cancellation Policy for details.", "Booking", 2],
    ["How does distance healing work?", "Distance healing uses quantum energy transmission techniques. Our certified healers channel healing energy remotely, and you can experience the session from the comfort of your home.", "Services", 1],
    ["Are the consultations confidential?", "Absolutely. All consultations are 100% confidential. We never share your personal information or session details with anyone without your explicit consent.", "General", 2],
    ["How long is a typical consultation?", "Consultations typically last 30-60 minutes depending on the service you choose. Numerology and Tarot sessions are usually 30 minutes, while comprehensive Kundali analysis can take up to 60 minutes.", "Services", 2],
    ["Do I need to prepare anything before a session?", "For the best experience, choose a quiet and comfortable space. Have your date of birth and time of birth ready for astrology sessions. For Tarot, come with an open mind and specific questions.", "Booking", 3],
    ["What if I am not satisfied with my session?", "Your satisfaction is our priority. If you are not satisfied, please contact us within 24 hours and we will work with you to resolve the issue or arrange a follow-up session.", "General", 3],
    ["How do I create an account?", "Click the Sign Up button on our website or app. You can register using your email address or phone number. After verification, you can start booking consultations immediately.", "Technical", 1],
    ["Is my personal data safe?", "Yes, we use industry-standard encryption and security measures to protect your personal data. We never sell or share your information with third parties. See our Privacy Policy for details.", "Technical", 2],
    ["Can I get a refund if I cancel?", "Refunds are available for cancellations made at least 24 hours before the scheduled session. Please refer to our Refund Policy for complete details.", "Payment", 2],
    ["What are your operating hours?", "Our team is available Monday through Saturday, 10 AM to 8 PM IST. You can book consultations within these hours. Distance healing sessions may be available outside these hours.", "General", 4],
    ["Do you offer package deals?", "Yes, we offer various packages and subscription plans that provide significant savings. Visit our Pricing page to explore available packages for individuals and families.", "Payment", 3],
    ["How do I contact support?", "You can reach us via WhatsApp, email, or through the Contact page on our website. Our support team responds within 2 hours during business hours.", "General", 5],
    ["What is Numerology and how can it help me?", "Numerology is the ancient study of numbers and their influence on your life. Your Life Path Number reveals your personality, strengths, and life purpose. A numerology consultation can provide clarity on career, relationships, and personal growth.", "Services", 3],
    ["How accurate are Tarot readings?", "Tarot readings provide guidance and insight based on your current energy and situation. While they offer valuable perspectives for decision-making, they are tools for self-reflection rather than definitive predictions.", "Services", 4],
    ["What is the difference between Reiki and spiritual healing?", "Reiki is a specific Japanese energy healing technique using universal life force energy. Spiritual healing is a broader term that encompasses various modalities including Reiki, chakra balancing, and energy alignment.", "Services", 5],
    ["Can I book consultations for someone else?", "Yes, you can book a consultation as a gift or on behalf of a family member. During booking, provide the recipient's details including name, date of birth, and contact information.", "Booking", 4],
    ["Do you offer corporate or group sessions?", "Yes, we offer special group sessions for corporate wellness programs, team building, and family gatherings. Contact us for customised packages and pricing.", "General", 6],
  ];
  for (const f of faqs) {
    await pool.query(
      `INSERT INTO faqs (question, answer, category, sort_order, active)
       VALUES (?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE question = VALUES(question)`,
      f
    );
  }

  logger.info("Seed complete.");
  logger.info("Admin login:   admin@amooguru.com / admin123");
  logger.info("User login:    vedika.desai@gmail.com / user123");
  logger.info("Expert login:  neha@amooguru.com / expert123");
}

(async () => {
  const okDb = await testConnection();
  if (!okDb) {
    logger.error("Cannot connect to database. Aborting seed.");
    process.exit(1);
  }
  try {
    await seed();
    process.exit(0);
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }
})();
