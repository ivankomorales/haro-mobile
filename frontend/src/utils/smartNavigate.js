// src/utils/smartNavigate.js

import { en as messages } from '../locales/en'
import { ORDER_CREATION_ROUTES } from './constants' // or '../utils/constants' if used outside

/**
 * Smart navigation helper that intercepts route changes during critical flows.
 * If the current path is part of an ongoing process (like order creation),
 * it optionally shows a confirmation dialog before allowing navigation.
 *
 * @param {function} navigate - The navigate function from React Router.
 * @param {string} currentPath - The current route path.
 * @param {string} targetPath - The path to navigate to.
 * @param {object} options - Optional config, including a custom `confirm` function.
 */
export const smartNavigate = (
  navigate,
  currentPath,
  targetPath,
  options = {}
) => {
  const { confirm } = options

  // Check if the user is inside an ongoing flow (e.g., order creation)
  const needsConfirmation = ORDER_CREATION_ROUTES.some((path) =>
    currentPath.startsWith(path)
  )

  if (needsConfirmation && typeof confirm === 'function') {
    // Show confirmation modal before navigating away
    confirm(() => navigate(targetPath, options), {
      title: messages.formActionsCreate.confirmTitle,
      message: messages.formActionsCreate.confirmMessage,
      confirmText: messages.formActions.confirmText,
      cancelText: messages.formActions.cancelText,
    })
  } else {
    // Navigate immediately
    navigate(targetPath, options)
  }
}
