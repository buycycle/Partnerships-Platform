'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user-context';

interface LoginModalContextType {
  isLoginModalOpen: boolean;
  openLoginModal: (returnUrl?: string) => void;
  closeLoginModal: () => void;
}

const LoginModalContext = createContext<LoginModalContextType | undefined>(undefined);

interface LoginModalProviderProps {
  children: ReactNode;
}

export function LoginModalProvider({ children }: LoginModalProviderProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [returnUrl, setReturnUrl] = useState<string | undefined>(undefined);
  const router = useRouter();
  const { refreshUser } = useUser();

  const openLoginModal = (returnUrl?: string) => {
    setIsLoginModalOpen(true);
    
    if (returnUrl) {
      setReturnUrl(returnUrl);
        localStorage.setItem('oauth_return_url', returnUrl);
    }
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const handleLoginSuccess = async (userData: any) => {
    // Refresh user context to update the global user state
    await refreshUser();
    
    setIsLoginModalOpen(false);

    // Get the stored return URL
    const storedReturnUrl = localStorage.getItem('oauth_return_url');

    // Handle redirection logic
    if (returnUrl || storedReturnUrl) {
      // Get the target URL (either from state or local storage)
      const targetUrl = storedReturnUrl || returnUrl!;
      
      // Navigate to the target URL
      router.push(targetUrl);
    }
    
    // Clean up localStorage
      localStorage.removeItem('oauth_return_url');
  };

  return (
    <LoginModalContext.Provider
      value={{
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
      }}
    >
      {children}
    </LoginModalContext.Provider>
  );
}

export function useLoginModal() {
  const context = useContext(LoginModalContext);
  if (context === undefined) {
    throw new Error('useLoginModal must be used within a LoginModalProvider');
  }
  return context;
} 