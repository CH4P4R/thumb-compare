# 🚀 ThumbCompare - Production Deployment Rehberi

Bu rehber, projeyi Vercel'e production olarak deploy etmeniz için adım adım talimatlar içerir.

## 📋 Ön Hazırlık

Deployment öncesi kontrol listesi:

- [ ] Supabase production projesi hazır
- [ ] YouTube API key production limits ayarlanmış
- [ ] Environment variables hazır
- [ ] Git repository oluşturulmuş
- [ ] Code review tamamlanmış

## 🎯 Adım 1: Production Supabase Projesi

### Development'tan Farklı Bir Proje Kullan

1. https://supabase.com adresinden yeni bir proje oluştur
2. Proje adı: `thumb-compare-production`
3. Güçlü bir database şifresi belirle
4. Production'a yakın bir bölge seç

### Storage Bucket Oluştur

- "Storage" sekmesine git
- `thumbnails` bucket'ı oluştur (public)

### Database Migration

```bash
# Production DATABASE_URL ile
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

### Seed Plans (Sadece planlar)

Production'da kullanıcıları seed etme, sadece planları:

```sql
-- Supabase SQL Editor'de çalıştır
INSERT INTO "Plan" (id, name, limits, "createdAt") VALUES
  ('free-plan-id', 'free', '{"max_projects":2,"max_thumbnails":20,"max_competitors":2,"regions":["TR"]}', NOW()),
  ('pro-plan-id', 'pro', '{"max_projects":999,"max_thumbnails":200,"max_competitors":10,"regions":["TR","US","GB"]}', NOW()),
  ('team-plan-id', 'team', '{"max_projects":999,"max_thumbnails":999,"max_competitors":999,"regions":["TR","US","GB","DE","FR"]}', NOW())
ON CONFLICT (name) DO NOTHING;
```

## 🎯 Adım 2: Vercel'e Deploy

### 2.1 Vercel Hesabı Oluştur

- https://vercel.com adresine git
- GitHub ile giriş yap

### 2.2 Repository'yi Bağla

Vercel Dashboard'da:
1. "Add New..." > "Project"
2. GitHub repository'ni seç
3. "Import" butonuna tıkla

### 2.3 Environment Variables Ekle

```env
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE=eyJ...

# YouTube API
YOUTUBE_API_KEY=AIzaSy...

# Analytics & Monitoring
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
SENTRY_DSN=https://...@sentry.io/...

# App
NEXT_PUBLIC_APP_URL=https://thumb-compare.vercel.app
APP_URL=https://thumb-compare.vercel.app

# Jobs
JOB_SECRET=production-secret-super-strong-password
```

### 2.4 Deploy Ayarları

- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### 2.5 Deploy

"Deploy" butonuna tıkla! 🚀

İlk deployment 2-3 dakika sürebilir.

## 🎯 Adım 3: Supabase Production Ayarları

### 3.1 Site URL'lerini Güncelle

Supabase Dashboard > Authentication > URL Configuration:

```
Site URL: https://thumb-compare.vercel.app
Redirect URLs:
  - https://thumb-compare.vercel.app/**
  - https://*.vercel.app/**
```

### 3.2 Row Level Security (RLS)

Supabase'de RLS'yi aktifleştir (önemli!):

```sql
-- Projects için RLS
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view projects they are members of"
  ON "Project" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "ProjectMember"
      WHERE "ProjectMember"."projectId" = "Project".id
        AND "ProjectMember"."userId" = auth.uid()
    )
  );

CREATE POLICY "Users can create projects"
  ON "Project" FOR INSERT
  WITH CHECK (auth.uid() = "ownerId");

-- Diğer tablolar için benzer policies ekle
```

### 3.3 Backup Ayarla

Supabase otomatik backup yapar, ancak manuel backup schedule'ı kontrol et:
- "Settings" > "Database" > "Backups"
- Point-in-time recovery aktif mi kontrol et

## 🎯 Adım 4: Cron Jobs (Vercel)

Vercel'de cron jobs otomatik çalışır (vercel.json'a ekledik).

### Cron'ları Test Et

```bash
# Trending job'ı test et
curl -X GET https://thumb-compare.vercel.app/api/jobs/trending \
  -H "Authorization: Bearer YOUR_JOB_SECRET"

# Competitors job'ı test et
curl -X GET https://thumb-compare.vercel.app/api/jobs/competitors \
  -H "Authorization: Bearer YOUR_JOB_SECRET"
