import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function LoginForm({ setShowLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to login",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-10">
      <div className="bg-gradient-to-br from-indigo-100 via-white to-pink-100 rounded-2xl shadow-2xl p-12 border-4 border-indigo-200">
        <h2 className="text-4xl font-extrabold text-center mb-8 text-indigo-700 drop-shadow">Login</h2>
        <p className="mb-8 text-base text-indigo-700 text-center">Enter your credentials to access your account</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-base font-semibold text-indigo-800 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border-2 border-indigo-300 bg-white shadow focus:border-pink-400 focus:ring-2 focus:ring-pink-200 text-lg py-2 px-4 transition-all duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-base font-semibold text-indigo-800 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border-2 border-indigo-300 bg-white shadow focus:border-pink-400 focus:ring-2 focus:ring-pink-200 text-lg py-2 px-4 transition-all duration-200"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-8 border border-transparent rounded-lg shadow-md text-lg font-bold text-white bg-gradient-to-r from-indigo-500 via-pink-400 to-indigo-400 hover:from-pink-500 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-300 disabled:opacity-50 transition-all duration-200"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="mt-6 text-center text-base text-indigo-700">
          Don't have an account? <button type="button" onClick={() => setShowLogin(false)} className="font-bold text-pink-600 hover:text-indigo-500 transition-colors duration-200">Register</button>
        </div>
      </div>
    </div>
  );
}
