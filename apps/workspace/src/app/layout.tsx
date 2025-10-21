// app/layout.tsx
'use client';
import { useState, useEffect } from 'react';
import '../app/global.css'

interface Business {
  id: number;
  name: string;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [business, setBusiness] = useState<Business | null>(null);

  useEffect(() => {
    const businessData = localStorage.getItem('business');
    if (businessData) {
      setBusiness(JSON.parse(businessData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('business');
    setBusiness(null);
    window.location.href = '/';
  };

  return (
    <html lang="mn">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  <a href="/">Монголын Бизнесийн Лавлах</a>
                </h1>
              </div>
              
              <nav className="flex items-center space-x-4">
                <a href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Нүүр
                </a>
                
                {business ? (
                  <>
                    <a href="/profile" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                      Профайл
                    </a>
                    <span className="text-gray-500 text-sm">({business.name})</span>
                    <button
                      onClick={handleLogout}
                      className="text-red-600 hover:text-red-800 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Гарах
                    </button>
                  </>
                ) : (
                  <>
                    <a href="/register" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                      Бүртгүүлэх
                    </a>
                    <a href="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                      Нэвтрэх
                    </a>
                  </>
                )}
              </nav>
            </div>
          </div>
        </header>
        
        <main>{children}</main>
      </body>
    </html>
  );
}