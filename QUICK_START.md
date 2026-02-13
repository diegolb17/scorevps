# Guía Rápida: Desplegar API en Hostinger y usar en n8n

## 🚀 Despliegue Rápido (5 minutos)

### 1. Subir archivos al VPS

```bash
# Desde tu máquina local
scp -r server.js package.json Dockerfile .dockerignore docker-compose.yml usuario@tu-vps-hostinger.com:~/api-sentinel/
```

### 2. En el servidor VPS

```bash
# Conectarse
ssh usuario@tu-vps-hostinger.com

# Ir al directorio
cd ~/api-sentinel

# Construir y ejecutar
docker-compose up -d --build

# Verificar
docker logs api-sentinel-bot
curl http://localhost:3000/health
```

### 3. Abrir puerto (si es necesario)

```bash
sudo ufw allow 3000/tcp
```

### 4. Obtener IP de tu VPS

```bash
curl ifconfig.me
# O revisa en el panel de Hostinger
```

## 📋 Configurar en n8n

### Paso 1: Crear HTTP Request Node

1. En n8n, arrastra un nodo **"HTTP Request"**
2. Configura:
   - **Method:** `POST`
   - **URL:** `http://TU_IP_VPS:3000/api/credit-score`
   - **Headers:** 
     ```
     Content-Type: application/json
     ```
   - **Body (JSON):**
     ```json
     {
       "username": "74096313",
       "password": "Chalaca17*"
     }
     ```
   - **Timeout:** `60000` (60 segundos)

### Paso 2: Probar

1. Ejecuta el workflow
2. Deberías recibir:
   ```json
   {
     "success": true,
     "score": 921,
     "name": "DIEGO MANUEL LUNA",
     "username": "74096313"
   }
   ```

## 🔧 URLs según tu configuración

- **Mismo servidor:** `http://localhost:3000/api/credit-score`
- **IP pública:** `http://123.456.789.0:3000/api/credit-score`
- **Con dominio:** `http://api.tu-dominio.com/api/credit-score`

## ✅ Verificación Rápida

```bash
# En el VPS
curl -X POST http://localhost:3000/api/credit-score \
  -H "Content-Type: application/json" \
  -d '{"username":"74096313","password":"Chalaca17*"}'
```

Si ves la respuesta JSON con `score` y `name`, ¡está funcionando!

## 🆘 Problemas Comunes

**No puedo conectar desde n8n:**
- Verifica que el puerto 3000 esté abierto: `sudo ufw status`
- Verifica que el contenedor esté corriendo: `docker ps`
- Prueba desde el servidor: `curl http://localhost:3000/health`

**Timeout en n8n:**
- Aumenta el timeout a 60000ms (60 segundos)
- El proceso puede tardar 10-30 segundos

**Error en la respuesta:**
- Revisa los logs: `docker logs api-sentinel-bot`
- Verifica las credenciales en n8n
