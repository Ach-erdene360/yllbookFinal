'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BusinessCard from './components/BusinessCard';

interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Business {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  links?: any;
  image?: string;
  description?: string;
  type: string;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  category: Category;
}

export default function HomePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string>(''); // ✅ ШИНЭ: Байршил хайх
  const [sortBy, setSortBy] = useState<'name' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const router = useRouter();

  const fetchTRPC = async (procedure: string, input?: any) => {
    try {
      let url = `http://localhost:3001/trpc/${procedure}`;
      if (input) {
        url += `?input=${encodeURIComponent(JSON.stringify(input))}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      return data.result.data;
    } catch (error) {
      console.error(`tRPC ${procedure} error:`, error);
      return [];
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        const categoriesData = await fetchTRPC('getAllCategories');
        setCategories(categoriesData);

        const businessesData = await fetchTRPC('getAllBusinessesSimple');
        setBusinesses(businessesData);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredAndSortedBusinesses = businesses
    .filter(business => {
      const matchesSearch = business.name.toLowerCase().includes(search.toLowerCase()) ||
                           business.phone?.includes(search) ||
                           business.email?.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = selectedCategory ? business.categoryId === selectedCategory : true;
      const matchesType = selectedType ? business.type === selectedType : true;
      
      const matchesLocation = locationFilter ? 
        business.address?.toLowerCase().includes(locationFilter.toLowerCase()) : true;

      return matchesSearch && matchesCategory && matchesType && matchesLocation;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortOrder === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory(null);
    setSelectedType(null);
    setLocationFilter('');
  };

  const hasActiveFilters = search || selectedCategory || selectedType || locationFilter;

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Монголын бизнесийн лавлах
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Бизнес, төрийн байгууллага, ТББ-уудын мэдээлэл
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4"> {/* ✅ 4-ээс 5 болгосон */}
            <div className="lg:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Нэр, утас, имэйлээр хайх..."
                />
              </div>
            </div>

            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Бүх ангилал</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

<div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Байршилаар хайх..."
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Эрэмбэлэх:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="asc">Өсөх (А-Я)</option>
                <option value="desc">Буурах (Я-А)</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium text-sm border border-blue-200 rounded-lg hover:bg-blue-50"
              >
                Бүх шүүлтүүр цэвэрлэх
              </button>
            )}
          </div>

          {/* {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Идэвхтэй шүүлтүүрүүд:</span>
              
              {search && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Хайлт: "{search}"
                  <button 
                    onClick={() => setSearch('')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {locationFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Байршил: "{locationFilter}"
                  <button 
                    onClick={() => setLocationFilter('')}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {selectedCategory && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  Ангилал: {categories.find(c => c.id === selectedCategory)?.name}
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {selectedType && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                  Төрөл: {selectedType}
                  <button 
                    onClick={() => setSelectedType(null)}
                    className="ml-1 text-orange-600 hover:text-orange-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )} */}
        </div>
        <div className="mb-6">
          <p className="text-gray-600 text-sm">
            Нийт <span className="font-semibold text-gray-900">{filteredAndSortedBusinesses.length}</span> ширхэг байгууллага олдлоо
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>

        {filteredAndSortedBusinesses.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Илэрц олдсонгүй</h3>
              <p className="text-gray-500 text-sm">
                Хайлтын үр дүнд тохирох байгууллага олдсонгүй. Шүүлтүүрээ шалгаад дахин оролдоно уу.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}