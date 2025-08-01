import AddressInput from './AddressInput'

export default function FormAddress({
  addresses,
  onAdd,
  onRemove,
  onChange,
  errors = [],
}) {
  return (
    <div className="p-4 border rounded bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
          Shipping address(es) // TODO locale
        </p>
        <button
          type="button"
          onClick={onAdd}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-neutral-700"
        >
          + Add address // TODO locale
        </button>
      </div>

      {addresses.map((addr, idx) => (
        <AddressInput
          key={idx}
          index={idx}
          value={addr}
          errors={errors[idx] || {}}
          onRemove={() => onRemove(idx)}
          onChange={(field, val) => onChange(idx, field, val)}
        />
      ))}
    </div>
  )
}
