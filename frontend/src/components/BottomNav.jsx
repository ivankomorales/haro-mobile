import { HomeIcon } from '@heroicons/react/24/outline'
import { ClipboardIcon } from '@heroicons/react/24/outline'
import { PlusIcon } from '@heroicons/react/24/solid'
import { ChartBarIcon } from '@heroicons/react/24/outline'
import { UserIcon } from '@heroicons/react/24/outline'

export default function BottomNav() {
  return (
    <div className="fixed z-50 w-full h-16 max-w-lg -translate-x-1/2 bg-white border border-gray-200 rounded-full bottom-4 left-1/2 dark:bg-gray-700 dark:border-gray-600">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
        {/* Home */}
        <button
          type="button"
          className="inline-flex flex-col items-center justify-center px-5 rounded-s-full hover:bg-gray-100 dark:hover:bg-gray-800 group"
        >
          <HomeIcon className="w-5 h-5 text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400" />
          <span className="sr-only">Home</span>
        </button>

        {/* Orders */}
        <button
          type="button"
          className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-100 dark:hover:bg-gray-800 group"
        >
          <ClipboardIcon className="w-5 h-5 text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400" />
          <span className="sr-only">Orders</span>
        </button>

        {/* Central Button */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            className="inline-flex items-center justify-center w-10 h-10 font-medium bg-blue-600 rounded-full hover:bg-blue-700 group focus:outline-none"
          >
            <PlusIcon className="w-4 h-4 text-white" />
            <span className="sr-only">New</span>
          </button>
        </div>

        {/* Dashboard */}
        <button
          type="button"
          className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-100 dark:hover:bg-gray-800 group"
        >
          <ChartBarIcon className="w-5 h-5 text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400" />
          <span className="sr-only">Dashboard</span>
        </button>

        {/* Profile */}
        <button
          type="button"
          className="inline-flex flex-col items-center justify-center px-5 rounded-e-full hover:bg-gray-100 dark:hover:bg-gray-800 group"
        >
          <UserIcon className="w-5 h-5 text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400" />
          <span className="sr-only">Profile</span>
        </button>
      </div>
    </div>
  )
}
