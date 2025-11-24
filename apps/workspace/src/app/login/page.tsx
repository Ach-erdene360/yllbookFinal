'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
const SERVER_IP = process.env.NEXT_PUBLIC_SERVER_IP;
export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`http://${SERVER_IP}:3001/trpc/loginBusiness`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.result?.data) {
        localStorage.setItem('business', JSON.stringify(result.result.data));
        alert('Амжилттай нэвтэрлээ!');
        router.push('/profile');
      } else {
        alert('Нэвтрэх амжилтгүй: ' + (result.error?.message || 'Имэйл эсвэл нууц үг буруу'));
      }
    } catch (error) {
      alert('Алдаа гарлаа: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Нэвтрэх</h1>
            <p className="text-gray-600 mt-2">Байгууллагын бүртгэлдээ нэвтрэнэ үү</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Имэйл хаяг
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="example@company.mn"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Нууц үг
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Нууц үгээ оруулна уу"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Бүртгэлгүй юу?{' '}
              <a href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                Бүртгүүлэх
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}