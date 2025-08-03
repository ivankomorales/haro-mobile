// utils/toastUtils.js

import { toast } from 'react-hot-toast'
import { getMessage } from './getMessage'

/**
 * Displays an error toast with a localized message.
 * @param {string} key - Message key for localization.
 * @param {object} options - Toast options (optional).
 */
export const showError = (key, options = {}) => {
  toast.error(getMessage(key), options)
}

/**
 * Displays a success toast with a localized message.
 */
export const showSuccess = (key, options = {}) => {
  toast.success(getMessage(key), options)
}

/**
 * Displays an informational toast with a default info icon.
 */
export const showInfo = (key, options = {}) => {
  toast(getMessage(key), {
    icon: 'ℹ️',
    ...options,
  })
}

/**
 * Displays a loading toast and returns its ID.
 * Useful for showing loading states and dismissing them later.
 */
export const showLoading = (key, options = {}) => {
  return toast.loading(getMessage(key), options) // returns toast ID for dismissal
}

/**
 * Dismisses a toast by its ID.
 */
export const dismissToast = (id) => {
  toast.dismiss(id)
}
