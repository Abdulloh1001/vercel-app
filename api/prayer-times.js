const axios = require('axios');
const cheerio = require('cheerio');

// Islom.uz region ID lar
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

// Cache (Vercel Environment Variables orqali uzunroq saqlash mumkin)
const cache = {};

// Islom.uz dan namoz vaqtlarini olish
async function scrapePrayerTimes(city) {
  try {
    const regionId = regionMapping[city] || 27;
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    const url = `https://islom.uz/vaqtlar/${regionId}/${month}`;
    
    console.log(`📍 Scraping: ${city} (region ${regionId})`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    const rows = $('tbody tr.p_day');
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows.eq(i);
      const cols = [];
      
      row.find('td').each((index, element) => {
        cols.push($(element).text().trim());
      });
      
      if (cols.length < 9) continue;
      
      let dayNum;
      try {
        const dayText = cols[1].split(/\s+/)[0];
        dayNum = parseInt(dayText);
      } catch (err) {
        continue;
      }
      
      if (dayNum === day) {
        console.log(`✅ ${day}-kun topildi!`);
        
        return {
          'Bomdod': cols[3],
          'Quyosh': cols[4],
          'Peshin': cols[5],
          'Asr': cols[6],
          'Shom': cols[7],
          'Xufton': cols[8]
        };
      }
    }
    
    return await getFallbackPrayerTimes(city);
    
  } catch (error) {
    console.error('❌ Scraping xatolik:', error.message);
    return await getFallbackPrayerTimes(city);
  }
}

// Fallback: Aladhan API
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

// Vercel Serverless Function
module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // URL dan city parametrini olish: /api/prayer-times?city=Toshkent
    const city = req.query.city || 'Toshkent';
    const today = new Date().toDateString();
    const cacheKey = `${city}_${today}`;
    
    // Cache dan tekshirish
    if (cache[cacheKey]) {
      console.log('Cache dan:', city);
      return res.status(200).json({
        success: true,
        city: city,
        date: today,
        times: cache[cacheKey],
        source: 'cache'
      });
    }
    
    // Yangi ma'lumot olish
    console.log('Scraping:', city);
    const times = await scrapePrayerTimes(city);
    
    // Cache ga saqlash
    cache[cacheKey] = times;
    
    return res.status(200).json({
      success: true,
      city: city,
      date: today,
      times: times,
      source: 'api'
    });
  } catch (error) {
    console.error('Server xatolik:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
