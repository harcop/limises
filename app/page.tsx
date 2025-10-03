'use client'

import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import {
  UserGroupIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  BeakerIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

const stats = [
  { name: 'Total Patients', value: '2,847', icon: UserGroupIcon },
  { name: 'Active Encounters', value: '156', icon: DocumentTextIcon },
  { name: 'Pending Orders', value: '23', icon: ClipboardDocumentListIcon },
  { name: 'Lab Results', value: '89', icon: BeakerIcon },
]

const recentActivity = [
  {
    id: 1,
    type: 'patient',
    description: 'New patient John Doe registered',
    time: '2 minutes ago',
    icon: UserGroupIcon,
  },
  {
    id: 2,
    type: 'order',
    description: 'Lab order completed for Jane Smith',
    time: '15 minutes ago',
    icon: BeakerIcon,
  },
  {
    id: 3,
    type: 'note',
    description: 'Clinical note updated for Mike Johnson',
    time: '1 hour ago',
    icon: DocumentTextIcon,
  },
  {
    id: 4,
    type: 'alert',
    description: 'Critical lab result for Sarah Wilson',
    time: '2 hours ago',
    icon: ExclamationTriangleIcon,
  },
]

const upcomingAppointments = [
  {
    id: 1,
    patient: 'Alice Brown',
    time: '9:00 AM',
    type: 'Follow-up',
    provider: 'Dr. Smith',
  },
  {
    id: 2,
    patient: 'Bob Green',
    time: '10:30 AM',
    type: 'New Patient',
    provider: 'Dr. Johnson',
  },
  {
    id: 3,
    patient: 'Carol White',
    time: '2:00 PM',
    type: 'Consultation',
    provider: 'Dr. Smith',
  },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="xl:pl-72">
        <Header setSidebarOpen={setSidebarOpen} />
        
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Page header */}
            <div className="md:flex md:items-center md:justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
                  Dashboard
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Welcome back, Dr. Smith. Here's what's happening today.
                </p>
              </div>
              <div className="mt-4 flex md:ml-4 md:mt-0">
                <button
                  type="button"
                  className="btn-secondary"
                >
                  View Reports
                </button>
                <button
                  type="button"
                  className="ml-3 btn-primary"
                >
                  New Patient
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.name} className="card">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <stat.icon className="size-8 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            {stat.name}
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                              {stat.value}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main content grid */}
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Recent Activity */}
              <div className="card">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
                  <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                    View all
                  </a>
                </div>
                <div className="mt-6 flow-root">
                  <ul role="list" className="-my-5 divide-y divide-gray-200 dark:divide-white/10">
                    {recentActivity.map((activity) => (
                      <li key={activity.id} className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <activity.icon className="size-6 text-gray-400 dark:text-gray-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-900 dark:text-white">
                              {activity.description}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Upcoming Appointments */}
              <div className="card">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upcoming Appointments</h3>
                  <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                    View all
                  </a>
                </div>
                <div className="mt-6 flow-root">
                  <ul role="list" className="-my-5 divide-y divide-gray-200 dark:divide-white/10">
                    {upcomingAppointments.map((appointment) => (
                      <li key={appointment.id} className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <ClockIcon className="size-6 text-gray-400 dark:text-gray-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {appointment.patient}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {appointment.time} • {appointment.type} • {appointment.provider}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <button className="card hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center">
                    <UserGroupIcon className="size-8 text-indigo-600 dark:text-indigo-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Register Patient</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Add new patient</p>
                    </div>
                  </div>
                </button>
                
                <button className="card hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center">
                    <DocumentTextIcon className="size-8 text-indigo-600 dark:text-indigo-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Create Note</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Document encounter</p>
                    </div>
                  </div>
                </button>
                
                <button className="card hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center">
                    <ClipboardDocumentListIcon className="size-8 text-indigo-600 dark:text-indigo-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Place Order</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Lab or medication</p>
                    </div>
                  </div>
                </button>
                
                <button className="card hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center">
                    <BeakerIcon className="size-8 text-indigo-600 dark:text-indigo-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">View Results</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Check lab results</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
