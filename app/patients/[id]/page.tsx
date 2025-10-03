'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '../../../components/Sidebar'
import Header from '../../../components/Header'
import {
  ArrowLeftIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  HeartIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  PencilIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'

// Mock data interfaces
interface Patient {
  id: string
  name: string
  dateOfBirth: string
  phone: string
  email: string
  address: string
  mrn: string
  gender: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
}

interface Appointment {
  id: string
  date: string
  time: string
  type: string
  provider: string
  status: 'upcoming' | 'completed' | 'cancelled'
  notes?: string
}

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate?: string
  prescribedBy: string
  status: 'active' | 'discontinued'
}

interface ClinicalNote {
  id: string
  date: string
  provider: string
  type: string
  content: string
  diagnosis?: string
}

interface Allergy {
  id: string
  allergen: string
  reaction: string
  severity: 'mild' | 'moderate' | 'severe'
  dateReported: string
}

interface Payment {
  id: string
  date: string
  amount: number
  description: string
  status: 'paid' | 'pending' | 'overdue'
  method?: string
}

interface Insurance {
  id: string
  provider: string
  policyNumber: string
  groupNumber?: string
  effectiveDate: string
  expiryDate?: string
  primary: boolean
}

// Mock data
const mockPatient: Patient = {
  id: '1',
  name: 'John Doe',
  dateOfBirth: '1985-03-15',
  phone: '(555) 123-4567',
  email: 'john.doe@email.com',
  address: '123 Main St, Anytown, ST 12345',
  mrn: 'MRN001',
  gender: 'Male',
  emergencyContact: {
    name: 'Jane Doe',
    phone: '(555) 123-4568',
    relationship: 'Spouse'
  }
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    date: '2024-02-15',
    time: '10:00 AM',
    type: 'Follow-up',
    provider: 'Dr. Smith',
    status: 'upcoming',
    notes: 'Annual checkup'
  },
  {
    id: '2',
    date: '2024-01-15',
    time: '2:30 PM',
    type: 'Consultation',
    provider: 'Dr. Johnson',
    status: 'completed',
    notes: 'Blood pressure check'
  },
  {
    id: '3',
    date: '2023-12-10',
    time: '9:00 AM',
    type: 'Physical',
    provider: 'Dr. Smith',
    status: 'completed'
  }
]

const mockMedications: Medication[] = [
  {
    id: '1',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    startDate: '2024-01-01',
    prescribedBy: 'Dr. Smith',
    status: 'active'
  },
  {
    id: '2',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    startDate: '2023-11-15',
    prescribedBy: 'Dr. Johnson',
    status: 'active'
  },
  {
    id: '3',
    name: 'Ibuprofen',
    dosage: '200mg',
    frequency: 'As needed',
    startDate: '2024-01-10',
    endDate: '2024-01-20',
    prescribedBy: 'Dr. Smith',
    status: 'discontinued'
  }
]

const mockClinicalNotes: ClinicalNote[] = [
  {
    id: '1',
    date: '2024-01-15',
    provider: 'Dr. Smith',
    type: 'Progress Note',
    content: 'Patient reports feeling well. Blood pressure controlled with current medication. Continue current treatment plan.',
    diagnosis: 'Hypertension'
  },
  {
    id: '2',
    date: '2023-12-10',
    provider: 'Dr. Johnson',
    type: 'Consultation',
    content: 'Initial consultation for diabetes management. Patient educated on diet and exercise. Started on Metformin.',
    diagnosis: 'Type 2 Diabetes'
  }
]

const mockAllergies: Allergy[] = [
  {
    id: '1',
    allergen: 'Penicillin',
    reaction: 'Rash, hives',
    severity: 'moderate',
    dateReported: '2020-05-15'
  },
  {
    id: '2',
    allergen: 'Shellfish',
    reaction: 'Nausea, vomiting',
    severity: 'mild',
    dateReported: '2019-08-22'
  }
]

const mockPayments: Payment[] = [
  {
    id: '1',
    date: '2024-01-15',
    amount: 150.00,
    description: 'Office visit - Dr. Smith',
    status: 'paid',
    method: 'Insurance'
  },
  {
    id: '2',
    date: '2024-02-01',
    amount: 75.00,
    description: 'Lab work',
    status: 'pending'
  },
  {
    id: '3',
    date: '2023-12-10',
    amount: 200.00,
    description: 'Physical examination',
    status: 'paid',
    method: 'Credit Card'
  }
]

