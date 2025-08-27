import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'

interface User {
  id: number
  email: string
  first_name: string
  last_name: string
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

type AuthCtx = { 
  user?: User
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  isLoading: boolean
  isInitialized: boolean
}

const Ctx = createContext<AuthCtx>(null as any)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }: { children: any }) {
  const [user, setUser] = useState<User | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Check if user is already authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('access')
      if (accessToken) {
        try {
          // Verify token by fetching user profile
          const response = await api.get('/auth/profile/')
          setUser(response.data)
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('access')
          localStorage.removeItem('refresh')
        }
      }
      setIsInitialized(true)
    }
    checkAuth()
  }, [])

  async function login(email: string, password: string) {
    setIsLoading(true)
    try {
      const { data } = await api.post('/auth/token/', { 
        username: email, // Django expects 'username' field
        password 
      })
      
      // Store tokens
      localStorage.setItem('access', data.access)
      localStorage.setItem('refresh', data.refresh)
      
      // Fetch user profile
      const profileResponse = await api.get('/auth/profile/')
      setUser(profileResponse.data)
    } catch (error: any) {
      console.error('Login error:', error.response?.data)
      throw new Error(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        'Login failed. Please check your credentials.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function register(userData: RegisterData) {
    setIsLoading(true)
    try {
      const { data } = await api.post('/auth/register/', {
        email: userData.email,
        password: userData.password,
        confirm_password: userData.confirmPassword,
        first_name: userData.firstName,
        last_name: userData.lastName
      })
      
      // Store tokens from registration response
      localStorage.setItem('access', data.access)
      localStorage.setItem('refresh', data.refresh)
      
      // Set user from registration response
      setUser(data.user)
    } catch (error: any) {
      console.error('Registration error:', error.response?.data)
      
      // Handle validation errors
      if (error.response?.data) {
        const errors = error.response.data
        if (errors.email) {
          throw new Error(errors.email[0])
        }
        if (errors.password) {
          throw new Error(errors.password[0])
        }
        if (errors.confirm_password) {
          throw new Error(errors.confirm_password[0])
        }
        if (errors.non_field_errors) {
          throw new Error(errors.non_field_errors[0])
        }
      }
      
      throw new Error('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function logout() { 
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    setUser(undefined)
  }

  return (
    <Ctx.Provider value={{ user, login, register, logout, isLoading, isInitialized }}>
      {children}
    </Ctx.Provider>
  )
}