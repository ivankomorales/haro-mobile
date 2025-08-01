// src/utils/smartNavigate.js
import { en as messages } from '../locales/en'
import { ORDER_CREATION_ROUTES } from './constants' // o '../utils/constants' si lo usas fuera

export const smartNavigate = (
  navigate,
  currentPath,
  targetPath,
  options = {}
) => {
  const { confirm } = options

  const needsConfirmation = ORDER_CREATION_ROUTES.some((path) =>
    currentPath.startsWith(path)
  )

  if (needsConfirmation && typeof confirm === 'function') {
    confirm(() => navigate(targetPath, options), {
      title: messages.confirm.exitFlowTitle,
      message: messages.confirm.exitFlowMessage,
      confirmText: messages.confirm.exitFlowConfirm,
      cancelText: messages.confirm.exitFlowCancel,
    })
  } else {
    navigate(targetPath, options)
  }
}
