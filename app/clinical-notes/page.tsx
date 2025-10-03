'use client'

import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import {
  DocumentTextIcon,
  PlusIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  PencilIcon,
} from '@heroicons/react/24/outline'

interface ClinicalNote {
  id: string
  patientName: string
  patientId: string
  provider: string
  date: string
  type: 'SOAP' | 'Progress' | 'Consultation' | 'Discharge'
  status: 'Draft' | 'Finalized' | 'Signed'
  chiefComplaint: string
  subjective: string
  objective: string
  assessment: string
  plan: string
}

const mockNotes: ClinicalNote[] = [
  {
    id: '1',
    patientName: 'John Doe',
    patientId: 'MRN001',
    provider: 'Dr. Smith',
    date: '2024-01-15',
    type: 'SOAP',
    status: 'Finalized',
    chiefComplaint: 'Chest pain',
    subjective: 'Patient reports chest pain that started 2 hours ago. Pain is sharp, 7/10 intensity, located in center of chest. No radiation. No shortness of breath.',
    objective: 'Vital signs stable. Heart rate 88 bpm, BP 120/80. No acute distress. Heart sounds normal, no murmurs. Lungs clear bilaterally.',
    assessment: 'Chest pain, likely musculoskeletal in origin. No signs of cardiac event.',
    plan: 'Continue monitoring. Prescribe ibuprofen for pain management. Follow up in 1 week if symptoms persist.',
  },
  {
    id: '2',
    patientName: 'Jane Smith',
    patientId: 'MRN002',
    provider: 'Dr. Johnson',
    date: '2024-01-14',
    type: 'Progress',
    status: 'Draft',
    chiefComplaint: 'Follow-up for diabetes',
    subjective: 'Patient reports good blood sugar control. No episodes of hypoglycemia. Taking medications as prescribed.',
    objective: 'HbA1c 6.8% (improved from 7.2%). Weight stable. No diabetic complications noted.',
    assessment: 'Type 2 diabetes mellitus, well controlled.',
    plan: 'Continue current medication regimen. Follow up in 3 months.',
  },
  {
    id: '3',
    patientName: 'Mike Johnson',
    patientId: 'MRN003',
    provider: 'Dr. Smith',
    date: '2024-01-13',
    type: 'Consultation',
    status: 'Signed',
    chiefComplaint: 'Hypertension management',
    subjective: 'Patient reports occasional headaches. Blood pressure readings at home average 150/95.',
    objective: 'BP 148/92 in office. Heart rate 72 bpm. No acute findings.',
    assessment: 'Essential hypertension, poorly controlled.',
    plan: 'Start lisinopril 10mg daily. Lifestyle modifications. Follow up in 2 weeks.',
  },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function ClinicalNotesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNewNoteForm, setShowNewNoteForm] = useState(false)
  const [selectedNote, setSelectedNote] = useState<ClinicalNote | null>(null)
  const [noteType, setNoteType] = useState<'SOAP' | 'Progress' | 'Consultation' | 'Discharge'>('SOAP')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'Finalized':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'Signed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
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
                  Clinical Documentation
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Create and manage clinical notes and documentation
                </p>
              </div>
              <div className="mt-4 flex md:ml-4 md:mt-0">
                <button
                  type="button"
                  onClick={() => setShowNewNoteForm(true)}
                  className="btn-primary"
                >
                  <PlusIcon className="size-5 mr-2" />
                  New Note
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="mt-8">
              <div className="card">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex gap-2">
                    <select className="input-field">
                      <option>All Note Types</option>
                      <option>SOAP</option>
                      <option>Progress</option>
                      <option>Consultation</option>
                      <option>Discharge</option>
                    </select>
                    <select className="input-field">
                      <option>All Status</option>
                      <option>Draft</option>
                      <option>Finalized</option>
                      <option>Signed</option>
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

            {/* Notes list */}
            <div className="mt-8">
              <div className="card">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Clinical Notes ({mockNotes.length})
                  </h3>
                  
                  <ul role="list" className="divide-y divide-gray-200 dark:divide-white/10">
                    {mockNotes.map((note) => (
                      <li key={note.id} className="py-5">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                              <DocumentTextIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {note.patientName}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                  Chief Complaint: {note.chiefComplaint}
                                </p>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {note.provider}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(note.date).toLocaleDateString()}
                                </div>
                                <span className={classNames(
                                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                  getStatusColor(note.status)
                                )}>
                                  {note.status}
                                </span>
                                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400">
                                  {note.type}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <button
                              onClick={() => setSelectedNote(note)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              <PencilIcon className="size-5" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* New Note Modal */}
      {showNewNoteForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowNewNoteForm(false)} />
            
            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
              <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-4">
                      Create New Clinical Note
                    </h3>
                    
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                            Note Type
                          </label>
                          <select 
                            value={noteType}
                            onChange={(e) => setNoteType(e.target.value as any)}
                            className="input-field mt-1"
                          >
                            <option value="SOAP">SOAP Note</option>
                            <option value="Progress">Progress Note</option>
                            <option value="Consultation">Consultation</option>
                            <option value="Discharge">Discharge Summary</option>
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
                          Chief Complaint
                        </label>
                        <input 
                          type="text" 
                          placeholder="Brief description of the primary concern"
                          className="input-field mt-1" 
                        />
                      </div>
                      
                      {noteType === 'SOAP' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Subjective
                            </label>
                            <textarea 
                              rows={4}
                              placeholder="Patient's description of symptoms, history, and concerns"
                              className="input-field mt-1" 
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Objective
                            </label>
                            <textarea 
                              rows={4}
                              placeholder="Physical examination findings, vital signs, test results"
                              className="input-field mt-1" 
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Assessment
                            </label>
                            <textarea 
                              rows={3}
                              placeholder="Clinical impression, diagnosis, differential diagnosis"
                              className="input-field mt-1" 
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Plan
                            </label>
                            <textarea 
                              rows={3}
                              placeholder="Treatment plan, medications, follow-up instructions"
                              className="input-field mt-1" 
                            />
                          </div>
                        </>
                      )}
                      
                      {noteType !== 'SOAP' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Note Content
                          </label>
                          <textarea 
                            rows={8}
                            placeholder="Enter your clinical note here..."
                            className="input-field mt-1" 
                          />
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="btn-primary sm:ml-3"
                  onClick={() => setShowNewNoteForm(false)}
                >
                  Save Note
                </button>
                <button
                  type="button"
                  className="btn-secondary mt-3 sm:mt-0"
                  onClick={() => setShowNewNoteForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note Details Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedNote(null)} />
            
            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
              <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                        Clinical Note - {selectedNote.patientName}
                      </h3>
                      <button
                        onClick={() => setSelectedNote(null)}
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
                          <span className="font-medium text-gray-700 dark:text-gray-300">Patient ID:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedNote.patientId}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Provider:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedNote.provider}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Date:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{new Date(selectedNote.date).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedNote.type}</span>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-200 dark:border-white/10 pt-6">
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Chief Complaint</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{selectedNote.chiefComplaint}</p>
                        
                        {selectedNote.type === 'SOAP' && (
                          <>
                            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Subjective</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{selectedNote.subjective}</p>
                            
                            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Objective</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{selectedNote.objective}</p>
                            
                            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Assessment</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{selectedNote.assessment}</p>
                            
                            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Plan</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{selectedNote.plan}</p>
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
                  onClick={() => setSelectedNote(null)}
                >
                  Edit Note
                </button>
                <button
                  type="button"
                  className="btn-secondary mt-3 sm:mt-0"
                  onClick={() => setSelectedNote(null)}
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
