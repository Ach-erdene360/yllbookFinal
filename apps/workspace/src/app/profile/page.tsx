'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Business {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  image?: string;
  description?: string;
  type: string;
  categoryId: number;
  category?: {
    id: number;
    name: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const businessData = localStorage.getItem('business');
    if (!businessData) {
      router.push('/login');
      return;
    }

    setBusiness(JSON.parse(businessData));
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('business');
    router.push('/');
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Уншиж байна...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Бүртгэл олдсонгүй</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Нэвтрэх
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{business.name}</h1>
                <p className="text-blue-100 mt-2">{business.type}</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleEditProfile}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium"
                >
                  Мэдээлэл засах
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Гарах
                </button>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                  {business.image ? (
                    <img 
                      src={business.image} 
                      alt={business.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Зураг байхгүй
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Үндсэн мэдээлэл</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Байгууллагын нэр</label>
                        <p className="text-gray-900">{business.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Төрөл</label>
                        <p className="text-gray-900">{business.type}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Утас</label>
                        <p className="text-gray-900">{business.phone || 'Оруулаагүй'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Имэйл</label>
                        <p className="text-gray-900">{business.email || 'Оруулаагүй'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-500">Байршил</label>
                        <p className="text-gray-900">{business.address || 'Оруулаагүй'}</p>
                      </div>
                      {business.website && (
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-gray-500">Вэбсайт</label>
                          <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                            {business.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {business.description && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Танилцуулга</h2>
                      <p className="text-gray-700 leading-relaxed">{business.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}