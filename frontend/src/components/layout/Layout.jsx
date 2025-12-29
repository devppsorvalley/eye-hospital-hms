import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
export default function Layout({ children }) {
  return (
    <div>
      <Header />
      <Sidebar />
      {children}
    </div>
  );
}
