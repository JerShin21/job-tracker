import { useState } from 'react'
import { useRoles, useCreateRole, useCreateApplication, useCreateCompany } from '../api/hooks'
import Layout from '../components/Layout'
import { useNavigate } from 'react-router-dom'

interface Role {
  id: string
  company: {
    id: string
    name: string
    website?: string
    country?: string
    city?: string
  }
  title: string
  level?: string
  job_url?: string
  stack_tags: string[]
  salary_min?: number
  salary_max?: number
  currency?: string
}

function RecentRoleCard({ role, onStartTracking }: { role: Role; onStartTracking: (role: Role) => void }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{role.title}</h3>
          {role.level && (
            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
              {role.level}
            </span>
          )}
        </div>
        <button
          onClick={() => onStartTracking(role)}
          className="bg-brand-50 hover:bg-brand-100 text-brand-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Start Tracking
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-gray-600">
            {role.company.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-medium text-gray-900">{role.company.name}</p>
          {role.company.city && role.company.country && (
            <p className="text-sm text-gray-500">{role.company.city}, {role.company.country}</p>
          )}
        </div>
      </div>

      {role.salary_min && role.salary_max && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            💰 {role.currency || '$'}{role.salary_min?.toLocaleString()} - {role.currency || '$'}{role.salary_max?.toLocaleString()}
          </p>
        </div>
      )}

      {role.stack_tags && role.stack_tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {role.stack_tags.slice(0, 6).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
            {role.stack_tags.length > 6 && (
              <span className="text-xs text-gray-500">+{role.stack_tags.length - 6} more</span>
            )}
          </div>
        </div>
      )}

      <div className="flex space-x-2">
        {role.job_url && (
          <a
            href={role.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-brand-600 hover:text-brand-700 font-medium inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Job Posting
          </a>
        )}
        {role.company.website && (
          <a
            href={role.company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 hover:text-gray-700 inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0 9c-1.657 0-3-4.03-3-9s1.343-9 3-9m0 18c1.657 0 3-4.03 3-9s-1.343-9-3-9m-9 9a9 9 0 019-9" />
            </svg>
            Company Site
          </a>
        )}
      </div>
    </div>
  )
}

function AddRoleForm({ onRoleAdded }: { onRoleAdded: (role: any) => void }) {
  const [activeTab, setActiveTab] = useState<'manual' | 'paste'>('manual')
  const [jobDescription, setJobDescription] = useState('')
  const [manualData, setManualData] = useState({
    jobUrl: '',
    companyName: '',
    companyWebsite: '',
    companyCountry: '',
    companyCity: '',
    title: '',
    level: '',
    stackTags: '',
    salaryMin: '',
    salaryMax: '',
    currency: 'RM',
    source: ''
  })

  const createRole = useCreateRole()
  const createCompany = useCreateCompany()

  const parseJobDescription = () => {
    // Simple parsing logic - in a real app, you'd use AI/ML
    const lines = jobDescription.split('\n').map(line => line.trim()).filter(Boolean)
    
    // Try to extract basic info
    let title = ''
    let company = ''
    let location = ''
    let technologies: string[] = []
    
    // Look for common patterns
    lines.forEach(line => {
      if (line.toLowerCase().includes('position:') || line.toLowerCase().includes('role:')) {
        title = line.split(':')[1]?.trim() || ''
      }
      if (line.toLowerCase().includes('company:')) {
        company = line.split(':')[1]?.trim() || ''
      }
      if (line.toLowerCase().includes('location:')) {
        location = line.split(':')[1]?.trim() || ''
      }
    })
    
    // Extract tech stack (simple keyword matching)
    const techKeywords = ['react', 'node', 'python', 'java', 'javascript', 'typescript', 'aws', 'docker', 'kubernetes', 'sql', 'mongodb', 'postgresql', 'redis', 'git', 'ci/cd']
    const descriptionLower = jobDescription.toLowerCase()
    technologies = techKeywords.filter(tech => descriptionLower.includes(tech))
    
    // Pre-fill the manual form
    setManualData(prev => ({
      ...prev,
      title: title || prev.title,
      companyName: company || prev.companyName,
      companyCity: location.split(',')[0]?.trim() || prev.companyCity,
      companyCountry: location.split(',')[1]?.trim() || prev.companyCountry,
      stackTags: technologies.join(', ') || prev.stackTags
    }))
    
    setActiveTab('manual')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Create or find company
      const companyData = {
        name: manualData.companyName,
        website: manualData.companyWebsite,
        country: manualData.companyCountry,
        city: manualData.companyCity
      }

      const company = await createCompany.mutateAsync(companyData)

      // Create role
      const roleData = {
        company: company.id,
        title: manualData.title,
        level: manualData.level,
        job_url: manualData.jobUrl,
        stack_tags: manualData.stackTags.split(',').map(tag => tag.trim()).filter(Boolean),
        salary_min: manualData.salaryMin ? parseInt(manualData.salaryMin) : null,
        salary_max: manualData.salaryMax ? parseInt(manualData.salaryMax) : null,
        currency: manualData.currency
      }

      const role = await createRole.mutateAsync(roleData)
      onRoleAdded({ ...role, company })
      
      // Reset form
      setManualData({
        jobUrl: '', companyName: '', companyWebsite: '', companyCountry: '', companyCity: '',
        title: '', level: '', stackTags: '', salaryMin: '', salaryMax: '', currency: 'USD', source: ''
      })
      setJobDescription('')
    } catch (error) {
      console.error('Failed to create role:', error)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Add Job to Track</h2>
        <p className="text-gray-600">Found a job you want to apply for? Add it here to start tracking your application process.</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex px-6">
          <button
            onClick={() => setActiveTab('manual')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'manual'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ml-8 transition-colors ${
              activeTab === 'paste'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Paste Job Description
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'paste' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the job description here. We'll try to extract the key details automatically."
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              />
            </div>
            <button
              onClick={parseJobDescription}
              disabled={!jobDescription.trim()}
              className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Extract Details
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Posting URL
              </label>
              <input
                type="url"
                value={manualData.jobUrl}
                onChange={e => setManualData({ ...manualData, jobUrl: e.target.value })}
                placeholder="https://company.com/careers/software-engineer"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Link to the original job posting</p>
            </div>

            {/* Company Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={manualData.companyName}
                    onChange={e => setManualData({ ...manualData, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Website</label>
                  <input
                    type="url"
                    value={manualData.companyWebsite}
                    onChange={e => setManualData({ ...manualData, companyWebsite: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={manualData.companyCountry}
                    onChange={e => setManualData({ ...manualData, companyCountry: e.target.value })}
                    placeholder="Malaysia"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={manualData.companyCity}
                    onChange={e => setManualData({ ...manualData, companyCity: e.target.value })}
                    placeholder="Kuala Lumpur"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Role Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Role Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={manualData.title}
                    onChange={e => setManualData({ ...manualData, title: e.target.value })}
                    placeholder="Software Engineer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <select
                    value={manualData.level}
                    onChange={e => setManualData({ ...manualData, level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    <option value="">Select level</option>
                    <option value="Intern">Intern</option>
                    <option value="Entry Level">Entry Level</option>
                    <option value="Junior">Junior</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                    <option value="Principal">Principal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <select
                    value={manualData.source}
                    onChange={e => setManualData({ ...manualData, source: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    <option value="">Where did you find this?</option>
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Technologies/Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={manualData.stackTags}
                    onChange={e => setManualData({ ...manualData, stackTags: e.target.value })}
                    placeholder="React, Node.js, Python, AWS, Docker"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
                  <input
                    type="number"
                    value={manualData.salaryMin}
                    onChange={e => setManualData({ ...manualData, salaryMin: e.target.value })}
                    placeholder="80000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
                  <input
                    type="number"
                    value={manualData.salaryMax}
                    onChange={e => setManualData({ ...manualData, salaryMax: e.target.value })}
                    placeholder="120000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={manualData.currency}
                    onChange={e => setManualData({ ...manualData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    <option value="RM">RM </option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="AUD">AUD (A$)</option>
                    <option value="SGD">SGD (S$)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={createRole.isPending || createCompany.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center shadow-lg border-2 border-blue-800 ring-2 ring-blue-200"
                style={{ 
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                }}
                >
                {(createRole.isPending || createCompany.isPending) ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding Role...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Role & Start Tracking
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function AddRole() {
  const { data: roles = [] } = useRoles()
  const createApplication = useCreateApplication()
  const navigate = useNavigate()

  const handleStartTracking = async (role: Role) => {
    try {
      const application = await createApplication.mutateAsync({
        role: role.id,
        status: 'saved',
        priority: 0
      })
      
      // Navigate to the new application
      navigate(`/applications/${application.id}`)
    } catch (error) {
      console.error('Failed to start tracking application:', error)
    }
  }

  const handleRoleAdded = async (role: any) => {
    // Automatically start tracking the newly added role
    await handleStartTracking(role)
  }

  // Show recent roles that aren't being tracked yet
  const recentRoles = roles.slice(0, 6)

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Add Job to Track</h1>
        <p className="text-gray-600">
          Found an interesting job opportunity? Add it here and start managing your application process.
        </p>
      </div>

      {/* Add Role Form */}
      <div className="mb-8">
        <AddRoleForm onRoleAdded={handleRoleAdded} />
      </div>

      {/* Recent Roles */}
      {recentRoles.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recently Added Roles</h2>
            <p className="text-sm text-gray-600">
              These roles were added recently but aren't being tracked yet
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recentRoles.map((role: Role) => (
              <RecentRoleCard
                key={role.id}
                role={role}
                onStartTracking={handleStartTracking}
              />
            ))}
          </div>
        </div>
      )}
    </Layout>
  )
}