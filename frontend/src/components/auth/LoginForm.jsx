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
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/90 backdrop-blur-md">
        <CardHeader className="space-y-1 text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-xl p-8">
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription className="text-indigo-100">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="pl-10 border-slate-200 focus:border-indigo-500 transition-all duration-200 h-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 border-slate-200 focus:border-indigo-500 transition-all duration-200 h-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 transition-all duration-300 shadow-lg mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
        <CardFooter className="justify-center pb-8 bg-slate-50/50 rounded-b-xl">
          <p className="text-slate-600">
            Don't have an account?{' '}
            <button
              onClick={() => setShowLogin(false)}
              className="text-purple-600 font-bold hover:underline hover:text-purple-800 transition-colors"
            >
              Create one
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
