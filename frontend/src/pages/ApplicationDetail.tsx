import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  useApplication,
  useStages,
  useCreateStage,
  useUpdateStage,
  useUpdateApplication,
  useDocuments,
  useReminders,
  useCreateReminder
} from '../api/hooks'
import Layout from '../components/Layout'

interface Stage {
  id: string
  type: string
  scheduled_at?: string
  result?: string
  notes?: string
  created_at: string
}

interface Application {
  id: string
  role: {
    title: string
    company: {
      name: string
      website?: string
    }
    level?: string
    job_url?: string
    stack_tags: string[]
    salary_min?: number
    salary_max?: number
    currency?: string
  }
  status: string
  priority: number
  source?: string
  applied_at?: string
  deadline_at?: string
  notes?: string
  created_at: string
  updated_at: string
}

const stageTypes = {
  oa: { label: 'Online Assessment', icon: '💻', color: 'bg-purple-100 text-purple-800' },
  tech: { label: 'Technical Interview', icon: '⚡', color: 'bg-blue-100 text-blue-800' },
  hr: { label: 'HR Interview', icon: '👥', color: 'bg-green-100 text-green-800' },
  final: { label: 'Final Round', icon: '🎯', color: 'bg-orange-100 text-orange-800' },
  other: { label: 'Other', icon: '📋', color: 'bg-gray-100 text-gray-800' }
}

const resultColors = {
  passed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800'
}

