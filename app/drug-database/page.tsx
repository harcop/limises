'use client'

import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import {
  MagnifyingGlassIcon,
  BookOpenIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'

interface Drug {
  id: string
  name: string
  genericName: string
  brandNames: string[]
  drugClass: string
  description: string
  indications: string[]
  contraindications: string[]
  sideEffects: string[]
  dosage: string
  route: string
  pregnancyCategory: string
  interactions: string[]
  mechanismOfAction: string
  halfLife: string
  metabolism: string
  excretion: string
}

const drugDatabase: Drug[] = [
  {
    id: '1',
    name: 'Lisinopril',
    genericName: 'Lisinopril',
    brandNames: ['Prinivil', 'Zestril', 'Qbrelis'],
    drugClass: 'ACE Inhibitor',
    description: 'Lisinopril is an angiotensin-converting enzyme (ACE) inhibitor used to treat high blood pressure, heart failure, and to improve survival after a heart attack. It works by relaxing blood vessels, allowing blood to flow more easily.',
    indications: ['Hypertension', 'Heart failure', 'Post-myocardial infarction', 'Diabetic nephropathy'],
    contraindications: ['Pregnancy', 'History of angioedema with ACE inhibitors', 'Bilateral renal artery stenosis'],
    sideEffects: ['Dry cough', 'Dizziness', 'Fatigue', 'Headache', 'Nausea', 'Hyperkalemia'],
    dosage: '10-40mg daily',
    route: 'Oral',
    pregnancyCategory: 'D',
    interactions: ['Potassium supplements', 'NSAIDs', 'Lithium', 'Diuretics'],
    mechanismOfAction: 'Inhibits ACE, preventing conversion of angiotensin I to angiotensin II, leading to vasodilation and reduced aldosterone secretion.',
    halfLife: '12 hours',
    metabolism: 'Not metabolized',
    excretion: 'Renal (unchanged)'
  },
  {
    id: '2',
    name: 'Metformin',
    genericName: 'Metformin',
    brandNames: ['Glucophage', 'Fortamet', 'Glumetza'],
    drugClass: 'Biguanide',
    description: 'Metformin is an oral diabetes medicine that helps control blood sugar levels. It works by decreasing glucose production in the liver and improving insulin sensitivity in muscle and fat cells.',
    indications: ['Type 2 diabetes mellitus', 'Polycystic ovary syndrome', 'Prediabetes'],
    contraindications: ['Severe renal impairment', 'Acute or chronic metabolic acidosis', 'Severe liver disease'],
    sideEffects: ['Nausea', 'Diarrhea', 'Abdominal discomfort', 'Metallic taste', 'Lactic acidosis (rare)'],
    dosage: '500-2000mg daily in divided doses',
    route: 'Oral',
    pregnancyCategory: 'B',
    interactions: ['Contrast media', 'Alcohol', 'Cimetidine', 'Furosemide'],
    mechanismOfAction: 'Decreases hepatic glucose production, decreases intestinal absorption of glucose, and improves insulin sensitivity.',
    halfLife: '6.2 hours',
    metabolism: 'Not metabolized',
    excretion: 'Renal (unchanged)'
  },
  {
    id: '3',
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    brandNames: ['Advil', 'Motrin', 'Nurofen'],
    drugClass: 'NSAID',
    description: 'Ibuprofen is a nonsteroidal anti-inflammatory drug (NSAID) used to treat pain, inflammation, and fever. It works by blocking the production of prostaglandins, which are chemicals that cause pain and inflammation.',
    indications: ['Pain relief', 'Inflammation', 'Fever', 'Arthritis', 'Menstrual cramps'],
    contraindications: ['Active peptic ulcer', 'Severe heart failure', 'Third trimester pregnancy', 'Severe liver disease'],
    sideEffects: ['Stomach upset', 'Nausea', 'Heartburn', 'Dizziness', 'Headache', 'GI bleeding'],
    dosage: '200-800mg every 4-6 hours',
    route: 'Oral',
    pregnancyCategory: 'D (third trimester)',
    interactions: ['Warfarin', 'Aspirin', 'ACE inhibitors', 'Lithium', 'Methotrexate'],
    mechanismOfAction: 'Inhibits cyclooxygenase (COX) enzymes, reducing prostaglandin synthesis and inflammation.',
    halfLife: '2-4 hours',
    metabolism: 'Hepatic (CYP2C9)',
    excretion: 'Renal (metabolites)'
  },
  {
    id: '4',
    name: 'Penicillin V',
    genericName: 'Penicillin V',
    brandNames: ['Pen-Vee K', 'Veetids'],
    drugClass: 'Beta-lactam Antibiotic',
    description: 'Penicillin V is a beta-lactam antibiotic used to treat bacterial infections. It works by interfering with bacterial cell wall synthesis, leading to bacterial cell death.',
    indications: ['Streptococcal infections', 'Pneumococcal infections', 'Staphylococcal infections', 'Syphilis'],
    contraindications: ['Penicillin allergy', 'Severe renal impairment'],
    sideEffects: ['Nausea', 'Diarrhea', 'Rash', 'Allergic reactions', 'Superinfection'],
    dosage: '250-500mg every 6-8 hours',
    route: 'Oral',
    pregnancyCategory: 'B',
    interactions: ['Probenecid', 'Methotrexate', 'Warfarin', 'Oral contraceptives'],
    mechanismOfAction: 'Inhibits bacterial cell wall synthesis by binding to penicillin-binding proteins.',
    halfLife: '1 hour',
    metabolism: 'Hepatic (minimal)',
    excretion: 'Renal (60-90% unchanged)'
  },
  {
    id: '5',
    name: 'Atorvastatin',
    genericName: 'Atorvastatin',
    brandNames: ['Lipitor'],
    drugClass: 'HMG-CoA Reductase Inhibitor (Statin)',
    description: 'Atorvastatin is a statin medication used to lower cholesterol and reduce the risk of cardiovascular disease. It works by blocking an enzyme that the body needs to make cholesterol.',
    indications: ['Hypercholesterolemia', 'Cardiovascular disease prevention', 'Atherosclerosis'],
    contraindications: ['Active liver disease', 'Pregnancy', 'Lactation', 'Uncontrolled hypothyroidism'],
    sideEffects: ['Muscle pain', 'Liver enzyme elevation', 'Digestive problems', 'Memory problems', 'Rhabdomyolysis (rare)'],
    dosage: '10-80mg daily',
    route: 'Oral',
    pregnancyCategory: 'X',
    interactions: ['Grapefruit juice', 'Warfarin', 'Cyclosporine', 'Gemfibrozil', 'Erythromycin'],
    mechanismOfAction: 'Inhibits HMG-CoA reductase, the rate-limiting enzyme in cholesterol synthesis.',
    halfLife: '14 hours',
    metabolism: 'Hepatic (CYP3A4)',
    excretion: 'Biliary (primarily)'
  },
  {
    id: '6',
    name: 'Omeprazole',
    genericName: 'Omeprazole',
    brandNames: ['Prilosec', 'Losec'],
    drugClass: 'Proton Pump Inhibitor',
    description: 'Omeprazole is a proton pump inhibitor used to treat acid-related conditions by reducing stomach acid production. It works by blocking the enzyme that produces acid in the stomach.',
    indications: ['GERD', 'Peptic ulcer disease', 'Zollinger-Ellison syndrome', 'Helicobacter pylori eradication'],
    contraindications: ['Hypersensitivity to omeprazole', 'Severe liver disease'],
    sideEffects: ['Headache', 'Nausea', 'Diarrhea', 'Abdominal pain', 'Vitamin B12 deficiency (long-term)'],
    dosage: '20-40mg daily',
    route: 'Oral',
    pregnancyCategory: 'C',
    interactions: ['Clopidogrel', 'Warfarin', 'Diazepam', 'Phenytoin', 'Digoxin'],
    mechanismOfAction: 'Irreversibly blocks the H+/K+-ATPase enzyme system of the gastric parietal cell.',
    halfLife: '1 hour',
    metabolism: 'Hepatic (CYP2C19, CYP3A4)',
    excretion: 'Renal (77%)'
  },
  {
    id: '7',
    name: 'Warfarin',
    genericName: 'Warfarin',
    brandNames: ['Coumadin', 'Jantoven'],
    drugClass: 'Anticoagulant',
    description: 'Warfarin is an anticoagulant medication used to prevent blood clots. It works by inhibiting the synthesis of vitamin K-dependent clotting factors.',
    indications: ['Atrial fibrillation', 'Deep vein thrombosis', 'Pulmonary embolism', 'Mechanical heart valves'],
    contraindications: ['Active bleeding', 'Severe liver disease', 'Pregnancy', 'Uncontrolled hypertension'],
    sideEffects: ['Bleeding', 'Bruising', 'Nausea', 'Hair loss', 'Skin necrosis (rare)'],
    dosage: '2-10mg daily (dose varies based on INR)',
    route: 'Oral',
    pregnancyCategory: 'X',
    interactions: ['Aspirin', 'NSAIDs', 'Antibiotics', 'Antifungals', 'Vitamin K'],
    mechanismOfAction: 'Inhibits vitamin K epoxide reductase, preventing the synthesis of vitamin K-dependent clotting factors.',
    halfLife: '20-60 hours',
    metabolism: 'Hepatic (CYP2C9, CYP1A2, CYP3A4)',
    excretion: 'Renal (metabolites)'
  },
  {
    id: '8',
    name: 'Amlodipine',
    genericName: 'Amlodipine',
    brandNames: ['Norvasc', 'Katerzia'],
    drugClass: 'Calcium Channel Blocker',
    description: 'Amlodipine is a calcium channel blocker used to treat high blood pressure and chest pain. It works by relaxing blood vessels and reducing the workload on the heart.',
    indications: ['Hypertension', 'Angina pectoris', 'Coronary artery disease'],
    contraindications: ['Severe aortic stenosis', 'Hypotension', 'Cardiogenic shock'],
    sideEffects: ['Peripheral edema', 'Dizziness', 'Flushing', 'Headache', 'Fatigue'],
    dosage: '5-10mg daily',
    route: 'Oral',
    pregnancyCategory: 'C',
    interactions: ['Grapefruit juice', 'Simvastatin', 'Cyclosporine', 'Rifampin'],
    mechanismOfAction: 'Blocks calcium channels in vascular smooth muscle and cardiac muscle, causing vasodilation and reduced cardiac contractility.',
    halfLife: '30-50 hours',
    metabolism: 'Hepatic (CYP3A4)',
    excretion: 'Renal (10% unchanged)'
  }
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function DrugDatabasePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [drugClassFilter, setDrugClassFilter] = useState('')
  const [showAddDrugForm, setShowAddDrugForm] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // Filter drugs based on search term and drug class
  const filteredDrugs = drugDatabase.filter(drug => {
    const matchesSearch = drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         drug.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         drug.brandNames.some(brand => brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         drug.drugClass.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesClass = drugClassFilter === '' || drug.drugClass === drugClassFilter
    
    return matchesSearch && matchesClass
  })

  // Get unique drug classes for filter
  const drugClasses = [...new Set(drugDatabase.map(drug => drug.drugClass))]

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
                  Drug Database
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Comprehensive drug information and reference database
                </p>
              </div>
              <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
                  className="btn-secondary"
                >
                  {viewMode === 'grid' ? (
                    <>
                      <FunnelIcon className="size-5 mr-2" />
                      Table View
                    </>
                  ) : (
                    <>
                      <BookOpenIcon className="size-5 mr-2" />
                      Grid View
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddDrugForm(true)}
                  className="btn-primary"
                >
                  <PlusIcon className="size-5 mr-2" />
                  Add Drug
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="card">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BookOpenIcon className="size-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Total Drugs
                        </dt>
                        <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {drugDatabase.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FunnelIcon className="size-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Drug Classes
                        </dt>
                        <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {drugClasses.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <MagnifyingGlassIcon className="size-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Filtered Results
                        </dt>
                        <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {filteredDrugs.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <PencilIcon className="size-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Last Updated
                        </dt>
                        <dd className="text-sm font-semibold text-gray-900 dark:text-white">
                          Today
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="mt-8">
              <div className="card">
                <div className="px-4 py-5 sm:p-6">
                  <div className="space-y-4 sm:space-y-0 sm:flex sm:space-x-4">
                    <div className="flex-1">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search drugs by name, brand, or class..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="input-field pl-10"
                        />
                      </div>
                    </div>
                    <div className="sm:w-48">
                      <select
                        value={drugClassFilter}
                        onChange={(e) => setDrugClassFilter(e.target.value)}
                        className="input-field"
                      >
                        <option value="">All Drug Classes</option>
                        {drugClasses.map((drugClass) => (
                          <option key={drugClass} value={drugClass}>
                            {drugClass}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drug Display */}
            <div className="mt-8">
              <div className="card">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {viewMode === 'grid' ? 'Drug Cards' : 'Drug Table'} ({filteredDrugs.length} drugs)
                    </h3>
                  </div>

                  {viewMode === 'grid' ? (
                    /* Grid View */
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredDrugs.map((drug) => (
                        <div key={drug.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-white/10 p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {drug.name}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {drug.genericName}
                              </p>
                            </div>
                            <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400">
                              {drug.drugClass}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                            {drug.description}
                          </p>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <span className="font-medium mr-2">Brand Names:</span>
                              <span>{drug.brandNames.join(', ')}</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <span className="font-medium mr-2">Dosage:</span>
                              <span>{drug.dosage}</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <span className="font-medium mr-2">Route:</span>
                              <span>{drug.route}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {drug.indications.slice(0, 2).map((indication, index) => (
                                <span key={index} className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                  {indication}
                                </span>
                              ))}
                              {drug.indications.length > 2 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  +{drug.indications.length - 2} more
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => setSelectedDrug(drug)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Table View */
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300 dark:divide-white/10">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Drug Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Generic Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Drug Class
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Dosage
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Route
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-white/10">
                          {filteredDrugs.map((drug) => (
                            <tr key={drug.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{drug.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{drug.brandNames.join(', ')}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {drug.genericName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400">
                                  {drug.drugClass}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {drug.dosage}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {drug.route}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => setSelectedDrug(drug)}
                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                  >
                                    View
                                  </button>
                                  <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                                    Edit
                                  </button>
                                  <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {filteredDrugs.length === 0 && (
                    <div className="text-center py-12">
                      <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No drugs found</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Try adjusting your search terms or filters.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Drug Details Modal */}
      {selectedDrug && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedDrug(null)} />
            
            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
              <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-semibold leading-6 text-gray-900 dark:text-white">
                          {selectedDrug.name}
                        </h3>
                        <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">
                          {selectedDrug.genericName}
                        </p>
                        <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400 mt-2">
                          {selectedDrug.drugClass}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedDrug(null)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left Column */}
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Description</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{selectedDrug.description}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Brand Names</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedDrug.brandNames.map((brand, index) => (
                              <span key={index} className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                {brand}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Indications</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {selectedDrug.indications.map((indication, index) => (
                              <li key={index} className="text-sm text-gray-700 dark:text-gray-300">{indication}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Contraindications</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {selectedDrug.contraindications.map((contraindication, index) => (
                              <li key={index} className="text-sm text-red-700 dark:text-red-300">{contraindication}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      {/* Right Column */}
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Dosage Information</h4>
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Dosage:</span>
                              <span className="text-gray-900 dark:text-white">{selectedDrug.dosage}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Route:</span>
                              <span className="text-gray-900 dark:text-white">{selectedDrug.route}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Half-life:</span>
                              <span className="text-gray-900 dark:text-white">{selectedDrug.halfLife}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Pregnancy Category:</span>
                              <span className="text-gray-900 dark:text-white">{selectedDrug.pregnancyCategory}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Side Effects</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedDrug.sideEffects.map((sideEffect, index) => (
                              <span key={index} className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                                {sideEffect}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Drug Interactions</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {selectedDrug.interactions.map((interaction, index) => (
                              <li key={index} className="text-sm text-orange-700 dark:text-orange-300">{interaction}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Pharmacokinetics</h4>
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Metabolism:</span>
                              <span className="text-gray-900 dark:text-white text-sm">{selectedDrug.metabolism}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Excretion:</span>
                              <span className="text-gray-900 dark:text-white text-sm">{selectedDrug.excretion}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Mechanism of Action</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{selectedDrug.mechanismOfAction}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="btn-primary sm:ml-3"
                  onClick={() => setSelectedDrug(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Drug Modal */}
      {showAddDrugForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddDrugForm(false)} />
            
            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
              <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-4">
                      Add New Drug
                    </h3>
                    
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Drug Name
                          </label>
                          <input 
                            type="text" 
                            placeholder="Enter drug name"
                            className="input-field mt-1" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Generic Name
                          </label>
                          <input 
                            type="text" 
                            placeholder="Enter generic name"
                            className="input-field mt-1" 
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Drug Class
                        </label>
                        <input 
                          type="text" 
                          placeholder="Enter drug class"
                          className="input-field mt-1" 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Description
                        </label>
                        <textarea 
                          rows={3}
                          placeholder="Enter drug description"
                          className="input-field mt-1" 
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Dosage
                          </label>
                          <input 
                            type="text" 
                            placeholder="e.g., 10-40mg daily"
                            className="input-field mt-1" 
                          />
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
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="btn-primary sm:ml-3"
                  onClick={() => setShowAddDrugForm(false)}
                >
                  Add Drug
                </button>
                <button
                  type="button"
                  className="btn-secondary mt-3 sm:mt-0"
                  onClick={() => setShowAddDrugForm(false)}
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
