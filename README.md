# PeritIA

This project provides a small Node backend and a static HTML frontend used to practice forensic legal analysis with the OpenAI API.

## Setup

1. Install Node dependencies:

```bash
npm install
cd backend
npm install
```

2. Copy `backend/.env.example` to `backend/.env` and edit it:

```bash
cp backend/.env.example backend/.env
# Open backend/.env and set OPENAI_API_KEY
# Optionally set PORT if you don't want the default 4000
```

3. Start the backend and frontend together:

```bash
npm run dev
```

The server listens on `http://127.0.0.1:4000` by default. On some Windows setups `localhost` may fail to resolve, so using the numeric IP avoids that problem. You can change the port by setting the `PORT` variable in the `.env` file.

### Health check

The backend exposes a simple endpoint to verify that it is running:

```
GET /api/health
```

It responds with:

```json
{ "status": "ok" }
```

## Frontend

Open `index.html` in your browser. The page will communicate with the backend server to analyze text and generate questions.

## Configuración del backend

El frontend necesita saber dónde está el backend. La URL base (`API_BASE_URL`)
puede configurarse de dos formas:

1. **Variable de entorno**. Durante el desarrollo con Vite se usa
   `VITE_API_BASE_URL` y en la versión compilada `API_BASE_URL`.  Ejemplo de
   ejecución local:

   ```bash
   # Iniciar el backend y el frontend
   npm run dev
   ```

2. **Inyección en `window.API_BASE_URL`**. Para servir archivos estáticos, basta
   con definir la variable antes de cargar los scripts del frontend:

   ```html
   <script>
     window.API_BASE_URL = "https://api.midominio.com";
   </script>
   ```

Ajusta estos valores si el backend corre en otra máquina o si se accede por
**HTTPS**.

## Ejemplos para establecer `API_BASE_URL`

Cuando se sirve el frontend con herramientas como `live-server`, la URL del
backend puede definirse mediante la variable de entorno `VITE_API_BASE_URL`
(o `API_BASE_URL` en producción). Los comandos varían según la plataforma:

En Windows, algunos entornos no resuelven `localhost` correctamente; en esos casos usa `http://127.0.0.1:4000`.

### Comando unificado

```bash
npm run dev
```


### Linux/macOS (Bash)

```bash
VITE_API_BASE_URL=http://localhost:4000 npx live-server
```

### Windows CMD

```cmd
set VITE_API_BASE_URL=http://127.0.0.1:4000 && npx live-server
```

### PowerShell

```powershell
$env:VITE_API_BASE_URL="http://127.0.0.1:4000"; npx live-server
```
