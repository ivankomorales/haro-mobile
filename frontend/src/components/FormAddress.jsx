import AddressInput from './AddressInput'

/**
 * FormAddress Component
 *
 * Displays a list of address input sections (shipping addresses), with support for adding,
 * removing, and updating multiple address entries.
 *
 * Features:
 * - Renders one or more `AddressInput` components dynamically.
 * - "Add Address" button to append a new address entry.
 * - Individual error handling per address block.
 * - Fully customizable labels via props for i18n support.
 */
export default function FormAddress({
  addresses,
  onAdd,
  onRemove,
  onChange,
  errors = [],
  errorFormatter,
  // i18n TEXTS
  shippingAddress = 'Shipping Address',
  addButton = '+ Add Address',
  addressInputTexts = {},
}) {
  return (
    <div className="rounded border bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{shippingAddress}</p>
        <button
          type="button"
          onClick={onAdd}
          className="rounded border px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700"
        >
          {addButton}
        </button>
      </div>

      {addresses.map((addr, idx) => (
        <AddressInput
          key={idx}
          index={idx}
          value={addr}
          errors={errors[idx] || {}}
          errorFormatter={errorFormatter}
          onRemove={() => onRemove(idx)}
          onChange={(field, val) => onChange(idx, field, val)}
          {...addressInputTexts}
        />
      ))}
    </div>
  )
}
