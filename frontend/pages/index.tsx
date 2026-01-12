import { useState } from 'react'
import Head from 'next/head'
import StarRating from '@/components/StarRating'
import axios from 'axios'
import Squares from '@/components/Squares'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

interface AIResponse {
  id: number
  rating: number
  review_text: string
  user_response: string
  created_at: string
}

export default function Home() {
  const [rating, setRating] = useState<number>(0)
  const [reviewText, setReviewText] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [aiResponse, setAiResponse] = useState<string>('')
  const [showResponse, setShowResponse] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    setIsSubmitting(true)
    setError('')
    setShowResponse(false)

    try {
      const response = await axios.post<AIResponse>(`${API_URL}/api/reviews`, {
        rating,
        review_text: reviewText
      })

      setAiResponse(response.data.user_response)
      setShowResponse(true)
      
      // Reset form
      setRating(0)
      setReviewText('')
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(err.response.data.detail || 'Invalid input')
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.')
      } else {
        setError('Failed to submit review. Please check your connection.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNewReview = () => {
    setShowResponse(false)
    setAiResponse('')
  }

  return (
    <>
      <Head>
        <title>AI Feedback System - Submit Review</title>
        <meta name="description" content="Submit your feedback and receive AI-powered response" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Animated Background */}
      <div className="fixed inset-0" style={{ zIndex: 1 }}>
        <Squares
          speed={0.5}
          squareSize={40}
          direction="diagonal"
          borderColor="rgba(255, 255, 255, 0.3)"
          hoverFillColor="rgba(255, 255, 255, 0.8)"
        />
      </div>

      <main className="relative min-h-screen py-12 px-4" style={{ zIndex: 10 }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-block mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-xl">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
            </div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              Share Your Feedback
            </h1>
            <p className="text-white text-lg font-bold italic">
              " We value your opinion and respond to every review with AI-powered insights!"
            </p>
          </div>

          {!showResponse ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20 transform transition-all duration-300 hover:shadow-blue-500/20">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100">
                  <label className="block text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    How would you rate your experience? *
                  </label>
                  <StarRating rating={rating} onRatingChange={setRating} />
                </div>

                {/* Review Text */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                  <label htmlFor="review" className="block text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    Tell us more about your experience (optional)
                  </label>
                  <textarea
                    id="review"
                    rows={6}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your thoughts, suggestions, or concerns..."
                    maxLength={5000}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400 shadow-inner bg-white/80 backdrop-blur-sm transition-all duration-200"
                  />
                  <div className="text-right text-sm text-gray-600 mt-2 font-medium">
                    {reviewText.length} / 5000 characters
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-md animate-shake">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-700 text-sm font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all duration-300 transform ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 active:scale-95 shadow-lg hover:shadow-xl hover:shadow-purple-500/50'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting Your Feedback...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Submit Review
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <a
                  href="/admin"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Admin Dashboard
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20 animate-fadeIn">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full mb-4 shadow-lg animate-bounce-once">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                  Thank You for Your Feedback!
                </h2>
                <p className="text-gray-600">Your opinion helps us improve our service</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-l-4 border-blue-500 p-6 rounded-xl mb-6 shadow-md">
                <div className="flex items-start gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-2 rounded-lg shadow-md flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2 text-sm">AI Response:</h3>
                    <p className="text-gray-800 leading-relaxed">{aiResponse}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleNewReview}
                className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transform hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Submit Another Review
                </span>
              </button>

              <div className="mt-6 text-center">
                <a
                  href="/admin"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Admin Dashboard
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
