// src/hooks/useCreateUser.js

import { createUser } from '../api/users'
import { logout } from '../api/auth'

/**
 * Custom hook to handle user creation logic with validation and error handling.
 *
 * @param {function} navigate - react-router navigate function (used for logout redirection).
 * @returns {object} - Object with the create() function to trigger user creation.
 */
export const useCreateUser = (navigate) => {
  /**
   * Attempts to create a new user with the provided form data.
   *
   * @param {object} formData - Includes name, email, password, confirmPassword, role.
   * @throws {Error} - If passwords do not match or API returns an error.
   */
  const create = async (formData) => {
    // Validate passwords
    if (formData.password !== formData.confirmPassword) {
      throw new Error('Passwords do not match')
    }

    try {
      await createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })
    } catch (err) {
      // Handle expired session or unauthorized
      if (
        err.message.toLowerCase().includes('expired') ||
        err.message.includes('401')
      ) {
        logout(navigate)
      }
      throw err
    }
  }

  return { create }
}
