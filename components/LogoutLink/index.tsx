"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSignOut } from '~/hooks/useSignOut';

interface LogoutLinkProps {
  className?: string;
  children?: React.ReactNode;
}

const LogoutLink: React.FC<LogoutLinkProps> = ({ className, children }) => {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { handleSignOut } = useSignOut();
  const router = useRouter();

  const onClickHandler = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isSigningOut) return; // Prevent multiple clicks

    setIsSigningOut(true);
    try {
      await handleSignOut();
      // Redirect to home page or login page after successful sign out
      router.push('/');
    } catch (error) {
      console.error('Error during sign out:', error);
      setIsSigningOut(false); // Reset state if there's an error
    }
  };

  return (
    <Link
      href="#"
      onClick={onClickHandler}
      className={className}
    >
      {isSigningOut ?
        <div className="ml-1 flex items-center">
          <svg className="animate-spin mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg> Signing out ...
        </div>
        : children}
    </Link>
  );
};

export default LogoutLink;