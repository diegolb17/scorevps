# Instrucciones de Despliegue en Hostinger VPS

## Requisitos Previos

- VPS con Docker instalado
- Acceso SSH al servidor
- Puerto 3000 disponible (o el que prefieras)

## Pasos para Desplegar

### 1. Subir archivos al servidor

Usa SCP o SFTP para subir los siguientes archivos a tu VPS:

```
server.js
package.json
Dockerfile
.dockerignore
docker-compose.yml
```

### 2. Conectarse al servidor VPS

```bash
ssh usuario@tu-vps-hostinger.com
```

### 3. Navegar al directorio del proyecto

```bash
cd /ruta/a/tu/proyecto
```

### 4. Construir la imagen Docker

```bash
docker build -t api-sentinel-bot .
```

### 5. Ejecutar el contenedor

**Opción A: Usando Docker directamente**

```bash
docker run -d \
  --name api-sentinel \
  -p 3000:3000 \
  --shm-size=2gb \
  --restart unless-stopped \
  api-sentinel-bot
```

**Opción B: Usando Docker Compose (recomendado)**

```bash
docker-compose up -d
```

### 6. Verificar que está funcionando

```bash
# Ver logs
docker logs api-sentinel

# Verificar que el contenedor está corriendo
docker ps

# Probar el endpoint de salud
curl http://localhost:3000/health
```

### 7. Configurar firewall (si es necesario)

Si necesitas exponer el puerto externamente:

```bash
# UFW (Ubuntu)
sudo ufw allow 3000/tcp

# O configurar tu firewall según tu distribución
```

### 8. Configurar Nginx como reverse proxy (opcional pero recomendado)

Si quieres usar un dominio y SSL:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Comandos Útiles

### Ver logs en tiempo real
```bash
docker logs -f api-sentinel
```

### Reiniciar el contenedor
```bash
docker restart api-sentinel
```

### Detener el contenedor
```bash
docker stop api-sentinel
```

### Eliminar el contenedor
```bash
docker stop api-sentinel
docker rm api-sentinel
```

### Actualizar el código
```bash
# Detener contenedor
docker-compose down

# Reconstruir imagen
docker build -t api-sentinel-bot .

# Iniciar nuevamente
docker-compose up -d
```

## Probar la API

```bash
curl -X POST http://tu-servidor:3000/api/credit-score \
  -H "Content-Type: application/json" \
  -d '{
    "username": "74096313",
    "password": "tu_contraseña"
  }'
```

## Solución de Problemas

### Error: "Failed to launch the browser process"

Asegúrate de que el contenedor tenga suficiente memoria compartida:
```bash
docker run --shm-size=2gb ...
```

### Error: "Navigation timeout"

Aumenta el timeout en el código o verifica la conexión a internet del servidor.

### El contenedor se detiene inmediatamente

Revisa los logs:
```bash
docker logs api-sentinel
```
