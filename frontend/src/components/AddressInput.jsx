// src/components/AddressInput.jsx
import { Trash2 } from 'lucide-react'

import FormInput from './FormInput'

// Renders a grouped set of input fields for shipping addresses.
// Supports validation errors, dynamic indexing, and a remove button for handling multiple address entries in a form.
export default function AddressInput({
  index,
  value,
  onChange,
  onRemove,
  errors = {},
  errorFormatter,
  // i18n TEXTS
  street = 'Street',
  city = 'City',
  state = 'State',
  zip = 'ZIP',
  country = 'Country',
  phone = 'Phone (shipping)',
  reference = 'Reference',
}) {
  return (
    <div className="rounded-lg border border-neutral-200/80 bg-white p-3 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <FormInput
          label={street}
          name={`street-${index}`}
          value={value.street}
          onChange={(e) => onChange(index, 'street', e.target.value)}
          error={errors.street}
          errorFormatter={errorFormatter}
        />
        <FormInput
          label={city}
          name={`city-${index}`}
          value={value.city}
          onChange={(e) => onChange(index, 'city', e.target.value)}
          error={errors.city}
          errorFormatter={errorFormatter}
        />
        <FormInput
          label={state}
          name={`state-${index}`}
          value={value.state}
          onChange={(e) => onChange(index, 'state', e.target.value)}
          error={errors.state}
          errorFormatter={errorFormatter}
        />
        <FormInput
          label={zip}
          name={`zip-${index}`}
          maxLength={5}
          value={value.zip}
          onChange={(e) => onChange(index, 'zip', e.target.value)}
          error={errors.zip}
          errorFormatter={errorFormatter}
        />
        <FormInput
          label={country}
          name={`country-${index}`}
          value={value.country}
          onChange={(e) => onChange(index, 'country', e.target.value)}
          error={errors.country}
          errorFormatter={errorFormatter}
        />
        <FormInput
          label={phone}
          name={`phone-${index}`}
          type="tel"
          maxLength={10}
          pattern="\d{10}"
          value={value.phone}
          onChange={(e) => onChange(index, 'phone', e.target.value)}
          error={errors.phone}
          errorFormatter={errorFormatter}
        />
        <div className="md:col-span-2">
          <FormInput
            label={reference}
            name={`reference-${index}`}
            value={value.reference}
            onChange={(e) => onChange(index, 'reference', e.target.value)}
            error={errors.reference}
            errorFormatter={errorFormatter}
          />
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-red-600 underline-offset-2 hover:underline"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
