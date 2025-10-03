'use client'

import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import {
  CalendarDaysIcon,
  PlusIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'

interface Appointment {
  id: string
  patientName: string
  patientId: string
  provider: string
  date: string
  time: string
  duration: number
  type: 'New Patient' | 'Follow-up' | 'Consultation' | 'Procedure' | 'Emergency'
  status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No Show'
  notes?: string
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientName: 'John Doe',
    patientId: 'MRN001',
    provider: 'Dr. Smith',
    date: '2024-01-16',
    time: '09:00',
    duration: 30,
    type: 'Follow-up',
    status: 'Scheduled',
    notes: 'Hypertension follow-up',
  },
  {
    id: '2',
    patientName: 'Jane Smith',
    patientId: 'MRN002',
    provider: 'Dr. Johnson',
    date: '2024-01-16',
    time: '10:30',
    duration: 45,
    type: 'New Patient',
    status: 'Confirmed',
    notes: 'Initial consultation',
  },
  {
    id: '3',
    patientName: 'Mike Johnson',
    patientId: 'MRN003',
    provider: 'Dr. Smith',
    date: '2024-01-16',
    time: '14:00',
    duration: 30,
    type: 'Consultation',
    status: 'Completed',
    notes: 'Chest pain evaluation',
  },
  {
    id: '4',
    patientName: 'Sarah Wilson',
    patientId: 'MRN004',
    provider: 'Dr. Johnson',
    date: '2024-01-16',
    time: '15:30',
    duration: 60,
    type: 'Procedure',
    status: 'Scheduled',
    notes: 'Minor procedure',
  },
  {
    id: '5',
    patientName: 'Robert Brown',
    patientId: 'MRN005',
    provider: 'Dr. Smith',
    date: '2024-01-15',
    time: '11:00',
    duration: 30,
    type: 'Follow-up',
    status: 'No Show',
    notes: 'Diabetes management',
  },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function SchedulingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNewAppointmentForm, setShowNewAppointmentForm] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [selectedDate, setSelectedDate] = useState('2024-01-16')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 ring-inset dark:bg-blue-500/10 dark:text-blue-500 dark:ring-blue-500/10'
      case 'Confirmed':
        return 'bg-green-50 text-green-700 ring-1 ring-green-600/20 ring-inset dark:bg-green-500/10 dark:text-green-500 dark:ring-green-500/10'
      case 'Completed':
        return 'bg-gray-50 text-gray-700 ring-1 ring-gray-600/20 ring-inset dark:bg-gray-500/10 dark:text-gray-500 dark:ring-gray-500/10'
      case 'Cancelled':
        return 'bg-red-50 text-red-700 ring-1 ring-red-600/20 ring-inset dark:bg-red-500/10 dark:text-red-500 dark:ring-red-500/10'
      case 'No Show':
        return 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20 ring-inset dark:bg-yellow-500/10 dark:text-yellow-500 dark:ring-yellow-500/10'
      default:
        return 'bg-gray-50 text-gray-700 ring-1 ring-gray-600/20 ring-inset dark:bg-gray-500/10 dark:text-gray-500 dark:ring-gray-500/10'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'New Patient':
        return 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20 ring-inset dark:bg-purple-500/10 dark:text-purple-500 dark:ring-purple-500/10'
      case 'Follow-up':
        return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 ring-inset dark:bg-blue-500/10 dark:text-blue-500 dark:ring-blue-500/10'
      case 'Consultation':
        return 'bg-green-50 text-green-700 ring-1 ring-green-600/20 ring-inset dark:bg-green-500/10 dark:text-green-500 dark:ring-green-500/10'
      case 'Procedure':
        return 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/20 ring-inset dark:bg-orange-500/10 dark:text-orange-500 dark:ring-orange-500/10'
      case 'Emergency':
        return 'bg-red-50 text-red-700 ring-1 ring-red-600/20 ring-inset dark:bg-red-500/10 dark:text-red-500 dark:ring-red-500/10'
      default:
        return 'bg-gray-50 text-gray-700 ring-1 ring-gray-600/20 ring-inset dark:bg-gray-500/10 dark:text-gray-500 dark:ring-gray-500/10'
    }
  }

  const todayAppointments = mockAppointments.filter(apt => apt.date === selectedDate)
  const scheduledAppointments = mockAppointments.filter(apt => apt.status === 'Scheduled')
  const completedAppointments = mockAppointments.filter(apt => apt.status === 'Completed')
  const noShowAppointments = mockAppointments.filter(apt => apt.status === 'No Show')

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

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
                  Appointment Scheduling
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Manage patient appointments and provider schedules
                </p>
              </div>
              <div className="mt-4 flex md:ml-4 md:mt-0">
                <button
                  type="button"
                  onClick={() => setShowNewAppointmentForm(true)}
                  className="btn-primary"
                >
                  <PlusIcon className="size-5 mr-2" />
                  New Appointment
                </button>
              </div>
            </div>

            {/* Quick stats */}
            <div className="mt-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="card">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CalendarDaysIcon className="size-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Today's Appointments
                        </dt>
                        <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {todayAppointments.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ClockIcon className="size-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Scheduled
                        </dt>
                        <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {scheduledAppointments.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="size-8 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Completed
                        </dt>
                        <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {completedAppointments.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <XCircleIcon className="size-8 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          No Shows
                        </dt>
                        <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {noShowAppointments.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Date selector and filters */}
            <div className="mt-8">
              <div className="card">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Date
                      </label>
                      <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="input-field mt-1" 
                      />
                    </div>
                    <select className="input-field">
                      <option>All Providers</option>
                      <option>Dr. Smith</option>
                      <option>Dr. Johnson</option>
                    </select>
                    <select className="input-field">
                      <option>All Status</option>
                      <option>Scheduled</option>
                      <option>Confirmed</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                      <option>No Show</option>
                    </select>
                    <select className="input-field">
                      <option>All Types</option>
                      <option>New Patient</option>
                      <option>Follow-up</option>
                      <option>Consultation</option>
                      <option>Procedure</option>
                      <option>Emergency</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointments list */}
            <div className="mt-8">
              <div className="card">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Appointments for {new Date(selectedDate).toLocaleDateString()} ({todayAppointments.length})
                  </h3>
                  
                  <table className="w-full whitespace-nowrap text-left text-sm/6">
                    <colgroup>
                      <col className="w-full" />
                      <col />
                      <col />
                      <col />
                      <col />
                      <col />
                      <col />
                    </colgroup>
                    <thead className="border-b border-gray-200 text-gray-900 dark:border-white/15 dark:text-white">
                      <tr>
                        <th scope="col" className="px-0 py-3 font-semibold">
                          Time
                        </th>
                        <th scope="col" className="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell">
                          Patient
                        </th>
                        <th scope="col" className="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell">
                          Provider
                        </th>
                        <th scope="col" className="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell">
                          Type
                        </th>
                        <th scope="col" className="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell">
                          Status
                        </th>
                        <th scope="col" className="py-3 pl-8 pr-0 text-right font-semibold">
                          Duration
                        </th>
                        <th scope="col" className="py-3 pl-8 pr-0 text-right font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayAppointments.map((appointment) => (
                        <tr key={appointment.id} className="border-b border-gray-100 dark:border-white/10">
                          <td className="max-w-0 px-0 py-5 align-top">
                            <div className="truncate font-medium text-gray-900 dark:text-white">{formatTime(appointment.time)}</div>
                          </td>
                          <td className="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell dark:text-gray-300">
                            {appointment.patientName}
                          </td>
                          <td className="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell dark:text-gray-300">
                            {appointment.provider}
                          </td>
                          <td className="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell dark:text-gray-300">
                            <span className={classNames(
                                'inline-flex items-center rounded-md px-2 py-2 text-xs font-medium',
                              getTypeColor(appointment.type)
                            )}>
                              {appointment.type}
                            </span>
                          </td>
                          <td className="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell dark:text-gray-300">
                            <span className={classNames(
                                'inline-flex items-center rounded-md px-2 py-2 text-xs font-medium',
                              getStatusColor(appointment.status)
                            )}>
                              {appointment.status}
                            </span>
                          </td>
                          <td className="py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 dark:text-gray-300">
                            {appointment.duration} min
                          </td>
                          <td className="py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 dark:text-gray-300">
                            <button
                              onClick={() => setSelectedAppointment(appointment)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* New Appointment Modal */}
      {showNewAppointmentForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowNewAppointmentForm(false)} />
            
            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
              <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-4">
                      Schedule New Appointment
                    </h3>
                    
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Patient
                          </label>
                          <select className="input-field mt-1">
                            <option>Select Patient</option>
                            <option>John Doe (MRN001)</option>
                            <option>Jane Smith (MRN002)</option>
                            <option>Mike Johnson (MRN003)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Provider
                          </label>
                          <select className="input-field mt-1">
                            <option>Dr. Smith</option>
                            <option>Dr. Johnson</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Date
                          </label>
                          <input type="date" className="input-field mt-1" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Time
                          </label>
                          <input type="time" className="input-field mt-1" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Duration (minutes)
                          </label>
                          <select className="input-field mt-1">
                            <option>15</option>
                            <option>30</option>
                            <option>45</option>
                            <option>60</option>
                            <option>90</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Appointment Type
                          </label>
                          <select className="input-field mt-1">
                            <option>New Patient</option>
                            <option>Follow-up</option>
                            <option>Consultation</option>
                            <option>Procedure</option>
                            <option>Emergency</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Notes
                        </label>
                        <textarea 
                          rows={3}
                          placeholder="Additional notes or special instructions"
                          className="input-field mt-1" 
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="btn-primary sm:ml-3"
                  onClick={() => setShowNewAppointmentForm(false)}
                >
                  Schedule Appointment
                </button>
                <button
                  type="button"
                  className="btn-secondary mt-3 sm:mt-0"
                  onClick={() => setShowNewAppointmentForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedAppointment(null)} />
            
            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
              <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                        Appointment Details
                      </h3>
                      <button
                        onClick={() => setSelectedAppointment(null)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Patient:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedAppointment.patientName}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Patient ID:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedAppointment.patientId}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Provider:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedAppointment.provider}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Date:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{new Date(selectedAppointment.date).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Time:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{formatTime(selectedAppointment.time)}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Duration:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedAppointment.duration} minutes</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedAppointment.type}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                          <span className={classNames(
                            'ml-2 inline-flex items-center rounded-md px-2.5 py-2 text-xs font-medium',
                            getStatusColor(selectedAppointment.status)
                          )}>
                            {selectedAppointment.status}
                          </span>
                        </div>
                      </div>
                      
                      {selectedAppointment.notes && (
                        <div className="border-t border-gray-200 dark:border-white/10 pt-6">
                          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Notes</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{selectedAppointment.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="btn-primary sm:ml-3"
                  onClick={() => setSelectedAppointment(null)}
                >
                  Edit Appointment
                </button>
                <button
                  type="button"
                  className="btn-secondary mt-3 sm:mt-0"
                  onClick={() => setSelectedAppointment(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
