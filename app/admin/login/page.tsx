'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Shield, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [formError, setFormError] = useState<string>('');
  const [formData, setFormData] = useState({
    email: 'admin@gmail.com',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.email || !formData.password) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      console.log('[Admin Login] Attempting login...');
      await login(formData.email, formData.password);
      
      // Check if token was stored
      const token = localStorage.getItem('authToken');
      console.log('[Admin Login] Token stored:', !!token);
      
      if (token) {
        console.log('[Admin Login] Login successful, redirecting to admin dashboard');
        router.push('/admin');
      } else {
        throw new Error('Authentication token not received');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      console.error('[Admin Login] Error:', errorMessage);
      setFormError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 px-4">
      <Card className="w-full max-w-md p-8 border-orange-200 bg-white shadow-xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full">
              <Shield size={48} className="text-amber-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent mb-2">
            Admin Portal
          </h1>
          <p className="text-amber-700">Sign in to access the admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-amber-900 mb-2">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className="bg-white border-orange-200 text-amber-900 placeholder-amber-400 focus:border-amber-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-amber-900 mb-2">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className="bg-white border-orange-200 text-amber-900 placeholder-amber-400 focus:border-amber-500"
            />
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Login Failed</p>
                <p className="text-sm">{formError}</p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium py-2 shadow-md"
          >
            {isLoading ? 'Signing in...' : 'Sign In to Admin Portal'}
          </Button>
        </form>

        <div className="border-t border-orange-200 pt-4">
          <p className="text-center text-amber-700 text-sm">
            <Link href="/login" className="text-amber-600 hover:text-amber-800 font-medium">
              ← Back to regular login
            </Link>
          </p>
        </div>

        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800">
            <strong>Admin Credentials:</strong> Use <code className="bg-amber-100 px-1 rounded">admin@gmail.com</code> 
            with password <code className="bg-amber-100 px-1 rounded">admin123</code>
          </p>
        </div>
      </Card>
    </div>
  );
}
