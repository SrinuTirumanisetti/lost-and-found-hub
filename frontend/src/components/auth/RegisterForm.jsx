import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export function RegisterForm({ setShowLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Debug logs
    console.log('Password:', formData.password);
    console.log('Confirm Password:', formData.confirmPassword);
    console.log('Are passwords equal?', formData.password === formData.confirmPassword);

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phoneNumber: formData.phoneNumber,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Registration successful! Please login.",
        });
        // Clear form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phoneNumber: '',
        });
        setShowLogin(true);
      } else {
        toast({
          title: "Error",
          description: Array.isArray(result.error)
            ? (
                <ul>{result.error.map((err, idx) => <li key={idx}>{err}</li>)}</ul>
              )
            : (
                <ul>{result.error.split(',').map((err, idx) => <li key={idx}>{err.trim()}</li>)}</ul>
              ),
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
        <h2 className="text-4xl font-extrabold text-center mb-8 text-indigo-700 drop-shadow">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-base font-semibold text-indigo-800 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-2 border-indigo-300 bg-white shadow focus:border-pink-400 focus:ring-2 focus:ring-pink-200 text-lg py-2 px-4 transition-all duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-base font-semibold text-indigo-800 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-2 border-indigo-300 bg-white shadow focus:border-pink-400 focus:ring-2 focus:ring-pink-200 text-lg py-2 px-4 transition-all duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-base font-semibold text-indigo-800 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-2 border-indigo-300 bg-white shadow focus:border-pink-400 focus:ring-2 focus:ring-pink-200 text-lg py-2 px-4 transition-all duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-base font-semibold text-indigo-800 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-2 border-indigo-300 bg-white shadow focus:border-pink-400 focus:ring-2 focus:ring-pink-200 text-lg py-2 px-4 pr-10 transition-all duration-200"
                required
              />
              <span
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={0}
                role="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12.001C3.226 16.273 7.355 19.5 12 19.5c1.658 0 3.237-.335 4.646-.94m3.374-2.14A10.45 10.45 0 0022.066 12c-1.292-4.272-5.421-7.5-10.066-7.5-1.226 0-2.41.218-3.502.617m7.068 7.068a3 3 0 11-4.243-4.243m4.243 4.243L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c0-1.192.214-2.333.611-3.382C4.774 5.727 8.903 2.5 13.548 2.5c4.645 0 8.774 3.227 10.687 6.118.397 1.049.611 2.19.611 3.382s-.214 2.333-.611 3.382C22.322 18.273 18.193 21.5 13.548 21.5c-4.645 0-8.774-3.227-10.687-6.118A10.45 10.45 0 012.25 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </span>
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-base font-semibold text-indigo-800 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-2 border-indigo-300 bg-white shadow focus:border-pink-400 focus:ring-2 focus:ring-pink-200 text-lg py-2 px-4 pr-10 transition-all duration-200"
                required
              />
              <span
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                tabIndex={0}
                role="button"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12.001C3.226 16.273 7.355 19.5 12 19.5c1.658 0 3.237-.335 4.646-.94m3.374-2.14A10.45 10.45 0 0022.066 12c-1.292-4.272-5.421-7.5-10.066-7.5-1.226 0-2.41.218-3.502.617m7.068 7.068a3 3 0 11-4.243-4.243m4.243 4.243L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c0-1.192.214-2.333.611-3.382C4.774 5.727 8.903 2.5 13.548 2.5c4.645 0 8.774 3.227 10.687 6.118.397 1.049.611 2.19.611 3.382s-.214 2.333-.611 3.382C22.322 18.273 18.193 21.5 13.548 21.5c-4.645 0-8.774-3.227-10.687-6.118A10.45 10.45 0 012.25 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </span>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-8 border border-transparent rounded-lg shadow-md text-lg font-bold text-white bg-gradient-to-r from-indigo-500 via-pink-400 to-indigo-400 hover:from-pink-500 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-300 disabled:opacity-50 transition-all duration-200"
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div className="mt-6 text-center text-base text-indigo-700">
          Already have an account? {' '}
          <button type="button" onClick={() => setShowLogin(true)} className="font-bold text-pink-600 hover:text-indigo-500 transition-colors duration-200">
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
