# 🚀 ThumbCompare - Kurulum Rehberi

Bu rehber, projeyi sıfırdan kurmanız için adım adım talimatlar içerir.

## 📋 Ön Gereksinimler

- Node.js 18+ ve npm
- Git
- Supabase hesabı (ücretsiz tier yeterli)
- YouTube Data API Key

## 🎯 Adım 1: Supabase Projesi Oluştur

### 1.1 Supabase'e Kaydol
- https://supabase.com adresine git
- "Start your project" butonuna tıkla
- Ücretsiz hesap oluştur

### 1.2 Yeni Proje Oluştur
- Dashboard'da "New Project" butonuna tıkla
- Proje adı: `thumb-compare` (veya istediğin isim)
- Database şifresi belirle (güçlü bir şifre seç)
- Bölge seç (en yakın bölge)
- "Create new project" butonuna tıkla (1-2 dakika sürebilir)

### 1.3 API Keys'leri Al
Proje oluşturulduktan sonra:
- Sol menüden "Settings" > "API" sekmesine git
- Not al:
  - `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
  - `anon public` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
  - `service_role` key (SUPABASE_SERVICE_ROLE) - **GİZLİ TUT!**

### 1.4 Database URL'sini Al
- "Settings" > "Database" sekmesine git
- "Connection string" altında "URI" sekmesini seç
- Connection string'i kopyala ve şifreyi değiştir
- Format: `postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres`

### 1.5 Storage Bucket Oluştur
- Sol menüden "Storage" sekmesine git
- "Create a new bucket" butonuna tıkla
- Bucket adı: `thumbnails`
- **Public bucket** olarak işaretle
- "Create bucket" butonuna tıkla

## 🎯 Adım 2: YouTube Data API Key Al

### 2.1 Google Cloud Console
- https://console.cloud.google.com adresine git
- Yeni proje oluştur veya var olan projeyi seç

### 2.2 YouTube Data API v3'ü Aktifleştir
- "APIs & Services" > "Enable APIs and Services"
- "YouTube Data API v3" ara ve tıkla
- "Enable" butonuna tıkla

### 2.3 API Key Oluştur
- "APIs & Services" > "Credentials"
- "Create Credentials" > "API key"
- API key'i kopyala (YOUTUBE_API_KEY)
- (Opsiyonel) API key restrictions ekle (güvenlik için)

## 🎯 Adım 3: Projeyi Klonla ve Kur

```bash
# Projeyi klonla
cd thumb-compare

# Bağımlılıkları yükle
npm install
```

## 🎯 Adım 4: Environment Variables Ayarla

`.env.example` dosyasını `.env` olarak kopyala:

```bash
cp .env.example .env
```

`.env` dosyasını düzenle ve değerleri doldur:

```env
# Database (Supabase'den aldığın)
DATABASE_URL="postgresql://postgres:[ŞIFRE]@[HOST]:5432/postgres"

# Supabase (Supabase'den aldığın)
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# YouTube API (Google Cloud'dan aldığın)
YOUTUBE_API_KEY="AIzaSy..."

# Analytics & Monitoring (Opsiyonel - şimdilik boş bırakabilirsin)
NEXT_PUBLIC_POSTHOG_KEY=""
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
SENTRY_DSN=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
APP_URL="http://localhost:3000"

# Jobs (Rastgele güçlü bir şifre oluştur)
JOB_SECRET="super-secret-job-password-12345"
```

## 🎯 Adım 5: Database Migration

Prisma ile database tablolarını oluştur:

```bash
# Prisma client oluştur
npx prisma generate

# Migration çalıştır
npx prisma migrate dev --name init
```

Migration tamamlandığında Supabase'de tablolar oluşmuş olacak.

## 🎯 Adım 6: Seed Data (Opsiyonel)

Demo verisi eklemek için:

```bash
npm run seed
```

Bu komut:
- Demo kullanıcı oluşturur (`demo@example.com`)
- Demo proje oluşturur
- Örnek rakip kanallar ekler
- Free/Pro/Team planları oluşturur

## 🎯 Adım 7: Supabase Auth Ayarları

### 7.1 Email Auth'u Aktifleştir
Supabase Dashboard'da:
- "Authentication" > "Providers" sekmesine git
- "Email" provider'ının enabled olduğundan emin ol

### 7.2 Site URL Ayarla
- "Authentication" > "URL Configuration"
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/**`

### 7.3 (Opsiyonel) OAuth Providers
İstersen Google, GitHub, X gibi OAuth provider'ları da ekleyebilirsin.

## 🎯 Adım 8: Projeyi Çalıştır

```bash
npm run dev
```

Tarayıcıda http://localhost:3000 adresini aç!

## 🎉 İlk Kullanım

### 1. Hesap Oluştur
- http://localhost:3000/signup adresine git
- Email ve şifre ile hesap oluştur

### 2. İlk Projeyi Oluştur
- Dashboard'da "New Project" butonuna tıkla
- Proje adı ve bölge seç
- "Create Project" butonuna tıkla

### 3. Thumbnail Yükle
- Projeye tıkla
- "Upload Thumbnail" butonuna tıkla
- Bir görsel seç ve yükle

### 4. Rakip Kanal Ekle
- "Add Competitor" butonuna tıkla
- YouTube Channel ID gir (örn: `UCX6OQ3DkcsbYNE6H8uQQuVA` - MrBeast)
- Rakip videolarını çekmek için "Refresh" butonuna tıkla

### 5. Trending Videoları Çek
- "Refresh Trending" butonuna tıkla
- Seçtiğin bölgenin trending videoları yüklenecek

## 🔧 Yararlı Komutlar

```bash
# Development server
npm run dev

# Production build
npm run build
npm start

# Prisma Studio (database yönetimi)
npm run prisma:studio

# Linting
npm run lint

# Seed data
npm run seed
```

## 🐛 Sorun Giderme

### "Failed to fetch" Hatası
- `.env` dosyasındaki URL'lerin doğru olduğundan emin ol
- Supabase projesinin çalıştığından emin ol

### Prisma Migration Hatası
- `DATABASE_URL` değerinin doğru olduğundan emin ol
- Şifrede özel karakterler varsa URL encode et

### YouTube API Hatası
- API key'in aktif olduğundan emin ol
- YouTube Data API v3'ün enabled olduğundan emin ol
- API quota'nın dolmadığından emin ol

### Storage Upload Hatası
- `thumbnails` bucket'ının oluşturulduğundan emin ol
- Bucket'ın **public** olarak işaretlendiğinden emin ol

## 📚 Ek Kaynaklar

- [Next.js Dökümantasyonu](https://nextjs.org/docs)
- [Supabase Dökümantasyonu](https://supabase.com/docs)
- [Prisma Dökümantasyonu](https://www.prisma.io/docs)
- [YouTube Data API](https://developers.google.com/youtube/v3)

## 🚀 Production'a Deploy

Production'a deploy için `DEPLOYMENT.md` dosyasına bakın.

## 💡 İpuçları

1. **Güvenlik**: `SUPABASE_SERVICE_ROLE` ve `JOB_SECRET` değerlerini asla paylaşma
2. **YouTube Quota**: Free tier'da günlük 10,000 units var, dikkatli kullan
3. **Database**: Düzenli backup al (Supabase otomatik yapıyor)
4. **Monitoring**: Production'da Sentry ve PostHog kullan

## 🆘 Yardım

Sorun yaşıyorsan:
1. `.env` dosyasını kontrol et
2. Console'da hata mesajlarını oku
3. Supabase Dashboard'da logları kontrol et
4. GitHub Issues'a yaz

---

**Keyifli kodlamalar! 🎨🚀**

