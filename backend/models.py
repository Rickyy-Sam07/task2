from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from sqlalchemy.sql import func
from database import Base


class Review(Base):
    """Database model for storing user reviews and AI-generated content."""
    
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    rating = Column(Integer, nullable=False)
    review_text = Column(Text, nullable=False)
    user_response = Column(Text, nullable=False)  # AI response shown to user
    ai_summary = Column(Text, nullable=False)  # AI summary for admin
    recommended_actions = Column(Text, nullable=False)  # AI recommended actions
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<Review(id={self.id}, rating={self.rating})>"
