import FormInput from './FormInput'

export default function AddressInput({
  index,
  value,
  onChange,
  onRemove,
  errors = {},
}) {
  return (
    <div className="mb-4 rounded border p-3 dark:border-neutral-700">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <FormInput
          label="Address"
          name={`address-${index}`}
          value={value.address}
          onChange={(e) => onChange('address', e.target.value)}
          error={errors.address}
        />
        <FormInput
          label="City"
          name={`city-${index}`}
          value={value.city}
          onChange={(e) => onChange('city', e.target.value)}
          error={errors.city}
        />
        <FormInput
          label="ZIP"
          name={`zip-${index}`}
          maxLength={10}
          value={value.zip}
          onChange={(e) => onChange('zip', e.target.value)}
          error={errors.zip}
        />
        <FormInput
          label="Phone (shipping)"
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
          Remove
        </button>
      </div>
    </div>
  )
}
