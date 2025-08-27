import { useState, useRef } from 'react'
import { useDocuments, useCreateDocument, usePresignUpload, useApplications } from '../api/hooks'
import Layout from '../components/Layout'
import { Link } from 'react-router-dom'
import api from '../api/client'

interface Document {
    id: string
    application: {
        id: string
        role: {
            title: string
            company: {
                name: string
            }
        }
    }
    kind: string
    s3_key: string
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

const documentKinds = {
    resume: { label: 'Resume', icon: '📄', color: 'bg-blue-100 text-blue-800' },
    cover: { label: 'Cover Letter', icon: '📝', color: 'bg-green-100 text-green-800' },
    es: { label: 'Entry Sheet', icon: '📋', color: 'bg-purple-100 text-purple-800' },
    offer: { label: 'Offer Letter', icon: '🎉', color: 'bg-yellow-100 text-yellow-800' },
    other: { label: 'Other', icon: '📁', color: 'bg-gray-100 text-gray-800' }
}

function DocumentCard({ document: doc }: { document: Document }) {
    const kind = documentKinds[doc.kind as keyof typeof documentKinds] || documentKinds.other
    const fileName = doc.s3_key.split('/').pop() || 'Unknown file'
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || ''
    const app = doc.application
    const isObj = app && typeof app === 'object'
    const appId = isObj ? app?.id : String(app ?? '')
    const roleTitle = isObj ? app?.role?.title ?? '—' : 'View application'
    const companyName = isObj ? app?.role?.company?.name ?? '' : ''

    const getFileIcon = () => {
        if (['pdf'].includes(fileExtension)) return '📄'
        if (['doc', 'docx'].includes(fileExtension)) return '📝'
        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) return '🖼️'
        return '📁'
    }

