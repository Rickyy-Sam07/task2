import os
from typing import Optional
import httpx
from fastapi import HTTPException
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AIService:
    """Service for handling all AI/LLM operations."""
    
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY", "")
        self.api_base = "https://api.groq.com/openai/v1"
        self.model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        self.timeout = 30.0
        
        # Fallback mode if no API key is provided
        self.use_fallback = not self.api_key
        
        if self.use_fallback:
            logger.warning("No GROQ_API_KEY found. Using fallback responses.")
        else:
            logger.info(f"Groq AI enabled with model: {self.model}")
    
    async def _call_llm(self, system_prompt: str, user_prompt: str) -> str:
        """
        Internal method to call LLM API with error handling.
        Falls back to rule-based responses if API fails.
        """
        if self.use_fallback:
            logger.info("Using fallback response (no API key)")
            return self._fallback_response(system_prompt, user_prompt)
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.api_base}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        "temperature": 0.9,  # Increased for more variety
                        "max_tokens": 500
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    ai_response = data["choices"][0]["message"]["content"].strip()
                    logger.info(f"✓ Groq API call successful")
                    return ai_response
                else:
                    logger.error(f"Groq API error: {response.status_code} - {response.text}")
                    return self._fallback_response(system_prompt, user_prompt)
                    
        except Exception as e:
            logger.error(f"Groq API exception: {str(e)}")
            return self._fallback_response(system_prompt, user_prompt)
    
    def _fallback_response(self, system_prompt: str, user_prompt: str) -> str:
        """Rule-based fallback when LLM API is unavailable."""
        # Normalize for checking
        user_prompt_lower = user_prompt.lower()
        
        if "customer service" in system_prompt.lower() or "friendly" in system_prompt.lower():
            # User-facing response - check for rating patterns
            if "rating: 5/5" in user_prompt_lower or "rating: 4/5" in user_prompt_lower:
                return "Thank you for your positive feedback! We're delighted to hear about your great experience. Your satisfaction is our top priority!"
            elif "rating: 3/5" in user_prompt_lower:
                return "Thank you for your feedback. We appreciate your input and are always looking for ways to improve our service."
            elif "rating: 2/5" in user_prompt_lower or "rating: 1/5" in user_prompt_lower:
                return "Thank you for sharing your experience with us. We take your feedback seriously and will work to address your concerns."
            else:
                return "Thank you for your feedback! We truly appreciate you taking the time to share your thoughts with us."
        
        elif "summary" in system_prompt.lower() or "summarize" in system_prompt.lower():
            # Summary generation
            if not user_prompt or user_prompt.strip() == "" or "no text provided" in user_prompt_lower:
                return "No review text provided."
            elif len(user_prompt) > 200:
                return f"Detailed customer feedback: {user_prompt[:150]}..."
            else:
                return f"Customer feedback: {user_prompt}"
        
        elif "recommended actions" in system_prompt.lower() or "recommendations" in system_prompt.lower():
            # Recommended actions - check for rating patterns
            if "rating: 5/5" in user_prompt_lower or "rating: 4/5" in user_prompt_lower:
                return "1. Send thank you message\n2. Maintain current service quality\n3. Consider requesting testimonial"
            elif "rating: 3/5" in user_prompt_lower:
                return "1. Follow up with customer to understand concerns\n2. Review service processes\n3. Implement improvements"
            else:
                return "1. Immediate follow-up required\n2. Investigate issues mentioned\n3. Offer resolution or compensation\n4. Prevent similar issues"
        
        return "Thank you for your feedback! We appreciate your input."
    
    async def generate_user_response(self, rating: int, review_text: str) -> str:
        """
        Generate AI response to show to the user after submission.
        Handles empty reviews and provides appropriate responses.
        """
        system_prompt = """You are a friendly customer service AI. Generate a personalized, 
        empathetic response to the customer's review. Keep it concise (2-3 sentences). 
        Acknowledge their rating and feedback appropriately. Make each response unique and varied."""
        
        if not review_text or review_text.strip() == "":
            user_prompt = f"Rating: {rating}/5. No written review provided."
        else:
            user_prompt = f"Rating: {rating}/5. Review: {review_text}"
        
        logger.info(f"Generating user response for rating: {rating}")
        return await self._call_llm(system_prompt, user_prompt)
    
    async def generate_summary(self, review_text: str) -> str:
        """
        Generate AI summary of the review for admin dashboard.
        Handles empty and long reviews.
        """
        if not review_text or review_text.strip() == "":
            return "No review text provided."
        
        system_prompt = """You are an AI assistant that summarizes customer reviews. 
        Provide a concise summary (1-2 sentences) highlighting key points and sentiment."""
        
        # Truncate very long reviews for API
        truncated_text = review_text[:2000] if len(review_text) > 2000 else review_text
        user_prompt = f"Summarize this review: {truncated_text}"
        
        return await self._call_llm(system_prompt, user_prompt)
    
    async def generate_recommended_actions(self, rating: int, review_text: str, summary: str) -> str:
        """
        Generate AI-recommended actions for admin based on the review.
        """
        system_prompt = """You are an AI assistant that recommends actions based on customer feedback. 
        Provide 2-4 specific, actionable recommendations for the business. Format as a simple numbered list.
        Do not use markdown formatting like ** or bold text. Use plain text only."""
        
        user_prompt = f"""Rating: {rating}/5
Review: {review_text if review_text else 'No text provided'}
Summary: {summary}

What actions should the business take?"""
        
        return await self._call_llm(system_prompt, user_prompt)
