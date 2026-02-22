import axios from 'axios';
import * as cheerio from 'cheerio';

// Cache
const cache = {};

// islom.uz dan Ramazon maqolalarini scraping qilish
async function scrapeRamazonArticles(categoryNum) {
  try {
    const url = `https://islom.uz/maqolalar/45/${categoryNum}`;
    
    console.log(`📚 Scraping: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    
    let articles = [];
    let articleIndex = 0;
    
    // To'g'ridan-to'g'ri .col-6 ichidagi maqolalarni topamiz
    $('.col-6').each((index, element) => {
      const $col = $(element);
      
      // Agar bu col da .title_maqola_2 a bo'lsa, demak bu maqola
      const $titleLink = $col.find('.title_maqola_2 a');
      
      if ($titleLink.length > 0) {
        // Rasm
        const $img = $col.find('img');
        const image = $img.attr('src') || $img.attr('data-src') || '';
        const imageUrl = image.startsWith('http') ? image : (image.startsWith('/') ? `https://islom.uz${image}` : '');
        
        // Sarlavha va link
        const title = $titleLink.text().trim();
        const link = $titleLink.attr('href');
        const fullLink = link ? (link.startsWith('http') ? link : `https://islom.uz${link}`) : '';
        
        // Intro
        const intro = $col.find('.intro_maqola').text().trim();
        
        if (title && fullLink) {
          articleIndex++;
          articles.push({
            id: articleIndex,
            title: title,
            intro: intro || '',
            image: imageUrl || '',
            link: fullLink,
            category: categoryNum
          });
        }
      }
    });
    
    console.log(`✅ Found ${articles.length} articles from category ${categoryNum}`);
    
    return articles;
    
  } catch (error) {
    console.error('❌ Scraping xatolik:', error.message);
    
    // Fallback - demo data
    return [];
  }
}

// Maqola tarkibini olish
async function scrapeArticleContent(articleUrl) {
  try {
    console.log(`📖 Fetching article: ${articleUrl}`);
    
    const response = await axios.get(articleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    
    // Maqola sarlavhasi
    const title = $('.title_maqola_2').text().trim() || $('h1').first().text().trim();
    
    // Maqola rasmi
    const $img = $('.inmaqola_img img, .maqola_img img, img').first();
    const image = $img.attr('src') || $img.attr('data-src') || '';
    const imageUrl = image.startsWith('http') ? image : (image.startsWith('/') ? `https://islom.uz${image}` : '');
    
    // Maqola matni - .inmaqola_text ichidagi barcha p larni olish
    const contentParagraphs = [];
    $('.inmaqola_text p').each((index, element) => {
      const text = $(element).text().trim();
      if (text) {
        contentParagraphs.push(text);
      }
    });
    
    const content = contentParagraphs.join('\n\n');
    
    console.log(`✅ Article fetched: ${title}`);
    
    return {
      title,
      image: imageUrl,
      content: content || 'Matn topilmadi'
    };
    
  } catch (error) {
    console.error('❌ Article fetch error:', error.message);
    return {
      title: 'Xatolik',
      image: '',
      content: 'Maqolani yuklashda xatolik yuz berdi'
    };
  }
}

// Vercel Serverless Function
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Agar articleUrl parametri bo'lsa, maqola tarkibini qaytarish
    const { articleUrl } = req.query;
    
    if (articleUrl) {
      const articleContent = await scrapeArticleContent(articleUrl);
      return res.status(200).json({
        success: true,
        article: articleContent
      });
    }
    
    // Aks holda, barcha maqolalar ro'yxatini qaytarish
    const cacheKey = 'ramazon_all';
    
    // Cache dan tekshirish
    if (cache[cacheKey]) {
      console.log('Cache dan: all articles');
      return res.status(200).json({
        success: true,
        articles: cache[cacheKey],
        total: cache[cacheKey].length,
        source: 'cache'
      });
    }
    
    // Barcha kategoriyalardan maqolalarni olish
    let allArticles = [];
    
    for (let i = 1; i <= 13; i++) {
      console.log(`Fetching category ${i}...`);
      const articles = await scrapeRamazonArticles(i);
      allArticles = allArticles.concat(articles);
    }
    
    // ID larni qayta raqamlash (1 dan boshlab)
    allArticles = allArticles.map((article, index) => ({
      ...article,
      id: index + 1
    }));
    
    // Cache ga saqlash
    cache[cacheKey] = allArticles;
    
    return res.status(200).json({
      success: true,
      articles: allArticles,
      total: allArticles.length,
      source: 'api'
    });
  } catch (error) {
    console.error('Server xatolik:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
