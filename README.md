# 🎯 ThumbCompare - YouTube Thumbnail Comparison SaaS

YouTuber'ların kendi kapak görsellerini (thumbnail) **rakip kanalların** ve **trending** videoların kapaklarıyla görsel olarak kıyaslayabildiği, **projeler** bazlı çalışan, **yorum/çizimle kolaborasyon** destekli bir SaaS platformu.

## ✨ Özellikler

- 📊 **Proje Bazlı Yönetim**: Birden fazla proje oluştur, her projede kendi thumbnail'lerini yönet
- 🎨 **AI-Powered Skorlama**: Kontrast, parlaklık, kompozisyon analizi
- 🔥 **Trending Entegrasyonu**: Bölge bazlı trending videoları otomatik çek (12 saatte bir)
- 👥 **Rakip Analizi**: YouTube kanallarını ekle, son videolarını takip et
- 💬 **Kolaborasyon**: Yorum ve annotation desteği
- 🔗 **Paylaşılabilir Linkler**: Public read-only önizleme linkleri
- 🎯 **Shuffle & Filter**: Görsel karşılaştırma için rastgele karıştırma

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js Route Handlers, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Image Processing**: Sharp
- **External API**: YouTube Data API v3
- **UI Components**: shadcn/ui, Radix UI

## 📋 Gereksinimler

- Node.js 18+ 
- PostgreSQL database (veya Supabase hesabı)
- YouTube Data API Key

## 🚀 Kurulum

### 1. Projeyi Klonla

```bash
git clone <repo-url>
cd thumb-compare
```

### 2. Bağımlılıkları Yükle

```bash
npm install
```

### 3. Environment Variables

`.env.example` dosyasını `.env` olarak kopyala ve doldur:

```bash
cp .env.example .env
```

Gerekli değişkenler:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/thumb_compare"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE="your-service-role-key"

# YouTube API
YOUTUBE_API_KEY="your-youtube-api-key"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
APP_URL="http://localhost:3000"

# Jobs (cron authentication)
JOB_SECRET="your-secret-for-cron-jobs"
```

### 4. Supabase Setup

#### Storage Bucket Oluştur

Supabase Dashboard'da:
1. Storage > Create bucket
2. Name: `thumbnails`
3. Public bucket: Yes

#### Database Migration

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Seed Data (Opsiyonel)

```bash
npx tsx prisma/seed.ts
```

### 6. Development Server

```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacak.

## 📁 Proje Yapısı

```
thumb-compare/
├── app/
│   ├── api/              # API routes
│   │   ├── projects/
│   │   ├── thumbnails/
│   │   ├── competitors/
│   │   ├── jobs/
│   │   └── health/
│   ├── dashboard/        # Dashboard sayfaları
│   ├── p/[token]/        # Public share pages
│   ├── login/
│   ├── signup/
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── thumbnail-grid.tsx
│   ├── compare-board.tsx
│   └── collab-sidebar.tsx
├── lib/
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # Auth helpers
│   ├── youtube.ts        # YouTube API
│   ├── score.ts          # Image scoring
│   └── supabase/         # Supabase clients
├── prisma/
│   └── schema.prisma     # Database schema
└── middleware.ts         # Auth middleware
```

## 🔐 API Endpoints

### Projects
- `POST /api/projects` - Yeni proje oluştur
- `GET /api/projects` - Projeleri listele
- `GET /api/projects/:id` - Proje detayı
- `POST /api/projects/:id/invite` - Kullanıcı davet et

### Thumbnails
- `POST /api/projects/:id/thumbnails` - Thumbnail yükle
- `GET /api/projects/:id/thumbnails` - Thumbnail'leri listele
- `POST /api/thumbnails/:id/score` - Thumbnail skorla

### Competitors
- `POST /api/projects/:id/competitors` - Rakip kanal ekle
- `GET /api/projects/:id/competitors` - Rakipleri listele
- `POST /api/competitors/:id/refresh` - Rakip videolarını güncelle

### Trending
- `GET /api/projects/:id/trending` - Trending videoları getir
- `POST /api/projects/:id/trending/refresh` - Trending'i güncelle

### Collaboration
- `POST /api/projects/:id/comments` - Yorum ekle
- `GET /api/projects/:id/comments` - Yorumları listele
- `POST /api/projects/:id/annotations` - Annotation ekle

### Share
- `POST /api/projects/:id/share` - Paylaşım linki oluştur

### Jobs (Cron)
- `GET /api/jobs/trending` - Trending fetch job
- `GET /api/jobs/competitors` - Competitor refresh job

## ⏱️ Cron Jobs (Vercel)

`vercel.json` ekle:

```json
{
  "crons": [
    {
      "path": "/api/jobs/trending",
      "schedule": "0 */12 * * *"
    },
    {
      "path": "/api/jobs/competitors",
      "schedule": "0 0 * * *"
    }
  ]
}
```

Her cron job çağrısında `Authorization: Bearer ${JOB_SECRET}` header'ı gönder.

## 📊 Database Schema

Temel modeller:
- **User**: Kullanıcılar
- **Project**: Projeler
- **ProjectMember**: Proje üyelikleri
- **Thumbnail**: Kullanıcı thumbnail'leri
- **CompetitorChannel**: Rakip kanallar
- **CompetitorVideo**: Rakip videoları
- **TrendingVideo**: Trending videolar
- **Comment**: Yorumlar
- **Annotation**: Çizimler/annotation'lar
- **ShareLink**: Paylaşım linkleri

Detaylar için `prisma/schema.prisma` dosyasına bakın.

## 🎨 Image Scoring

Thumbnail'ler şu metriklere göre skorlanır (0-100):

- **Kontrast** (35%): RMS kontrast
- **Parlaklık** (20%): Ortalama luminance
- **Metin Yoğunluğu** (25%): OCR ile tespit (opsiyonel)
- **Yüz Tespiti** (20%): Yüz var/yok (opsiyonel)

Skor hesaplama: `lib/score.ts`

## 🚀 Production Deployment

### Vercel'e Deploy

```bash
vercel
```

### Environment Variables

Vercel dashboard'da tüm environment variables'ları ayarla.

### Supabase Production

Production Supabase instance'ı oluştur ve URL'leri güncelle.

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests (Playwright)
npm run test:e2e
```

## 📝 TODO

MVP tamamlandı! Gelecek özellikler:

- [ ] ML tabanlı CTR tahmini
- [ ] A/B test desteği
- [ ] Heatmap analizi
- [ ] Stripe/LemonSqueezy ödeme entegrasyonu
- [ ] Çoklu bölge karşılaştırma
- [ ] Otomatik font/border önerileri
- [ ] Gelişmiş analytics dashboard

## 🤝 Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır!

## 📄 Lisans

MIT

## 🙏 Teşekkürler

- Next.js Team
- Supabase Team  
- shadcn/ui
- YouTube Data API

---

**Made with ❤️ by ThumbCompare Team**
