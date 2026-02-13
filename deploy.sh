#!/bin/bash

echo "🚀 Desplegando API Sentinel en Hostinger VPS..."

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Instalando..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
fi

# Verificar que Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Instalando..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Construir y ejecutar
echo "📦 Construyendo imagen Docker..."
docker-compose down
docker-compose up -d --build

# Esperar a que el servicio esté listo
echo "⏳ Esperando a que el servicio esté listo..."
sleep 5

# Verificar estado
if docker ps | grep -q api-sentinel-bot; then
    echo "✅ Servicio desplegado correctamente!"
    echo ""
    echo "📍 Endpoint disponible en:"
    echo "   http://$(hostname -I | awk '{print $1}'):3000/api/credit-score"
    echo ""
    echo "🔍 Ver logs con: docker logs -f api-sentinel-bot"
    echo "🛑 Detener con: docker-compose down"
else
    echo "❌ Error al desplegar. Revisa los logs:"
    docker logs api-sentinel-bot
fi
