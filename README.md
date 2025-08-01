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
