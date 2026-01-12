# Quick Start Guide

## 1. Backend Setup (5 minutes)

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
python main.py
```

Backend runs at: http://localhost:8000

## 2. Frontend Setup (3 minutes)

Open new terminal:

```bash
cd frontend
npm install
```

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
npm run dev
```

Frontend runs at: http://localhost:3000

## 3. Test the Application

### User Dashboard (http://localhost:3000)
1. Select a star rating (1-5)
2. Write a review (optional)
3. Submit
4. See AI-generated response

### Admin Dashboard (http://localhost:3000/admin)
1. View all reviews
2. See AI summaries and recommended actions
3. Filter by rating
4. Auto-refreshes every 10 seconds

## 4. API Documentation

Interactive docs: http://localhost:8000/docs

## 5. Optional: Add OpenAI API Key

Create `backend/.env`:
```
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-3.5-turbo
```

Without API key, the system uses intelligent fallback responses.

## Deploy to Production

### Backend (Render)
1. Push to GitHub
2. Create Web Service on Render
3. Connect repository
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel)
```bash
cd frontend
npm install -g vercel
vercel
```

Set `NEXT_PUBLIC_API_URL` in Vercel dashboard to your Render backend URL.

## Need Help?

Check README.md for detailed documentation!
