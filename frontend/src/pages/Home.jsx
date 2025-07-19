import { useEffect, useState } from 'react'
import useDarkMode from '../hooks/useDarkMode'
import BottomNav from '../components/BottomNav'

export default function Home() {
  const { isDark, toggleDarkMode } = useDarkMode()

  const pendingCount = 12
  const recentOrders = [
    {
      id: 'ORD-0045',
      name: 'Sandra López',
      date: 'Jun 20, 2025',
      status: 'Pendiente',
    },
    {
      id: 'ORD-0044',
      name: 'Sandra López',
      date: 'Jun 19, 2025',
      status: 'Pendiente',
    },
    {
      id: 'ORD-0043',
      name: 'Sandra López',
      date: 'Jun 18, 2025',
      status: 'Pendiente',
    },
  ]

  return (
    <div className="p-4 pb-20 min-h-screen bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-100 font-sans">
      {/* Toggle button */}
      {/* <div className="flex justify-end">
        <button
          onClick={toggleDarkMode}
          className="mb-4 px-3 py-1 text-sm rounded-full border border-gray-400 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-neutral-700"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div> */}
      <h1 className="text-xl font-semibold mb-4">Inicio</h1>
      <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow mb-6 text-center">
        <h2 className="text-base text-gray-500 dark:text-gray-300">
          Pedidos pendientes
        </h2>
        <p className="text-3xl font-bold my-2">{pendingCount}</p>
        <span className="text-sm text-gray-400">
          Última actualización: hoy a las 10:25
        </span>
      </div>
      <section className="mb-10">
        <h3 className="text-lg font-medium mb-2">Pedidos recientes</h3>
        <ul className="space-y-2">
          {recentOrders.map((order) => (
            <li
              key={order.id}
              className="flex justify-between items-center bg-white dark:bg-neutral-800 p-3 rounded-lg shadow"
            >
              <div>
                <strong className="block text-sm">{order.name}</strong>
                <span className="text-xs text-gray-500">{order.date}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {order.id}
                </div>
                <span className="text-xs bg-yellow-300 text-gray-800 px-2 py-0.5 rounded">
                  {order.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <BottomNav />
    </div>
  )
}
