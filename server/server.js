const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 3001;

// CORS ni yoqish
app.use(cors());
app.use(express.json());

// Islom.uz region ID lar (to'g'ri ID lar islom.uz saytidan)
const regionMapping = {
  'Andijon': 27,
  'Buxoro': 4,
  'Jizzax': 9,
  'Namangan': 15,
  'Navoiy': 14,
  'Qarshi': 25,
  'Qo\'qon': 26,
  'Samarqand': 18,
  'Guliston': 5,
  'Toshkent': 27,
  'Xiva': 21,
  'Nukus': 16,
  "Marg\'ilon": 13
};

// Cache uchun
let prayerTimesCache = {};

// Islom.uz dan namoz vaqtlarini olish (Python kodidan o'tkazilgan)
async function scrapePrayerTimes(city) {
  try {
    const regionId = regionMapping[city] || 12; // Default Toshkent (ID 12)
    const today = new Date();
    const month = today.getMonth() + 1; // JavaScript 0-indexed
    const day = today.getDate();
    
    // Islom.uz URL formati: /vaqtlar/{region_id}/{month}
    const url = `https://islom.uz/vaqtlar/${regionId}/${month}`;
    
    console.log(`📍 Scraping: ${city} (region ${regionId}) - ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    
    // HTML dan tbody tr.p_day qatorlarini olish
    const rows = $('tbody tr.p_day');
    
    console.log(`📊 Topilgan qatorlar soni: ${rows.length}`);
    
    // Har bir qatorni tekshirish
    for (let i = 0; i < rows.length; i++) {
      const row = rows.eq(i);
      const cols = [];
      
      row.find('td').each((index, element) => {
        cols.push($(element).text().trim());
      });
      
      if (cols.length < 9) {
        continue;
      }
      
      // Kun raqamini olish (2-ustun, birinchi so'z)
      let dayNum;
      try {
        const dayText = cols[1].split(/\s+/)[0]; // Bo'sh joylar bo'yicha bo'lib, birinchi qismni olish
        dayNum = parseInt(dayText);
      } catch (err) {
        continue;
      }
      
      // Agar bugungi kun bo'lsa
      if (dayNum === day) {
        console.log(`✅ ${day}-kun topildi!`);
        console.log('Ustunlar:', cols);
        
        const times = {
          'Bomdod': cols[3],    // Fajr
          'Quyosh': cols[4],    // Sunrise
          'Peshin': cols[5],    // Dhuhr
          'Asr': cols[6],       // Asr
          'Shom': cols[7],      // Maghrib
          'Xufton': cols[8]     // Isha
        };
        
        console.log('🕌 Namoz vaqtlari:', times);
        return times;
      }
    }
    
    console.log(`⚠️ ${day}-kun topilmadi, fallback ishlatilmoqda...`);
    // Agar bugungi kun topilmasa, fallback
    return await getFallbackPrayerTimes(city);
    
  } catch (error) {
    console.error('❌ Scraping xatolik:', error.message);
    // Fallback API dan olamiz
    return await getFallbackPrayerTimes(city);
  }
}

// Fallback: Aladhan API dan olish
async function getFallbackPrayerTimes(city) {
  const coordinates = {
    'Andijon': { lat: 40.7821, lng: 72.3442 },
    'Buxoro': { lat: 39.7747, lng: 64.4286 },
    'Guliston': { lat: 40.4897, lng: 68.7842 },
    'Jizzax': { lat: 40.1158, lng: 67.8422 },
    'Marg\'ilon': { lat: 40.4716, lng: 71.7245 },
    'Namangan': { lat: 41.0004, lng: 71.6726 },
    'Navoiy': { lat: 40.0844, lng: 65.3792 },
    'Nukus': { lat: 42.4531, lng: 59.6103 },
    'Qarshi': { lat: 38.8606, lng: 65.7890 },
    'Qo\'qon': { lat: 40.5283, lng: 70.9424 },
    'Samarqand': { lat: 39.6542, lng: 66.9597 },
    'Toshkent': { lat: 41.2995, lng: 69.2401 },
    'Xiva': { lat: 41.3775, lng: 60.3642 }
  };
  
  const coords = coordinates[city] || coordinates['Toshkent'];
  
  try {
    const response = await axios.get(
      `https://api.aladhan.com/v1/timings?latitude=${coords.lat}&longitude=${coords.lng}&method=2`
    );
    
    if (response.data.code === 200) {
      const timings = response.data.data.timings;
      return {
        'Bomdod': timings.Fajr,
        'Quyosh': timings.Sunrise,
        'Peshin': timings.Dhuhr,
        'Asr': timings.Asr,
        'Shom': timings.Maghrib,
        'Xufton': timings.Isha
      };
    }
  } catch (error) {
    console.error('Fallback API xatolik:', error.message);
  }
  
  // Default vaqtlar
  return {
    'Bomdod': '05:30',
    'Quyosh': '07:00',
    'Peshin': '12:30',
    'Asr': '16:00',
    'Shom': '18:00',
    'Xufton': '19:30'
  };
}


// API endpoint
app.get('/api/prayer-times/:city', async (req, res) => {
  try {
    const city = req.params.city;
    const today = new Date().toDateString();
    const cacheKey = `${city}_${today}`;
    
    // Cache dan tekshirish
    if (prayerTimesCache[cacheKey]) {
      console.log('Cache dan:', city);
      return res.json({
        success: true,
        city: city,
        date: today,
        times: prayerTimesCache[cacheKey],
        source: 'cache'
      });
    }
    
    // Yangi ma'lumot olish
    console.log('Scraping:', city);
    const times = await scrapePrayerTimes(city);
    
    // Cache ga saqlash
    prayerTimesCache[cacheKey] = times;
    
    res.json({
      success: true,
      city: city,
      date: today,
      times: times,
      source: 'api'
    });
  } catch (error) {
    console.error('Server xatolik:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Har kuni cache ni tozalash
setInterval(() => {
  prayerTimesCache = {};
  console.log('Cache tozalandi');
}, 24 * 60 * 60 * 1000); // 24 soat

// Server ishga tushirish
app.listen(PORT, () => {
  console.log(`🚀 Server ishlamoqda: http://localhost:${PORT}`);
  console.log(`📿 Prayer Times API: http://localhost:${PORT}/api/prayer-times/Toshkent`);
});
