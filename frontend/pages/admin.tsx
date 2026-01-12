import { useState, useEffect } from 'react'
import Head from 'next/head'
import axios from 'axios'
import dynamic from 'next/dynamic'
import AnalyticsCharts from '@/components/AnalyticsCharts'
import AIInsightsPanel from '@/components/AIInsightsPanel'

const Balatro = dynamic(() => import('@/components/Balatro'), { ssr: false })

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

interface Review {
  id: number
  rating: number
  review_text: string
  user_response: string
  ai_summary: string
  recommended_actions: string
  created_at: string
}

interface Analytics {
  total_reviews: number
  average_rating: number
  rating_distribution: {
    rating_1: number
    rating_2: number
    rating_3: number
    rating_4: number
    rating_5: number
  }
  sentiment_analysis: {
    positive: number
    positive_percentage: number
    neutral: number
    neutral_percentage: number
    negative: number
    negative_percentage: number
  }
}

export default function Admin() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true)

  const fetchData = async () => {
    try {
      const [reviewsRes, analyticsRes] = await Promise.all([
        axios.get<Review[]>(`${API_URL}/api/admin/reviews`),
        axios.get<Analytics>(`${API_URL}/api/admin/analytics`)
      ])
      
      setReviews(reviewsRes.data)
      setAnalytics(analyticsRes.data)
      setError('')
    } catch (err) {
      setError('Failed to fetch data. Please check if the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Auto-refresh every 10 seconds
    let interval: NodeJS.Timeout | null = null
    if (autoRefresh) {
      interval = setInterval(fetchData, 10000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const filteredReviews = filterRating
    ? reviews.filter(r => r.rating === filterRating)
    : reviews

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600 bg-green-100'
    if (rating === 3) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - AI Feedback System</title>
        <meta name="description" content="Admin dashboard for managing feedback" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <Balatro
          spinRotation={-1.5}
          spinSpeed={4.0}
          color1="#10b981"
          color2="#fbbf24"
          color3="#ffffff"
          contrast={2.5}
          lighting={0.3}
          spinAmount={0.2}
          pixelFilter={800.0}
          isRotate={true}
          mouseInteraction={true}
        />
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
      </div>

      <main className="relative z-10 min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 text-sm">Real-time feedback analytics and insights</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg ${
                    autoRefresh
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-green-500/50'
                      : 'bg-white text-gray-700 hover:shadow-xl'
                  }`}
                >
                  {autoRefresh ? <span>&#10227; Auto-refresh ON</span> : <span>⏸ Auto-refresh OFF</span>}
                </button>
                <button
                  onClick={fetchData}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl text-sm font-semibold hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300"
                >
                  <span>&#10227; Refresh Now</span>
                </button>
                <a
                  href="/"
                  className="px-5 py-2.5 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-xl text-sm font-semibold hover:shadow-xl hover:shadow-gray-500/50 transition-all duration-300"
                >
                  ← User Dashboard
                </a>
              </div>
            </div>
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-4 rounded-xl shadow-lg">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Analytics Cards */}
          {analytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-6 border border-blue-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Total Reviews</h3>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{analytics.total_reviews}</p>
                </div>
                
                <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-xl p-6 border border-amber-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Average Rating</h3>
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-4xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {analytics.average_rating.toFixed(1)} <span className="text-2xl">⭐</span>
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-xl p-6 border-l-4 border-green-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-700 text-sm font-semibold uppercase tracking-wide">Positive Feedback</h3>
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-4xl font-extrabold text-green-600">
                    {analytics.sentiment_analysis.positive_percentage}%
                  </p>
                  <p className="text-sm text-gray-600 mt-2 font-medium">
                    {analytics.sentiment_analysis.positive} reviews
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl shadow-xl p-6 border-l-4 border-red-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-700 text-sm font-semibold uppercase tracking-wide">Needs Attention</h3>
                    <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-pink-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-4xl font-extrabold text-red-600">
                    {analytics.sentiment_analysis.negative_percentage}%
                  </p>
                  <p className="text-sm text-gray-600 mt-2 font-medium">
                    {analytics.sentiment_analysis.negative} reviews
                  </p>
                </div>
              </div>

              {/* AI Insights Panel */}
              <AIInsightsPanel />

              {/* Charts */}
              <AnalyticsCharts analytics={analytics} />
            </>
          )}

          {/* Old Rating Distribution Card - Remove this */}
          {analytics && false && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium mb-2">Total Reviews</h3>
                <p className="text-3xl font-bold text-gray-800">{analytics.total_reviews}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium mb-2">Average Rating</h3>
                <p className="text-3xl font-bold text-gray-800">
                  {analytics.average_rating.toFixed(1)} ⭐
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium mb-2">Rating Distribution</h3>
                <div className="space-y-1 text-sm">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <div key={rating} className="flex items-center justify-between">
                      <span>{rating}⭐</span>
                      <span className="font-semibold">
                        {analytics.rating_distribution[`rating_${rating}` as keyof typeof analytics.rating_distribution]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Filter */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-semibold text-gray-700 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter by rating:
              </span>
              <button
                onClick={() => setFilterRating(null)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  filterRating === null
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {[5, 4, 3, 2, 1].map(rating => (
                <button
                  key={rating}
                  onClick={() => setFilterRating(rating)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    filterRating === rating
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {rating}⭐
                </button>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {filteredReviews.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-medium">No reviews found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or wait for new reviews</p>
              </div>
            ) : (
              filteredReviews.map(review => (
                <div key={review.id} className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${getRatingColor(review.rating)}`}>
                        {review.rating}⭐ Rating
                      </span>
                      <div className="text-gray-500 text-sm">
                        <span className="font-semibold text-gray-700">ID #{review.id}</span>
                        <span className="mx-2">•</span>
                        <span>{formatDate(review.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Review */}
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-l-4 border-blue-500">
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          User Review
                        </h4>
                        <p className="text-gray-700 leading-relaxed">
                          {review.review_text || <em className="text-gray-400">No text provided</em>}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-5 border-l-4 border-cyan-500">
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Response Sent to User
                        </h4>
                        <p className="text-gray-700 leading-relaxed">{review.user_response}</p>
                      </div>
                    </div>

                    {/* AI Analysis */}
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-l-4 border-purple-500">
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          AI Summary
                        </h4>
                        <p className="text-gray-700 leading-relaxed">{review.ai_summary}</p>
                      </div>

                      <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border-l-4 border-emerald-500">
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                          Recommended Actions
                        </h4>
                        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {review.recommended_actions}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  )
}
