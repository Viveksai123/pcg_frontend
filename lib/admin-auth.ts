/**
 * Admin Access Control Hook
 * Provides role-based access control for admin features
 */

import { useAuth } from './auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Admin email list - in production, this should come from the backend
// You can add your admin emails here
const ADMIN_EMAILS = [
  'admin@company.com',
  'admin@ptcg.com',
  'test@admin.com',  // Test admin account
  // Add your email below:
  // 'your-email@example.com',
];

export function useAdminAccess() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // HARDCODED ADMIN ACCESS - NO AUTHENTICATION REQUIRED
  // Always return admin access for testing/development
  const isAdmin = true; // Hardcoded to always allow access

  // Removed authentication check - direct access granted
  // useEffect(() => {
  //   if (!isLoading && isAuthenticated && !isAdmin) {
  //     router.push('/dashboard');
  //   }
  // }, [isAdmin, isAuthenticated, isLoading, router]);

  return {
    isAdmin: true,
    isLoading: false,
    hasAccess: true, // Always grant access
  };
}

/**
 * Admin role checker - server-side ready
 * When backend implements roles, update this function
 */
export function checkAdminRole(user: any): boolean {
  if (!user) return false;

  // Method 1: Check by email (current)
  if (ADMIN_EMAILS.includes(user.email)) {
    return true;
  }

  // Method 2: Check by role field (uncomment when backend supports it)
  // if (user.role === 'admin' || user.role === 'administrator') {
  //   return true;
  // }

  // Method 3: Check by permissions array (uncomment when backend supports it)
  // if (user.permissions && user.permissions.includes('admin_access')) {
  //   return true;
  // }

  return false;
}

/**
 * HOC to protect admin routes
 * Usage: export default withAdminAuth(YourComponent);
 */
export function withAdminAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function AdminProtectedComponent(props: P) {
    const { hasAccess, isLoading } = useAdminAccess();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="animate-spin">
            <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-600 rounded-full" />
          </div>
        </div>
      );
    }

    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-slate-400">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
