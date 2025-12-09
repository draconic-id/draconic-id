'use client'

import { useEffect } from 'react';
import { signIn } from '@/lib/auth-client';

export default function AuthRedirect() {
  useEffect(() => {
    signIn.social({
      provider: 'draconic-id',
      callbackURL: '/profile'
    });
  }, []);

  return '';
}