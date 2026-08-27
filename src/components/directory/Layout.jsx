import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import AnimatedOutlet from './AnimatedOutlet';
import MobileBottomNav from './MobileBottomNav';
import AdPopup from '@/components/AdPopup';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import ExpertFeaturePopup from '@/components/ExpertFeaturePopup';

export default function DirectoryLayout() {
  const location = useLocation();
  const isMessages = location.pathname === '/messages';
  return (
    <div className={isMessages ? 'h-screen flex flex-col bg-background overflow-hidden' : 'min-h-screen bg-background'}>
      <Navbar />
      <AnnouncementBanner />
      <AdPopup />
      <ExpertFeaturePopup />
      <div className={isMessages ? 'flex-1 overflow-hidden' : 'pb-16 md:pb-0'}>
        <AnimatedOutlet className={isMessages ? 'h-full' : undefined} />
      </div>
      <MobileBottomNav />
    </div>
  );
}