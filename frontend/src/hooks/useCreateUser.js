// src/hooks/useCreateUser.js
import { createUser } from '../api/users'
import { useAuthedFetch } from './useAuthedFetch'

/**
 * Custom hook to handle user creation logic with validation and error handling.
 *
 * @param {function} navigate - react-router navigate function (used for logout redirection).
 * @returns {object} - Object with the create() function to trigger user creation.
 */
export const useCreateUser = () => {
  const authedFetch = useAuthedFetch()
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

    await createUser(
      {
        name: formData.name,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      },
      { fetcher: authedFetch }
    )
  }

  return { create }
}
