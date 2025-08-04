import React, { useEffect } from 'react';
import Footer from './Footer';
import toast from 'react-hot-toast';
import Header from './Header';

export default function Layout({ children }) {

  return (
    <div>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex items-center justify-center">
          <div className="w-full container px-4 mx-auto py-8">{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
