'use client';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Business {
  id: number;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  category?: string;
  image?: string;
  similarityScore: number;
}

interface SearchResult {
  answer: string;
  businesses: Business[];
  timestamp: string;
}

export default function AssistantPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/trpc/aiSearch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (data.result?.data) {
        setResult(data.result.data);
      } else {
        setError(data.error?.message || 'Хайлт амжилтгүй боллоо');
      }
    } catch (err) {
      setError('Алдаа гарлаа: ' + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
             AI Туслах
          </h1>
          <p className="text-gray-600">
            Монголын бизнесийн мэдээллийг хиймэл оюун ухаанаар хайна уу
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex gap-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Жишээ: Улаанбаатарт банк байна уу?"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? ' Хайж байна...' : ' Хайх'}
              </button>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <p className="font-medium mb-2">💡 Жишээ асуултууд:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Төв дүүрэгт ямар төрийн байгууллагууд байдаг вэ?</li>
                <li>Мэдээллийн технологийн компани хайж байна</li>
                <li>Элчин сайдын яамны холбоо барих утас хэд вэ?</li>
              </ul>
            </div>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800"> {error}</p>
          </div>
        )}

        {/* AI Answer */}
        {result && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xl">
                  
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    AI Хариулт
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {result.answer}
                  </p>
                </div>
              </div>
            </div>

            {/* Business Results */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">
                📋 Олдсон байгууллагууд ({result.businesses.length})
              </h3>
              
              <div className="space-y-4">
                {result.businesses.map((business, index) => (
                  <div
                    key={business.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex gap-4">
                      {business.image && (
                        <img
                          src={business.image}
                          alt={business.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {index + 1}. {business.name}
                            </h4>
                            <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded mt-1">
                              {business.category}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {(business.similarityScore * 100).toFixed(1)}% match
                          </span>
                        </div>
                        
                        {business.description && (
                          <p className="text-gray-600 text-sm mt-2">
                            {business.description}
                          </p>
                        )}
                        
                        <div className="mt-3 space-y-1 text-sm text-gray-500">
                          {business.address && (
                            <p>📍 {business.address}</p>
                          )}
                          {business.phone && (
                            <p>📞 {business.phone}</p>
                          )}
                          {business.email && (
                            <p>✉️ {business.email}</p>
                          )}
                          {business.website && (
                            <p>
                              🌐 <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {business.website}
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        {!result && !loading && (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-6xl mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              AI-тай хамтран хайлт хийх
            </h3>
            <p className="text-gray-600">
              Асуулт асууж, хамгийн тохиромжтой байгууллагуудыг олоорой
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
