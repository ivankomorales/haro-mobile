// components/FormInput.jsx
import { useState } from 'react'
import { Eye, EyeOff, Calendar } from 'lucide-react'

/**
 * FormInput (reusable)
 *
 * Props (plain English, short):
 * - type: HTML input type (text, number, password, date, etc.)
 * - as: "input" (default) or "select". If "select", pass <option> as children.
 * - prefix: small fixed text on the left inside the field (e.g., "$").
 * - name: technical key used by onChange (e.target.name) and form submit.
 * - label: visible text for users (usually from i18n).
 * - value: current value (controlled from your state).
 * - onChange: called when user types/selects (receives the event).
 * - error: error message to show below; falsy to hide.
 * - errorFormatter: optional function to transform/format the error before display.
 * - required: marks field as required (HTML).
 * - minLength, min, max, step: native HTML constraints (text/number/date).
 * - showToggle: if true and type="password", show a toggle (show/hide).
 * - floating: if true, floating label; if false, classic label above.
 * - icon: currently supports 'calendar' when type="date".
 * - ...props: any extra HTML props (disabled, placeholder in non-floating mode, etc.).
 */
export default function FormInput({
  type = 'text',
  as = 'input',
  prefix = null,
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

  // If it's a password and toggle is enabled, swap between text/password
  const inputType =
    type === 'password' && showToggle ? (show ? 'text' : 'password') : type

  // If there's a right-side icon (toggle or calendar), add right padding
  const hasRightIcon =
    (type === 'password' && showToggle) ||
    (icon === 'calendar' && type === 'date')

  return (
    <div className="w-full">
      <div className="relative w-full">
        {/* Prefix */}
        {prefix && (
          <span className="absolute left-3 top-2/3 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-300 pointer-events-none">
            {prefix}
          </span>
        )}

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
        {as === 'select' ? (
          <select
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            className={`
              peer w-full px-3 py-2 min-h-[44px]
              rounded-lg border text-sm bg-white dark:bg-neutral-700
              text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
              ${floating ? 'pt-5' : ''}
            `}
            {...props}
          >
            {props.children}
          </select>
        ) : (
          <input
            type={inputType}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            // In floating mode we keep a single-space placeholder to trigger the animation.
            // In classic mode you can pass your own placeholder via props or fall back to label.
            placeholder={floating ? ' ' : (props.placeholder ?? label)}
            minLength={minLength}
            min={min}
            max={max}
            step={step}
            required={required}
            className={`
              peer w-full ${prefix ? 'pl-10' : 'px-3'} py-1 min-h-[44px]
              rounded-lg border text-sm bg-white dark:bg-neutral-700
              text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
              ${floating ? 'pt-5' : ''}
              ${hasRightIcon ? 'pr-11' : ''}
            `}
            {...props}
          />
        )}

        {/* Floating label */}
        {floating && (
          <label
            htmlFor={name}
            className={`
              absolute left-3 top-1 text-sm text-gray-500 dark:text-gray-400
              transform origin-[0] scale-75 -translate-y-0.5 transition-all
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
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}

            {icon === 'calendar' && type === 'date' && (
              <Calendar
                size={18}
                className="text-gray-500 dark:text-gray-300 pointer-events-none"
                aria-hidden="true"
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
