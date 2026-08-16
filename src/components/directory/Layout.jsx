import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import FloatingAccountMenu from './FloatingAccountMenu';
import MobileBottomNav from './MobileBottomNav';
import AdPopup from '@/components/AdPopup';
import AnnouncementBanner from '@/components/AnnouncementBanner';

export default function DirectoryLayout() {
  const location = useLocation();
  const isMessages = location.pathname === '/messages';
  return (
    <div className={isMessages ? 'h-screen flex flex-col bg-background overflow-hidden' : 'min-h-screen bg-background'}>
      <Navbar />
      <FloatingAccountMenu />
      <AnnouncementBanner />
      <AdPopup />
      <div className={isMessages ? 'flex-1 overflow-hidden' : 'pb-16 md:pb-0'}>
        <Outlet />
      </div>
      <MobileBottomNav />
    </div>
  );
}