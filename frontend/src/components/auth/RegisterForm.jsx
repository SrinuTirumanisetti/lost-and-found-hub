import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { UserPlus, Mail, Phone, Lock, User } from 'lucide-react';

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
        confirmPassword: formData.confirmPassword, // Included for symmetry/backend validation if needed
        phoneNumber: formData.phoneNumber,
      });

      if (result.success) {
        toast({
          title: "Registration Successful!",
          description: "Welcome aboard! Please login with your new account.",
          variant: "default", // Success uses default or custom success variant
          className: "bg-green-100 border-green-500 text-green-900"
        });
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
          title: "Registration Failed",
          description: Array.isArray(result.error)
            ? result.error.join(', ')
            : result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] relative">
      {/* Dynamic Background Effects - Fixed to viewport to cover everything */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse delay-2000" />
      </div>

      <Card className="w-full max-w-md border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl text-white relative z-10 overflow-hidden">
        {/* Card Decorative Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-400" />

        <CardHeader className="space-y-1 text-center pt-8 pb-4">
          <div className="mx-auto w-12 h-12 bg-yellow-400 rotate-3 flex items-center justify-center shadow-lg shadow-yellow-400/20 rounded-xl mb-4 group hover:rotate-6 transition-transform">
             <span className="text-[10px] font-black text-black -rotate-3 text-center leading-tight tracking-tighter">LOST<br/>&FOUND</span>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Create Account</CardTitle>
          <CardDescription className="text-neutral-400">
            Join the community to report and find items
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-4 pt-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-neutral-300">Full Name</Label>
              <div className="relative group">
                <User className="absolute left-3 top-3 h-4 w-4 text-neutral-500 group-focus-within:text-yellow-400 transition-colors" />
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  className="pl-10 bg-white/5 border-white/10 focus:border-yellow-400/50 focus:ring-yellow-400/20 text-white placeholder:text-neutral-600 transition-all duration-300 h-11"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-300">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-500 group-focus-within:text-yellow-400 transition-colors" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  className="pl-10 bg-white/5 border-white/10 focus:border-yellow-400/50 focus:ring-yellow-400/20 text-white placeholder:text-neutral-600 transition-all duration-300 h-11"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-neutral-300">Phone Number</Label>
              <div className="relative group">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-neutral-500 group-focus-within:text-yellow-400 transition-colors" />
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="1234567890"
                  className="pl-10 bg-white/5 border-white/10 focus:border-yellow-400/50 focus:ring-yellow-400/20 text-white placeholder:text-neutral-600 transition-all duration-300 h-11"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-neutral-300">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-500 group-focus-within:text-yellow-400 transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 bg-white/5 border-white/10 focus:border-yellow-400/50 focus:ring-yellow-400/20 text-white placeholder:text-neutral-600 transition-all duration-300 h-11"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-neutral-300">Confirm Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-500 group-focus-within:text-yellow-400 transition-colors" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 bg-white/5 border-white/10 focus:border-yellow-400/50 focus:ring-yellow-400/20 text-white placeholder:text-neutral-600 transition-all duration-300 h-11"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-6 text-lg transition-all duration-300 shadow-lg shadow-yellow-400/20 mt-4 rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Register
                </div>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center pb-8 pt-0">
          <p className="text-neutral-400 text-sm">
            Already have an account?{' '}
            <button
              onClick={() => setShowLogin(true)}
              className="text-yellow-400 font-bold hover:underline hover:text-yellow-300 transition-colors"
            >
              Sign in
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
