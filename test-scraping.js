import axios from 'axios';
import * as cheerio from 'cheerio';

// Test scraping function
async function testScraping() {
  try {
    const categoryNum = 1; // Test birinchi kategoriya
    const url = `https://islom.uz/maqolalar/45/${categoryNum}`;
    
    console.log(`\n📚 Scraping: ${url}\n`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    
    // Debug: barcha .row larni ko'ramiz
    console.log(`Jami .row elementlar: ${$('.row').length}`);
    console.log(`Jami .col-6 elementlar: ${$('.col-6').length}`);
    console.log(`Jami .title_maqola_2 a elementlar: ${$('.title_maqola_2 a').length}`);
    
    let articles = [];
    let articleIndex = 0;
    
    // To'g'ridan-to'g'ri .col-6 ichidagi .title_maqola_2 a larni topamiz
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
          
          console.log(`  ${articleIndex}. ✅ ${title.substring(0, 50)}...`);
        }
      }
    });
    
    console.log(`\n✅ Jami topildi: ${articles.length} ta maqola\n`);
    
    // Birinchi 3 ta maqolani ko'rsatish
    console.log('=== Birinchi 3 ta maqola ===\n');
    articles.slice(0, 3).forEach((article, i) => {
      console.log(`${i + 1}. ${article.title}`);
      console.log(`   Image: ${article.image ? '✅' : '❌'}`);
      console.log(`   Intro: ${article.intro ? article.intro.substring(0, 80) + '...' : '❌'}`);
      console.log(`   Link: ${article.link}\n`);
    });
    
  } catch (error) {
    console.error('❌ Xatolik:', error.message);
  }
}

testScraping();
