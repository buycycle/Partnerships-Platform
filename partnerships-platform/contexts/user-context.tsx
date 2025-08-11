'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/lib/api';
import { User } from '@/lib/types';

interface UserContextType {
  isUserLoggedIn: boolean;
  isLoading: boolean;
  user: User | null;
  refreshUser: () => Promise<void>;
}

// Create context with default values
const UserContext = createContext<UserContextType>({
  isUserLoggedIn: false,
  isLoading: true,
  user: null,
  refreshUser: async () => {}
});

// Provider component
interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  const refreshUser = async () => {
    console.log('🔄 [UserContext] Refreshing user data...');
    try {
      setIsLoading(true);
      
      // Try to get current user
      const currentUser = await auth.getCurrentUser();
      console.log('🔄 [UserContext] Got user data:', currentUser ? `User ID: ${currentUser.id}` : 'No user data');
      
      if (currentUser) {
        setUser(currentUser);
        setIsUserLoggedIn(true);
        console.log('✅ [UserContext] User context updated - logged in');
        console.log('✅ [UserContext] User ID:', currentUser.id);
        console.log('✅ [UserContext] User email:', currentUser.email);
      } else {
        // User fetch failed, clear state
        setUser(null);
        setIsUserLoggedIn(false);
        console.log('❌ [UserContext] User context updated - logged out');
        console.log('❌ [UserContext] localStorage user_data:', localStorage.getItem('user_data') ? 'Present' : 'Not present');
        console.log('❌ [UserContext] localStorage custom_auth_token:', localStorage.getItem('custom_auth_token') ? 'Present' : 'Not present');
      }
    } catch (error) {
      console.error('❌ [UserContext] Error refreshing user:', error);
      // On error, clear state
      setUser(null);
      setIsUserLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize user state on mount
  useEffect(() => {
    const initializeUser = async () => {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      try {
        // Check for stored user data first (for quick initial load)
        const storedUserData = localStorage.getItem('user_data');
        console.log('🔄 [UserContext] Initializing - localStorage user_data:', storedUserData ? 'Present' : 'Not present');
        
        if (storedUserData) {
          try {
            const userData = JSON.parse(storedUserData);
            console.log('🔄 [UserContext] Parsed stored user data:', userData ? `User ID: ${userData.id}` : 'Invalid data');
            
            // Verify we still have authentication tokens
            const authToken = localStorage.getItem('auth_token');
            const customToken = localStorage.getItem('custom_auth_token');
            if (authToken || customToken) {
              console.log('🔄 [UserContext] User is authenticated, setting initial state');
              setUser(userData);
              setIsUserLoggedIn(true);
            } else {
              console.log('🔄 [UserContext] User not authenticated, clearing stored data');
              localStorage.removeItem('user_data');
            }
          } catch (error) {
            console.error('🔄 [UserContext] Error parsing stored user data:', error);
            localStorage.removeItem('user_data');
          }
        }

        // Only refresh user data from server if we don't have valid cached data
        // This prevents unnecessary API calls that might clear tokens
        if (!storedUserData) {
          console.log('🔄 [UserContext] No cached user state, refreshing from server...');
          await refreshUser();
        } else {
          console.log('🔄 [UserContext] User already authenticated from cache, skipping server refresh');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Listen for storage changes (for multi-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'custom_auth_token' || e.key === 'user_data') {
        // Token or user data changed in another tab, refresh user state
        refreshUser();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        isUserLoggedIn,
        isLoading,
        user,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// Hook to use the user context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 