# PeritIA

This project provides a small Node backend and a static HTML frontend used to practice forensic legal analysis with the OpenAI API.

## Setup

1. Install Node dependencies:

```bash
cd backend
npm install
```

2. Create a `.env` file inside `backend/` with your OpenAI API key. Use `.env.example` as a template:

```bash
cp backend/.env.example backend/.env
# Edit backend/.env and set OPENAI_API_KEY
```

3. Start the API server:

```bash
npm start
```

The server listens on `http://localhost:4000` by default. You can change the port by setting the `PORT` variable in the `.env` file.

## Frontend

Open `index.html` in your browser. The page will communicate with the backend server to analyze text and generate questions.
