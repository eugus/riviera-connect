import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { DesktopSidebar } from './DesktopSidebar';
import { DesktopHeader } from './DesktopHeader';

export const AppLayout: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      {isMobile ? (
        <>
          <MobileHeader />
          <main className="pb-20 pt-2 px-3">
            <Outlet />
          </main>
          <MobileBottomNav />
        </>
      ) : (
        <>
          <DesktopHeader />
          <div className="flex">
            <DesktopSidebar />
            <main className="flex-1 p-6 lg:p-8">
              <Outlet />
            </main>
          </div>
        </>
      )}
    </div>
  );
};
