#!/bin/bash

# Finans Çözüm Deployment Script
# Bu script projeyi build eder ve PM2 ile başlatır

set -e

echo "🚀 Finans Çözüm Deployment Başlatılıyor..."

# Proje dizinine git
cd /root/finans-cozum

# Logs dizinini oluştur
mkdir -p logs

# Server build
echo "📦 Server build ediliyor..."
cd server
npm install
npm run build
cd ..

# Client build
echo "📦 Client build ediliyor..."
cd client
npm install
npm run build
cd ..

# PM2'yi yükle (eğer yüklü değilse)
if ! command -v pm2 &> /dev/null; then
    echo "📥 PM2 yükleniyor..."
    npm install -g pm2
fi

# PM2 ile uygulamaları başlat/durumunu güncelle
echo "🔄 PM2 ile uygulamalar başlatılıyor..."
pm2 delete finans-cozum-server finans-cozum-client 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# PM2'yi sistem başlangıcında otomatik başlat
pm2 startup systemd -u root --hp /root

echo "✅ Deployment tamamlandı!"
echo ""
echo "📊 Durum kontrolü için: pm2 status"
echo "📝 Loglar için: pm2 logs"
echo "🛑 Durdurmak için: pm2 stop all"
echo "▶️  Başlatmak için: pm2 start all"
echo "🔄 Yeniden başlatmak için: pm2 restart all"

