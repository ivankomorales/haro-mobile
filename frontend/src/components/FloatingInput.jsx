// components/FloatingInput.jsx
import { useState } from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function FloatingInput({
  type = 'text',
  name,
  label,
  value,
  onChange,
  required = false,
  minLength,
}) {
  const [showPassword, setShowPassword] = useState(false)
  const inputType = type === 'password' && showPassword ? 'text' : type

  return (
    <div className="relative w-full">
      <input
        type={inputType}
        name={name}
        id={name}
        required={required}
        minLength={minLength}
        value={value}
        onChange={onChange}
        placeholder=" "
        className="peer w-full p-3 pt-5 text-sm bg-white dark:bg-neutral-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <label
        htmlFor={name}
        className="absolute text-sm text-gray-500 dark:text-gray-400 duration-200 transform -translate-y-2.5 scale-75 top-2 left-3 z-0 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-2.5 peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-blue-600 dark:peer-focus:text-blue-400"
      >
        {label}
      </label>

      {type === 'password' && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300"
        >
          {showPassword ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      )}
    </div>
  )
}
