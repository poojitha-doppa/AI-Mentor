import StudioNav from '@/components/studio/StudioNav'
import { TrendingUp, Users, Eye, BookOpen } from 'lucide-react'

export default function StudioAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <StudioNav />

      <div className="container-custom py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">Track your performance and engagement</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Eye className="w-8 h-8 text-blue-600" />
              <span className="text-sm text-green-600 font-semibold">+15%</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">12,458</h3>
            <p className="text-gray-600 text-sm">Total Views</p>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-purple-600" />
              <span className="text-sm text-green-600 font-semibold">+24%</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">1,247</h3>
            <p className="text-gray-600 text-sm">New Enrollments</p>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="w-8 h-8 text-green-600" />
              <span className="text-sm text-green-600 font-semibold">+18%</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">89%</h3>
            <p className="text-gray-600 text-sm">Completion Rate</p>
            <p className="text-xs text-gray-500 mt-1">Average across courses</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <span className="text-sm text-green-600 font-semibold">+32%</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">4.8</h3>
            <p className="text-gray-600 text-sm">Average Rating</p>
            <p className="text-xs text-gray-500 mt-1">Based on 342 reviews</p>
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Enrollment Trends</h2>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart coming soon...</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Course Performance</h2>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
