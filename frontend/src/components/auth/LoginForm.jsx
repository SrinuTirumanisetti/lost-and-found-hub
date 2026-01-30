import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LogIn, Mail, Lock } from 'lucide-react';

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
          title: "Welcome Back!",
          description: "Logged in successfully",
          className: "bg-green-100 border-green-500 text-green-900"
        });
      } else {
        toast({
          title: "Login Failed",
          description: result.error || "Please check your credentials and try again",
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
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-purple-500 to-blue-500" />
        
        <CardHeader className="space-y-1 text-center pt-8 pb-4">
          <div className="mx-auto w-12 h-12 bg-yellow-400 rotate-3 flex items-center justify-center shadow-lg shadow-yellow-400/20 rounded-xl mb-4 group hover:rotate-6 transition-transform">
             <span className="text-[10px] font-black text-black -rotate-3 text-center leading-tight tracking-tighter">LOST<br/>&FOUND</span>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Welcome Back</CardTitle>
          <CardDescription className="text-neutral-400">
            Sign in to access the portal
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6 pt-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-300">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-500 group-focus-within:text-yellow-400 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="pl-10 bg-white/5 border-white/10 focus:border-yellow-400/50 focus:ring-yellow-400/20 text-white placeholder:text-neutral-600 transition-all duration-300 h-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-neutral-300">Password</Label>
                <a href="#" className="text-xs text-yellow-400 hover:text-yellow-300 hover:underline">Forgot password?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-500 group-focus-within:text-yellow-400 transition-colors" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 bg-white/5 border-white/10 focus:border-yellow-400/50 focus:ring-yellow-400/20 text-white placeholder:text-neutral-600 transition-all duration-300 h-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  Signing In...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="h-5 w-5" />
                  Sign In
                </div>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center pb-8 pt-0">
          <p className="text-neutral-400 text-sm">
            Don't have an account?{' '}
            <button
              onClick={() => setShowLogin(false)}
              className="text-yellow-400 font-bold hover:underline hover:text-yellow-300 transition-colors"
            >
              Create one
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