const mockInsurance: Insurance[] = [
  {
    id: '1',
    provider: 'Blue Cross Blue Shield',
    policyNumber: 'BC123456789',
    groupNumber: 'GRP001',
    effectiveDate: '2024-01-01',
    primary: true
  },
  {
    id: '2',
    provider: 'Medicare',
    policyNumber: 'MED987654321',
    effectiveDate: '2023-01-01',
    primary: false
  }
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const patient = mockPatient
  const upcomingAppointments = mockAppointments.filter(apt => apt.status === 'upcoming')
  const pastAppointments = mockAppointments.filter(apt => apt.status === 'completed')
  const activeMedications = mockMedications.filter(med => med.status === 'active')
  const paidPayments = mockPayments.filter(payment => payment.status === 'paid')
  const pendingPayments = mockPayments.filter(payment => payment.status === 'pending')
  const primaryInsurance = mockInsurance.find(ins => ins.primary)

  const tabs = [
    { id: 'overview', name: 'Overview', icon: UserIcon },
    { id: 'appointments', name: 'Appointments', icon: CalendarIcon },
    { id: 'medications', name: 'Medications', icon: HeartIcon },
    { id: 'notes', name: 'Clinical Notes', icon: DocumentTextIcon },
    { id: 'allergies', name: 'Allergies', icon: ExclamationTriangleIcon },
    { id: 'payments', name: 'Payments', icon: CreditCardIcon },
    { id: 'insurance', name: 'Insurance', icon: ShieldCheckIcon },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 ring-inset dark:bg-blue-500/10 dark:text-blue-500 dark:ring-blue-500/10'
      case 'completed':
        return 'bg-green-50 text-green-700 ring-1 ring-green-600/20 ring-inset dark:bg-green-500/10 dark:text-green-500 dark:ring-green-500/10'
      case 'cancelled':
        return 'bg-red-50 text-red-700 ring-1 ring-red-600/20 ring-inset dark:bg-red-500/10 dark:text-red-500 dark:ring-red-500/10'
      case 'active':
        return 'bg-green-50 text-green-700 ring-1 ring-green-600/20 ring-inset dark:bg-green-500/10 dark:text-green-500 dark:ring-green-500/10'
      case 'discontinued':
        return 'bg-gray-50 text-gray-700 ring-1 ring-gray-600/20 ring-inset dark:bg-gray-500/10 dark:text-gray-500 dark:ring-gray-500/10'
      case 'paid':
        return 'bg-green-50 text-green-700 ring-1 ring-green-600/20 ring-inset dark:bg-green-500/10 dark:text-green-500 dark:ring-green-500/10'
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20 ring-inset dark:bg-yellow-500/10 dark:text-yellow-500 dark:ring-yellow-500/10'
      case 'overdue':
        return 'bg-red-50 text-red-700 ring-1 ring-red-600/20 ring-inset dark:bg-red-500/10 dark:text-red-500 dark:ring-red-500/10'
      default:
        return 'bg-gray-50 text-gray-700 ring-1 ring-gray-600/20 ring-inset dark:bg-gray-500/10 dark:text-gray-500 dark:ring-gray-500/10'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20 ring-inset dark:bg-yellow-500/10 dark:text-yellow-500 dark:ring-yellow-500/10'
      case 'moderate':
        return 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/20 ring-inset dark:bg-orange-500/10 dark:text-orange-500 dark:ring-orange-500/10'
      case 'severe':
        return 'bg-red-50 text-red-700 ring-1 ring-red-600/20 ring-inset dark:bg-red-500/10 dark:text-red-500 dark:ring-red-500/10'
      default:
        return 'bg-gray-50 text-gray-700 ring-1 ring-gray-600/20 ring-inset dark:bg-gray-500/10 dark:text-gray-500 dark:ring-gray-500/10'
    }
  }

  return (
    <div>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="xl:pl-72">
        <Header setSidebarOpen={setSidebarOpen} />
        
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => router.back()}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to Patients
              </button>
              
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {patient.name}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400">
                    MRN: {patient.mrn} • DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary">
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Patient
                  </button>
                  <button className="btn-primary">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    New Appointment
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={classNames(
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
                      'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center'
                    )}
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Patient Information */}
                <div className="lg:col-span-2">
                  <div className="card">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Patient Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Full Name
                            </label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{patient.name}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Date of Birth
                            </label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                              {new Date(patient.dateOfBirth).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Gender
                            </label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{patient.gender}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Medical Record Number
                            </label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{patient.mrn}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Phone Number
                            </label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{patient.phone}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Email Address
                            </label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{patient.email}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Address
                            </label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{patient.address}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="card mt-6">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Emergency Contact
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Name
                          </label>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {patient.emergencyContact.name}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Phone
                          </label>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {patient.emergencyContact.phone}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Relationship
                          </label>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {patient.emergencyContact.relationship}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-6">
                  <div className="card">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Quick Stats
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Upcoming Appointments</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {upcomingAppointments.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Active Medications</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {activeMedications.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Allergies</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {mockAllergies.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Pending Payments</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {pendingPayments.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Primary Insurance */}
                  {primaryInsurance && (
                    <div className="card">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                          Primary Insurance
                        </h3>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {primaryInsurance.provider}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Policy: {primaryInsurance.policyNumber}
                          </p>
                          {primaryInsurance.groupNumber && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Group: {primaryInsurance.groupNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="space-y-6">
                {/* Upcoming Appointments */}
                <div className="card">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Upcoming Appointments
                    </h3>
                    {upcomingAppointments.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingAppointments.map((appointment) => (
                          <div key={appointment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                  {appointment.type}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Provider: {appointment.provider}
                                </p>
                                {appointment.notes && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {appointment.notes}
                                  </p>
                                )}
                              </div>
                              <span className={classNames(
                                'inline-flex items-center px-2 py-2 rounded-md text-xs font-medium',
                                getStatusColor(appointment.status)
                              )}>
                                {appointment.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No upcoming appointments</p>
                    )}
                  </div>
                </div>

                {/* Past Appointments */}
                <div className="card">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Past Appointments
                    </h3>
                    {pastAppointments.length > 0 ? (
                      <div className="space-y-4">
                        {pastAppointments.map((appointment) => (
                          <div key={appointment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                  {appointment.type}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Provider: {appointment.provider}
                                </p>
                                {appointment.notes && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {appointment.notes}
                                  </p>
                                )}
                              </div>
                              <span className={classNames(
                                'inline-flex items-center px-2 py-2 rounded-md text-xs font-medium',
                                getStatusColor(appointment.status)
                              )}>
                                {appointment.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No past appointments</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'medications' && (
              <div className="card">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Current Medications
                  </h3>
                  {activeMedications.length > 0 ? (
                    <div className="space-y-4">
                      {activeMedications.map((medication) => (
                        <div key={medication.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                {medication.name}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {medication.dosage} • {medication.frequency}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Started: {new Date(medication.startDate).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Prescribed by: {medication.prescribedBy}
                              </p>
                            </div>
                            <span className={classNames(
                              'inline-flex items-center px-2.5 py-2 rounded-md text-xs font-medium',
                              getStatusColor(medication.status)
                            )}>
                              {medication.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No active medications</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="card">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Clinical Notes
                  </h3>
                  {mockClinicalNotes.length > 0 ? (
                    <div className="space-y-4">
                      {mockClinicalNotes.map((note) => (
                        <div key={note.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {note.type}
                            </h4>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(note.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            Provider: {note.provider}
                          </p>
                          {note.diagnosis && (
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                              Diagnosis: {note.diagnosis}
                            </p>
                          )}
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {note.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No clinical notes</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'allergies' && (
              <div className="card">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Allergies & Adverse Reactions
                  </h3>
                  {mockAllergies.length > 0 ? (
                    <div className="space-y-4">
                      {mockAllergies.map((allergy) => (
                        <div key={allergy.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                {allergy.allergen}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Reaction: {allergy.reaction}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Reported: {new Date(allergy.dateReported).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={classNames(
                              'inline-flex items-center px-2.5 py-2 rounded-md text-xs font-medium',
                              getSeverityColor(allergy.severity)
                            )}>
                              {allergy.severity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No known allergies</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-6">
                {/* Paid Payments */}
                <div className="card">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Paid Payments
                    </h3>
                    {paidPayments.length > 0 ? (
                      <div className="space-y-4">
                        {paidPayments.map((payment) => (
                          <div key={payment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                  {payment.description}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(payment.date).toLocaleDateString()}
                                </p>
                                {payment.method && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Method: {payment.method}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  ${payment.amount.toFixed(2)}
                                </p>
                                <span className={classNames(
                                  'inline-flex items-center px-2 py-2 rounded-md text-xs font-medium',
                                  getStatusColor(payment.status)
                                )}>
                                  {payment.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No paid payments</p>
                    )}
                  </div>
                </div>

                {/* Pending Payments */}
                <div className="card">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Pending Payments
                    </h3>
                    {pendingPayments.length > 0 ? (
                      <div className="space-y-4">
                        {pendingPayments.map((payment) => (
                          <div key={payment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                  {payment.description}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(payment.date).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  ${payment.amount.toFixed(2)}
                                </p>
                                <span className={classNames(
                                  'inline-flex items-center px-2 py-2 rounded-md text-xs font-medium',
                                  getStatusColor(payment.status)
                                )}>
                                  {payment.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No pending payments</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'insurance' && (
              <div className="card">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Insurance Information
                  </h3>
                  {mockInsurance.length > 0 ? (
                    <div className="space-y-4">
                      {mockInsurance.map((insurance) => (
                        <div key={insurance.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {insurance.provider}
                            </h4>
                            {insurance.primary && (
                              <span className="inline-flex items-center px-2 py-2 rounded-md text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 ring-inset dark:bg-blue-500/10 dark:text-blue-500 dark:ring-blue-500/10">
                                Primary
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Policy Number: {insurance.policyNumber}
                              </p>
                              {insurance.groupNumber && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Group Number: {insurance.groupNumber}
                                </p>
                              )}
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Effective: {new Date(insurance.effectiveDate).toLocaleDateString()}
                              </p>
                              {insurance.expiryDate && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Expires: {new Date(insurance.expiryDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No insurance information</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

