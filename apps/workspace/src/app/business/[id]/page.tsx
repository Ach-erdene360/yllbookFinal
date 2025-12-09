const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Business {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  links?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    [key: string]: string | undefined;
  };
  image?: string;
  description?: string;
  type: string;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    name: string;
  };
}

export async function generateStaticParams() {
  try {
    console.log('[SSG] Generating static params for first 10 businesses...');
    const response = await fetch(`${API_URL}/trpc/getAllBusinessesSimple`, {
      next: { revalidate: 3600 } 
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const businesses = data.result.data || [];
    
    console.log(`[SSG] Generated ${businesses.slice(0, 10).length} static business pages`);
    return businesses.slice(0, 10).map((business: Business) => ({
      id: business.id.toString(),
    }));
  } catch (error) {
    console.error('[SSG] Error generating static params:', error);
    return [];
  }
}

export const revalidate = 3600;

async function getBusiness(id: string): Promise<Business | null> {
  try {
    console.log(`[DATA] Fetching FRESH business data for ID: ${id}`);
    const response = await fetch(`${API_URL}/trpc/getBusinessById?input=${id}`, {
      next: { 
        revalidate: 3600,
        tags: [`business-${id}`]
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const business = data.result.data;
    
    console.log(`✅ [DATA] Successfully fetched business: ${business?.name}`);
    return business;
  } catch (error) {
    console.error('[DATA] Error fetching business:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const business = await getBusiness(params.id);
  
  return {
    title: business ? `${business.name} - Монголын бизнесийн лавлах` : 'Байгууллага олдсонгүй',
    description: business?.description || 'Монголын бизнесийн мэдээлэл',
  };
}

export default async function BusinessDetailPage({ params }: { params: { id: string } }) {
  console.log(`[PAGE] Rendering business page for ID: ${params.id}`);
  
  const business = await getBusiness(params.id);

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Байгууллага олдсонгүй</h1>
          <p className="text-gray-600">Таны хайсан байгууллагын мэдээлэл олдсонгүй.</p>
          <div className="mt-4 text-sm text-gray-500">
            <p>ID: {params.id}</p>
          </div>
        </div>
      </div>
    );
  }

  const formatWebsiteUrl = (url: string) => {
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  const getDisplayUrl = (url: string) => {
    try {
      const formattedUrl = formatWebsiteUrl(url);
      const domain = new URL(formattedUrl).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };

  const socialMediaConfig = {
    website: {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      label: 'Вэбсайт',
      color: 'text-blue-600 hover:text-blue-800'
    },
    facebook: {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      label: 'Facebook',
      color: 'text-blue-600 hover:text-blue-800'
    },
    instagram: {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.24 14.816 3.75 13.665 3.75 12.368s.49-2.448 1.376-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.886.875 1.376 2.026 1.376 3.323s-.49 2.448-1.376 3.323c-.875.807-2.026 1.297-3.323 1.297z"/>
        </svg>
      ),
      label: 'Instagram',
      color: 'text-pink-600 hover:text-pink-800'
    },
    twitter: {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      label: 'Twitter',
      color: 'text-blue-400 hover:text-blue-600'
    },
    linkedin: {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      label: 'LinkedIn',
      color: 'text-blue-700 hover:text-blue-900'
    },
    youtube: {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
      label: 'YouTube',
      color: 'text-red-600 hover:text-red-800'
    }
  };

  // Filter valid links
  const validLinks = business.links ? Object.entries(business.links)
    .filter(([key, value]) => value && value.trim() !== '')
    .map(([key, value]) => ({
      key,
      url: formatWebsiteUrl(value!),
      displayUrl: getDisplayUrl(value!),
      ...socialMediaConfig[key as keyof typeof socialMediaConfig]
    })) : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Debug info - remove in production */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
          <div className="flex justify-between">
            <span>🔄 SSG + On-demand Revalidation Active</span>
            <span>ID: {params.id}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
            <h1 className="text-3xl font-bold">{business.name}</h1>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-6">
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

                <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Холбоо барих</h3>
                  
                  <div className="space-y-3">
                    {business.phone && (
                      <div className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="font-medium">{business.phone}</span>
                      </div>
                    )}

                    {business.email && (
                      <div className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{business.email}</span>
                      </div>
                    )}
                  </div>

                  {validLinks.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Холбоосууд</h4>
                      <div className="space-y-2">
                        {validLinks.map((link) => (
                          <a
                            key={link.key}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center ${link.color} transition-colors duration-200`}
                          >
                            <span className="mr-3">{link.icon}</span>
                            <span className="font-medium">{link.label}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {business.address && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-start text-gray-700">
                        <svg className="w-5 h-5 mr-3 text-gray-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <div>
                          <p className="font-medium text-gray-900">Хаяг</p>
                          <p className="text-sm mt-1">{business.address}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="space-y-6">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    {business.type}
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Ерөнхий мэдээлэл</h2>
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <p className="text-gray-700 leading-relaxed">
                        {business.description || 'Тайлбар оруулаагүй байна.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Ангилал</h3>
                      <p className="text-gray-900 font-medium">{business.category?.name}</p>
                    </div>
                  </div>

                  {business.address && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Байршил</h2>
                      <div className="bg-gray-100 rounded-lg border border-gray-200 p-6 h-64 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <p>Газрын зураг</p>
                          <p className="text-sm mt-1">{business.address}</p>
                        </div>
                      </div>
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