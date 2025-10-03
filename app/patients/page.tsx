'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline'

interface Patient {
  id: string
  name: string
  dateOfBirth: string
  phone: string
  email: string
  address: string
  mrn: string
  lastVisit: string
}

const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'John Doe',
    dateOfBirth: '1985-03-15',
    phone: '(555) 123-4567',
    email: 'john.doe@email.com',
    address: '123 Main St, Anytown, ST 12345',
    mrn: 'MRN001',
    lastVisit: '2024-01-15',
  },
  {
    id: '2',
    name: 'Jane Smith',
    dateOfBirth: '1990-07-22',
    phone: '(555) 987-6543',
    email: 'jane.smith@email.com',
    address: '456 Oak Ave, Somewhere, ST 67890',
    mrn: 'MRN002',
    lastVisit: '2024-01-10',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    dateOfBirth: '1978-12-08',
    phone: '(555) 456-7890',
    email: 'mike.johnson@email.com',
    address: '789 Pine Rd, Elsewhere, ST 13579',
    mrn: 'MRN003',
    lastVisit: '2024-01-08',
  },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function PatientsPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewPatientForm, setShowNewPatientForm] = useState(false)

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  )

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
                  Patient Management
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Search and manage patient records
                </p>
              </div>
              <div className="mt-4 flex md:ml-4 md:mt-0">
                <button
                  type="button"
                  onClick={() => setShowNewPatientForm(true)}
                  className="btn-primary"
                >
                  <PlusIcon className="size-5 mr-2" />
                  New Patient
                </button>
              </div>
            </div>

            {/* Search and filters */}
            <div className="mt-8">
              <div className="card">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="size-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search by name, MRN, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select className="input-field">
                      <option>All Departments</option>
                      <option>Emergency</option>
                      <option>Cardiology</option>
                      <option>Pediatrics</option>
                    </select>
                    <select className="input-field">
                      <option>All Status</option>
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Patient list */}
            <div className="mt-8">
              <div className="card">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Patients ({filteredPatients.length})
                  </h3>
                  
                  <table className="w-full whitespace-nowrap text-left text-sm/6">
                    <colgroup>
                      <col className="w-full" />
                      <col />
                      <col />
                      <col />
                      <col />
                    </colgroup>
                    <thead className="border-b border-gray-200 text-gray-900 dark:border-white/15 dark:text-white">
                      <tr>
                        <th scope="col" className="px-0 py-3 font-semibold">
                          Patient
                        </th>
                        <th scope="col" className="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell">
                          MRN
                        </th>
                        <th scope="col" className="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell">
                          Phone
                        </th>
                        <th scope="col" className="py-3 pl-8 pr-0 text-right font-semibold">
                          Last Visit
                        </th>
                        <th scope="col" className="py-3 pl-8 pr-0 text-right font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.map((patient) => (
                        <tr key={patient.id} className="border-b border-gray-100 dark:border-white/10">
                          <td className="max-w-0 px-0 py-5 align-top">
                            <div className="truncate font-medium text-gray-900 dark:text-white">{patient.name}</div>
                            <div className="truncate text-gray-500 dark:text-gray-400">DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</div>
                          </td>
                          <td className="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell dark:text-gray-300">
                            {patient.mrn}
                          </td>
                          <td className="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell dark:text-gray-300">
                            {patient.phone}
                          </td>
                          <td className="py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 dark:text-gray-300">
                            {new Date(patient.lastVisit).toLocaleDateString()}
                          </td>
                          <td className="py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 dark:text-gray-300">
                            <button
                              onClick={() => router.push(`/patients/${patient.id}`)}
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

      {/* New Patient Modal */}
      {showNewPatientForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowNewPatientForm(false)} />
            
            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-4">
                      Register New Patient
                    </h3>
                    
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            First Name
                          </label>
                          <input type="text" className="input-field mt-1" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Last Name
                          </label>
                          <input type="text" className="input-field mt-1" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Date of Birth
                        </label>
                        <input type="date" className="input-field mt-1" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Phone Number
                        </label>
                        <input type="tel" className="input-field mt-1" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email Address
                        </label>
                        <input type="email" className="input-field mt-1" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Address
                        </label>
                        <textarea rows={3} className="input-field mt-1" />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="btn-primary sm:ml-3"
                  onClick={() => setShowNewPatientForm(false)}
                >
                  Register Patient
                </button>
                <button
                  type="button"
                  className="btn-secondary mt-3 sm:mt-0"
                  onClick={() => setShowNewPatientForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
