import { useState, useRef, useEffect } from 'react'
import { useApplications, useUpdateApplication } from '../api/hooks'
import Layout from '../components/Layout'
import { Link } from 'react-router-dom'

interface Application {
  id: string
  role: {
    title: string
    company: {
      name: string
    }
  }
  status: string
  priority: number
  applied_at?: string
  deadline_at?: string
  created_at: string
}

const statusConfig = {
  saved: { label: 'Saved', color: 'bg-gray-100 text-gray-800', bgColor: 'bg-gray-50' },
  applied: { label: 'Applied', color: 'bg-blue-100 text-blue-800', bgColor: 'bg-blue-50' },
  oa: { label: 'Online Assessment', color: 'bg-purple-100 text-purple-800', bgColor: 'bg-purple-50' },
  tech: { label: 'Technical', color: 'bg-orange-100 text-orange-800', bgColor: 'bg-orange-50' },
  hr: { label: 'HR Interview', color: 'bg-yellow-100 text-yellow-800', bgColor: 'bg-yellow-50' },
  final: { label: 'Final Round', color: 'bg-indigo-100 text-indigo-800', bgColor: 'bg-indigo-50' },
  offer: { label: 'Offer', color: 'bg-green-100 text-green-800', bgColor: 'bg-green-50' },
  reject: { label: 'Rejected', color: 'bg-red-100 text-red-800', bgColor: 'bg-red-50' },
  accept: { label: 'Accepted', color: 'bg-emerald-100 text-emerald-800', bgColor: 'bg-emerald-50' }
}

