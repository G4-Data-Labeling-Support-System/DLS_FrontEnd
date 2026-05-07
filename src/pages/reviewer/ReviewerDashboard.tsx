import React, { useEffect, useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'

import { StatsCard } from '@/features/reviewer/components/StatsCard'
import { ReviewerFilters } from '@/features/reviewer/components/ReviewerFilters'
import { reviewerApi, type ReviewerStats } from '@/services/ReviewerApi'



const ReviewerDashboard: React.FC = () => {
  const [stats, setStats] = useState<ReviewerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const statsData = await reviewerApi.getDashboardStats()
        setStats(statsData)
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <p className="font-medium">{error}</p>
      </div>
    )
  }


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] gap-4">
        <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
        <p className="text-gray-500 font-mono text-xs tracking-widest uppercase animate-pulse">
          Loading Dashboard...
        </p>
      </div>
    )
  }


  return (
    <div>
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start relative">
        {/* Main Content - Stats (3 cols) */}
        <div className="xl:col-span-3 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-[#111] tracking-tight">
                Reviewer Dashboard
              </h1>
              <p className="text-gray-500 text-xs">
                Overview of current annotation progress and performance.
              </p>
            </div>

          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Using a grid for stats cards to mimic ActiveProjects layout if more cards are added */}
            <StatsCard
              title="TOTAL SUBMISSIONS"
              value={stats?.totalSubmissions || 0}
              trend={stats?.totalSubmissionsTrend}
              trendLabel="Last 7 days"
            />
            {/* Placeholders for other stats to fill the grid if needed */}
          </div>
        </div>

        {/* Sidebar - Filters (1 col) - Matches QuickActions placement */}
        <div className="xl:col-span-1 xl:sticky xl:top-6 space-y-6">
          <ReviewerFilters />
        </div>
      </div>
    </div>
  )
}

export default ReviewerDashboard

