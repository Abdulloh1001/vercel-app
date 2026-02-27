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
    const { articleUrl, category } = req.query;
    
    if (articleUrl) {
      try {
        const articleContent = await scrapeArticleContent(articleUrl);
        return res.status(200).json({
          success: true,
          article: articleContent
        });
      } catch (error) {
        console.error('Article scraping error:', error);
        return res.status(200).json({
          success: true,
          article: {
            title: 'Maqola',
            image: '',
            content: 'Maqolani yuklashda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.'
          }
        });
      }
    }
    
    // Agar category parametri bo'lsa, faqat o'sha kategoriyani yuklash
    if (category) {
      const categoryNum = parseInt(category);
      if (categoryNum < 1 || categoryNum > 13) {
        return res.status(400).json({
          success: false,
          error: 'Invalid category number'
        });
      }
      
      const cacheKey = `ramazon_cat_${categoryNum}`;
      
      // Cache dan tekshirish (10 daqiqa)
      if (cache[cacheKey] && cache[cacheKey].timestamp > Date.now() - 600000) {
        console.log(`Cache dan: category ${categoryNum}`);
        return res.status(200).json({
          success: true,
          articles: cache[cacheKey].data,
          total: cache[cacheKey].data.length,
          category: categoryNum,
          source: 'cache'
        });
      }
      
      // Kategoriyani yuklash
      try {
        const articles = await scrapeRamazonArticles(categoryNum);
        
        // Cache ga saqlash
        cache[cacheKey] = {
          data: articles,
          timestamp: Date.now()
        };
        
        return res.status(200).json({
          success: true,
          articles: articles,
          total: articles.length,
          category: categoryNum,
          source: 'api'
        });
      } catch (error) {
        console.error(`Category ${categoryNum} error:`, error);
        return res.status(200).json({
          success: true,
          articles: [],
          total: 0,
          category: categoryNum,
          source: 'error'
        });
      }
    }
    
    // Aks holda faqat birinchi 3 kategoriyadan maqolalarni qaytarish (legacy support)
    const cacheKey = 'ramazon_quick';
    
    // Cache dan tekshirish (10 daqiqa)
    if (cache[cacheKey] && cache[cacheKey].timestamp > Date.now() - 600000) {
      console.log('Cache dan: quick articles');
      return res.status(200).json({
        success: true,
        articles: cache[cacheKey].data,
        total: cache[cacheKey].data.length,
        source: 'cache'
      });
    }
    
    // Faqat birinchi 3 kategoriyadan maqolalarni olish
    let allArticles = [];
    
    for (let i = 1; i <= 3; i++) {
      console.log(`Fetching category ${i}...`);
      try {
        const articles = await scrapeRamazonArticles(i);
        allArticles = allArticles.concat(articles);
      } catch (error) {
        console.error(`Category ${i} error:`, error);
      }
    }
    
    // ID larni qayta raqamlash (1 dan boshlab)
    allArticles = allArticles.map((article, index) => ({
      ...article,
      id: index + 1
    }));
    
    // Cache ga saqlash
    cache[cacheKey] = {
      data: allArticles,
      timestamp: Date.now()
    };
    
    return res.status(200).json({
      success: true,
      articles: allArticles,
      total: allArticles.length,
      source: 'api'
    });
  } catch (error) {
    console.error('Server xatolik:', error);
    
    // Fallback - demo data
    return res.status(200).json({
      success: true,
      articles: [
        {
          id: 1,
          title: 'Ramazon oyi haqida',
          intro: 'Ramazon muborak oyi musulmonlar uchun eng fazilatli oylardan biri hisoblanadi.',
          image: '',
          link: 'https://islom.uz',
          category: 1
        },
        {
          id: 2,
          title: 'Ro\'za tutish fazilati',
          intro: 'Ro\'za Islomning besh arkonidan biri bo\'lib, musulmonlar uchun farz amaldir.',
          image: '',
          link: 'https://islom.uz',
          category: 1
        }
      ],
      total: 2,
      source: 'fallback'
    });
  }
}
