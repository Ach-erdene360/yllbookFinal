import { Suspense } from 'react';
import HomePageContent from '@/app/components/HomePageClient/page';
const SERVER_IP = process.env.PUBLIC_SERVER_IP;
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

async function fetchBackendData() {
  try {
    const [categoriesResponse, businessesResponse] = await Promise.all([
      fetch(`http://${SERVER_IP}:3001/cached/categories`, {
        next: { revalidate: 60 } 
      }),
      fetch(`http://${SERVER_IP}:3001/cached/businesses`, {
        next: { revalidate: 60 } 
      })
    ]);

    if (!categoriesResponse.ok || !businessesResponse.ok) {
      throw new Error('Backend API request failed');
    }

    const categoriesData = await categoriesResponse.json();
    const businessesData = await businessesResponse.json();

    return {
      categories: categoriesData.result.data || [],
      businesses: businessesData.result.data || [],
      timestamp: new Date().toISOString(),
      error: null
    };
  } catch (error) {
    console.error('Error fetching from backend:', error);
    return {
      categories: [],
      businesses: [],
      timestamp: new Date().toISOString(),
      error: 'Backend connection failed'
    };
  }
}

export default async function HomePage() {
  const initialData = await fetchBackendData();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HomePageContent initialData={initialData} />
    </Suspense>
  );
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Уншиж байна...</p>
      </div>
    </div>
  );
}

export const revalidate = 60; 
