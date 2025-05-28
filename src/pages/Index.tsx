
import React, { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Index: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl mb-6 border border-emerald-100">
            <img 
              src="/lovable-uploads/2748bf15-4308-48e5-ae2e-d5f095dfa1a4.png" 
              alt="Campus Binge Logo" 
              className="h-20 mx-auto mb-6"
            />
            <h1 className="text-4xl font-bold text-emerald-800 mb-2">CBCC</h1>
            <p className="text-emerald-600 text-lg font-medium">Campus Binge Command Center</p>
            <div className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mt-4 rounded-full"></div>
          </div>
        </div>

        {isLoginMode ? (
          <LoginForm onToggleMode={() => setIsLoginMode(false)} />
        ) : (
          <SignupForm onToggleMode={() => setIsLoginMode(true)} />
        )}
      </div>
    </div>
  );
};

export default Index;