function ApplicationCard({ application, onStatusChange }: { 
  application: Application
  onStatusChange: (id: string, status: string) => void 
}) {
  const config = statusConfig[application.status as keyof typeof statusConfig]
  const [isDragging, setIsDragging] = useState(false)

  const getPriorityColor = (priority: number) => {
    if (priority >= 3) return 'border-l-red-500'
    if (priority >= 2) return 'border-l-yellow-500'
    return 'border-l-gray-300'
  }

  const isOverdue = application.deadline_at && new Date(application.deadline_at) < new Date()

  return (
    <div
      draggable
      onDragStart={(e) => {
        setIsDragging(true)
        e.dataTransfer.setData('application/json', JSON.stringify({
          id: application.id,
          currentStatus: application.status
        }))
      }}
      onDragEnd={() => setIsDragging(false)}
      className={`bg-white rounded-lg shadow-sm border-l-4 ${getPriorityColor(application.priority)} p-4 mb-3 hover:shadow-md transition-all cursor-move ${
        isDragging ? 'opacity-50 transform rotate-2' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <Link 
          to={`/applications/${application.id}`}
          className="font-medium text-gray-900 hover:text-brand-600 transition-colors flex-1 mr-2"
        >
          {application.role?.title || 'Position'}
        </Link>
        {application.priority >= 2 && (
          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
            High Priority
          </span>
        )}
      </div>
      
      <p className="text-sm text-gray-600 mb-3">
        {application.role?.company?.name || 'Company'}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {application.applied_at 
            ? `Applied ${new Date(application.applied_at).toLocaleDateString()}` 
            : `Saved ${new Date(application.created_at).toLocaleDateString()}`
          }
        </span>
        {application.deadline_at && (
          <span className={`px-2 py-1 rounded ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-gray-100'}`}>
            Due {new Date(application.deadline_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  )
}

function KanbanColumn({ 
  status, 
  applications, 
  onStatusChange,
  isVisible = true
}: { 
  status: string
  applications: Application[]
  onStatusChange: (id: string, newStatus: string) => void
  isVisible?: boolean
}) {
  const config = statusConfig[status as keyof typeof statusConfig]
  const [dragOver, setDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'))
      if (data.currentStatus !== status) {
        onStatusChange(data.id, status)
      }
    } catch (error) {
      console.error('Error handling drop:', error)
    }
  }

  if (!isVisible) return null

  return (
    <div className="flex-shrink-0 w-80">
      <div className={`${config.bgColor} rounded-lg p-4 h-full min-h-96`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <span className={`w-3 h-3 rounded-full mr-2 ${config.color.split(' ')[0]}`}></span>
            {config.label}
          </h3>
          <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
            {applications.length}
          </span>
        </div>
        
        <div
          className={`min-h-80 transition-colors ${dragOver ? 'bg-white/50 border-2 border-dashed border-gray-300 rounded-lg' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {applications.map(app => (
            <ApplicationCard
              key={app.id}
              application={app}
              onStatusChange={onStatusChange}
            />
          ))}
          
          {applications.length === 0 && !dragOver && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-sm">No applications</p>
            </div>
          )}
          
          {dragOver && (
            <div className="text-center py-8 text-brand-600">
              <div className="text-3xl mb-2">⬇️</div>
              <p className="text-sm font-medium">Drop to move here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ScrollNavigation({ 
  scrollContainerRef, 
  visibleStatuses, 
  setVisibleStatuses 
}: {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  visibleStatuses: Set<string>
  setVisibleStatuses: (statuses: Set<string>) => void
}) {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0)
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      )
    }
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollButtons)
      checkScrollButtons() // Initial check
      
      return () => container.removeEventListener('scroll', checkScrollButtons)
    }
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (container) {
      const scrollAmount = 320 // Width of one column + gap
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const allStatuses = Object.keys(statusConfig)
  const hiddenCount = allStatuses.length - visibleStatuses.size

  return (
    <div className="flex items-center justify-between mb-4 bg-white rounded-lg p-3 shadow-sm border border-gray-200">
      {/* Status Filter Chips */}
      <div className="flex items-center space-x-2 flex-1">
        <span className="text-sm font-medium text-gray-700 mr-2">View:</span>
        <div className="flex flex-wrap gap-2">
          {allStatuses.slice(0, 6).map((status) => {
            const config = statusConfig[status as keyof typeof statusConfig]
            const isVisible = visibleStatuses.has(status)
            return (
              <button
                key={status}
                onClick={() => {
                  const newVisibleStatuses = new Set(visibleStatuses)
                  if (isVisible) {
                    newVisibleStatuses.delete(status)
                  } else {
                    newVisibleStatuses.add(status)
                  }
                  setVisibleStatuses(newVisibleStatuses)
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  isVisible 
                    ? `${config.color} shadow-sm` 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {config.label}
              </button>
            )
          })}
          
          {hiddenCount > 0 && (
            <button
              onClick={() => setVisibleStatuses(new Set(allStatuses))}
              className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            >
              +{hiddenCount} more
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Scroll Controls */}
      <div className="flex items-center space-x-2 ml-4">
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Scroll left"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Scroll right"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function ImprovedKanbanDashboard() {
  const { data: applications = [] } = useApplications()
  const updateApplication = useUpdateApplication()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  // State for visible columns - show all by default
  const [visibleStatuses, setVisibleStatuses] = useState<Set<string>>(
    new Set(Object.keys(statusConfig))  // Show all columns by default
  )

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      await updateApplication.mutateAsync({
        id: applicationId,
        status: newStatus,
        ...(newStatus === 'applied' && { applied_at: new Date().toISOString() })
      })
    } catch (error) {
      console.error('Failed to update application status:', error)
    }
  }

  // Group applications by status
  const applicationsByStatus = Object.keys(statusConfig).reduce((acc, status) => {
    acc[status] = applications.filter((app: Application) => app.status === status)
    return acc
  }, {} as Record<string, Application[]>)

  const totalApplications = applications.length
  const pendingCount = applications.filter((app: Application) => 
    ['applied', 'oa', 'tech', 'hr', 'final'].includes(app.status)
  ).length
  const visibleApplicationsCount = Array.from(visibleStatuses).reduce((count, status) => 
    count + (applicationsByStatus[status]?.length || 0), 0
  )

  // Handle wheel scrolling on the container
  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      const handleWheel = (e: WheelEvent) => {
        if (e.deltaY !== 0) {
          e.preventDefault()
          container.scrollLeft += e.deltaY
        }
      }
      
      container.addEventListener('wheel', handleWheel, { passive: false })
      return () => container.removeEventListener('wheel', handleWheel)
    }
  }, [])

  return (
    <Layout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Application Pipeline</h1>
          <p className="text-gray-600">
            {totalApplications} total • {pendingCount} in progress • {visibleApplicationsCount} visible
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/applications/new"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors inline-flex items-center shadow-lg border-2 border-blue-800 ring-2 ring-blue-200 justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Application
          </Link>
        </div>
      </div>

      {/* Scroll Navigation & Column Filters */}
      <ScrollNavigation 
        scrollContainerRef={scrollContainerRef}
        visibleStatuses={visibleStatuses}
        setVisibleStatuses={setVisibleStatuses}
      />

      {/* Kanban Board */}
      <div 
        ref={scrollContainerRef}
        className="flex space-x-4 overflow-x-auto pb-4 min-h-screen scrollbar-hide"
        style={{ 
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {Object.entries(statusConfig).map(([status, config]) => (
          <KanbanColumn
            key={status}
            status={status}
            applications={applicationsByStatus[status] || []}
            onStatusChange={handleStatusChange}
            isVisible={visibleStatuses.has(status)}
          />
        ))}
      </div>

      {/* Mobile scroll hint */}
      <div className="md:hidden text-center mt-4">
        <p className="text-sm text-gray-500">💡 Swipe left/right to scroll between columns</p>
      </div>
    </Layout>
  )
}