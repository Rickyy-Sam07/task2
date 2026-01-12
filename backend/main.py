from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import uvicorn
from dotenv import load_dotenv
import os
from functools import lru_cache

# Load environment variables from .env file
load_dotenv()

from database import get_db, engine, Base
from models import Review
from schemas import ReviewCreate, ReviewResponse, AdminReviewResponse
from ai_service import AIService

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Feedback System", version="1.0.0")

# Log environment status
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.info(f"GROQ_API_KEY loaded: {'Yes' if os.getenv('GROQ_API_KEY') else 'No'}")

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ai_service = AIService()


@app.get("/")
def read_root():
    return {"message": "AI Feedback System API", "version": "1.0.0"}


@app.post("/api/reviews", response_model=ReviewResponse, status_code=201)
async def create_review(review: ReviewCreate, db: Session = Depends(get_db)):
    """
    Submit a new review with rating and text.
    Returns AI-generated response to the user.
    """
    # Validate rating
    if not 1 <= review.rating <= 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    try:
        # Generate AI response for user
        user_response = await ai_service.generate_user_response(
            rating=review.rating,
            review_text=review.review_text
        )
        
        # Generate AI summary and recommendations for admin (async processing)
        summary = await ai_service.generate_summary(review.review_text)
        recommended_actions = await ai_service.generate_recommended_actions(
            rating=review.rating,
            review_text=review.review_text,
            summary=summary
        )
        
        # Create database entry
        db_review = Review(
            rating=review.rating,
            review_text=review.review_text,
            user_response=user_response,
            ai_summary=summary,
            recommended_actions=recommended_actions
        )
        
        db.add(db_review)
        db.commit()
        db.refresh(db_review)
        
        return ReviewResponse(
            id=db_review.id,
            rating=db_review.rating,
            review_text=db_review.review_text,
            user_response=db_review.user_response,
            created_at=db_review.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating review: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process review. Please try again later."
        )


@app.get("/api/admin/reviews", response_model=List[AdminReviewResponse])
def get_all_reviews(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Admin endpoint: Get all reviews with AI summaries and recommended actions.
    """
    try:
        reviews = db.query(Review).order_by(Review.created_at.desc()).offset(skip).limit(limit).all()
        return reviews
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch reviews"
        )


@app.get("/api/admin/analytics")
def get_analytics(db: Session = Depends(get_db)):
    """
    Admin endpoint: Get analytics data.
    """
    try:
        total_reviews = db.query(Review).count()
        
        # Count by rating
        rating_distribution = {}
        for rating in range(1, 6):
            count = db.query(Review).filter(Review.rating == rating).count()
            rating_distribution[f"rating_{rating}"] = count
        
        # Average rating
        from sqlalchemy import func
        avg_rating = db.query(func.avg(Review.rating)).scalar() or 0
        
        # Calculate sentiment percentages
        positive = rating_distribution.get("rating_5", 0) + rating_distribution.get("rating_4", 0)
        neutral = rating_distribution.get("rating_3", 0)
        negative = rating_distribution.get("rating_2", 0) + rating_distribution.get("rating_1", 0)
        
        positive_pct = (positive / total_reviews * 100) if total_reviews > 0 else 0
        neutral_pct = (neutral / total_reviews * 100) if total_reviews > 0 else 0
        negative_pct = (negative / total_reviews * 100) if total_reviews > 0 else 0
        
        return {
            "total_reviews": total_reviews,
            "average_rating": round(float(avg_rating), 2),
            "rating_distribution": rating_distribution,
            "sentiment_analysis": {
                "positive": positive,
                "positive_percentage": round(positive_pct, 1),
                "neutral": neutral,
                "neutral_percentage": round(neutral_pct, 1),
                "negative": negative,
                "negative_percentage": round(negative_pct, 1)
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch analytics"
        )


@app.get("/api/admin/ai-insights")
async def get_ai_insights(db: Session = Depends(get_db)):
    """
    Admin endpoint: Get AI-powered insights about all reviews.
    """
    try:
        reviews = db.query(Review).all()
        
        if len(reviews) == 0:
            return {
                "insights": "No reviews available yet. Start collecting feedback to get AI-powered insights!",
                "strengths": [],
                "weaknesses": [],
                "recommendations": []
            }
        
        # Gather statistics
        total = len(reviews)
        from sqlalchemy import func
        avg_rating = db.query(func.avg(Review.rating)).scalar() or 0
        
        rating_counts = {}
        for rating in range(1, 6):
            rating_counts[rating] = db.query(Review).filter(Review.rating == rating).count()
        
        # Sample reviews for AI analysis
        high_rated = db.query(Review).filter(Review.rating >= 4).order_by(Review.created_at.desc()).limit(5).all()
        low_rated = db.query(Review).filter(Review.rating <= 2).order_by(Review.created_at.desc()).limit(5).all()
        
        # Build context for AI
        context = f"""Analyze this customer feedback data:
        
Total Reviews: {total}
Average Rating: {round(float(avg_rating), 2)}/5
Rating Distribution:
- 5 stars: {rating_counts.get(5, 0)} ({rating_counts.get(5, 0)/total*100:.1f}%)
- 4 stars: {rating_counts.get(4, 0)} ({rating_counts.get(4, 0)/total*100:.1f}%)
- 3 stars: {rating_counts.get(3, 0)} ({rating_counts.get(3, 0)/total*100:.1f}%)
- 2 stars: {rating_counts.get(2, 0)} ({rating_counts.get(2, 0)/total*100:.1f}%)
- 1 star: {rating_counts.get(1, 0)} ({rating_counts.get(1, 0)/total*100:.1f}%)

Sample High-Rated Reviews:
{chr(10).join([f"- {r.review_text[:100]}" for r in high_rated if r.review_text])}

Sample Low-Rated Reviews:
{chr(10).join([f"- {r.review_text[:100]}" for r in low_rated if r.review_text])}

Based on this data, provide:
1. Overall insights about customer satisfaction
2. Key strengths (what customers love)
3. Key weaknesses (what needs improvement)
4. Strategic recommendations for the business"""

        system_prompt = """You are a business analytics AI. Analyze customer feedback data and provide actionable insights.
        Be specific, concise, and focus on what the business should do. Use plain text without markdown formatting."""
        
        ai_response = await ai_service._call_llm(system_prompt, context)
        
        # Parse the response (simple split by sections)
        sections = ai_response.split("\n\n")
        
        return {
            "insights": ai_response,
            "total_reviews_analyzed": total,
            "average_rating": round(float(avg_rating), 2)
        }
        
    except Exception as e:
        logger.error(f"AI Insights error: {str(e)}")
        return {
            "insights": "Unable to generate insights at this time. Please try again later.",
            "error": str(e)
        }


@app.get("/health")
def health_check():
    """Health check endpoint for deployment monitoring."""
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
