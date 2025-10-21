'use client';
import { useRouter } from 'next/navigation';

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

interface BusinessCardProps {
  business: Business;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/business/${business.id}`);
  };

  const getTypeLabel = (type: string) => {
    const typeLabels: { [key: string]: string } = {
      'BUSINESS': 'Бизнес',
      'GOVERNMENT': 'Төрийн байгууллага',
      'NGO': 'ТББ',
      'EMBASSY': 'Элчин сайд',
      'CONSULATE': 'Консулын газар',
      'PROVINCE': 'Аймаг',
      'DISTRICT': 'Сум'
    };
    return typeLabels[type] || type;
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >

      {business.image && (
        <div className="h-48 bg-gray-200 overflow-hidden">
          <img 
            src={business.image} 
            alt={business.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight pr-2">
            {business.name}
          </h3>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
            {getTypeLabel(business.type)}
          </span>
        </div>

        <p className="text-sm text-gray-500 mb-4">{business.category.name}</p>

        {business.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {business.description}
          </p>
        )}

        <div className="space-y-3">
          {business.phone && (
            <div className="flex items-center text-sm text-gray-700">
              <svg className="w-4 h-4 mr-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{business.phone}</span>
            </div>
          )}

          {business.email && (
            <div className="flex items-center text-sm text-gray-700">
              <svg className="w-4 h-4 mr-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="truncate">{business.email}</span>
            </div>
          )}

          {business.address && (
            <div className="flex items-start text-sm text-gray-700">
              <svg className="w-4 h-4 mr-3 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="leading-relaxed">{business.address}</span>
            </div>
          )}

          {business.links && (
            <div className="flex items-center space-x-3 pt-2">
              {business.website && (
                <a 
                  href={business.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Вебсайт
                </a>
              )}
              
              {business.links.facebook && (
                <a 
                  href={business.links.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  Facebook
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}