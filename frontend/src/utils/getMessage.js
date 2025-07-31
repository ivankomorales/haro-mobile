// utils/getMessage.js

import { en as messages } from '../locales/en'

/**
 * Safely access a nested message using dot-notation keys.
 * Falls back to the key itself if not found.
 *
 * @example
 *   getMessage('errors.order.CreateFailed')
 *   => 'Something went wrong while creating the order.'
 *
 *   getMessage('formActionsUser.confirmTitle')
 *   => 'Cancel creating user?'
 *
 *   getMessage('nonexistent.path')
 *   => 'nonexistent.path'
 *
 * @param {string} key - Dot notation key path to message
 * @returns {string} - Message string or fallback to key
 */
export const getMessage = (key) =>
  key.split('.').reduce((obj, part) => obj?.[part], messages) || key
