import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '../lib/apiClient';

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

  useEffect(() => {
    // Check for existing session on app load
    const initializeAuth = () => {
      const token = apiClient.getToken()
      const savedUser = apiClient.getCurrentUser()

      if (token && savedUser) {
        setUser(savedUser)
        setUserProfile(savedUser) // In our new setup, user and userProfile are the same
      }

      setLoading(false)
    }

    initializeAuth()
  }, [])

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

  const signOut = async () => {
    try {
      await apiClient.logout()
      setUser(null)
      setUserProfile(null)
      setAuthError('')
    } catch (error) {
      console.error('Sign out error:', error)
    }
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
    signIn,
    signUp,
    signOut,
    getUserProfile,
    updateUserProfile,
    clearAuthError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}