```

### Cron Loglarını İzle

Vercel Dashboard > Project > Deployments > Logs

## 🎯 Adım 5: Monitoring & Analytics

### 5.1 Sentry Setup

1. https://sentry.io hesabı oluştur
2. Yeni proje oluştur (Next.js)
3. DSN'i kopyala ve environment variable olarak ekle
4. Vercel'i redeploy et

### 5.2 PostHog Setup

1. https://posthog.com hesabı oluştur
2. Project key'i al
3. Environment variable olarak ekle
4. Vercel'i redeploy et

### 5.3 Vercel Analytics

Vercel Dashboard'da Analytics'i aktifleştir (ücretsiz):
- Project Settings > Analytics > Enable

## 🎯 Adım 6: Custom Domain (Opsiyonel)

### 6.1 Domain Ekle

Vercel Dashboard > Project > Settings > Domains:
1. "Add Domain" butonuna tıkla
2. Domain'i gir (örn: `thumbcompare.com`)
3. DNS kayıtlarını güncelle (Vercel talimatları verir)

### 6.2 SSL Otomatik

Vercel otomatik SSL certificate sağlar. 5-10 dakika içinde aktif olur.

### 6.3 Environment Variables'ı Güncelle

```env
NEXT_PUBLIC_APP_URL=https://thumbcompare.com
APP_URL=https://thumbcompare.com
```

### 6.4 Supabase Redirect URLs'i Güncelle

```
Site URL: https://thumbcompare.com
Redirect URLs:
  - https://thumbcompare.com/**
```

## 🎯 Adım 7: Performance Optimization

### 7.1 Image Optimization

Next.js otomatik image optimization yapar. Supabase CDN'i kullan:

```typescript
// next.config.ts
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '*.supabase.co',
    },
  ],
}
```

### 7.2 Caching Strategy

```typescript
// API route'larda cache headers
export const revalidate = 3600; // 1 saat
```

### 7.3 Edge Functions (Opsiyonel)

Kritik route'ları Edge'e taşı:

```typescript
export const runtime = 'edge';
```

## 🎯 Adım 8: Güvenlik

### 8.1 Rate Limiting

Upstash Redis ile rate limiting ekle (opsiyonel):

```bash
npm install @upstash/ratelimit @upstash/redis
```

### 8.2 CORS Ayarları

API route'larında CORS kontrol et:

```typescript
// middleware.ts'de
if (request.nextUrl.pathname.startsWith('/api')) {
  // CORS headers ekle
}
```

### 8.3 Environment Variables Güvenliği

- Production secrets'ları asla commit etme
- Vercel Secret Management kullan
- Service role key'i sadece server-side kullan

## 🎯 Adım 9: CI/CD Pipeline

### 9.1 GitHub Actions (Opsiyonel)

`.github/workflows/ci.yml`:

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm run build
```

### 9.2 Vercel Preview Deployments

Her PR için otomatik preview deployment oluşur. Test et!

## 🎯 Adım 10: Go Live Checklist

Deploy öncesi son kontroller:

- [ ] Tüm environment variables doğru
- [ ] Database migrations çalıştı
- [ ] Seed data (plans) eklendi
- [ ] Storage bucket public
- [ ] Auth redirect URLs doğru
- [ ] Cron jobs çalışıyor
- [ ] Error tracking aktif (Sentry)
- [ ] Analytics çalışıyor (PostHog)
- [ ] Custom domain bağlandı (varsa)
- [ ] SSL sertifikası aktif
- [ ] Performance testleri yapıldı
- [ ] Security audit tamamlandı

## 📊 Post-Launch

### İzlenmesi Gerekenler

1. **Error Rate**: Sentry'de hata oranını izle
2. **API Latency**: Vercel Analytics'te response time'ları kontrol et
3. **Database Load**: Supabase Dashboard'da query performance
4. **YouTube Quota**: Google Cloud Console'da API usage
5. **User Sign-ups**: PostHog'da funnel analysis

### Günlük Kontroller

- [ ] Cron job logları (trending/competitors)
- [ ] Error rate (Sentry)
- [ ] API response times
- [ ] Database performance

### Haftalık Kontroller

- [ ] YouTube API quota kullanımı
- [ ] Storage kullanımı
- [ ] Database boyutu
- [ ] Active users sayısı

## 🆘 Rollback Planı

Bir sorun olursa:

1. Vercel Dashboard > Deployments
2. Önceki working deployment'ı bul
3. "..." menüsünden "Promote to Production"

## 🔧 Troubleshooting

### Deployment Başarısız

```bash
# Build loglarını kontrol et
vercel logs [deployment-url]
```

### Database Connection Issues

- DATABASE_URL doğru mu?
- Supabase projesi aktif mi?
- Connection pool limitleri yeterli mi?

### Cron Jobs Çalışmıyor

- JOB_SECRET doğru mu?
- vercel.json dosyası commit'lendi mi?
- Vercel'de cron aktif mi?

## 🎉 Tebrikler!

Production'a başarıyla deploy ettin! 🚀

Şimdi şunları yapabilirsin:
- İlk kullanıcıları davet et
- Feedback topla
- Iterate et
- Scale et!

---

**Başarılar! 🎨🚀**

