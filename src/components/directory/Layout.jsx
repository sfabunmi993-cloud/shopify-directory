import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function DirectoryLayout() {
  const location = useLocation();
  const isMessages = location.pathname === '/messages';
  return (
    <div className={isMessages ? 'h-screen flex flex-col bg-background overflow-hidden' : 'min-h-screen bg-background flex flex-col'}>
      <Navbar />
      <div className={isMessages ? 'flex-1 overflow-hidden' : 'flex-1'}>
        <Outlet />
      </div>
      {!isMessages && <Footer />}
    </div>
  );
}