'use client'

import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import {
  HeartIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'

interface Medication {
  id: string
  patientName: string
  patientId: string
  medicationName: string
  dosage: string
  frequency: string
  route: string
  startDate: string
  endDate?: string
  status: 'Active' | 'Discontinued' | 'Completed'
  provider: string
  indication: string
  allergies?: string[]
  interactions?: string[]
}

const mockMedications: Medication[] = [
  {
    id: '1',
    patientName: 'John Doe',
    patientId: 'MRN001',
    medicationName: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    route: 'Oral',
    startDate: '2024-01-10',
    status: 'Active',
    provider: 'Dr. Smith',
    indication: 'Hypertension',
  },
  {
    id: '2',
    patientName: 'Jane Smith',
    patientId: 'MRN002',
    medicationName: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    route: 'Oral',
    startDate: '2024-01-05',
    status: 'Active',
    provider: 'Dr. Johnson',
    indication: 'Type 2 Diabetes',
  },
  {
    id: '3',
    patientName: 'Mike Johnson',
    patientId: 'MRN003',
    medicationName: 'Ibuprofen',
    dosage: '400mg',
    frequency: 'As needed',
    route: 'Oral',
    startDate: '2024-01-15',
    endDate: '2024-01-20',
    status: 'Completed',
    provider: 'Dr. Smith',
    indication: 'Pain management',
  },
  {
    id: '4',
    patientName: 'Sarah Wilson',
    patientId: 'MRN004',
    medicationName: 'Penicillin',
    dosage: '500mg',
    frequency: 'Four times daily',
    route: 'Oral',
    startDate: '2024-01-12',
    status: 'Active',
    provider: 'Dr. Johnson',
    indication: 'Bacterial infection',
    allergies: ['Penicillin'],
    interactions: ['Warfarin - may increase bleeding risk'],
  },
]

const mockAllergies = [
  {
    id: '1',
    patientName: 'John Doe',
    patientId: 'MRN001',
    allergen: 'Penicillin',
    reaction: 'Rash',
    severity: 'Moderate',
    dateReported: '2020-03-15',
  },
  {
    id: '2',
    patientName: 'Jane Smith',
    patientId: 'MRN002',
    allergen: 'Sulfa drugs',
    reaction: 'Hives',
    severity: 'Severe',
    dateReported: '2019-08-22',
  },
  {
    id: '3',
    patientName: 'Mike Johnson',
    patientId: 'MRN003',
    allergen: 'Latex',
    reaction: 'Contact dermatitis',
    severity: 'Mild',
    dateReported: '2021-11-10',
  },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function MedicationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNewMedicationForm, setShowNewMedicationForm] = useState(false)
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null)
  const [activeTab, setActiveTab] = useState<'medications' | 'allergies'>('medications')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'Discontinued':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'Completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Mild':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'Severe':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const activeMedications = mockMedications.filter(med => med.status === 'Active')
  const discontinuedMedications = mockMedications.filter(med => med.status === 'Discontinued')
  const medicationsWithInteractions = mockMedications.filter(med => med.interactions && med.interactions.length > 0)

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
                  Medication Management
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Manage patient medications and allergy information
                </p>
              </div>
              <div className="mt-4 flex md:ml-4 md:mt-0">
                <button
                  type="button"
                  onClick={() => setShowNewMedicationForm(true)}
                  className="btn-primary"
                >
                  <PlusIcon className="size-5 mr-2" />
                  New Medication
                </button>
              </div>
            </div>

            {/* Alert for interactions */}
            {medicationsWithInteractions.length > 0 && (
              <div className="mt-8">
                <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                        Drug Interactions Alert
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                        <p>You have {medicationsWithInteractions.length} medication(s) with potential drug interactions.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick stats */}
            <div className="mt-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="card">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="size-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Active Medications
                        </dt>
                        <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {activeMedications.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="size-8 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Drug Interactions
                        </dt>
                        <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {medicationsWithInteractions.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="size-8 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Known Allergies
                        </dt>
                        <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {mockAllergies.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <HeartIcon className="size-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Total Medications
                        </dt>
                        <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {mockMedications.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-8">
              <div className="border-b border-gray-200 dark:border-white/10">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('medications')}
                    className={classNames(
                      activeTab === 'medications'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
                      'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
                    )}
                  >
                    Medications
                  </button>
                  <button
                    onClick={() => setActiveTab('allergies')}
                    className={classNames(
                      activeTab === 'allergies'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
                      'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
                    )}
                  >
                    Allergies
                  </button>
                </nav>
              </div>
            </div>

            {/* Medications Tab */}
            {activeTab === 'medications' && (
              <div className="mt-8">
                <div className="card">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Medications ({mockMedications.length})
                    </h3>
                    
                    <table className="w-full whitespace-nowrap text-left text-sm/6">
                      <colgroup>
                        <col className="w-full" />
                        <col />
                        <col />
                        <col />
                        <col />
                        <col />
                      </colgroup>
                      <thead className="border-b border-gray-200 text-gray-900 dark:border-white/15 dark:text-white">
                        <tr>
                          <th scope="col" className="px-0 py-3 font-semibold">
                            Medication
                          </th>
                          <th scope="col" className="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell">
                            Patient
                          </th>
                          <th scope="col" className="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell">
                            Dosage
                          </th>
                          <th scope="col" className="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell">
                            Status
                          </th>
                          <th scope="col" className="py-3 pl-8 pr-0 text-right font-semibold">
                            Start Date
                          </th>
                          <th scope="col" className="py-3 pl-8 pr-0 text-right font-semibold">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockMedications.map((medication) => (
                          <tr key={medication.id} className="border-b border-gray-100 dark:border-white/10">
                            <td className="max-w-0 px-0 py-5 align-top">
                              <div className="truncate font-medium text-gray-900 dark:text-white">{medication.medicationName}</div>
                              <div className="truncate text-gray-500 dark:text-gray-400">{medication.indication}</div>
                            </td>
                            <td className="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell dark:text-gray-300">
                              {medication.patientName}
                            </td>
                            <td className="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell dark:text-gray-300">
                              {medication.dosage}
                            </td>
                            <td className="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell dark:text-gray-300">
                              <span className={classNames(
                                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                getStatusColor(medication.status)
                              )}>
                                {medication.status}
                              </span>
                            </td>
                            <td className="py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 dark:text-gray-300">
                              {new Date(medication.startDate).toLocaleDateString()}
                            </td>
                            <td className="py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 dark:text-gray-300">
                              <button
                                onClick={() => setSelectedMedication(medication)}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              >
                                <EyeIcon className="size-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Allergies Tab */}
            {activeTab === 'allergies' && (
              <div className="mt-8">
                <div className="card">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Known Allergies ({mockAllergies.length})
                    </h3>
                    
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300 dark:divide-white/10">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Patient
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Allergen
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Reaction
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Severity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Date Reported
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-white/10">
                          {mockAllergies.map((allergy) => (
                            <tr key={allergy.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">{allergy.patientName}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{allergy.patientId}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{allergy.allergen}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">{allergy.reaction}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={classNames(
                                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                  getSeverityColor(allergy.severity)
                                )}>
                                  {allergy.severity}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {new Date(allergy.dateReported).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* New Medication Modal */}
      {showNewMedicationForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowNewMedicationForm(false)} />
            
            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
              <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-4">
                      Add New Medication
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
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Medication Name
                        </label>
                        <input 
                          type="text" 
                          placeholder="Enter medication name"
                          className="input-field mt-1" 
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Dosage
                          </label>
                          <input 
                            type="text" 
                            placeholder="e.g., 10mg"
                            className="input-field mt-1" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Frequency
                          </label>
                          <select className="input-field mt-1">
                            <option>Once daily</option>
                            <option>Twice daily</option>
                            <option>Three times daily</option>
                            <option>Four times daily</option>
                            <option>As needed</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Route
                          </label>
                          <select className="input-field mt-1">
                            <option>Oral</option>
                            <option>IV</option>
                            <option>IM</option>
                            <option>Topical</option>
                            <option>Inhalation</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Indication
                        </label>
                        <input 
                          type="text" 
                          placeholder="Reason for medication"
                          className="input-field mt-1" 
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Start Date
                          </label>
                          <input type="date" className="input-field mt-1" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            End Date (optional)
                          </label>
                          <input type="date" className="input-field mt-1" />
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="btn-primary sm:ml-3"
                  onClick={() => setShowNewMedicationForm(false)}
                >
                  Add Medication
                </button>
                <button
                  type="button"
                  className="btn-secondary mt-3 sm:mt-0"
                  onClick={() => setShowNewMedicationForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medication Details Modal */}
      {selectedMedication && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedMedication(null)} />
            
            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
              <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                        Medication Details
                      </h3>
                      <button
                        onClick={() => setSelectedMedication(null)}
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
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedMedication.patientName}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Patient ID:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedMedication.patientId}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Medication:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedMedication.medicationName}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Provider:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedMedication.provider}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Dosage:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedMedication.dosage}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Frequency:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedMedication.frequency}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Route:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedMedication.route}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Start Date:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{new Date(selectedMedication.startDate).toLocaleDateString()}</span>
                        </div>
                        {selectedMedication.endDate && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">End Date:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{new Date(selectedMedication.endDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="border-t border-gray-200 dark:border-white/10 pt-6">
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Indication</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{selectedMedication.indication}</p>
                        
                        {selectedMedication.allergies && selectedMedication.allergies.length > 0 && (
                          <>
                            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Known Allergies</h4>
                            <div className="space-y-1">
                              {selectedMedication.allergies.map((allergy, index) => (
                                <span key={index} className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/20 dark:text-red-400 mr-2">
                                  {allergy}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                        
                        {selectedMedication.interactions && selectedMedication.interactions.length > 0 && (
                          <>
                            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2 mt-4">Drug Interactions</h4>
                            <div className="space-y-2">
                              {selectedMedication.interactions.map((interaction, index) => (
                                <p key={index} className="text-sm text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                                  {interaction}
                                </p>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="btn-primary sm:ml-3"
                  onClick={() => setSelectedMedication(null)}
                >
                  Edit Medication
                </button>
                <button
                  type="button"
                  className="btn-secondary mt-3 sm:mt-0"
                  onClick={() => setSelectedMedication(null)}
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
