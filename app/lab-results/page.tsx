'use client'

import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import {
  BeakerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'

interface LabResult {
  id: string
  patientName: string
  patientId: string
  testName: string
  testCode: string
  result: string
  unit: string
  referenceRange: string
  status: 'Normal' | 'Abnormal' | 'Critical' | 'Pending'
  dateOrdered: string
  dateCompleted: string
  provider: string
  notes?: string
}

const mockLabResults: LabResult[] = [
  {
    id: '1',
    patientName: 'John Doe',
    patientId: 'MRN001',
    testName: 'Complete Blood Count',
    testCode: 'CBC',
    result: 'Normal',
    unit: '',
    referenceRange: 'Normal',
    status: 'Normal',
    dateOrdered: '2024-01-15',
    dateCompleted: '2024-01-15',
    provider: 'Dr. Smith',
    notes: 'All values within normal limits',
  },
  {
    id: '2',
    patientName: 'Jane Smith',
    patientId: 'MRN002',
    testName: 'Hemoglobin A1c',
    testCode: 'HBA1C',
    result: '6.8',
    unit: '%',
    referenceRange: '<7.0%',
    status: 'Normal',
    dateOrdered: '2024-01-14',
    dateCompleted: '2024-01-14',
    provider: 'Dr. Johnson',
  },
  {
    id: '3',
    patientName: 'Mike Johnson',
    patientId: 'MRN003',
    testName: 'Troponin I',
    testCode: 'TROP',
    result: '0.02',
    unit: 'ng/mL',
    referenceRange: '<0.04 ng/mL',
    status: 'Normal',
    dateOrdered: '2024-01-16',
    dateCompleted: '2024-01-16',
    provider: 'Dr. Smith',
  },
  {
    id: '4',
    patientName: 'Sarah Wilson',
    patientId: 'MRN004',
    testName: 'White Blood Cell Count',
    testCode: 'WBC',
    result: '15.2',
    unit: 'K/uL',
    referenceRange: '4.5-11.0 K/uL',
    status: 'Abnormal',
    dateOrdered: '2024-01-16',
    dateCompleted: '2024-01-16',
    provider: 'Dr. Johnson',
    notes: 'Elevated WBC suggests possible infection',
  },
  {
    id: '5',
    patientName: 'Robert Brown',
    patientId: 'MRN005',
    testName: 'Potassium',
    testCode: 'K',
    result: '6.8',
    unit: 'mEq/L',
    referenceRange: '3.5-5.0 mEq/L',
    status: 'Critical',
    dateOrdered: '2024-01-16',
    dateCompleted: '2024-01-16',
    provider: 'Dr. Smith',
    notes: 'CRITICAL VALUE - Notify provider immediately',
  },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function LabResultsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Normal':
        return 'bg-green-50 text-green-700 ring-1 ring-green-600/20 ring-inset dark:bg-green-500/10 dark:text-green-500 dark:ring-green-500/10'
      case 'Abnormal':
        return 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20 ring-inset dark:bg-yellow-500/10 dark:text-yellow-500 dark:ring-yellow-500/10'
      case 'Critical':
        return 'bg-red-50 text-red-700 ring-1 ring-red-600/20 ring-inset dark:bg-red-500/10 dark:text-red-500 dark:ring-red-500/10'
      case 'Pending':
        return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 ring-inset dark:bg-blue-500/10 dark:text-blue-500 dark:ring-blue-500/10'
      default:
        return 'bg-gray-50 text-gray-700 ring-1 ring-gray-600/20 ring-inset dark:bg-gray-500/10 dark:text-gray-500 dark:ring-gray-500/10'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Normal':
        return CheckCircleIcon
      case 'Abnormal':
        return ExclamationTriangleIcon
      case 'Critical':
        return ExclamationTriangleIcon
      case 'Pending':
        return ClockIcon
      default:
        return BeakerIcon
    }
  }

  const criticalResults = mockLabResults.filter(result => result.status === 'Critical')
  const abnormalResults = mockLabResults.filter(result => result.status === 'Abnormal')
  const pendingResults = mockLabResults.filter(result => result.status === 'Pending')

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
                  Lab Results Management
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  View and manage laboratory test results
                </p>
              </div>
            </div>

            {/* Alert cards for critical results */}
            {criticalResults.length > 0 && (
              <div className="mt-8">
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                        Critical Lab Results
                      </h3>
                      <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                        <p>You have {criticalResults.length} critical lab result(s) that require immediate attention.</p>
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
                      <ExclamationTriangleIcon className="size-8 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Critical Results
                        </dt>
                        <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {criticalResults.length}
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
                          Abnormal Results
                        </dt>
                        <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {abnormalResults.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ClockIcon className="size-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Pending Results
                        </dt>
                        <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {pendingResults.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BeakerIcon className="size-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Total Results
                        </dt>
                        <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {mockLabResults.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="mt-8">
              <div className="card">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex gap-2">
                    <select className="input-field">
                      <option>All Status</option>
                      <option>Normal</option>
                      <option>Abnormal</option>
                      <option>Critical</option>
                      <option>Pending</option>
                    </select>
                    <select className="input-field">
                      <option>All Test Types</option>
                      <option>Complete Blood Count</option>
                      <option>Hemoglobin A1c</option>
                      <option>Troponin I</option>
                      <option>White Blood Cell Count</option>
                      <option>Potassium</option>
                    </select>
                    <select className="input-field">
                      <option>All Providers</option>
                      <option>Dr. Smith</option>
                      <option>Dr. Johnson</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Results list */}
            <div className="mt-8">
              <div className="card">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Lab Results ({mockLabResults.length})
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
                          Test
                        </th>
                        <th scope="col" className="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell">
                          Patient
                        </th>
                        <th scope="col" className="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell">
                          Result
                        </th>
                        <th scope="col" className="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell">
                          Status
                        </th>
                        <th scope="col" className="py-3 pl-8 pr-0 text-right font-semibold">
                          Date Completed
                        </th>
                        <th scope="col" className="py-3 pl-8 pr-0 text-right font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockLabResults.map((result) => {
                        const StatusIcon = getStatusIcon(result.status)
                        return (
                          <tr key={result.id} className="border-b border-gray-100 dark:border-white/10">
                            <td className="max-w-0 px-0 py-5 align-top">
                              <div className="truncate font-medium text-gray-900 dark:text-white">{result.testName}</div>
                              <div className="truncate text-gray-500 dark:text-gray-400">{result.testCode}</div>
                            </td>
                            <td className="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell dark:text-gray-300">
                              {result.patientName}
                            </td>
                            <td className="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell dark:text-gray-300">
                              {result.result} {result.unit}
                            </td>
                            <td className="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell dark:text-gray-300">
                              <span className={classNames(
                                'inline-flex items-center rounded-md px-2 py-2 text-xs font-medium',
                                getStatusColor(result.status)
                              )}>
                                {result.status}
                              </span>
                            </td>
                            <td className="py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 dark:text-gray-300">
                              {new Date(result.dateCompleted).toLocaleDateString()}
                            </td>
                            <td className="py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 dark:text-gray-300">
                              <button
                                onClick={() => setSelectedResult(result)}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              >
                                <EyeIcon className="size-5" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Result Details Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedResult(null)} />
            
            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
              <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                        Lab Result Details
                      </h3>
                      <button
                        onClick={() => setSelectedResult(null)}
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
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedResult.patientName}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Patient ID:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedResult.patientId}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Test Name:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedResult.testName}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Test Code:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedResult.testCode}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Provider:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedResult.provider}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Date Ordered:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{new Date(selectedResult.dateOrdered).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Date Completed:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{new Date(selectedResult.dateCompleted).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-200 dark:border-white/10 pt-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Result:</span>
                            <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
                              {selectedResult.result} {selectedResult.unit}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Reference Range:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{selectedResult.referenceRange}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                          <span className={classNames(
                            'ml-2 inline-flex items-center rounded-md px-2.5 py-2 text-xs font-medium',
                            getStatusColor(selectedResult.status)
                          )}>
                            {selectedResult.status}
                          </span>
                        </div>
                        
                        {selectedResult.notes && (
                          <div className="mt-4">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Notes:</span>
                            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{selectedResult.notes}</p>
                          </div>
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
                  onClick={() => setSelectedResult(null)}
                >
                  Print Result
                </button>
                <button
                  type="button"
                  className="btn-secondary mt-3 sm:mt-0"
                  onClick={() => setSelectedResult(null)}
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