function EditApplicationModal({
  isOpen,
  onClose,
  application
}: {
  isOpen: boolean
  onClose: () => void
  application: Application
}) {
  const [editData, setEditData] = useState({
    status: application?.status || 'saved',
    priority: application?.priority || 0,
    source: application?.source || '',
    applied_at: application?.applied_at?.split('T')[0] || '',
    deadline_at: application?.deadline_at?.split('T')[0] || '',
    notes: application?.notes || ''
  })

  const updateApplication = useUpdateApplication()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateApplication.mutateAsync({
        id: application.id,
        status: editData.status,
        priority: parseInt(editData.priority.toString()),
        source: editData.source,
        applied_at: editData.applied_at ? new Date(editData.applied_at).toISOString() : null,
        deadline_at: editData.deadline_at ? new Date(editData.deadline_at).toISOString() : null,
        notes: editData.notes
      })
      onClose()
    } catch (error) {
      console.error('Failed to update application:', error)
    }
  }

  if (!isOpen || !application) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Edit Application</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={editData.status}
              onChange={e => setEditData({ ...editData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="saved">Saved</option>
              <option value="applied">Applied</option>
              <option value="oa">Online Assessment</option>
              <option value="tech">Technical Interview</option>
              <option value="hr">HR Interview</option>
              <option value="final">Final Round</option>
              <option value="offer">Offer</option>
              <option value="reject">Rejected</option>
              <option value="accept">Accepted</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={editData.priority}
              onChange={e => setEditData({ ...editData, priority: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value={0}>Normal</option>
              <option value={1}>Low Priority</option>
              <option value={2}>High Priority</option>
              <option value={3}>Very High Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <select
              value={editData.source}
              onChange={e => setEditData({ ...editData, source: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="">Where did you find this job?</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Company Website">Company Website</option>
              <option value="Indeed">Indeed</option>
              <option value="Glassdoor">Glassdoor</option>
              <option value="AngelList">AngelList</option>
              <option value="Referral">Referral</option>
              <option value="University Portal">University Portal</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Applied Date</label>
            <input
              type="date"
              value={editData.applied_at}
              onChange={e => setEditData({ ...editData, applied_at: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
            <input
              type="date"
              value={editData.deadline_at}
              onChange={e => setEditData({ ...editData, deadline_at: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={editData.notes}
              onChange={e => setEditData({ ...editData, notes: e.target.value })}
              placeholder="Add any notes about this application..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={updateApplication.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white flex-1 rounded-lg font-semibold transition-colors inline-flex items-center shadow-lg border-2 border-blue-800 ring-2 ring-blue-200 justify-center"
            >
              {updateApplication.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function StageCard({ stage, applicationId, onUpdate }: {
  stage: Stage
  applicationId: string
  onUpdate: () => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    scheduled_at: stage.scheduled_at?.split('T')[0] || '',
    scheduled_time: stage.scheduled_at?.split('T')[1]?.slice(0, 5) || '',
    result: stage.result || 'pending',
    notes: stage.notes || ''
  })

  const updateStage = useUpdateStage()
  const stageConfig = stageTypes[stage.type as keyof typeof stageTypes] || stageTypes.other

  const handleSave = async () => {
    try {
      const scheduledAt = editData.scheduled_at && editData.scheduled_time
        ? new Date(`${editData.scheduled_at}T${editData.scheduled_time}`).toISOString()
        : null

      await updateStage.mutateAsync({
        id: stage.id,
        scheduled_at: scheduledAt,
        result: editData.result,
        notes: editData.notes
      })

      setIsEditing(false)
      onUpdate()
    } catch (error) {
      console.error('Failed to update stage:', error)
    }
  }

  if (isEditing) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{stageConfig.icon}</span>
            <h3 className="font-medium text-gray-900">{stageConfig.label}</h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={updateStage.isPending}
              className="bg-brand-500 hover:bg-brand-600 text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={editData.scheduled_at}
                onChange={e => setEditData({ ...editData, scheduled_at: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={editData.scheduled_time}
                onChange={e => setEditData({ ...editData, scheduled_time: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Result</label>
            <select
              value={editData.result}
              onChange={e => setEditData({ ...editData, result: e.target.value })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={editData.notes}
              onChange={e => setEditData({ ...editData, notes: e.target.value })}
              placeholder="Interview questions, feedback, etc."
              rows={2}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-brand-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{stageConfig.icon}</span>
          <h3 className="font-medium text-gray-900">{stageConfig.label}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${resultColors[stage.result as keyof typeof resultColors] || resultColors.pending
            }`}>
            {stage.result || 'Pending'}
          </span>
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      </div>

      {stage.scheduled_at && (
        <p className="text-sm text-gray-600 mb-2">
          📅 {new Date(stage.scheduled_at).toLocaleString()}
        </p>
      )}

      {stage.notes && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
          {stage.notes}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">
        Added {new Date(stage.created_at).toLocaleDateString()}
      </p>
    </div>
  )
}

function AddStageModal({ isOpen, onClose, applicationId }: {
  isOpen: boolean
  onClose: () => void
  applicationId: string
}) {
  const [stageData, setStageData] = useState({
    type: 'oa',
    scheduled_date: '',
    scheduled_time: '',
    notes: ''
  })

  const createStage = useCreateStage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const scheduledAt = stageData.scheduled_date && stageData.scheduled_time
        ? new Date(`${stageData.scheduled_date}T${stageData.scheduled_time}`).toISOString()
        : null

      await createStage.mutateAsync({
        application: applicationId,
        type: stageData.type,
        scheduled_at: scheduledAt,
        notes: stageData.notes,
        result: 'pending'
      })

      setStageData({ type: 'oa', scheduled_date: '', scheduled_time: '', notes: '' })
      onClose()
    } catch (error) {
      console.error('Failed to create stage:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Add Interview Stage</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stage Type</label>
            <select
              value={stageData.type}
              onChange={e => setStageData({ ...stageData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              {Object.entries(stageTypes).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.icon} {config.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={stageData.scheduled_date}
                onChange={e => setStageData({ ...stageData, scheduled_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={stageData.scheduled_time}
                onChange={e => setStageData({ ...stageData, scheduled_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              value={stageData.notes}
              onChange={e => setStageData({ ...stageData, notes: e.target.value })}
              placeholder="Interview format, preparation notes, etc."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={createStage.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-14 py-3 rounded-lg font-semibold transition-colors inline-flex items-center shadow-lg border-2 border-blue-800 ring-2 ring-blue-200"
            >
              {createStage.isPending ? 'Adding...' : 'Add Stage'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function EnhancedApplicationDetail() {
  const { id } = useParams()
  const [showAddStage, setShowAddStage] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [refreshStages, setRefreshStages] = useState(0)

  const { data: application, isLoading } = useApplication(id!)
  const { data: stages = [] } = useStages(id!)
  const { data: documents = [] } = useDocuments(id!)
  const { data: reminders = [] } = useReminders()
  const updateApplication = useUpdateApplication()

  const applicationReminders = reminders.filter((r: any) => r.application?.id === id)

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading application details...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!application) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Application Not Found</h2>
          <Link to="/applications" className="text-brand-600 hover:text-brand-700">
            ← Back to Applications
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout maxWidth="4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link to="/applications" className="hover:text-brand-600 transition-colors">Applications</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900">{application.role.title} @ {application.role.company.name}</span>
      </nav>

      {/* Application Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {application.role.title}
            </h1>
            <div className="flex items-center space-x-4 text-gray-600">
              <span className="text-lg">{application.role.company.name}</span>
              {application.role.level && (
                <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                  {application.role.level}
                </span>
              )}
              {application.priority > 0 && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                  Priority {application.priority}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800`}>
              {application.status}
            </span>
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-semibold transition-colors inline-flex items-center shadow-lg border-2 border-blue-800 ring-2 ring-blue-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          </div>
        </div>

        {/* Role Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {application.role.salary_min && application.role.salary_max && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Salary:</span>
              <p className="text-gray-600">
                {application.role.currency || '$'}{application.role.salary_min?.toLocaleString()} - {application.role.currency || '$'}{application.role.salary_max?.toLocaleString()}
              </p>
            </div>
          )}
          <div className="text-sm">
            <span className="font-medium text-gray-700">Applied:</span>
            <p className="text-gray-600">
              {application.applied_at ? new Date(application.applied_at).toLocaleDateString() : 'Not yet'}
            </p>
          </div>
          {application.deadline_at && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Deadline:</span>
              <p className={`${new Date(application.deadline_at) < new Date() ? 'text-red-600' : 'text-gray-600'}`}>
                {new Date(application.deadline_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Tech Stack */}
        {application.role.stack_tags && application.role.stack_tags.length > 0 && (
          <div className="mb-4">
            <span className="font-medium text-gray-700 text-sm">Tech Stack:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {application.role.stack_tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="flex space-x-4 text-sm">
          {application.role.job_url && (
            <a
              href={application.role.job_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:text-brand-700 inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Job Posting
            </a>
          )}
          {application.role.company.website && (
            <a
              href={application.role.company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-700 inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0 9c-1.657 0-3-4.03-3-9s1.343-9 3-9m0 18c1.657 0 3-4.03 3-9s-1.343-9-3-9m-9 9a9 9 0 019-9" />
              </svg>
              Company Website
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interview Stages */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Interview Stages</h2>
                  <p className="text-sm text-gray-600">Track your interview progress</p>
                </div>
                <button
                  onClick={() => setShowAddStage(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-semibold transition-colors inline-flex items-center shadow-lg border-2 border-blue-800 ring-2 ring-blue-200"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Stage
                </button>
              </div>
            </div>

            <div className="p-6">
              {stages.length > 0 ? (
                <div className="space-y-4">
                  {stages
                    .sort((a: Stage, b: Stage) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    .map((stage: Stage) => (
                      <StageCard
                        key={stage.id}
                        stage={stage}
                        applicationId={id!}
                        onUpdate={() => setRefreshStages(prev => prev + 1)}
                      />
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V3m6 4V3m-6 0h6m-6 0v12a2 2 0 002 2h4a2 2 0 002-2V7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No interview stages yet</h3>
                  <p className="text-gray-600 mb-4">Add interview stages to track your progress</p>
                  <button
                    onClick={() => setShowAddStage(true)}
                    className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add First Stage
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {application.notes && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{application.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/documents"
                className="flex items-center space-x-3 text-gray-700 hover:text-brand-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Documents
              </Link>
              <Link
                to="/calendar"
                className="flex items-center space-x-3 text-gray-700 hover:text-brand-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Reminder
              </Link>
              <button className="flex items-center space-x-3 text-gray-700 hover:text-brand-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share Application
              </button>
            </div>
          </div>

          {/* Documents */}
          {documents.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Documents ({documents.length})</h3>
              <div className="space-y-2">
                {documents.slice(0, 3).map((doc: any) => (
                  <div key={doc.id} className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-400">📄</span>
                    <span className="text-gray-700 truncate">{doc.s3_key.split('/').pop()}</span>
                  </div>
                ))}
                {documents.length > 3 && (
                  <Link to="/documents" className="text-sm text-brand-600 hover:text-brand-700">
                    View all {documents.length} documents →
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Related Reminders */}
          {applicationReminders.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Reminders ({applicationReminders.length})</h3>
              <div className="space-y-3">
                {applicationReminders.slice(0, 3).map((reminder: any) => (
                  <div key={reminder.id} className="text-sm">
                    <p className="text-gray-700">{reminder.message}</p>
                    <p className="text-xs text-gray-500">
                      Due {new Date(reminder.due_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {applicationReminders.length > 3 && (
                  <Link to="/calendar" className="text-sm text-brand-600 hover:text-brand-700">
                    View all reminders →
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Application Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-700">Application created</p>
                  <p className="text-xs text-gray-500">{new Date(application.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {application.applied_at && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-700">Application submitted</p>
                    <p className="text-xs text-gray-500">{new Date(application.applied_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              {stages.map((stage: Stage) => (
                stage.scheduled_at && (
                  <div key={stage.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${stage.result === 'passed' ? 'bg-green-500' :
                        stage.result === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                    <div>
                      <p className="text-sm text-gray-700">
                        {stageTypes[stage.type as keyof typeof stageTypes]?.label || stage.type}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(stage.scheduled_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Application Modal */}
      <EditApplicationModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        application={application}
      />

      {/* Add Stage Modal */}
      <AddStageModal
        isOpen={showAddStage}
        onClose={() => setShowAddStage(false)}
        applicationId={id!}
      />
    </Layout>
  )
}