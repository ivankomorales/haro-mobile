// utils/toastUtils.js
import { toast } from 'react-hot-toast'
import { getMessage } from './getMessage'

export const showError = (key, options = {}) => {
  toast.error(getMessage(key), options)
}

export const showSuccess = (key, options = {}) => {
  toast.success(getMessage(key), options)
}

export const showInfo = (key, options = {}) => {
  toast(getMessage(key), {
    icon: 'ℹ️',
    ...options,
  })
}

export const showLoading = (key, options = {}) => {
  return toast.loading(getMessage(key), options) // devuelve el id para luego dismiss
}

export const dismissToast = (id) => {
  toast.dismiss(id)
}
