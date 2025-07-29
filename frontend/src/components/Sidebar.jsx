// components/Sidebar.jsx

import React from 'react'
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'

export default function Sidebar() {
  const navigate = useNavigate()

  return (
    <div
      className="
        hidden md:flex flex-col 
        w-56 h-screen 
        px-4 py-6
        bg-white dark:bg-neutral-900 
        border-r dark:border-neutral-800 
      "
    >
      <div
        className="
          mb-6
          text-lg font-bold  
          text-gray-800 dark:text-gray-100
        "
      >
        Haro Mobile
      </div>

      <nav
        className="
          flex flex-col 
          space-y-4 
          text-sm 
          text-gray-700 dark:text-gray-200
        "
      >
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 hover:text-blue-600"
        >
          <HomeIcon className="w-5 h-5" />
          Inicio
        </button>
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 hover:text-blue-600"
        >
          <ClipboardDocumentListIcon className="w-5 h-5" />
          Pedidos
        </button>
        <button
          onClick={() => navigate('/users')}
          className="flex items-center gap-2 hover:text-blue-600"
        >
          <UserIcon className="w-5 h-5" />
          Usuarios
        </button>
      </nav>
    </div>
  )
}
