import { useApplications, useCreateApplication } from '../api/hooks'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import Layout from '../components/Layout'

export default function Applications(){
  const { data } = useApplications()
  const createApp = useCreateApplication()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    status: 'saved'
  })

  const statusColors = {
    saved: 'bg-gray-100 text-gray-800',
    applied: 'bg-blue-100 text-blue-800',
    oa: 'bg-purple-100 text-purple-800',
    tech: 'bg-orange-100 text-orange-800',
    hr: 'bg-yellow-100 text-yellow-800',
    final: 'bg-indigo-100 text-indigo-800',
    offer: 'bg-green-100 text-green-800',
    reject: 'bg-red-100 text-red-800',
    accept: 'bg-emerald-100 text-emerald-800'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createApp.mutateAsync({
        role: {
          title: formData.position,
          company: { name: formData.company }
        },
        status: formData.status
      })
      setShowForm(false)
      setFormData({ company: '', position: '', status: 'saved' })
    } catch (error) {
      console.error('Failed to create application:', error)
    }
  }

  return (
    <Layout>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-gray-600">Track and manage your job application progress</p>
        </div>
        <Link
          to="/add-role"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors inline-flex items-center shadow-lg border-2 border-blue-800 ring-2 ring-blue-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Job to Track
        </Link>
      </div>

      {/* Add Application Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Application</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={e => setFormData({...formData, position: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="saved">Saved</option>
                  <option value="applied">Applied</option>
                  <option value="oa">Online Assessment</option>
                  <option value="tech">Technical Interview</option>
                  <option value="hr">HR Interview</option>
                  <option value="final">Final Round</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={createApp.isPending}
                  className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {createApp.isPending ? 'Adding...' : 'Add Application'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {data && data.length > 0 ? (
          <div className="overflow-hidden">
            {data.map((app: any, index: number) => (
              <Link
                key={app.id}
                to={`/applications/${app.id}`}
                className={`block hover:bg-gray-50 transition-colors card-hover ${index !== data.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div className="p-6 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{app.role?.title || 'Position'}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full status-badge ${statusColors[app.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-gray-600">{app.role?.company?.name || 'Company'}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Applied on {new Date(app.created_at || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600 mb-4">Start by adding your first job application</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Your First Application
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}