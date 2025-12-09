'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
interface Category {
  id: number;
  name: string;
}

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
  password?: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [business, setBusiness] = useState<Business | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    website: '',
    description: '',
    type: 'BUSINESS',
    categoryId: '',
    password: '',
    confirmPassword: '',
    image: ''
  });

  // Анхны өгөгдөл авах
  useEffect(() => {
    // localStorage-аас бизнес мэдээлэл авах
    const businessData = localStorage.getItem('business');
    if (!businessData) {
      router.push('/login');
      return;
    }

    const businessObj = JSON.parse(businessData);
    setBusiness(businessObj);
    
    // Form-д өгөгдөл оруулах
    setFormData({
      name: businessObj.name || '',
      phone: businessObj.phone || '',
      email: businessObj.email || '',
      address: businessObj.address || '',
      website: businessObj.website || '',
      description: businessObj.description || '',
      type: businessObj.type || 'BUSINESS',
      categoryId: businessObj.categoryId?.toString() || '',
      password: '',
      confirmPassword: '',
      image: businessObj.image || ''
    });

    // Категориуд авах
    fetch(`${API_URL}/trpc/getAllCategories`)
      .then(res => res.json())
      .then(data => setCategories(data.result.data || []));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Нууц үг шалгах
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('Нууц үг таарахгүй байна!');
      setLoading(false);
      return;
    }

    try {
      const updateData: any = {
        id: business?.id,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        website: formData.website,
        description: formData.description,
        type: formData.type,
        categoryId: Number(formData.categoryId),
        image: formData.image
      };

      // Зөвхөн нууц үг өөрчлөх бол оруулах
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`${API_URL}/trpc/updateBusiness`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (result.result?.data) {
        // Шинэчлэгдсэн мэдээллийг localStorage-д хадгалах
        localStorage.setItem('business', JSON.stringify(result.result.data));
        alert('Мэдээлэл амжилттай шинэчлэгдлээ!');
        router.push('/profile');
      } else {
        alert('Шинэчлэл амжилтгүй: ' + (result.error?.message || 'Алдаа гарлаа'));
      }
    } catch (error) {
      alert('Алдаа гарлаа: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!business) {
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Профайл засах</h1>
            <p className="text-gray-600 mt-2">Байгууллагын мэдээллээ шинэчлэнэ үү</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Үндсэн мэдээлэл */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Байгууллагын нэр *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Байгууллагын нэр"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Утасны дугаар
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="99999999"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Имэйл хаяг
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="example@company.mn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Байршил
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Улаанбаатар хот"
                />
              </div>
            </div>

            {/* Ангилал, төрөл */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ангилал *
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Ангилал сонгох</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Байгууллагын төрөл *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BUSINESS">Бизнес</option>
                  <option value="GOVERNMENT">Төрийн байгууллага</option>
                  <option value="NGO">ТББ</option>
                  <option value="EMBASSY">Элчин сайд</option>
                  <option value="CONSULATE">Консулын газар</option>
                  <option value="PROVINCE">Аймаг</option>
                  <option value="DISTRICT">Сум</option>
                </select>
              </div>
            </div>

            {/* Нэмэлт мэдээлэл */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Вэбсайт
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Зурагны линк
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Байгууллагын танилцуулга *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Байгууллагын талаар дэлгэрэнгүй танилцуулга..."
              />
            </div>

            {/* Нууц үг өөрчлөх (optional) */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Нууц үг өөрчлөх</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Шинэ нууц үг
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Шинэ нууц үг (заавал биш)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Шинэ нууц үг давтах
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Шинэ нууц үгээ давтах"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Нууц үг өөрчлөхгүй бол хоосон үлдээнэ үү</p>
            </div>

            <div className="flex items-center justify-between pt-6">
              <button
                type="button"
                onClick={() => router.push('/profile')}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Цуцлах
              </button>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/profile')}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Буцах
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Хадгалж байна...' : 'Хадгалах'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}