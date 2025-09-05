# PeritIA

This project provides a small Node backend and a static HTML frontend used to practice forensic legal analysis with the OpenAI API.

## Setup

1. Install Node dependencies:

```bash
cd backend
npm install
```

2. Copy `backend/.env.example` to `backend/.env` and edit it:

```bash
cp backend/.env.example backend/.env
# Open backend/.env and set OPENAI_API_KEY
# Optionally set PORT if you don't want the default 4000
```

3. Start the API server:

```bash
npm start
```

The server listens on `http://localhost:4000` by default. You can change the port by setting the `PORT` variable in the `.env` file.

## Frontend

Open `index.html` in your browser. The page will communicate with the backend server to analyze text and generate questions.

## Configuración del backend

El frontend obtiene la URL del servidor desde variables de entorno. Durante el
desarrollo, Vite usa `VITE_API_BASE_URL` y en la versión compilada se emplea
`API_BASE_URL`. Ajusta estos valores si el backend corre en otra máquina o si
el acceso se realiza por **HTTPS**.

Ejemplos de uso:

```bash
# Ejecutar el frontend en modo desarrollo apuntando a un backend remoto
VITE_API_BASE_URL="http://192.168.1.10:4000" npm run dev

# Compilar la aplicación especificando un backend con HTTPS
API_BASE_URL="https://api.midominio.com" npm run build
```
