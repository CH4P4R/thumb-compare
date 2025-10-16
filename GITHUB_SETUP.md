# 🚀 GitHub'a Yükleme Rehberi

## 📋 Seçenek 1: GitHub Web Arayüzü ile (Kolay)

### 1. GitHub'da Yeni Repository Oluştur

1. https://github.com adresine git ve giriş yap
2. Sağ üstteki "+" ikonuna tıkla
3. "New repository" seç
4. Repository bilgileri:
   - **Repository name**: `thumb-compare` (veya istediğin isim)
   - **Description**: "YouTube Thumbnail Comparison SaaS - Thumbnail'leri rakip ve trending videolarla karşılaştır"
   - **Visibility**: Public veya Private seç
   - ⚠️ **"Initialize this repository" seçeneklerini IŞARETLEME** (README, .gitignore, license)
5. "Create repository" butonuna tıkla

### 2. Terminal Komutları

GitHub'da repository oluşturduktan sonra, aşağıdaki komutları sırayla çalıştır:

```bash
# thumb-compare dizinine git (eğer değilsen)
cd thumb-compare

# Git repository'sini başlat
git init

# Tüm dosyaları stage'e ekle
git add .

# İlk commit'i yap
git commit -m "🎉 Initial commit - YouTube Thumbnail Comparison SaaS"

# Main branch'i oluştur
git branch -M main

# GitHub remote'unu ekle (KENDI USERNAME'INI KULLAN!)
git remote add origin https://github.com/KULLANICI_ADIN/thumb-compare.git

# GitHub'a push et
git push -u origin main
```

**Önemli**: `KULLANICI_ADIN` yerine kendi GitHub kullanıcı adını yaz!

### 3. GitHub'da Kontrol Et

Tarayıcıda repository'ne git ve dosyaların yüklendiğini kontrol et! 🎉

---

## 📋 Seçenek 2: GitHub CLI ile (Hızlı)

GitHub CLI kuruluysa (daha kolay):

```bash
# thumb-compare dizinine git
cd thumb-compare

# Git init
git init
git add .
git commit -m "🎉 Initial commit - YouTube Thumbnail Comparison SaaS"

# GitHub CLI ile repository oluştur ve push et (tek komut!)
gh repo create thumb-compare --public --source=. --push
# veya private için:
# gh repo create thumb-compare --private --source=. --push
```

---

## 🔐 Güvenlik - Önemli!

### .env Dosyasını ASLA Commit Etme!

`.gitignore` dosyası `.env` dosyasını zaten ignore ediyor, ama kontrol et:

```bash
# .gitignore'da .env olduğundan emin ol
cat .gitignore | grep ".env"
```

Eğer yanlışlıkla `.env` dosyasını commit ettiysen:

```bash
# Dosyayı Git history'den kaldır
git rm --cached .env
git commit -m "Remove .env from repository"
git push
```

---

## 📝 GitHub'a Yükledikten Sonra

### 1. README.md'yi Özelleştir

GitHub'da görünen README'yi güzelleştir:

- Proje logosu ekle
- Screenshots ekle
- Badges ekle (build status, license, vb.)

### 2. Repository Settings

GitHub repository > Settings:

- **About**: Description ve tags ekle
- **Topics**: `nextjs`, `typescript`, `supabase`, `youtube-api`, `saas`
- **Website**: Vercel URL'ini ekle (deploy edince)

### 3. GitHub Secrets (CI/CD için)

Settings > Secrets and variables > Actions:
- Environment variables'ları ekle (deploy için gerekli)

---

## 🔄 Güncellemeleri Push Etme

Projeyi geliştirdikçe, değişiklikleri GitHub'a atmak için:

```bash
# Değişiklikleri stage'e ekle
git add .

# Commit yap (açıklayıcı mesaj)
git commit -m "✨ Yeni özellik: Annotation desteği"

# GitHub'a push et
git push
```

### Yararlı Git Komutları

```bash
# Değişiklikleri görüntüle
git status

# Hangi dosyalarda değişiklik olduğunu gör
git diff

# Commit geçmişini gör
git log --oneline

# Branch oluştur
git checkout -b feature/yeni-ozellik

# Branch'i push et
git push -u origin feature/yeni-ozellik
```

---

## 🤝 Kolaborasyon

### Contributors Ekle

Repository > Settings > Collaborators:
- Ekip arkadaşlarını davet et

### Pull Request Workflow

1. Yeni branch oluştur: `git checkout -b feature/xyz`
2. Değişiklikleri yap ve commit et
3. Push et: `git push origin feature/xyz`
4. GitHub'da Pull Request oluştur
5. Review sonrası merge et

---

## 📌 Best Practices

### Commit Mesajları

Conventional Commits kullan:

```bash
git commit -m "feat: Yeni özellik ekle"
git commit -m "fix: Bug düzeltmesi"
git commit -m "docs: Dokümantasyon güncelle"
git commit -m "style: Kod formatı düzeltmesi"
git commit -m "refactor: Kod refactoring"
git commit -m "test: Test ekle"
git commit -m "chore: Build ayarları güncelle"
```

### .gitignore Kontrolü

Şu dosyaların ignore edildiğinden emin ol:

```
node_modules/
.next/
.env
.env.local
.vercel
*.log
.DS_Store
```

---

## 🆘 Sorun Giderme

### "Permission denied" Hatası

SSH key kullanıyorsan:
```bash
ssh-keygen -t ed25519 -C "email@example.com"
cat ~/.ssh/id_ed25519.pub
# Bu key'i GitHub > Settings > SSH Keys'e ekle
```

### "Remote already exists" Hatası

```bash
git remote remove origin
git remote add origin https://github.com/USERNAME/thumb-compare.git
```

### Git Kullanıcı Ayarları

İlk kez kullanıyorsan:

```bash
git config --global user.name "Adın Soyadın"
git config --global user.email "email@example.com"
```

---

## 🎉 Tebrikler!

Projen artık GitHub'da! 🚀

Şimdi şunları yapabilirsin:
- ✅ Vercel'e deploy et (GitHub repo bağlayarak)
- ✅ Issues ile task tracking yap
- ✅ GitHub Actions ile CI/CD kur
- ✅ README'de badges göster
- ✅ Open source yap ve star'lar topla! ⭐

---

**Başarılar! 🎨🚀**

