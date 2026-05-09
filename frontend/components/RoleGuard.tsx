'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  roles: ('ADMIN' | 'MANAGER' | 'USER')[];
  fallback?: React.ReactNode;
}

export default function RoleGuard({ children, roles, fallback = null }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
