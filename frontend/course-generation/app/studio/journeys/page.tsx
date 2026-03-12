import StudioNav from '@/components/studio/StudioNav'
import Link from 'next/link'
import { Plus, Edit, Trash2 } from 'lucide-react'

export default function StudioJourneysPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <StudioNav />

      <div className="container-custom py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Learning Journeys</h1>
            <p className="text-gray-600 mt-2">Create and manage learning paths</p>
          </div>
          <Link href="/studio/journeys/new" className="btn-primary flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Create New Journey</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-full h-40 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg mb-4"></div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Journey Title {i}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                Description of the learning journey and what students will learn
              </p>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>{Math.floor(Math.random() * 8) + 3} Courses</span>
                <span>{Math.floor(Math.random() * 300) + 100} Students</span>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 btn-outline text-sm py-2">
                  <Edit className="w-4 h-4 inline mr-1" />
                  Edit
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
