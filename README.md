# AI Feedback System - Deployment Guide

## Project Structure

```
task2/
├── backend/          # FastAPI Backend
├── frontend/         # Next.js Frontend
└── README.md         # This file
```

## 🚀 Features

### User Dashboard (Public-Facing)
- ⭐ Star rating system (1-5 stars)
- 📝 Text review input with validation
- 🤖 AI-generated personalized responses
- ✅ Success/error state handling
- 📱 Responsive design

### Admin Dashboard (Internal-Facing)
- 📊 Live analytics (total reviews, average rating, distribution)
- 🔄 Auto-refresh every 10 seconds
- 🎯 Filter reviews by rating
- 📋 Complete review details including:
  - User rating and review
  - AI-generated summary
  - AI-recommended actions
  - User-facing response sent
- 🎨 Color-coded rating badges

## 🛠️ Tech Stack

**Backend:**
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- SQLite/PostgreSQL (Database)
- OpenAI API (LLM integration with fallback)
- Pydantic (Data validation)

**Frontend:**
- Next.js 14 (React framework)
- TypeScript
- Tailwind CSS
- Axios (HTTP client)

## 📋 Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn
- OpenAI API key (optional - has fallback)

## 🔧 Local Development Setup

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
```

3. Activate virtual environment:
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create `.env` file:
```bash
cp .env.example .env
```

6. Edit `.env` and add your OpenAI API key (optional):
```
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-3.5-turbo
DATABASE_URL=sqlite:///./feedback.db
```

7. Run the backend:
```bash
python main.py
```

Backend will run at: `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run the development server:
```bash
npm run dev
```

Frontend will run at: `http://localhost:3000`

## 🌐 Deployment

### Backend Deployment (Render)

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables:**
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `DATABASE_URL`: PostgreSQL connection string (Render provides this)
     - `PYTHON_VERSION`: 3.11

4. Deploy and note your backend URL (e.g., `https://your-app.onrender.com`)

### Frontend Deployment (Vercel)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Navigate to frontend directory and deploy:
```bash
cd frontend
vercel
```

3. Set environment variable in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL`: Your backend URL from Render

4. Redeploy after setting environment variables

### Alternative: Deploy Backend on Railway/Fly.io

**Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

**Fly.io:**
```bash
# Install Fly CLI
# Deploy
fly launch
fly deploy
```

## 🔑 API Endpoints

### Public Endpoints

**POST /api/reviews**
```json
Request:
{
  "rating": 5,
  "review_text": "Great service!"
}

Response:
{
  "id": 1,
  "rating": 5,
  "review_text": "Great service!",
  "user_response": "Thank you for your wonderful feedback!",
  "created_at": "2026-01-12T10:00:00Z"
}
```

### Admin Endpoints

**GET /api/admin/reviews**
- Returns all reviews with AI analysis
- Query params: `skip` (default: 0), `limit` (default: 100)

**GET /api/admin/analytics**
- Returns aggregate statistics

## 🤖 AI Integration

The system uses OpenAI's API for:
1. **User Response Generation** - Personalized thank-you messages
2. **Review Summarization** - Concise summaries for admin
3. **Recommended Actions** - Business action recommendations

**Fallback Mode:** If no API key is provided, the system uses intelligent rule-based responses.

## 🛡️ Error Handling

The system handles:
- ✅ Empty reviews
- ✅ Long reviews (max 5000 characters)
- ✅ LLM API failures (automatic fallback)
- ✅ Network errors
- ✅ Invalid ratings
- ✅ Database errors

## 📱 Accessing the Application

- **User Dashboard:** `/` (root path)
- **Admin Dashboard:** `/admin`

## 🔒 Security Considerations

- All LLM calls are server-side only
- Input validation with Pydantic schemas
- SQL injection protection via SQLAlchemy ORM
- CORS configured for frontend domain
- Environment variables for sensitive data

## 📊 Database Schema

```sql
CREATE TABLE reviews (
    id INTEGER PRIMARY KEY,
    rating INTEGER NOT NULL,
    review_text TEXT NOT NULL,
    user_response TEXT NOT NULL,
    ai_summary TEXT NOT NULL,
    recommended_actions TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🧪 Testing the API

Use the interactive docs:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 📝 Environment Variables

### Backend
- `OPENAI_API_KEY` - OpenAI API key (optional)
- `OPENAI_MODEL` - Model name (default: gpt-3.5-turbo)
- `DATABASE_URL` - Database connection string

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL

## 🐛 Troubleshooting

### Backend won't start
- Check Python version: `python --version`
- Verify virtual environment is activated
- Check all dependencies installed: `pip list`

### Frontend won't start
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node version: `node --version`
- Verify environment variables in `.env.local`

### CORS Errors
- Ensure backend CORS allows your frontend URL
- Update `allow_origins` in `main.py`

### Database Errors
- Delete `feedback.db` and restart backend for fresh database
- Check DATABASE_URL format

## 📄 License

This project is for educational/demonstration purposes.

## 🤝 Contributing

This is a demonstration project. Feel free to fork and customize!
