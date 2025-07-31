// components/FormInput.jsx
import { useState } from 'react'
import { Eye, EyeOff, Calendar } from 'lucide-react'

export default function FormInput({
  type = 'text',
  name,
  label,
  value,
  onChange,
  error,
  errorFormatter,
  required,
  minLength,
  min,
  max,
  step,
  showToggle = false,
  floating = true,
  icon = null,
  ...props
}) {
  const [show, setShow] = useState(false)
  const inputType =
    type === 'password' && showToggle ? (show ? 'text' : 'password') : type

  const hasRightIcon =
    (type === 'password' && showToggle) ||
    (icon === 'calendar' && type === 'date')

  return (
    <div className="w-full">
      <div className="relative w-full">
        {/* Classic label (floating = false) */}
        {!floating && (
          <label
            htmlFor={name}
            className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}

        {/* Input */}
        <input
          type={inputType}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          placeholder={floating ? ' ' : label}
          required={required}
          minLength={minLength}
          min={min}
          max={max}
          step={step}
          className={`
          peer w-full px-3 py-2 min-h-[44px]
          rounded-lg border text-sm
          bg-white dark:bg-neutral-700
          text-gray-900 dark:text-white
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
          ${floating ? 'pt-5' : ''}
          ${hasRightIcon ? 'pr-11' : ''}
        `}
          {...props}
        />

        {/* Floating label */}
        {floating && (
          <label
            htmlFor={name}
            className={`
            absolute left-3 top-1 text-sm text-gray-500 dark:text-gray-400
            transform origin-[0] scale-75 -translate-y-1.5 transition-all
            peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-2
            peer-focus:scale-75 peer-focus:-translate-y-1.5
            ${error ? 'text-red-500' : 'peer-focus:text-blue-600 dark:peer-focus:text-blue-400'}
          `}
          >
            {label}
          </label>
        )}

        {/* Icon wrapper (right-aligned) */}
        {hasRightIcon && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            {type === 'password' && showToggle && (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShow((prev) => !prev)}
                className="text-gray-500 dark:text-gray-300"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}

            {icon === 'calendar' && type === 'date' && (
              <Calendar
                size={18}
                className="text-gray-500 dark:text-gray-300 pointer-events-none"
              />
            )}
          </div>
        )}
      </div>

      {/* Error message (outside relative box) */}
      {error && (
        <p className="text-red-500 text-sm mt-1">
          {errorFormatter ? errorFormatter(error) : error}
        </p>
      )}
    </div>
  )
}
