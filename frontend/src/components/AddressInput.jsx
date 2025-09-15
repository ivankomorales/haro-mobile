// src/components/AddressInput.jsx
import FormInput from './FormInput'
import { Trash2 } from 'lucide-react'
// Renders a grouped set of input fields for address, city, ZIP code, and phone.
//Supports validation errors, dynamic indexing, and a remove button for handling multiple address entries in a form.
export default function AddressInput({
  index,
  value,
  onChange,
  onRemove,
  errors = {},
  errorFormatter,
  // i18n TEXTS
  address = 'Address',
  city = 'City',
  zip = 'ZIP',
  phone = 'Phone (shipping)',
  remove = 'Remove', //Changed to lucide trash icon
}) {
  return (
    <div className="rounded-lg border border-neutral-200/80 bg-white p-3 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <FormInput
          label={address}
          name={`address-${index}`}
          value={value.address}
          onChange={(e) => onChange('address', e.target.value)}
          error={errors.address}
          errorFormatter={errorFormatter}
        />
        <FormInput
          label={city}
          name={`city-${index}`}
          value={value.city}
          onChange={(e) => onChange('city', e.target.value)}
          error={errors.city}
          errorFormatter={errorFormatter}
        />
        <FormInput
          label={zip}
          name={`zip-${index}`}
          maxLength={10}
          value={value.zip}
          onChange={(e) => onChange('zip', e.target.value)}
          error={errors.zip}
          errorFormatter={errorFormatter}
        />
        <FormInput
          label={phone}
          name={`phone-${index}`}
          type="tel"
          maxLength={10}
          pattern="\d{10}"
          value={value.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          error={errors.phone}
          errorFormatter={errorFormatter}
        />
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
