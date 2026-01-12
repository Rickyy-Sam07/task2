import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

interface AIInsights {
  insights: string
  total_reviews_analyzed: number
  average_rating: number
}

const AIInsightsPanel = React.memo(function AIInsightsPanel() {
  const [insights, setInsights] = useState<AIInsights | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchInsights = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get<AIInsights>(`${API_URL}/api/admin/ai-insights`)
      setInsights(response.data)
    } catch (err) {
      setError('Failed to load AI insights')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInsights()
  }, [])

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          <h3 className="text-lg font-semibold text-gray-800">Generating AI Insights...</h3>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg shadow p-6">
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchInsights}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!insights) return null

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">AI-Powered Insights</h3>
            <p className="text-sm text-gray-600">
              Based on {insights.total_reviews_analyzed} reviews (Avg: {insights.average_rating}⭐)
            </p>
          </div>
        </div>
        <button
          onClick={fetchInsights}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
        >
          <span>&#10227; Refresh</span>
        </button>
      </div>

      <div className="bg-white rounded-lg p-6 border-l-4 border-purple-600">
        <div className="prose max-w-none">
          <div className="whitespace-pre-line text-gray-700 leading-relaxed">
            {insights.insights}
          </div>
        </div>
      </div>
    </div>
  )
})

export default AIInsightsPanel
