# Prayer Times Backend Server

Backend server for scraping prayer times from islom.uz website.

## 🚀 Ishga tushirish

### 1. Dependencies o'rnatish
```bash
cd server
npm install
```

### 2. Serverni ishga tushirish
```bash
npm start
```

Yoki development rejimida (auto-reload):
```bash
npm run dev
```

Server `http://localhost:3001` da ishga tushadi.

## 📡 API Endpoints

### Namoz vaqtlarini olish
```
GET /api/prayer-times/:city
```

**Misol:**
```bash
curl http://localhost:3001/api/prayer-times/Toshkent
```

**Response:**
```json
{
  "success": true,
  "city": "Toshkent",
  "date": "Sat Feb 22 2026",
  "times": {
    "Bomdod": "05:30",
    "Peshin": "12:37",
    "Asr": "16:22",
    "Shom": "18:08",
    "Xufton": "19:24"
  },
  "source": "api"
}
```

## 🏙️ Qo'llab-quvvatlanadigan shaharlar

- Toshkent
- Samarqand
- Buxoro
- Andijon
- Namangan
- Farg'ona
- Nukus
- Urganch
- Xiva
- Qarshi
- Termiz
- Qo'qon
- Navoiy
- Jizzax

## 🔄 Fallback tizim

Agar islom.uz dan scraping ishlamasa, server avtomatik ravishda Aladhan API dan ma'lumot oladi.

## 💾 Cache

Har bir shahar uchun ma'lumotlar 24 soat davomida cache da saqlanadi.

## 🛠️ Texnologiyalar

- **Express.js** - Web framework
- **Axios** - HTTP client
- **Cheerio** - Web scraping
- **CORS** - Cross-Origin Resource Sharing

## ⚙️ Port o'zgartirish

`server.js` faylida `PORT` o'zgaruvchisini o'zgartiring:
```javascript
const PORT = 3001; // O'zingiz xohlagan port
```

## 📝 Eslatma

Frontend application ham ishga tushirilishi kerak (port 5173).
