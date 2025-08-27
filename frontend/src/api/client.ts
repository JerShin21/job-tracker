import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api' })

// Attach tokens
api.interceptors.request.use(cfg => {
  const access = localStorage.getItem('access')
  if (access) cfg.headers.Authorization = `Bearer ${access}`
  return cfg
})

let refreshing = false
let queue: any[] = []

api.interceptors.response.use(r => r, async err => {
  if (err.response?.status === 401 && !err.config.__isRetry) {
    if (refreshing) {
      return new Promise((resolve) => queue.push((t:string)=>{ err.config.headers.Authorization = `Bearer ${t}`; err.config.__isRetry = true; resolve(api(err.config)) }))
    }
    refreshing = true
    try {
      const refresh = localStorage.getItem('refresh')
      const { data } = await axios.post((import.meta.env.VITE_API_BASE_URL||'http://localhost:8000/api').replace('/api','') + '/api/auth/refresh/', { refresh })
      localStorage.setItem('access', data.access)
      queue.forEach(cb=>cb(data.access)); queue=[]
      err.config.headers.Authorization = `Bearer ${data.access}`; err.config.__isRetry = true
      return api(err.config)
    } finally { refreshing = false }
  }
  return Promise.reject(err)
})

export default api
