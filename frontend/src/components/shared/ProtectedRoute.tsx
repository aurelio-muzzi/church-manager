import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/modules/authentication/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2 } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold shadow-inner animate-pulse">
          <Building2 className="h-6 w-6" />
        </div>
        <div className="space-y-2 text-center">
          <Skeleton className="h-5 w-44 mx-auto" />
          <Skeleton className="h-3 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redireciona para login preservando rota solicitada
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificação de Autorização por Papel (RBAC)
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return children ? <>{children}</> : null;
}
