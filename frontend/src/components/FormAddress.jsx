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
  addOtherButton = '+ Add Another Address',
  addressInputTexts = {},
  // optional i18n
  emptyTitle = 'No addresses yet',
  emptyHint = 'Add at least one shipping address if delivery is required.',
}) {
  const hasItems = (addresses || []).length > 0

  return (
    <section className="rounded-xl border border-neutral-200/70 bg-white shadow-sm ring-1 ring-black/5 dark:border-neutral-700 dark:bg-neutral-900/60 dark:ring-white/5">
      {/* Header (no action button) */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
        <div>
          <h3 className="text-sm font-semibold">{shippingAddress}</h3>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {/* Optional helper text */}
          </p>
        </div>
        {/* Button removed from header on purpose */}
      </div>

      {/* Body */}
      <div className="p-4">
        {!hasItems ? (
          // Empty state keeps its own "Add" button
          <div className="flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-neutral-200 p-6 text-center dark:border-neutral-700">
            <p className="text-sm font-medium">{emptyTitle}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{emptyHint}</p>
            <button
              type="button"
              onClick={onAdd}
              className="mt-3 rounded-md bg-neutral-900 px-3 py-2 text-sm text-white hover:bg-neutral-800 dark:bg-amber-500 dark:hover:bg-amber-600"
            >
              {addButton}
            </button>
          </div>
        ) : (
          <>
            {/* Addresses list */}
            <div className="space-y-4">
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

            {/* Footer: full-width "Add address" button */}
            <button
              type="button"
              onClick={onAdd}
              className="mt-4 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
            >
              {addOtherButton}
            </button>
          </>
        )}
      </div>
    </section>
  )
}
