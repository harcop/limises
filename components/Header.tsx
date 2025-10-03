'use client'

import { Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void
}

export default function Header({ setSidebarOpen }: HeaderProps) {
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-6 border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8 dark:border-white/5 dark:bg-gray-900 dark:shadow-none">
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="-m-2.5 p-2.5 text-gray-900 xl:hidden dark:text-white"
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon aria-hidden="true" className="size-5" />
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form action="#" method="GET" className="grid flex-1 grid-cols-1">
          <input
            name="search"
            placeholder="Search patients, notes, or orders..."
            aria-label="Search"
            className="col-start-1 row-start-1 block size-full bg-transparent pl-8 text-base text-gray-900 outline-none placeholder:text-gray-400 sm:text-sm/6 dark:text-white dark:placeholder:text-gray-500"
          />
          <MagnifyingGlassIcon
            aria-hidden="true"
            className="pointer-events-none col-start-1 row-start-1 size-5 self-center text-gray-400 dark:text-gray-500"
          />
        </form>
      </div>

      <div className="flex items-center gap-x-4 lg:gap-x-6">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
        >
          <span className="sr-only">View notifications</span>
          <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </button>

        <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:bg-white/10" />

        <div className="relative">
          <button
            type="button"
            className="-m-1.5 flex items-center p-1.5"
          >
            <span className="sr-only">Open user menu</span>
            <img
              className="size-8 rounded-md bg-gray-50 dark:bg-gray-800"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt=""
            />
            <span className="hidden lg:flex lg:items-center">
              <span className="ml-4 text-sm/6 font-semibold text-gray-900 dark:text-white" aria-hidden="true">
                Dr. Smith
              </span>
              <svg className="ml-2 size-5 flex-none text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
