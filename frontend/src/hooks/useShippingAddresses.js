// comments in English only
//src/hooks/useHippingAddresses.js
import { useCallback } from 'react'

/**
 * Centralized shipping address handlers.
 * Single source of truth: formData.shipping.addresses
 * Contract for children: onChange(index, field, value)
 */
export function useShippingAddresses(formData, setFormData) {
  const updateAddress = useCallback(
    (index, field, value) => {
      setFormData((prev) => {
        const s = prev.shipping ?? { isRequired: false, addresses: [] }
        const addrs = Array.isArray(s.addresses) ? [...s.addresses] : []
        const curr = addrs[index] ?? {}
        addrs[index] = { ...curr, [field]: value }
        return { ...prev, shipping: { ...s, addresses: addrs } }
      })
    },
    [setFormData]
  )

  const addAddress = useCallback(
    (seed = {}) => {
      setFormData((prev) => {
        const s = prev.shipping ?? { isRequired: false, addresses: [] }
        const addrs = Array.isArray(s.addresses) ? [...s.addresses] : []
        return { ...prev, shipping: { ...s, isRequired: true, addresses: [...addrs, seed] } }
      })
    },
    [setFormData]
  )

  const removeAddress = useCallback(
    (index) => {
      setFormData((prev) => {
        const s = prev.shipping ?? { isRequired: false, addresses: [] }
        const addrs = (s.addresses || []).filter((_, i) => i !== index)
        return { ...prev, shipping: { ...s, addresses: addrs } }
      })
    },
    [setFormData]
  )

  const toggleShipping = useCallback(
    (required) => {
      setFormData((prev) => {
        const s = prev.shipping ?? { isRequired: false, addresses: [] }
        return { ...prev, shipping: { ...s, isRequired: !!required } }
      })
    },
    [setFormData]
  )

  return { updateAddress, addAddress, removeAddress, toggleShipping }
}
