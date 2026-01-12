import React from 'react'
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface RatingDistribution {
  rating_1: number
  rating_2: number
  rating_3: number
  rating_4: number
  rating_5: number
}

interface SentimentAnalysis {
  positive: number
  positive_percentage: number
  neutral: number
  neutral_percentage: number
  negative: number
  negative_percentage: number
}

interface AnalyticsData {
  total_reviews: number
  average_rating: number
  rating_distribution: RatingDistribution
  sentiment_analysis: SentimentAnalysis
}

const COLORS = {
  positive: '#10b981',
  neutral: '#f59e0b',
  negative: '#ef4444',
  rating: ['#ef4444', '#fb923c', '#fbbf24', '#a3e635', '#10b981']
}

const AnalyticsCharts = React.memo(function AnalyticsCharts({ analytics }: { analytics: AnalyticsData }) {
  // Data for rating distribution bar chart
  const ratingData = [
    { rating: '1⭐', count: analytics.rating_distribution.rating_1 },
    { rating: '2⭐', count: analytics.rating_distribution.rating_2 },
    { rating: '3⭐', count: analytics.rating_distribution.rating_3 },
    { rating: '4⭐', count: analytics.rating_distribution.rating_4 },
    { rating: '5⭐', count: analytics.rating_distribution.rating_5 },
  ]

  // Data for sentiment pie chart
  const sentimentData = [
    { name: 'Positive (4-5⭐)', value: analytics.sentiment_analysis.positive, percentage: analytics.sentiment_analysis.positive_percentage },
    { name: 'Neutral (3⭐)', value: analytics.sentiment_analysis.neutral, percentage: analytics.sentiment_analysis.neutral_percentage },
    { name: 'Negative (1-2⭐)', value: analytics.sentiment_analysis.negative, percentage: analytics.sentiment_analysis.negative_percentage },
  ].filter(item => item.value > 0)

  const sentimentColors = [COLORS.positive, COLORS.neutral, COLORS.negative]

  const renderCustomLabel = (entry: any) => {
    return `${entry.percentage}%`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Rating Distribution Area Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Rating Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={ratingData}>
            <defs>
              <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="rating" />
            <YAxis />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fill="url(#colorRating)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sentiment Pie Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Sentiment Analysis</h3>
        {sentimentData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={sentimentColors[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value} reviews`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No sentiment data available
          </div>
        )}
      </div>
    </div>
  )
})

export default AnalyticsCharts
