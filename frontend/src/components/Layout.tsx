import type { ReactNode } from 'react'
import TopNav from './TopNav'

interface LayoutProps {
  children: ReactNode
  title?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '7xl' | 'full'
  background?: 'gray' | 'white' | 'brand'
  padding?: boolean
}

export default function Layout({ 
  children, 
  title,
  maxWidth = '7xl',
  background = 'gray',
  padding = true
}: LayoutProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  }

  const backgroundClasses = {
    gray: 'bg-gray-50',
    white: 'bg-white',
    brand: 'bg-gradient-to-br from-brand-50 to-brand-100'
  }

  return (
    <div className="min-h-screen">
      <TopNav title={title} />
      <main className={`${backgroundClasses[background]} min-h-[calc(100vh-4rem)]`}>
        <div className={`${maxWidthClasses[maxWidth]} mx-auto ${padding ? 'py-6 px-4 sm:px-6 lg:px-8' : ''}`}>
          {children}
        </div>
      </main>
    </div>
  )
}