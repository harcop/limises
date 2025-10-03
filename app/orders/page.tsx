'use client'

import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  BeakerIcon,
  HeartIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

interface Order {
  id: string
  patientName: string
  patientId: string
  provider: string
  type: 'Lab' | 'Medication' | 'Imaging' | 'Procedure'
  description: string
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled'
  priority: 'Routine' | 'Urgent' | 'Stat'
  dateOrdered: string
  dateCompleted?: string
  notes?: string
}

const mockOrders: Order[] = [
  {
    id: '1',
    patientName: 'John Doe',
    patientId: 'MRN001',
    provider: 'Dr. Smith',
    type: 'Lab',
    description: 'Complete Blood Count (CBC)',
    status: 'Completed',
    priority: 'Routine',
    dateOrdered: '2024-01-15',
    dateCompleted: '2024-01-15',
    notes: 'Patient fasting for 12 hours',
  },
  {
    id: '2',
    patientName: 'Jane Smith',
    patientId: 'MRN002',
    provider: 'Dr. Johnson',
    type: 'Medication',
    description: 'Metformin 500mg BID',
    status: 'In Progress',
    priority: 'Routine',
    dateOrdered: '2024-01-14',
    notes: 'Continue current dose, monitor blood glucose',
  },
  {
    id: '3',
    patientName: 'Mike Johnson',
    patientId: 'MRN003',
    provider: 'Dr. Smith',
    type: 'Imaging',
    description: 'Chest X-Ray',
    status: 'Pending',
    priority: 'Urgent',
    dateOrdered: '2024-01-16',
    notes: 'Rule out pneumonia',
  },
  {
    id: '4',
    patientName: 'Sarah Wilson',
    patientId: 'MRN004',
    provider: 'Dr. Johnson',
    type: 'Lab',
    description: 'Troponin I',
    status: 'Pending',
    priority: 'Stat',
    dateOrdered: '2024-01-16',
    notes: 'Rule out MI',
  },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function OrdersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNewOrderForm, setShowNewOrderForm] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderType, setOrderType] = useState<'Lab' | 'Medication' | 'Imaging' | 'Procedure'>('Lab')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Stat':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'Urgent':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      case 'Routine':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Lab':
        return BeakerIcon
      case 'Medication':
        return HeartIcon
      case 'Imaging':
        return ClipboardDocumentListIcon
      case 'Procedure':
        return ClipboardDocumentListIcon
      default:
        return ClipboardDocumentListIcon
    }
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
                  Order Entry (CPOE)
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Computerized Provider Order Entry system
                </p>
              </div>
              <div className="mt-4 flex md:ml-4 md:mt-0">
                <button
                  type="button"
                  onClick={() => setShowNewOrderForm(true)}
                  className="btn-primary"
                >
                  <PlusIcon className="size-5 mr-2" />
                  New Order
                </button>
              </div>
            </div>

            {/* Quick stats */}
            <div className="mt-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="card">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ClockIcon className="size-8 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Pending Orders
                        </dt>
                        <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {mockOrders.filter(o => o.status === 'Pending').length}
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
                          Stat Orders
                        </dt>
                        <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {mockOrders.filter(o => o.priority === 'Stat').length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="size-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Completed Today
                        </dt>
                        <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {mockOrders.filter(o => o.status === 'Completed' && o.dateCompleted === '2024-01-16').length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ClipboardDocumentListIcon className="size-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Total Orders
                        </dt>
                        <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {mockOrders.length}
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
                      <option>All Order Types</option>
                      <option>Lab</option>
                      <option>Medication</option>
                      <option>Imaging</option>
                      <option>Procedure</option>
                    </select>
                    <select className="input-field">
                      <option>All Status</option>
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                    </select>
                    <select className="input-field">
                      <option>All Priority</option>
                      <option>Stat</option>
                      <option>Urgent</option>
                      <option>Routine</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders list */}
            <div className="mt-8">
              <div className="card">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Orders ({mockOrders.length})
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
                          Order
                        </th>
                        <th scope="col" className="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell">
                          Patient
                        </th>
                        <th scope="col" className="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell">
                          Type
                        </th>
                        <th scope="col" className="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell">
                          Status
                        </th>
                        <th scope="col" className="py-3 pl-8 pr-0 text-right font-semibold">
                          Priority
                        </th>
                        <th scope="col" className="py-3 pl-8 pr-0 text-right font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockOrders.map((order) => {
                        const TypeIcon = getTypeIcon(order.type)
                        return (
                          <tr key={order.id} className="border-b border-gray-100 dark:border-white/10">
                            <td className="max-w-0 px-0 py-5 align-top">
                              <div className="truncate font-medium text-gray-900 dark:text-white">{order.description}</div>
                              <div className="truncate text-gray-500 dark:text-gray-400">{order.provider}</div>
                            </td>
                            <td className="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell dark:text-gray-300">
                              {order.patientName}
                            </td>
                            <td className="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell dark:text-gray-300">
                              <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400">
                                {order.type}
                              </span>
                            </td>
                            <td className="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell dark:text-gray-300">
                              <span className={classNames(
                                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                getStatusColor(order.status)
                              )}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 dark:text-gray-300">
                              <span className={classNames(
                                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                getPriorityColor(order.priority)
                              )}>
                                {order.priority}
                              </span>
                            </td>
                            <td className="py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 dark:text-gray-300">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              >
                                View Details
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

      {/* New Order Modal */}
      {showNewOrderForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowNewOrderForm(false)} />
            
            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
              <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-4">
                      Create New Order
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
                            Order Type
                          </label>
                          <select 
                            value={orderType}
                            onChange={(e) => setOrderType(e.target.value as any)}
                            className="input-field mt-1"
                          >
                            <option value="Lab">Lab Test</option>
                            <option value="Medication">Medication</option>
                            <option value="Imaging">Imaging</option>
                            <option value="Procedure">Procedure</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Priority
                          </label>
                          <select className="input-field mt-1">
                            <option value="Routine">Routine</option>
                            <option value="Urgent">Urgent</option>
                            <option value="Stat">Stat</option>
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
                          Order Description
                        </label>
                        <input 
                          type="text" 
                          placeholder="Enter order description"
                          className="input-field mt-1" 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Notes
                        </label>
                        <textarea 
                          rows={3}
                          placeholder="Additional notes or instructions"
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
                  onClick={() => setShowNewOrderForm(false)}
                >
                  Create Order
                </button>
                <button
                  type="button"
                  className="btn-secondary mt-3 sm:mt-0"
                  onClick={() => setShowNewOrderForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedOrder(null)} />
            
            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
              <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                        Order Details
                      </h3>
                      <button
                        onClick={() => setSelectedOrder(null)}
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
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedOrder.patientName}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Patient ID:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedOrder.patientId}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Provider:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedOrder.provider}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedOrder.type}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Date Ordered:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{new Date(selectedOrder.dateOrdered).toLocaleDateString()}</span>
                        </div>
                        {selectedOrder.dateCompleted && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Date Completed:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{new Date(selectedOrder.dateCompleted).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="border-t border-gray-200 dark:border-white/10 pt-6">
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Order Description</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{selectedOrder.description}</p>
                        
                        {selectedOrder.notes && (
                          <>
                            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Notes</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{selectedOrder.notes}</p>
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
                  onClick={() => setSelectedOrder(null)}
                >
                  Edit Order
                </button>
                <button
                  type="button"
                  className="btn-secondary mt-3 sm:mt-0"
                  onClick={() => setSelectedOrder(null)}
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
