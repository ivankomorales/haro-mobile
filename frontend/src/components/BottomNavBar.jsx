import { HomeIcon } from '@heroicons/react/24/outline'
import { ClipboardIcon } from '@heroicons/react/24/outline'
import { PlusIcon } from '@heroicons/react/24/solid'
import { ChartBarIcon } from '@heroicons/react/24/outline'
import { UserIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'

export default function BottomNavBar() {
  const navigate = useNavigate()

  return (
    <div
      className="
        fixed bottom-4 left-1/2 -translate-x-1/2 z-50 
        w-full max-w-lg h-16
        bg-white border dark:bg-gray-700
        border-gray-200 dark:border-gray-600
        rounded-full   
      "
    >
      <div
        className="
          grid grid-cols-5
          h-full max-w-lg mx-auto
        "
      >
        {/* Home */}
        <button
          type="button"
          className="
            inline-flex flex-col items-center justify-center 
            px-5 
            rounded-s-full 
            hover:bg-gray-100 dark:hover:bg-gray-800 
            group
          "
        >
          <HomeIcon
            className="
              w-5 h-5 
              text-gray-500 dark:text-gray-400
              group-hover:text-blue-600  dark:group-hover:text-blue-400
            "
          />
          <span className="sr-only">Home</span>
        </button>

        {/* Orders */}
        <button
          type="button"
          className="
            inline-flex flex-col items-center justify-center 
            px-5 
            hover:bg-gray-100 dark:hover:bg-gray-800 
            group
          "
        >
          <ClipboardIcon
            className="
              w-5 h-5 
              text-gray-500 dark:text-gray-400 
              group-hover:text-blue-600 dark:group-hover:text-blue-400
            "
          />
          <span className="sr-only">Orders</span>
        </button>

        {/* Central Button */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            className="
              inline-flex items-center justify-center 
              w-10 h-10 
              text-white font-medium 
              bg-blue-600 hover:bg-blue-700 
              rounded-full
              focus:outline-none
              group
            "
            onClick={() => navigate('/orders/new')}
          >
            <PlusIcon className="w-4 h-4" />

            <span className="sr-only">New</span>
          </button>
        </div>

        {/* Dashboard */}
        <button
          type="button"
          className="
            inline-flex flex-col items-center justify-center 
            px-5 
            hover:bg-gray-100 dark:hover:bg-gray-800 
            group
          "
        >
          <ChartBarIcon
            className="
              w-5 h-5 
              text-gray-500 dark:text-gray-400 
              group-hover:text-blue-600 dark:group-hover:text-blue-400
            "
          />
          <span className="sr-only">Dashboard</span>
        </button>

        {/* Profile */}
        <button
          type="button"
          className="
            inline-flex flex-col items-center justify-center 
            px-5 
            hover:bg-gray-100 dark:hover:bg-gray-800
            rounded-e-full  
            group
          "
        >
          <UserIcon
            className="
              w-5 h-5 
              text-gray-500 dark:text-gray-400
              group-hover:text-blue-600 dark:group-hover:text-blue-400
            "
          />
          <span className="sr-only">Profile</span>
        </button>
      </div>
    </div>
  )
}
