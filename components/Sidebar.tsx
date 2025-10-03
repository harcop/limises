'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
} from '@headlessui/react'
import {
  UserGroupIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  BeakerIcon,
  HeartIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  XMarkIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline'
import { Bars3Icon } from '@heroicons/react/20/solid'

const navigation = [
  { name: 'Dashboard', href: '/', icon: ChartBarIcon, current: true },
  { name: 'Patients', href: '/patients', icon: UserGroupIcon, current: false },
  { name: 'Clinical Notes', href: '/clinical-notes', icon: DocumentTextIcon, current: false },
  { name: 'Orders', href: '/orders', icon: ClipboardDocumentListIcon, current: false },
  { name: 'Lab Results', href: '/lab-results', icon: BeakerIcon, current: false },
  { name: 'Medications', href: '/medications', icon: HeartIcon, current: false },
  { name: 'Drug Database', href: '/drug-database', icon: BookOpenIcon, current: false },
  { name: 'Scheduling', href: '/scheduling', icon: CalendarDaysIcon, current: false },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, current: false },
]

const departments = [
  { id: 1, name: 'Emergency', href: '#', initial: 'E', current: false },
  { id: 2, name: 'Cardiology', href: '#', initial: 'C', current: false },
  { id: 3, name: 'Pediatrics', href: '#', initial: 'P', current: false },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  return (
    <>
      {/* Mobile sidebar */}
      <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 xl:hidden">
        <DialogBackdrop className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear" />

        <div className="fixed inset-0 flex">
          <DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out">
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
              <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                <span className="sr-only">Close sidebar</span>
                <XMarkIcon aria-hidden="true" className="size-6 text-white" />
              </button>
            </div>

            <div className="relative flex grow flex-col gap-y-5 overflow-y-auto bg-gray-50 px-6 dark:bg-gray-900 dark:ring dark:ring-white/10 dark:before:pointer-events-none dark:before:absolute dark:before:inset-0 dark:before:bg-black/10">
              <div className="relative flex h-16 shrink-0 items-center">
                <div className="flex items-center gap-x-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600">
                    <span className="text-sm font-bold text-white">L</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">LIMISES</span>
                </div>
              </div>
              <nav className="relative flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item) => (
                        <li key={item.name}>
                          <a
                            href={item.href}
                            className={classNames(
                              item.current
                                ? 'bg-gray-100 text-indigo-600 dark:bg-white/5 dark:text-white'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white',
                              'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                            )}
                          >
                            <item.icon
                              aria-hidden="true"
                              className={classNames(
                                item.current
                                  ? 'text-indigo-600 dark:text-white'
                                  : 'text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-white',
                                'size-6 shrink-0',
                              )}
                            />
                            {item.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                  <li>
                    <div className="text-xs/6 font-semibold text-gray-400">Departments</div>
                    <ul role="list" className="-mx-2 mt-2 space-y-1">
                      {departments.map((dept) => (
                        <li key={dept.name}>
                          <a
                            href={dept.href}
                            className={classNames(
                              dept.current
                                ? 'bg-gray-100 text-indigo-600 dark:bg-white/5 dark:text-white'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white',
                              'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                            )}
                          >
                            <span
                              className={classNames(
                                dept.current
                                  ? 'border-indigo-600 text-indigo-600 dark:border-white/20 dark:text-white'
                                  : 'border-gray-200 text-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600 dark:border-white/10 dark:group-hover:border-white/20 dark:group-hover:text-white',
                                'flex size-6 shrink-0 items-center justify-center rounded-lg border bg-white text-[0.625rem] font-medium dark:bg-white/5',
                              )}
                            >
                              {dept.initial}
                            </span>
                            <span className="truncate">{dept.name}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                  <li className="-mx-6 mt-auto">
                    <a
                      href="#"
                      className="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-white/5"
                    >
                      <img
                        alt=""
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        className="size-8 rounded-full bg-gray-100 outline outline-1 -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10"
                      />
                      <span className="sr-only">Your profile</span>
                      <span aria-hidden="true">Dr. Smith</span>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Static sidebar for desktop */}
      <div className="hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col dark:bg-gray-900">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-50 px-6 ring-1 ring-gray-200 dark:bg-black/10 dark:ring-white/5">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center gap-x-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600">
                <span className="text-sm font-bold text-white">L</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">LIMISES</span>
            </div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className={classNames(
                          item.current
                            ? 'bg-gray-100 text-indigo-600 dark:bg-white/5 dark:text-white'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white',
                          'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                        )}
                      >
                        <item.icon
                          aria-hidden="true"
                          className={classNames(
                            item.current
                              ? 'text-indigo-600 dark:text-white'
                              : 'text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-white',
                            'size-6 shrink-0',
                          )}
                        />
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <div className="text-xs/6 font-semibold text-gray-500 dark:text-gray-400">Departments</div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {departments.map((dept) => (
                    <li key={dept.name}>
                      <a
                        href={dept.href}
                        className={classNames(
                          dept.current
                            ? 'bg-gray-100 text-indigo-600 dark:bg-white/5 dark:text-white'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white',
                          'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                        )}
                      >
                        <span
                          className={classNames(
                            dept.current
                              ? 'border-indigo-600 text-indigo-600 dark:border-white/20 dark:text-white'
                              : 'border-gray-200 text-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600 dark:border-white/10 dark:group-hover:border-white/20 dark:group-hover:text-white',
                            'flex size-6 shrink-0 items-center justify-center rounded-lg border bg-white text-[0.625rem] font-medium dark:bg-white/5',
                          )}
                        >
                          {dept.initial}
                        </span>
                        <span className="truncate">{dept.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="-mx-6 mt-auto">
                <a
                  href="#"
                  className="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-white/5"
                >
                  <img
                    alt=""
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    className="size-8 rounded-full bg-gray-100 outline outline-1 -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10"
                  />
                  <span className="sr-only">Your profile</span>
                  <span aria-hidden="true">Dr. Smith</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}
