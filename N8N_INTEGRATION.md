# Guía de Integración con n8n

## Paso 1: Desplegar en Hostinger VPS

### 1.1 Conectarse al servidor VPS

```bash
ssh usuario@tu-vps-hostinger.com
```

### 1.2 Crear directorio del proyecto

```bash
mkdir -p ~/api-sentinel
cd ~/api-sentinel
```

### 1.3 Subir archivos al servidor

Desde tu máquina local, sube los archivos necesarios:

```bash
scp server.js package.json Dockerfile .dockerignore docker-compose.yml usuario@tu-vps-hostinger.com:~/api-sentinel/
```

O usa un cliente SFTP como FileZilla para subir los archivos.

### 1.4 Construir y ejecutar con Docker

```bash
cd ~/api-sentinel
docker-compose up -d --build
```

### 1.5 Verificar que está funcionando

```bash
# Ver logs
docker logs api-sentinel-bot

# Probar localmente
curl http://localhost:3000/health
```

### 1.6 Configurar firewall (si es necesario)

```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 3000/tcp
sudo ufw reload

# O el firewall que uses
```

## Paso 2: Configurar acceso externo

### Opción A: Exponer directamente el puerto (más simple)

Si tu VPS tiene IP pública, ya debería ser accesible en:
```
http://TU_IP_VPS:3000
```

### Opción B: Configurar Nginx como reverse proxy (recomendado)

Si tienes un dominio, configura Nginx:

```bash
sudo nano /etc/nginx/sites-available/api-sentinel
```

Contenido del archivo:

```nginx
server {
    listen 80;
    server_name api-sentinel.tu-dominio.com;  # Cambia por tu dominio

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout aumentado para requests largos
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }
}
```

Activar el sitio:

```bash
sudo ln -s /etc/nginx/sites-available/api-sentinel /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Paso 3: Configurar en n8n

### 3.1 Crear un nuevo workflow en n8n

1. Abre n8n
2. Crea un nuevo workflow
3. Agrega un nodo **"HTTP Request"**

### 3.2 Configurar el nodo HTTP Request

**Configuración básica:**

- **Method:** `POST`
- **URL:** 
  - Si usas IP directa: `http://TU_IP_VPS:3000/api/credit-score`
  - Si usas dominio: `http://api-sentinel.tu-dominio.com/api/credit-score`
  - Si n8n está en el mismo servidor: `http://localhost:3000/api/credit-score`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "username": "{{ $json.username }}",
  "password": "{{ $json.password }}"
}
```

O si quieres valores fijos:
```json
{
  "username": "74096313",
  "password": "Chalaca17*"
}
```

### 3.3 Ejemplo completo de workflow n8n

**Nodo 1: Manual Trigger (opcional)**
- Para testing manual

**Nodo 2: Set (opcional)**
- Para definir las credenciales
- Campo: `username` = `74096313`
- Campo: `password` = `Chalaca17*`

**Nodo 3: HTTP Request**
- Method: `POST`
- URL: `http://TU_IP_VPS:3000/api/credit-score`
- Headers: `Content-Type: application/json`
- Body: 
```json
{
  "username": "{{ $json.username }}",
  "password": "{{ $json.password }}"
}
```

**Nodo 4: Code (opcional - para procesar respuesta)**
```javascript
const response = $input.item.json;

if (response.success) {
  return {
    json: {
      score: response.score,
      nombre: response.name,
      usuario: response.username,
      mensaje: `Score crediticio: ${response.score} para ${response.name}`
    }
  };
} else {
  throw new Error(`Error: ${response.error}`);
}
```

## Paso 4: Probar la conexión

### Desde la terminal del VPS:

```bash
curl -X POST http://localhost:3000/api/credit-score \
  -H "Content-Type: application/json" \
  -d '{
    "username": "74096313",
    "password": "Chalaca17*"
  }'
```

### Desde n8n:

1. Ejecuta el workflow manualmente
2. Verifica que recibes la respuesta:
```json
{
  "success": true,
  "score": 921,
  "name": "DIEGO MANUEL LUNA",
  "username": "74096313"
}
```

## Solución de Problemas

### Error: "Connection refused" desde n8n

- Verifica que el puerto 3000 esté abierto en el firewall
- Verifica que el contenedor esté corriendo: `docker ps`
- Verifica los logs: `docker logs api-sentinel-bot`

### Error: "CORS" 

El servidor ya tiene CORS habilitado, pero si tienes problemas, verifica que el header `Origin` esté permitido.

### Error: "Timeout"

- Aumenta el timeout en n8n (Settings → Timeout)
- El proceso puede tardar 10-30 segundos en completarse

### Verificar que el servicio está corriendo

```bash
# Ver estado del contenedor
docker ps

# Ver logs en tiempo real
docker logs -f api-sentinel-bot

# Reiniciar si es necesario
docker restart api-sentinel-bot
```

## URLs de ejemplo según tu configuración

- **Mismo servidor (n8n y API):** `http://localhost:3000/api/credit-score`
- **IP pública:** `http://123.456.789.0:3000/api/credit-score`
- **Con dominio:** `http://api-sentinel.tu-dominio.com/api/credit-score`
- **Con SSL (si configuraste):** `https://api-sentinel.tu-dominio.com/api/credit-score`

## Seguridad Adicional (Opcional)

Si quieres agregar autenticación básica al endpoint:

1. Agrega un token en el servidor
2. Envía el token en el header desde n8n
3. Valida el token antes de procesar

¿Quieres que agregue autenticación por token al servidor?
