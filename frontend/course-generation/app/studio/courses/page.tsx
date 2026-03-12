import StudioNav from '@/components/studio/StudioNav'
import Link from 'next/link'
import { Plus, Edit, Trash2 } from 'lucide-react'

export default function StudioCoursesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <StudioNav />

      <div className="container-custom py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-600 mt-2">Manage and create your courses</p>
          </div>
          <Link href="/studio/courses/new" className="btn-primary flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Create New Course</span>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Course</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Journey</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Students</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg"></div>
                      <div>
                        <p className="font-semibold text-gray-900">Course Title {i}</p>
                        <p className="text-sm text-gray-600">Published Dec {20 - i}, 2025</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      Published
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-700">
                    {i % 2 === 0 ? 'Web Development' : 'Not assigned'}
                  </td>
                  <td className="py-4 px-6 text-gray-900">{Math.floor(Math.random() * 500) + 100}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
