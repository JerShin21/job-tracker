import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './client'

// Existing hooks
export const useDashboard = () => useQuery({ 
  queryKey: ['dashboard'], 
  queryFn: async () => (await api.get('/applications/dashboard/')).data 
})

export const useApplications = () => useQuery({ 
  queryKey: ['applications'], 
  queryFn: async () => (await api.get('/applications/')).data 
})

export const useApplication = (id: string) => useQuery({
  queryKey: ['application', id],
  queryFn: async () => (await api.get(`/applications/${id}/`)).data,
  enabled: !!id
})

export const useCreateApplication = () => {
  const qc = useQueryClient()
  return useMutation({ 
    mutationFn: async (payload: any) => (await api.post('/applications/', payload)).data, 
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

export const useUpdateApplication = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: any) => (await api.patch(`/applications/${id}/`, payload)).data,
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['application', id] })
      qc.invalidateQueries({ queryKey: ['applications'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

// Company hooks
export const useCompanies = (search?: string) => useQuery({
  queryKey: ['companies', search],
  queryFn: async () => {
    const params = search ? `?search=${encodeURIComponent(search)}` : ''
    return (await api.get(`/companies/${params}`)).data
  }
})

export const useCreateCompany = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: any) => (await api.post('/companies/', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['companies'] })
  })
}

// Role hooks
export const useRoles = (params?: { company?: string; search?: string }) => useQuery({
  queryKey: ['roles', params],
  queryFn: async () => {
    const searchParams = new URLSearchParams()
    if (params?.company) searchParams.set('company', params.company)
    if (params?.search) searchParams.set('search', params.search)
    const queryString = searchParams.toString()
    return (await api.get(`/roles/${queryString ? '?' + queryString : ''}`)).data
  }
})

export const useCreateRole = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: any) => (await api.post('/roles/', payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] })
      qc.invalidateQueries({ queryKey: ['companies'] })
    }
  })
}

// Stages hooks
export const useStages = (applicationId: string) => useQuery({
  queryKey: ['stages', applicationId],
  queryFn: async () => (await api.get(`/stages/?application=${applicationId}`)).data,
  enabled: !!applicationId
})

export const useCreateStage = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: any) => (await api.post('/stages/', payload)).data,
    onSuccess: (_, payload) => {
      qc.invalidateQueries({ queryKey: ['stages', payload.application] })
      qc.invalidateQueries({ queryKey: ['application', payload.application] })
    }
  })
}

export const useUpdateStage = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: any) => (await api.patch(`/stages/${id}/`, payload)).data,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['stages', data.application] })
      qc.invalidateQueries({ queryKey: ['application', data.application] })
    }
  })
}

// Documents hooks
export const useDocuments = (applicationId?: string) => useQuery({
  queryKey: ['documents', applicationId],
  queryFn: async () => {
    const params = applicationId ? `?application=${applicationId}` : ''
    return (await api.get(`/documents/${params}`)).data
  }
})

export const useCreateDocument = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: any) => (await api.post('/documents/', payload)).data,
    onSuccess: (_, payload) => {
      qc.invalidateQueries({ queryKey: ['documents', payload.application] })
    }
  })
}

export const usePresignUpload = () => {
  return useMutation({
    mutationFn: async (payload: { key: string; contentType?: string }) => (await api.post('/documents/presign/', payload)).data
  })
}

// Reminders hooks
export const useReminders = (params?: { done?: boolean }) => useQuery({
  queryKey: ['reminders', params],
  queryFn: async () => {
    const searchParams = new URLSearchParams()
    if (params?.done !== undefined) searchParams.set('done', params.done.toString())
    const queryString = searchParams.toString()
    return (await api.get(`/reminders/${queryString ? '?' + queryString : ''}`)).data
  }
})

export const useCreateReminder = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: any) => (await api.post('/reminders/', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] })
  })
}

export const useUpdateReminder = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: any) => (await api.patch(`/reminders/${id}/`, payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] })
  })
}