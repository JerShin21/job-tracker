import { useDashboard } from '../api/hooks'
import Chart from 'react-apexcharts'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

export default function Dashboard(){
  const { data } = useDashboard()
  
  const statuses = ['saved', 'applied', 'oa', 'tech', 'hr', 'final', 'offer', 'reject', 'accept']
  const statusLabels = {
    saved: 'Saved',
    applied: 'Applied',
    oa: 'Online Assessment',
    tech: 'Technical',
    hr: 'HR Round',
    final: 'Final',
    offer: 'Offer',
    reject: 'Rejected',
    accept: 'Accepted'
  }
  
  const counts = statuses.map(s => (data?.[s] ?? 0))
  const total = counts.reduce((sum, count) => sum + count, 0)
  
  const series = [{ name: 'Applications', data: counts }]
  const options: any = {
    chart: { 
      type: 'bar',
      toolbar: { show: false },
      background: 'transparent'
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '60%'
      }
    },
    colors: ['#2fcf7e'],
    xaxis: { 
      categories: statuses.map(s => statusLabels[s as keyof typeof statusLabels]),
      labels: {
        style: { fontSize: '12px' }
      }
    },
    yaxis: {
      labels: {
        style: { fontSize: '12px' }
      }
    },
    dataLabels: { enabled: true, style: { fontSize: '11px' } },
    grid: {
      show: true,
      borderColor: '#f1f5f9',
      strokeDashArray: 3
    }
  }

  const quickStats = [
    { label: 'Total Applications', value: total, color: 'bg-blue-500' },
    { label: 'Pending', value: (data?.applied || 0) + (data?.oa || 0) + (data?.tech || 0) + (data?.hr || 0) + (data?.final || 0), color: 'bg-yellow-500' },
    { label: 'Offers', value: data?.offer || 0, color: 'bg-green-500' },
    { label: 'Rejected', value: data?.reject || 0, color: 'bg-red-500' }
  ]

  return (
    <Layout>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Track your job application progress</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 card-hover">
            <div className="flex items-center">
              <div className={`${stat.color} w-3 h-3 rounded-full mr-3`}></div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 card-hover">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Application Pipeline</h2>
          <p className="text-sm text-gray-600">Overview of your applications by status</p>
        </div>
        <div className="p-6">
          {total > 0 ? (
            <Chart options={options} series={series} type="bar" height={350} />
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-600 mb-4">Start tracking your job applications to see your progress</p>
              <Link 
                to="/applications" 
                className="inline-flex items-center px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
              >
                Add Your First Application
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}