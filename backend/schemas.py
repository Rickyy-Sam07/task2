from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional


class ReviewCreate(BaseModel):
    """Schema for creating a new review."""
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5")
    review_text: str = Field(..., min_length=0, max_length=5000, description="User review text")
    
    @validator('review_text')
    def validate_review_text(cls, v):
        """Handle empty reviews and trim whitespace."""
        return v.strip()
    
    class Config:
        json_schema_extra = {
            "example": {
                "rating": 5,
                "review_text": "Great service! Very satisfied with the experience."
            }
        }


class ReviewResponse(BaseModel):
    """Schema for review response to user."""
    id: int
    rating: int
    review_text: str
    user_response: str
    created_at: datetime
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "rating": 5,
                "review_text": "Great service!",
                "user_response": "Thank you for your wonderful feedback!",
                "created_at": "2026-01-12T10:00:00Z"
            }
        }


class AdminReviewResponse(BaseModel):
    """Schema for admin dashboard - includes AI analysis."""
    id: int
    rating: int
    review_text: str
    user_response: str
    ai_summary: str
    recommended_actions: str
    created_at: datetime
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "rating": 5,
                "review_text": "Great service!",
                "user_response": "Thank you for your feedback!",
                "ai_summary": "Customer is highly satisfied with the service.",
                "recommended_actions": "Continue maintaining service quality.",
                "created_at": "2026-01-12T10:00:00Z"
            }
        }
