// components/FormInput.jsx
import { useState } from 'react'
import { Eye, EyeOff, Calendar, XCircle } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { fromYMD, toYMD } from '../utils/date'

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

  const inputType = type === 'password' && showToggle ? (show ? 'text' : 'password') : type

  const hasRightIcon =
    (type === 'password' && showToggle) || (icon === 'calendar' && type === 'date')

  return (
    <div className="w-full">
      <div className="relative w-full">
        {/* Prefix (left aligned inside input) */}
        {prefix && (
          <span className="pointer-events-none absolute top-2/3 left-3 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-300">
            {prefix}
          </span>
        )}

        {/* Classic label (if floating is disabled) */}
        {!floating && (
          <label
            htmlFor={name}
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}

        {/* Input field logic */}
        {as === 'select' ? (
          <select
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            className={`peer min-h-[44px] w-full appearance-none rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-neutral-700 dark:text-white ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} ${floating ? 'pt-5' : ''} `}
            {...props}
          >
            {props.children}
          </select>
        ) : type === 'date' ? (
          <DatePicker
            selected={value ? fromYMD(value) : null}
            onChange={(date) => {
              const syntheticEvent = {
                target: {
                  name,
                  value: date ? toYMD(date) : '',
                },
              }
              onChange(syntheticEvent)
            }}
            dateFormat="dd-MM-yyyy"
            className={`peer w-full ${prefix ? 'pl-10' : 'px-3'} min-h-[44px] rounded-lg border bg-white py-1 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-neutral-700 dark:text-white ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} ${floating ? 'pt-5' : ''} ${hasRightIcon ? 'pr-11' : ''} `}
            wrapperClassName="w-full"
            placeholderText={floating ? ' ' : (props.placeholder ?? label)}
            showPopperArrow={false}
            {...props}
          />
        ) : (
          <input
            type={inputType}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            placeholder={floating ? ' ' : (props.placeholder ?? label)}
            minLength={minLength}
            min={min}
            max={max}
            step={step}
            required={required}
            className={`peer w-full ${prefix ? 'pl-10' : 'px-3'} min-h-[44px] rounded-lg border bg-white py-1 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-neutral-700 dark:text-white ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} ${floating ? 'pt-5' : ''} ${hasRightIcon ? 'pr-11' : ''} `}
            {...props}
          />
        )}

        {/* Floating label (if enabled) */}
        {floating && (
          <label
            htmlFor={name}
            className={`absolute top-1 left-3 origin-[0] -translate-y-0.5 scale-75 transform text-sm text-gray-500 transition-all peer-placeholder-shown:translate-y-2 peer-placeholder-shown:scale-100 peer-focus:-translate-y-1.5 peer-focus:scale-75 dark:text-gray-400 ${error ? 'text-red-500' : 'peer-focus:text-blue-600 dark:peer-focus:text-blue-400'} `}
          >
            {label}
          </label>
        )}

        {/* Icon wrapper (right-aligned) */}
        {hasRightIcon && (
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            {type === 'password' && showToggle && (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShow((prev) => !prev)}
                className="pointer-events-auto text-gray-500 dark:text-gray-300"
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}

            {icon === 'calendar' && type === 'date' && (
              <Calendar size={18} className="translate-y-2.5 text-gray-500 dark:text-gray-300" />
            )}
          </div>
        )}
      </div>

      {/* Error message (below input) */}
      {error && (
        <p className="mt-1 text-sm text-red-500">
          {errorFormatter ? errorFormatter(error) : error}
        </p>
      )}
    </div>
  )
}
