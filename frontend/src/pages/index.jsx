import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import AdminDashboard from '@/components/admin/AdminDashboard';
import UserDashboard from '@/components/user/UserDashboard';
import { Toaster } from '@/components/ui/toaster';

const AppContent = () => {
  const { user, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-md mx-auto">
          {showLogin ? <LoginForm /> : <RegisterForm />}
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowLogin(!showLogin)}
              className="text-sm text-primary hover:underline"
            >
              {showLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />;
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
};

export default App;