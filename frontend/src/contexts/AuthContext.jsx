import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '../lib/apiClient';
import { permissionsService } from '../services/permissionsService';

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [permissions, setPermissions] = useState([])

  useEffect(() => {
    // Check for existing session on app load
    const initializeAuth = async () => {
      const token = apiClient.getToken()
      const savedUser = apiClient.getCurrentUser()

      if (token && savedUser) {
        setUser(savedUser)
        setUserProfile(savedUser) // In our new setup, user and userProfile are the same

        // Load user permissions BEFORE setting loading to false
        await loadUserPermissions()
      }

      setLoading(false)
    }

    initializeAuth()
  }, [])

  // Load user permissions from backend
  const loadUserPermissions = async () => {
    try {
      const permissionsData = await permissionsService.fetchUserPermissions()
      if (permissionsData) {
        const perms = permissionsData.permissions || []
        setPermissions(perms)
      } else {
        console.warn('🔐 No permissions data received')
      }
    } catch (error) {
      console.error('🔐 Failed to load permissions:', error)
    }
  }

  const signIn = async (email, password) => {
    try {
      setAuthError('')
      setLoading(true)

      const { user, error } = await apiClient.login(email, password)

      if (error) {
        setAuthError(error.message)
        return { error }
      }

      if (user) {
        setUser(user)
        setUserProfile(user) // In our new setup, user and userProfile are the same
        // Load permissions after successful login
        await loadUserPermissions()
        return { user, userProfile: user }
      }
    } catch (error) {
      const errorMessage = 'Sign in failed. Please try again.'
      setAuthError(errorMessage)
      return { error: { message: errorMessage } }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, userData = {}) => {
    try {
      setAuthError('')
      setLoading(true)

      const { user, error } = await apiClient.register(email, password, userData)

      if (error) {
        setAuthError(error.message)
        return { error }
      }

      if (user) {
        setUser(user)
        setUserProfile(user)
        // Load permissions after successful registration
        await loadUserPermissions()
        return { user, userProfile: user }
      }
    } catch (error) {
      const errorMessage = 'Sign up failed. Please try again.'
      setAuthError(errorMessage)
      return { error: { message: errorMessage } }
    } finally {
      setLoading(false)
    }
  }

  const signInWithMicrosoft = async () => {
    try {
      setAuthError('')
      setLoading(true)

      const { user, error } = await apiClient.microsoftLogin()

      if (error) {
        setAuthError(error.message)
        return { error }
      }

      if (user) {
        setUser(user)
        setUserProfile(user)
        // Load permissions after successful Microsoft login
        await loadUserPermissions()
        return { user, userProfile: user }
      }
    } catch (error) {
      const errorMessage = error.message || 'Microsoft sign-in failed. Please try again.'
      setAuthError(errorMessage)
      return { error: { message: errorMessage } }
    } finally {
      setLoading(false)
    }
  }

  const attemptSilentSSO = async () => {
    try {
      // Check if we should attempt silent SSO
      const { microsoftAuthService } = await import('../services/microsoftAuthService')

      if (!microsoftAuthService.shouldAttemptSharePointSSO()) {
        return { user: null, error: null }
      }


      // Note: In a real implementation, you would need to get the Microsoft access token
      // from the SharePoint context. This is a placeholder.
      // You'll need to integrate with @microsoft/sp-http or similar SharePoint libraries

      // For now, we'll just return and let the user sign in manually
      return { user: null, error: null }
    } catch (error) {
      console.error('Silent SSO error:', error)
      // Don't show error to user - just fall back to normal login
      return { user: null, error: null }
    }
  }

  const signOut = async () => {
    try {
      await apiClient.logout()
      setUser(null)
      setUserProfile(null)
      setPermissions([])
      setAuthError('')
      // Clear permission cache
      permissionsService.clearCache()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Helper to check if user has a specific permission
  const hasPermission = (permissionName) => {
    const result = permissions.includes(permissionName)
    return result
  }

  // Helper to check if user has any of the specified permissions
  const hasAnyPermission = (permissionNames) => {
    return permissionNames.some(perm => permissions.includes(perm))
  }

  // Force refresh permissions without logging out
  const refreshPermissions = async () => {
    await loadUserPermissions()
    return permissions
  }

  // For compatibility with existing code - returns the current user profile
  const getUserProfile = async (userId) => {
    const currentUser = apiClient.getCurrentUser()
    if (currentUser && currentUser.id === userId) {
      return currentUser
    }
    return null
  }

  // For compatibility with existing code - updates user profile via API
  const updateUserProfile = async (userId, updates) => {
    try {
      const { data, error } = await apiClient.patch(`/users/${userId}`, updates)

      if (error) {
        return { data: null, error }
      }

      // Update local storage and state
      apiClient.setCurrentUser(data)
      setUser(data)
      setUserProfile(data)

      return { data, error: null }
    } catch (error) {
      return { data: null, error: { message: 'Failed to update profile' } }
    }
  }

  const clearAuthError = () => setAuthError('')

  const value = {
    user,
    userProfile,
    loading,
    authError,
    permissions,
    signIn,
    signUp,
    signInWithMicrosoft,
    attemptSilentSSO,
    signOut,
    getUserProfile,
    updateUserProfile,
    clearAuthError,
    hasPermission,
    hasAnyPermission,
    loadUserPermissions,
    refreshPermissions
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}