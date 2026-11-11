import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Skeleton } from '../common/LoadingSkeleton';

interface AppLayoutProps {
  requireAuth?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ requireAuth = false }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Skeleton height="32px" width="240px" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton height="90px" />
            <Skeleton height="90px" />
            <Skeleton height="90px" />
            <Skeleton height="90px" />
          </div>
          <Skeleton height="320px" />
        </main>
        <Footer />
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

