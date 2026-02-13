# API Sentinel - Score Crediticio

API REST para obtener el score crediticio y nombre de usuario desde Mi Sentinel.

## Características

- Endpoint POST para obtener score crediticio
- Extracción automática del nombre del usuario
- Ejecución en modo headless (sin interfaz gráfica)
- Listo para Docker

## Instalación Local

```bash
npm install
npm start
```

## Uso de la API

### Endpoint: POST `/api/credit-score`

**Request Body:**
```json
{
  "username": "74096313",
  "password": "tu_contraseña"
}
```

**Response Exitosa:**
```json
{
  "success": true,
  "score": 921,
  "name": "DIEGO MANUEL LUNA",
  "username": "74096313"
}
```

**Response con Error:**
```json
{
  "success": false,
  "error": "Mensaje de error",
  "score": null,
  "name": null,
  "username": "74096313"
}
```

### Endpoint de Salud: GET `/health`

```bash
curl http://localhost:3000/health
```

## Docker

### Construir la imagen

```bash
docker build -t api-sentinel-bot .
```

### Ejecutar el contenedor

```bash
docker run -d \
  --name api-sentinel \
  -p 3000:3000 \
  --shm-size=2gb \
  api-sentinel-bot
```

### Usar Docker Compose

```bash
docker-compose up -d
```

## Ejemplo de Uso con cURL

```bash
curl -X POST http://localhost:3000/api/credit-score \
  -H "Content-Type: application/json" \
  -d '{
    "username": "74096313",
    "password": "tu_contraseña"
  }'
```

## Variables de Entorno

- `PORT`: Puerto del servidor (default: 3000)

## Notas

- El servidor ejecuta Puppeteer en modo headless
- Se requiere suficiente memoria compartida (shm_size) para Puppeteer
- El tiempo de respuesta puede variar según la velocidad de carga de la página
