'use client'

import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { ChevronDownIcon } from '@heroicons/react/16/solid'

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('account')

  const tabs = [
    { id: 'account', name: 'Account', current: activeTab === 'account' },
    { id: 'notifications', name: 'Notifications', current: activeTab === 'notifications' },
    { id: 'billing', name: 'Billing', current: activeTab === 'billing' },
    { id: 'security', name: 'Security', current: activeTab === 'security' },
  ]

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
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
                  Settings
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Manage your account settings and preferences
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-8">
              <div className="border-b border-gray-200 dark:border-white/10">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={classNames(
                        tab.current
                          ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
                        'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
                      )}
                    >
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Settings content */}
            <div className="mt-8">
              {activeTab === 'account' && (
                <div className="space-y-8">
                  {/* Personal Information */}
                  <div className="card">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Personal Information
                      </h3>
                      
                      <form className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              First Name
                            </label>
                            <input 
                              type="text" 
                              defaultValue="Dr. John"
                              className="input-field mt-1" 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Last Name
                            </label>
                            <input 
                              type="text" 
                              defaultValue="Smith"
                              className="input-field mt-1" 
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email Address
                          </label>
                          <input 
                            type="email" 
                            defaultValue="dr.smith@hospital.com"
                            className="input-field mt-1" 
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Phone Number
                          </label>
                          <input 
                            type="tel" 
                            defaultValue="(555) 123-4567"
                            className="input-field mt-1" 
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Department
                          </label>
                          <select className="input-field mt-1">
                            <option>Internal Medicine</option>
                            <option>Cardiology</option>
                            <option>Emergency Medicine</option>
                            <option>Pediatrics</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Medical License Number
                          </label>
                          <input 
                            type="text" 
                            defaultValue="MD123456"
                            className="input-field mt-1" 
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <button type="submit" className="btn-primary">
                            Save Changes
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* Profile Picture */}
                  <div className="card">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Profile Picture
                      </h3>
                      
                      <div className="flex items-center space-x-6">
                        <div className="flex-shrink-0">
                          <img
                            className="h-20 w-20 rounded-md"
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                            alt=""
                          />
                        </div>
                        <div>
                          <button
                            type="button"
                            className="btn-secondary"
                          >
                            Change Photo
                          </button>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            JPG, GIF or PNG. 1MB max.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-8">
                  <div className="card">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Notification Preferences
                      </h3>
                      
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              Critical Lab Results
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Get notified immediately when critical lab results are available
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              New Patient Registrations
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Receive notifications when new patients are registered
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              Appointment Reminders
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Get reminders for upcoming appointments
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              System Updates
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Notifications about system maintenance and updates
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <button type="button" className="btn-primary">
                          Save Preferences
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-8">
                  <div className="card">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Billing Information
                      </h3>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Organization Name
                          </label>
                          <input 
                            type="text" 
                            defaultValue="General Hospital"
                            className="input-field mt-1" 
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Billing Address
                          </label>
                          <textarea 
                            rows={3}
                            defaultValue="123 Medical Center Dr&#10;Healthcare City, HC 12345"
                            className="input-field mt-1" 
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Tax ID
                            </label>
                            <input 
                              type="text" 
                              defaultValue="12-3456789"
                              className="input-field mt-1" 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              NPI Number
                            </label>
                            <input 
                              type="text" 
                              defaultValue="1234567890"
                              className="input-field mt-1" 
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <button type="button" className="btn-primary">
                          Update Billing Info
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8">
                  {/* Change Password */}
                  <div className="card">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Change Password
                      </h3>
                      
                      <form className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Current Password
                          </label>
                          <input 
                            type="password" 
                            className="input-field mt-1" 
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            New Password
                          </label>
                          <input 
                            type="password" 
                            className="input-field mt-1" 
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Confirm New Password
                          </label>
                          <input 
                            type="password" 
                            className="input-field mt-1" 
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <button type="submit" className="btn-primary">
                            Update Password
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="card">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Two-Factor Authentication
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            Enable 2FA
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <button
                          type="button"
                          className="btn-secondary"
                        >
                          Enable
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Session Management */}
                  <div className="card">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Active Sessions
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-white/10 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Current Session
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Chrome on macOS • Last active: Now
                            </p>
                          </div>
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-2 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset dark:bg-green-500/10 dark:text-green-500 dark:ring-green-500/10">
                            Active
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-white/10 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Mobile App
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              iOS App • Last active: 2 hours ago
                            </p>
                          </div>
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                          >
                            Revoke
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
