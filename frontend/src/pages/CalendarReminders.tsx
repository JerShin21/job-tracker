import { useState } from 'react'
import { useReminders, useCreateReminder, useUpdateReminder, useApplications } from '../api/hooks'
import Layout from '../components/Layout'
import { Link } from 'react-router-dom'

interface Reminder {
  id: string
  application?: {
    id: string
    role: {
      title: string
      company: {
        name: string
      }
    }
  }
  due_at: string
  message: string
  done: boolean
  created_at: string
}

interface Application {
  id: string
  role: {
    title: string
    company: {
      name: string
    }
  }
}

function ReminderCard({ reminder, onToggle }: { 
  reminder: Reminder
  onToggle: (id: string, done: boolean) => void 
}) {
  const dueDate = new Date(reminder.due_at)
  const now = new Date()
  const isOverdue = dueDate < now && !reminder.done
  const isDueToday = dueDate.toDateString() === now.toDateString()
  const isDueTomorrow = dueDate.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()

  const getDateColor = () => {
    if (reminder.done) return 'text-green-600'
    if (isOverdue) return 'text-red-600'
    if (isDueToday) return 'text-orange-600'
    if (isDueTomorrow) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const getDateText = () => {
    if (isOverdue) return `Overdue (${dueDate.toLocaleDateString()})`
    if (isDueToday) return `Today at ${dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    if (isDueTomorrow) return `Tomorrow at ${dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    return dueDate.toLocaleString()
  }

  return (
    <div className={`bg-white rounded-lg border p-4 ${reminder.done ? 'opacity-75' : ''} ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}>
      <div className="flex items-start space-x-3">
        <button
          onClick={() => onToggle(reminder.id, !reminder.done)}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            reminder.done 
              ? 'bg-green-500 border-green-500 text-white' 
              : 'border-gray-300 hover:border-brand-500'
          }`}
        >
          {reminder.done && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`font-medium ${reminder.done ? 'line-through text-gray-500' : 'text-gray-900'}`}>
            {reminder.message}
          </p>
          
          {reminder.application && (
            <div className="mt-2">
              <Link
                to={`/applications/${reminder.application.id}`}
                className="text-sm text-brand-600 hover:text-brand-700 inline-flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {reminder.application.role.title} @ {reminder.application.role.company.name}
              </Link>
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <p className={`text-sm font-medium ${getDateColor()}`}>
              {getDateText()}
            </p>
            
            {isOverdue && !reminder.done && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                Overdue
              </span>
            )}
            {isDueToday && !reminder.done && (
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                Due Today
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function AddReminderModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    message: '',
    dueDate: '',
    dueTime: '',
    applicationId: ''
  })

  const { data: applications = [] } = useApplications()
  const createReminder = useCreateReminder()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const dueAt = new Date(`${formData.dueDate}T${formData.dueTime}`)
      
      await createReminder.mutateAsync({
        message: formData.message,
        due_at: dueAt.toISOString(),
        application: formData.applicationId || null,
        done: false
      })

      setFormData({ message: '', dueDate: '', dueTime: '', applicationId: '' })
      onClose()
    } catch (error) {
      console.error('Failed to create reminder:', error)
    }
  }

  // Set default date to today and time to current hour + 1
  const getDefaultDateTime = () => {
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour from now
    return {
      date: now.toISOString().split('T')[0],
      time: tomorrow.toTimeString().slice(0, 5)
    }
  }

  const defaultDateTime = getDefaultDateTime()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Add Reminder</h2>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reminder Message *
            </label>
            <textarea
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
              placeholder="Submit application, prepare for interview, etc."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={formData.dueDate || defaultDateTime.date}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
              <input
                type="time"
                value={formData.dueTime || defaultDateTime.time}
                onChange={e => setFormData({ ...formData, dueTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Related Application (optional)
            </label>
            <select
              value={formData.applicationId}
              onChange={e => setFormData({ ...formData, applicationId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="">No specific application</option>
              {applications.map((app: Application) => (
                <option key={app.id} value={app.id}>
                  {app.role.title} @ {app.role.company.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={createReminder.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center shadow-lg border-2 border-blue-800 ring-2 ring-blue-200"
            >
              {createReminder.isPending ? 'Adding...' : 'Add Reminder'}
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

export default function CalendarReminders() {
  const [showCompleted, setShowCompleted] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'overdue' | 'completed'>('upcoming')

  const { data: allReminders = [] } = useReminders()
  const updateReminder = useUpdateReminder()

  const handleToggleReminder = async (id: string, done: boolean) => {
    try {
      await updateReminder.mutateAsync({ id, done })
    } catch (error) {
      console.error('Failed to update reminder:', error)
    }
  }

  const now = new Date()
  const overdueReminders = allReminders.filter((r: Reminder) => 
    new Date(r.due_at) < now && !r.done
  )
  const upcomingReminders = allReminders.filter((r: Reminder) => 
    new Date(r.due_at) >= now && !r.done
  )
  const completedReminders = allReminders.filter((r: Reminder) => r.done)

  const getActiveReminders = () => {
    switch (activeTab) {
      case 'overdue': return overdueReminders
      case 'upcoming': return upcomingReminders
      case 'completed': return completedReminders
      default: return upcomingReminders
    }
  }

  const activeReminders = getActiveReminders()

  return (
    <Layout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar & Reminders</h1>
          <p className="text-gray-600">Stay on top of deadlines and important dates</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center shadow-lg border-2 border-blue-800 ring-2 ring-blue-200"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Reminder
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{overdueReminders.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingReminders.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedReminders.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'upcoming', label: 'Upcoming', count: upcomingReminders.length },
              { key: 'overdue', label: 'Overdue', count: overdueReminders.length },
              { key: 'completed', label: 'Completed', count: completedReminders.length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeReminders.length > 0 ? (
            <div className="space-y-4">
              {activeReminders
                .sort((a: Reminder, b: Reminder) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())
                .map((reminder: Reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    onToggle={handleToggleReminder}
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'overdue' && 'No overdue reminders'}
                  {activeTab === 'upcoming' && 'No upcoming reminders'}
                  {activeTab === 'completed' && 'No completed reminders'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === 'overdue' && 'Great! You\'re all caught up.'}
                  {activeTab === 'upcoming' && 'Add a reminder to stay organized.'}
                  {activeTab === 'completed' && 'Completed reminders will appear here.'}
                </p>
                {activeTab !== 'completed' && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add First Reminder
                  </button>
                )}
              </div>
            )}
        </div>
      </div>

      {/* Add Reminder Modal */}
      <AddReminderModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </Layout>
  )
}