    const handleDownload = async () => {
        try {
            const { data } = await api.get(`/documents/${doc.id}/download/`)
            window.open(data.download_url, '_blank') // or location.href = ...
        } catch (e) {
            console.error(e)
            alert('Could not generate download URL')
        }
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getFileIcon()}</div>
                    <div>
                        <p className="font-medium text-gray-900 truncate max-w-48" title={fileName}>
                            {fileName}
                        </p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${kind.color} mt-1`}>
                            {kind.label}
                        </span>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleDownload}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Download"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="text-sm text-gray-600">
                <Link
                    to={appId ? `/applications/${appId}` : '#'}
                    className="text-brand-600 hover:text-brand-700 inline-flex items-center mb-2"
                    aria-disabled={!appId}
                    onClick={(e) => { if (!appId) e.preventDefault() }}
                >
                    <svg className="w-4 h-4 mr-1" /* ... */ />
                    {roleTitle}{companyName ? ` @ ${companyName}` : ''}
                </Link>
                <p>Uploaded {new Date(doc.created_at).toLocaleDateString()}</p>
            </div>
        </div>
    )
}

function UploadModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [uploadData, setUploadData] = useState({
        applicationId: '',
        kind: 'resume' as keyof typeof documentKinds,
        file: null as File | null
    })
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const { data: applications = [] } = useApplications()
    const presignUpload = usePresignUpload()
    const createDocument = useCreateDocument()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB')
                return
            }

            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'image/jpeg',
                'image/png',
                'image/gif'
            ]

            if (!allowedTypes.includes(file.type)) {
                alert('Please upload PDF, Word document, or image files only')
                return
            }

            setUploadData({ ...uploadData, file })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const EXT_MIME: Record<string, string> = {
            pdf: 'application/pdf',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            gif: 'image/gif',
        }

        if (!uploadData.file || !uploadData.applicationId) {
            alert('Please select a file and application')
            return
        }

        setUploading(true)
        setUploadProgress(0)

        try {
            const timestamp = Date.now()
            const fileExtension = uploadData.file.name.split('.').pop()
            const s3Key = `user/documents/${uploadData.applicationId}/${timestamp}.${fileExtension}`
            const ext = (uploadData.file.name.split('.').pop() || '').toLowerCase()
            const guessed = EXT_MIME[ext]
            const contentType = guessed || uploadData.file.type || 'application/octet-stream'


            const presignedData = await presignUpload.mutateAsync({ key: s3Key })

            const formData = new FormData()
            Object.entries(presignedData.fields).forEach(([key, value]) => {
                formData.append(key, value as string)
            })
            formData.append('Content-Type', contentType)
            formData.append('file', uploadData.file)

            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90))
            }, 100)

            const uploadResponse = await fetch(presignedData.url, {
                method: 'POST',
                body: formData
            })
            if (!uploadResponse.ok) {
                const errText = await uploadResponse.text().catch(() => '')
                console.error('S3 upload error:', uploadResponse.status, errText)
                throw new Error('Upload failed')
            }

            clearInterval(progressInterval)
            setUploadProgress(100)

            if (!uploadResponse.ok) {
                throw new Error('Upload failed')
            }

            await createDocument.mutateAsync({
                application: uploadData.applicationId,
                kind: uploadData.kind,
                s3_key: s3Key
            })

            setUploadData({ applicationId: '', kind: 'resume', file: null })
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            onClose()

        } catch (error) {
            console.error('Upload failed:', error)
            alert('Upload failed. Please try again.')
        } finally {
            setUploading(false)
            setUploadProgress(0)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Upload Document</h2>
                        <button
                            onClick={onClose}
                            disabled={uploading}
                            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Application *
                            </label>
                            <select
                                value={uploadData.applicationId}
                                onChange={e => setUploadData({ ...uploadData, applicationId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                required
                                disabled={uploading}
                            >
                                <option value="">Select application</option>
                                {applications.map((app: Application) => (
                                    <option key={app.id} value={app.id}>
                                        {app.role.title} @ {app.role.company.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Document Type *
                            </label>
                            <select
                                value={uploadData.kind}
                                onChange={e => setUploadData({ ...uploadData, kind: e.target.value as keyof typeof documentKinds })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                disabled={uploading}
                            >
                                {Object.entries(documentKinds).map(([key, value]) => (
                                    <option key={key} value={key}>
                                        {value.icon} {value.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                File *
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                                required
                                disabled={uploading}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Supports PDF, Word documents, and images. Max 10MB.
                            </p>
                        </div>

                        {uploading && (
                            <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Uploading...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-brand-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        <div className="flex space-x-3 pt-4">
                            <button
                                type="submit"
                                disabled={uploading || !uploadData.file || !uploadData.applicationId}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center shadow-lg border-2 border-blue-800 ring-2 ring-blue-200"
                            >
                                {uploading ? 'Uploading...' : 'Upload Document'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={uploading}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
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

export default function HighContrastDocumentsPage() {
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [filterKind, setFilterKind] = useState<string>('')
    const [filterApplication, setFilterApplication] = useState<string>('')

    const { data: allDocuments = [] } = useDocuments()
    const { data: applications = [] } = useApplications()

    const filteredDocuments = allDocuments.filter((doc: Document) => {
        const matchesKind = !filterKind || doc.kind === filterKind
        const matchesApplication = !filterApplication || doc.application.id === filterApplication
        return matchesKind && matchesApplication
    })

    const documentsByKind = Object.keys(documentKinds).reduce((acc, kind) => {
        acc[kind] = filteredDocuments.filter((doc: Document) => doc.kind === kind)
        return acc
    }, {} as Record<string, Document[]>)

    const totalDocuments = allDocuments.length

    return (
        <Layout>
            {/* Header with HIGH CONTRAST BUTTON */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
                    <p className="text-gray-600">Manage your resumes, cover letters, and other files</p>
                </div>

                {/* HIGHLY VISIBLE UPLOAD BUTTON */}
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center shadow-lg border-2 border-blue-800 ring-2 ring-blue-200"
                    style={{
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                    }}
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Document
                </button>
            </div>

            {/* Stats and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Documents</p>
                            <p className="text-2xl font-bold text-gray-900">{totalDocuments}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by type
                        </label>
                        <select
                            value={filterKind}
                            onChange={e => setFilterKind(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        >
                            <option value="">All document types</option>
                            {Object.entries(documentKinds).map(([key, value]) => (
                                <option key={key} value={key}>
                                    {value.icon} {value.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by application
                        </label>
                        <select
                            value={filterApplication}
                            onChange={e => setFilterApplication(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        >
                            <option value="">All applications</option>
                            {applications.map((app: Application) => (
                                <option key={app.id} value={app.id}>
                                    {app.role.title} @ {app.role.company.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Documents Grid */}
            {filteredDocuments.length > 0 ? (
                <div className="space-y-6">
                    {Object.entries(documentKinds).map(([kind, kindConfig]) => {
                        const kindDocuments = documentsByKind[kind] || []
                        if (kindDocuments.length === 0) return null

                        return (
                            <div key={kind}>
                                <div className="flex items-center space-x-2 mb-4">
                                    <span className="text-2xl">{kindConfig.icon}</span>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {kindConfig.label} ({kindDocuments.length})
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {kindDocuments.map((doc: Document) => (
                                        <DocumentCard key={doc.id} document={doc} />
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                    <p className="text-gray-600 mb-4">
                        {totalDocuments === 0
                            ? 'Upload your first document to get started'
                            : 'Try adjusting your filters to see more documents'
                        }
                    </p>

                    {/* HIGHLY VISIBLE EMPTY STATE BUTTON */}
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center shadow-lg border-2 border-blue-800 ring-2 ring-blue-200"
                        style={{
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                        }}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload First Document
                    </button>
                </div>
            )}

            {/* Upload Modal */}
            <UploadModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
            />
        </Layout>
    )
}