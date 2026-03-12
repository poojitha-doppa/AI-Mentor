'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, GraduationCap } from 'lucide-react'

// Separate client component for the form
function EducatorForm({ onSuccess }: { onSuccess: () => void }) {
  const [reason, setReason] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Submit to API
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="reason"
          className="block text-sm font-semibold text-gray-700 mb-3"
        >
          Why would you like to join Unfold for Educators?
        </label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
          placeholder="Share your experience, expertise, and what you hope to teach..."
          required
        />
        <p className="text-sm text-gray-500 mt-2">
          Minimum 100 characters ({reason.length}/100)
        </p>
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={reason.length < 100}
          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Become Educator at Unfold
        </button>
      </div>
    </form>
  )
}

export default function EducatorsPage() {
  const [step, setStep] = useState<'intro' | 'form'>('intro')
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-2xl text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✓</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Application Submitted!
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Thank you for your interest in becoming an educator at Unfold. We'll review your
            application and get back to you soon.
          </p>
          <Link href="/home" className="btn-primary">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container-custom py-12">
        <Link
          href="/home"
          className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>

        {step === 'intro' ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                Are you an Educator or Expert in your field?
              </h1>
              <p className="text-xl text-gray-600">
                Join thousands of educators shaping the future of learning
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <button
                onClick={() => setStep('form')}
                className="bg-white hover:bg-primary-50 border-2 border-primary-600 rounded-2xl p-8 transition-all hover:shadow-lg group"
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                  👍
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Yes, I am!</h2>
                <p className="text-gray-600">
                  Apply to become an educator and start creating courses
                </p>
              </button>

              <Link
                href="/home"
                className="bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-2xl p-8 transition-all hover:shadow-lg group"
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                  👎
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Not yet</h2>
                <p className="text-gray-600">
                  Continue exploring courses as a learner
                </p>
              </Link>
            </div>

            <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Why become an Unfold Educator?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🌟</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Share Your Expertise</h4>
                    <p className="text-gray-600 text-sm">
                      Impact thousands of learners worldwide
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">💰</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Earn Revenue</h4>
                    <p className="text-gray-600 text-sm">
                      Monetize your knowledge and skills
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🎨</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Creative Freedom</h4>
                    <p className="text-gray-600 text-sm">
                      Design courses your way with powerful tools
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Analytics & Insights</h4>
                    <p className="text-gray-600 text-sm">
                      Track your impact with detailed metrics
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Apply to Become an Educator
              </h2>
              <p className="text-gray-600 mb-8">
                Tell us why you'd like to join Unfold for Educators
              </p>

              <EducatorForm onSuccess={() => setSubmitted(true)} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
