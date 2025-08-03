// src/components/AddressInput.jsx
import FormInput from './FormInput'

// Renders a grouped set of input fields for address, city, ZIP code, and phone.
//Supports validation errors, dynamic indexing, and a remove button for handling multiple address entries in a form.
export default function AddressInput({
  index,
  value,
  onChange,
  onRemove,
  errors = {},
  // i18n TEXTS
  address = 'Address',
  city = 'City',
  zip = 'ZIP',
  phone = 'Phone (shipping)',
  remove = 'Remove',
}) {
  return (
    <div className="mb-4 rounded border p-3 dark:border-neutral-700">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <FormInput
          label={address}
          name={`address-${index}`}
          value={value.address}
          onChange={(e) => onChange('address', e.target.value)}
          error={errors.address}
        />
        <FormInput
          label={city}
          name={`city-${index}`}
          value={value.city}
          onChange={(e) => onChange('city', e.target.value)}
          error={errors.city}
        />
        <FormInput
          label={zip}
          name={`zip-${index}`}
          maxLength={10}
          value={value.zip}
          onChange={(e) => onChange('zip', e.target.value)}
          error={errors.zip}
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
        />
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-red-600 hover:underline"
        >
          {remove}
        </button>
      </div>
    </div>
  )
}
