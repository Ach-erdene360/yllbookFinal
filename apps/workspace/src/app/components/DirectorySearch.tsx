// 'use client';

// import { useState, useEffect } from 'react';

// interface Category {
//   id: number;
//   name: string;
//   entries: any[];
// }

// interface Entry {
//   id: number;
//   name: string;
//   phone?: string;
//   email?: string;
//   address?: string;
//   website?: string;
//   description?: string;
//   type: string;
//   category: Category;
// }

// export default function DirectorySearch() {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [results, setResults] = useState<Entry[]>([]);
//   const [loading, setLoading] = useState(false);

//   // Ангилалууд авах
//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       const response = await fetch('http://localhost:3000/categories');
//       const data = await response.json();
//       setCategories(data);
//     } catch (error) {
//       console.error('Ангилал авахад алдаа гарлаа:', error);
//     }
//   };

//   // Хайлт хийх
//   const handleSearch = async () => {
//     if (!searchTerm && !selectedCategory) return;

//     setLoading(true);
//     try {
//       const params = new URLSearchParams();
//       if (searchTerm) params.append('q', searchTerm);
//       if (selectedCategory) params.append('category', selectedCategory);

//       const response = await fetch(`http://localhost:3000/search?${params}`);
//       const data = await response.json();
//       setResults(data);
//     } catch (error) {
//       console.error('Хайлтын алдаа:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto">
//       {/* Хайлтын хэсэг */}
//       <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {/* Хайлтын талбар */}
//           <div className="md:col-span-2">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Нэр, хаяг, тайлбар хайх..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
//                 onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
//               />
//             </div>
//           </div>

//           {/* Ангилал сонгох */}
//           <div>
//             <select
//               value={selectedCategory}
//               onChange={(e) => setSelectedCategory(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
//             >
//               <option value="">Бүх ангилал</option>
//               {categories.map((category) => (
//                 <option key={category.id} value={category.id}>
//                   {category.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <button
//           onClick={handleSearch}
//           disabled={loading}
//           className="mt-4 w-full bg-yellow-500 text-white py-3 px-6 rounded-lg hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50"
//         >
//           {loading ? 'Хайж байна...' : 'Хайх'}
//         </button>
//       </div>

//       {/* Үр дүн */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {results.map((entry) => (
//           <div key={entry.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
//             <h3 className="font-semibold text-lg text-gray-900 mb-3">{entry.name}</h3>

//             <div className="space-y-2">
//               {entry.phone && (
//                 <div className="flex items-center text-gray-600">
//                   <a href={`tel:${entry.phone}`} className="hover:text-yellow-600">
//                      {entry.phone}
//                   </a>
//                 </div>
//               )}

//               {entry.email && (
//                 <div className="flex items-center text-gray-600">
//                   <a href={`mailto:${entry.email}`} className="hover:text-yellow-600 truncate">
//                     ✉️ {entry.email}
//                   </a>
//                 </div>
//               )}

//               {entry.address && (
//                 <div className="flex items-start text-gray-600">
//                   <span className="text-sm"> {entry.address}</span>
//                 </div>
//               )}

//               {entry.website && (
//                 <div className="flex items-center text-gray-600">
//                   <a 
//                     href={entry.website} 
//                     target="_blank" 
//                     rel="noopener noreferrer"
//                     className="hover:text-yellow-600 truncate text-sm"
//                   >
//                      Цахим хуудас
//                   </a>
//                 </div>
//               )}
//             </div>

//             <div className="mt-4 pt-3 border-t border-gray-100">
//               <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
//                 {entry.category.name}
//               </span>
//             </div>
//           </div>
//         ))}
//       </div>

//       {results.length === 0 && !loading && (
//         <div className="text-center py-12">
//           <p className="text-gray-500">Хайлтын үр дүн олдсонгүй</p>
//         </div>
//       )}
//     </div>
//   );
// }