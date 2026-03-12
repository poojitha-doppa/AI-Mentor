import StudioNav from '@/components/studio/StudioNav'
import { BookOpen, Map, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'

export default function StudioDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <StudioNav />

      <div className="container-custom py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-green-600 font-semibold">+12%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">24</h3>
            <p className="text-gray-600 text-sm">Total Courses</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Map className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-green-600 font-semibold">+8%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">6</h3>
            <p className="text-gray-600 text-sm">Learning Journeys</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-green-600 font-semibold">+24%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">1,247</h3>
            <p className="text-gray-600 text-sm">Total Students</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm text-green-600 font-semibold">+18%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">89%</h3>
            <p className="text-gray-600 text-sm">Completion Rate</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/studio/courses/new"
                className="block p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
              >
                <h3 className="font-semibold text-primary-900">Create New Course</h3>
                <p className="text-sm text-primary-700">Start building your next course</p>
              </Link>
              <Link
                href="/studio/journeys/new"
                className="block p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <h3 className="font-semibold text-purple-900">Create Learning Journey</h3>
                <p className="text-sm text-purple-700">Design a new learning path</p>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">Python Course</span> published
                  </p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">45 new enrollments</span> this week
                  </p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">Web Dev Journey</span> updated
                  </p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Courses */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Your Courses</h2>
            <Link href="/studio/courses" className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Course</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Students</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rating</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <p className="font-semibold text-gray-900">Python for Beginners</p>
                    <p className="text-sm text-gray-600">Published Dec 20, 2025</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      Published
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-900">523</td>
                  <td className="py-4 px-4">
                    <span className="text-yellow-500">★</span> 4.8
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Link href="/studio/courses/1" className="text-primary-600 hover:text-primary-700 text-sm font-semibold">
                      Edit
                    </Link>
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <p className="font-semibold text-gray-900">JavaScript Fundamentals</p>
                    <p className="text-sm text-gray-600">Published Dec 18, 2025</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      Published
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-900">412</td>
                  <td className="py-4 px-4">
                    <span className="text-yellow-500">★</span> 4.9
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Link href="/studio/courses/2" className="text-primary-600 hover:text-primary-700 text-sm font-semibold">
                      Edit
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
