# PM2 ile Sürekli Çalıştırma Kılavuzu

Bu kılavuz, Finans Çözüm projesini PM2 ile sürekli çalışır durumda tutmak için gerekli adımları içerir.

## 🚀 Hızlı Başlangıç

### 1. İlk Kurulum ve Başlatma

```bash
cd /root/finans-cozum
./deploy.sh
```

Bu script:
- Server ve client'ı build eder
- PM2'yi yükler (eğer yüklü değilse)
- Her iki uygulamayı da PM2 ile başlatır
- Sistem başlangıcında otomatik başlatmayı ayarlar

### 2. Manuel Başlatma

Eğer deploy script'ini kullanmak istemiyorsanız:

```bash
# PM2'yi yükle (eğer yüklü değilse)
npm install -g pm2

# Uygulamaları başlat
cd /root/finans-cozum
pm2 start ecosystem.config.js

# PM2'yi kaydet (sistem yeniden başladığında otomatik başlasın)
pm2 save

# Sistem başlangıcında otomatik başlatmayı ayarla
pm2 startup systemd -u root --hp /root
```

## 📊 PM2 Komutları

### Durum Kontrolü
```bash
pm2 status                    # Tüm uygulamaların durumunu göster
pm2 list                      # Detaylı liste
pm2 info finans-cozum-server  # Server bilgileri
pm2 info finans-cozum-client  # Client bilgileri
```

### Loglar
```bash
pm2 logs                      # Tüm loglar (canlı)
pm2 logs finans-cozum-server  # Sadece server logları
pm2 logs finans-cozum-client  # Sadece client logları
pm2 logs --lines 100          # Son 100 satır
```

### Yönetim
```bash
pm2 restart all               # Tüm uygulamaları yeniden başlat
pm2 restart finans-cozum-server  # Sadece server'ı yeniden başlat
pm2 restart finans-cozum-client  # Sadece client'ı yeniden başlat

pm2 stop all                  # Tüm uygulamaları durdur
pm2 stop finans-cozum-server  # Sadece server'ı durdur
pm2 stop finans-cozum-client  # Sadece client'ı durdur

pm2 start all                 # Tüm uygulamaları başlat
pm2 start finans-cozum-server # Sadece server'ı başlat
pm2 start finans-cozum-client # Sadece client'ı başlat

pm2 delete all                # Tüm uygulamaları PM2'den sil
pm2 delete finans-cozum-server # Sadece server'ı sil
pm2 delete finans-cozum-client # Sadece client'ı sil
```

### Monitoring
```bash
pm2 monit                     # Canlı monitoring (CPU, Memory)
pm2 describe finans-cozum-server  # Detaylı bilgi
```

## 🔄 Otomatik Yeniden Başlatma

PM2 otomatik olarak:
- ✅ Uygulama çökerse yeniden başlatır
- ✅ Sistem yeniden başladığında uygulamaları başlatır
- ✅ Bellek limiti aşılırsa yeniden başlatır (1GB limit)

## 📝 Log Dosyaları

Loglar şu dizinde saklanır:
- `/root/finans-cozum/logs/server-out.log` - Server çıktıları
- `/root/finans-cozum/logs/server-error.log` - Server hataları
- `/root/finans-cozum/logs/client-out.log` - Client çıktıları
- `/root/finans-cozum/logs/client-error.log` - Client hataları

## 🔧 Güncelleme

Kod güncelledikten sonra:

```bash
cd /root/finans-cozum

# Server güncelleme
cd server
npm install
npm run build
cd ..

# Client güncelleme
cd client
npm install
npm run build
cd ..

# PM2'yi yeniden başlat
pm2 restart all
```

## 🛠️ Sorun Giderme

### Uygulama başlamıyorsa:
```bash
pm2 logs finans-cozum-server --lines 50  # Hata loglarını kontrol et
pm2 describe finans-cozum-server         # Detaylı bilgi
```

### Port zaten kullanılıyorsa:
```bash
# Port 3000 veya 3001'i kullanan process'i bul
lsof -i :3000
lsof -i :3001

# Process'i durdur
kill -9 <PID>
```

### PM2'yi tamamen kaldırmak:
```bash
pm2 kill                    # PM2 daemon'ı durdur
pm2 unstartup systemd       # Otomatik başlatmayı kaldır
npm uninstall -g pm2        # PM2'yi kaldır
```

## 📌 Önemli Notlar

1. **Production Build**: PM2 production modda çalışır. Development modda çalıştırmak için `ecosystem.config.js` dosyasındaki `NODE_ENV` değerini değiştirin.

2. **Environment Variables**: `.env` dosyalarının doğru yapılandırıldığından emin olun:
   - `/root/finans-cozum/server/.env`
   - `/root/finans-cozum/client/.env.local`

3. **Database**: PostgreSQL'in çalıştığından emin olun.

4. **Ports**: 
   - Server: `3001`
   - Client: `3000`

## 🔐 Güvenlik

- PM2 log dosyalarını düzenli olarak temizleyin
- Production'da güçlü şifreler kullanın
- Firewall kurallarını kontrol edin


