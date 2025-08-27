import { useState } from 'react'
import { useRoles, useCompanies, useCreateRole, useCreateApplication, useCreateCompany } from '../api/hooks'
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

function RoleCard({ role, onQuickSave }: { role: Role; onQuickSave: (role: Role) => void }) {
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
          onClick={() => onQuickSave(role)}
          className="bg-brand-50 hover:bg-brand-100 text-brand-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Quick Save
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
            View Job
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

function AddRoleModal({ isOpen, onClose, onAdd }: {
  isOpen: boolean
  onClose: () => void
  onAdd: (role: any) => void
}) {
  const [formData, setFormData] = useState({
    companyName: '',
    companyWebsite: '',
    companyCountry: '',
    companyCity: '',
    title: '',
    level: '',
    jobUrl: '',
    stackTags: '',
    salaryMin: '',
    salaryMax: '',
    currency: 'USD'
  })

  const createRole = useCreateRole()
  const createCompany = useCreateCompany()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // First create or find company
      const companyData = {
        name: formData.companyName,
        website: formData.companyWebsite,
        country: formData.companyCountry,
        city: formData.companyCity
      }

      const company = await createCompany.mutateAsync(companyData)

      // Then create role
      const roleData = {
        company: company.id,
        title: formData.title,
        level: formData.level,
        job_url: formData.jobUrl,
        stack_tags: formData.stackTags.split(',').map(tag => tag.trim()).filter(Boolean),
        salary_min: formData.salaryMin ? parseInt(formData.salaryMin) : null,
        salary_max: formData.salaryMax ? parseInt(formData.salaryMax) : null,
        currency: formData.currency
      }

      const role = await createRole.mutateAsync(roleData)
      onAdd({ ...role, company })
      onClose()
      
      // Reset form
      setFormData({
        companyName: '', companyWebsite: '', companyCountry: '', companyCity: '',
        title: '', level: '', jobUrl: '', stackTags: '', salaryMin: '', salaryMax: '', currency: 'USD'
      })
    } catch (error) {
      console.error('Failed to create role:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Add New Role</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                    value={formData.companyName}
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={formData.companyWebsite}
                    onChange={e => setFormData({ ...formData, companyWebsite: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.companyCountry}
                    onChange={e => setFormData({ ...formData, companyCountry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.companyCity}
                    onChange={e => setFormData({ ...formData, companyCity: e.target.value })}
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
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <select
                    value={formData.level}
                    onChange={e => setFormData({ ...formData, level: e.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job URL</label>
                  <input
                    type="url"
                    value={formData.jobUrl}
                    onChange={e => setFormData({ ...formData, jobUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tech Stack (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.stackTags}
                    onChange={e => setFormData({ ...formData, stackTags: e.target.value })}
                    placeholder="React, Node.js, Python, AWS"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
                  <input
                    type="number"
                    value={formData.salaryMin}
                    onChange={e => setFormData({ ...formData, salaryMin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
                  <input
                    type="number"
                    value={formData.salaryMax}
                    onChange={e => setFormData({ ...formData, salaryMax: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="AUD">AUD (A$)</option>
                    <option value="SGD">SGD (S$)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={createRole.isPending || createCompany.isPending}
                className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {(createRole.isPending || createCompany.isPending) ? 'Adding...' : 'Add Role'}
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
    </div>
  )
}

export default function RoleSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [companyFilter, setCompanyFilter] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  
  const { data: roles = [] } = useRoles({ search: searchQuery, company: companyFilter })
  const { data: companies = [] } = useCompanies()
  const createApplication = useCreateApplication()
  const navigate = useNavigate()

  const handleQuickSave = async (role: Role) => {
    try {
      const application = await createApplication.mutateAsync({
        role: role.id,
        status: 'saved',
        priority: 0
      })
      
      // Show success message or redirect
      navigate(`/applications/${application.id}`)
    } catch (error) {
      console.error('Failed to save application:', error)
    }
  }

  const filteredRoles = roles.filter((role: Role) => {
    const matchesSearch = !searchQuery || 
      role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.stack_tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCompany = !companyFilter || role.company.id === companyFilter
    
    return matchesSearch && matchesCompany
  })

  return (
    <Layout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Search Roles</h1>
          <p className="text-gray-600">Find and save job opportunities</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Role
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search roles, companies, or technologies
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Software Engineer, Google, React..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
            <select
              value={companyFilter}
              onChange={e => setCompanyFilter(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="">All companies</option>
              {companies.map((company: any) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-600">
          {filteredRoles.length} role{filteredRoles.length !== 1 ? 's' : ''} found
        </p>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear search
          </button>
        )}
      </div>

      {/* Role Cards Grid */}
      {filteredRoles.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRoles.map((role: Role) => (
            <RoleCard
              key={role.id}
              role={role}
              onQuickSave={handleQuickSave}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No roles found' : 'No roles available'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery 
              ? 'Try adjusting your search terms or filters'
              : 'Add some roles to get started'
            }
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add First Role
          </button>
        </div>
      )}

      {/* Add Role Modal */}
      <AddRoleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleQuickSave}
      />
    </Layout>
  )
}