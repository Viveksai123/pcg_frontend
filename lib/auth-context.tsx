'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthResponse } from './types';
import { apiClient } from './api';
import { API_ENDPOINTS, API_BASE_URL } from './config';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        apiClient.setToken(token);
        try {
          const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.PROFILE);
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            localStorage.removeItem('authToken');
          }
        } catch (err) {
          console.error('Auth check failed:', err);
          localStorage.removeItem('authToken');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('[Auth] Attempting login with email:', email);
      console.log('[Auth] Sending POST to:', `${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`);
      
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        { email, password }
      );

      console.log('[Auth] Login response:', response);

      if (response.success && response.data) {
        const token = response.data.token;
        const user = response.data.user;
        
        // Store token in both apiClient and localStorage
        apiClient.setToken(token);
        localStorage.setItem('authToken', token);
        
        // Set user state
        setUser(user);
        
        console.log('[Auth] Login successful, token stored:', token.substring(0, 20) + '...');
      } else {
        const errorMsg = response.error || response.message || 'Login failed';
        console.error('[Auth] Login failed - response:', response);
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      console.error('[Auth] Login exception:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.SIGNUP,
        { email, password, firstName: name }
      );

      if (response.success && response.data) {
        apiClient.setToken(response.data.token);
        setUser(response.data.user);
      } else {
        setError(response.error || 'Signup failed');
        throw new Error(response.error || 'Signup failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (idToken: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('[Auth] Sending Google login request to:', API_ENDPOINTS.AUTH.GOOGLE_LOGIN);
      const rawResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.GOOGLE_LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });
      
      const responseData = await rawResponse.json();
      console.log('[Auth] Google login raw response:', responseData);

      // Handle both formats: ApiResponse and backend's raw format
      let token: string | null = null;
      let user: User | null = null;

      if (responseData.success && responseData.data) {
        // Standard ApiResponse format
        token = responseData.data.token;
        user = responseData.data.user;
      } else if (responseData.token && responseData.userId) {
        // Backend's raw format - need to fetch user profile using the token
        token = responseData.token as string;
        console.log('[Auth] Got token from raw response, fetching user profile...');
        
        // Set token temporarily to fetch profile
        if (token) {
          apiClient.setToken(token);
        }
        try {
          // Directly fetch to see raw response
          const profileRawResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.PROFILE}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token || ''}`,
            },
          });
          
          console.log('[Auth] Profile response status:', profileRawResponse.status);
          const profileData = await profileRawResponse.json();
          console.log('[Auth] Profile raw response data:', profileData);

          if (profileRawResponse.ok && profileData.success && profileData.data) {
            user = profileData.data;
          } else if (profileRawResponse.ok && profileData.data && typeof profileData.data === 'object' && 'email' in profileData.data) {
            // Handle case where backend returns user object directly in data
            user = profileData.data as User;
          } else if (profileRawResponse.ok && typeof profileData === 'object' && '_id' in profileData && 'email' in profileData) {
            // Handle backend's raw format with _id, firstName, etc.
            user = {
              id: profileData._id,
              email: profileData.email,
              name: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim(),
              avatar: profileData.avatar,
              googleId: profileData.googleId,
              createdAt: profileData.createdAt,
              updatedAt: profileData.updatedAt,
            } as User;
          } else if (profileRawResponse.ok && typeof profileData === 'object' && 'email' in profileData && 'id' in profileData) {
            // Handle case where backend returns user object directly
            user = profileData as User;
          } else {
            console.error('[Auth] Unexpected profile response format:', profileData);
            throw new Error('Invalid profile response format');
          }
        } catch (profileErr) {
          console.error('[Auth] Profile fetch error:', profileErr);
          apiClient.clearToken();
          throw profileErr;
        }
      } else {
        throw new Error('Invalid response format from server');
      }

      if (token && user) {
        console.log('[Auth] Response successful, setting user:', user);
        apiClient.setToken(token);
        setUser(user);
      } else {
        throw new Error('Missing token or user data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google login failed';
      console.error('[Auth] Google login exception:', errorMessage, err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {});
      apiClient.clearToken();
      setUser(null);
      localStorage.removeItem('authToken');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        googleLogin,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
