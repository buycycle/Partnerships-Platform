'use client';

import { useLoginModal } from '@/contexts/login-modal-context';
import { useUser } from '@/contexts/user-context';
import { LoginModal } from '@/components/auth/login-modal';

export function LoginModalRenderer() {
  const { isLoginModalOpen, closeLoginModal } = useLoginModal();
  const { refreshUser } = useUser();
  
  const handleLoginSuccess = async (userData: any) => {
    console.log('🎉 [LoginModal] Login success callback triggered');
    await refreshUser();
    console.log('🎉 [LoginModal] User context refreshed, closing modal');
    closeLoginModal();
  };
  
  return (
    <LoginModal
      isOpen={isLoginModalOpen}
      onClose={closeLoginModal}
      onLoginSuccess={handleLoginSuccess}
      onCreateAccount={() => {
        closeLoginModal();
        window.location.href = 'https://buycycle.com/';
      }}
    />
  );
} 