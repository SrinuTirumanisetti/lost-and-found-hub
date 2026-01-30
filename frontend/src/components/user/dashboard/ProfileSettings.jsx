import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Shield, Calendar, Clock, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ProfileSettings = () => {
  const { user, login } = useAuth(); // login function can be used to update user context if needed
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    role: '',
    createdAt: '',
    updatedAt: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFormData({
            name: data.name || '',
            email: data.email || '',
            phoneNumber: data.phoneNumber || '',
            role: data.role || 'USER',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        // Optionally update global auth context if needed
        // if (login) login(data.user, token); 
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-yellow-400/20 rounded-xl border border-yellow-400/20">
          <User className="h-6 w-6 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
          <p className="text-neutral-400">Manage your account information and preferences</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Personal Information Card */}
          <Card className="border border-white/10 shadow-xl bg-black/40 backdrop-blur-xl">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-white">Personal Information</CardTitle>
              <CardDescription className="text-neutral-400">Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-neutral-300">Full Name</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-3 h-4 w-4 text-neutral-500 group-focus-within:text-yellow-400 transition-colors" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10 bg-white/5 border-white/10 focus:border-yellow-400/50 focus:ring-yellow-400/20 text-white placeholder:text-neutral-600 h-11 transition-all"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-neutral-300">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-500 group-focus-within:text-yellow-400 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 bg-white/5 border-white/10 focus:border-yellow-400/50 focus:ring-yellow-400/20 text-white placeholder:text-neutral-600 h-11 transition-all"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-neutral-300">Phone Number</Label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-neutral-500 group-focus-within:text-yellow-400 transition-colors" />
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="pl-10 bg-white/5 border-white/10 focus:border-yellow-400/50 focus:ring-yellow-400/20 text-white placeholder:text-neutral-600 h-11 transition-all"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold shadow-lg shadow-yellow-400/20"
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Details Card */}
          <Card className="border border-white/10 shadow-xl bg-black/40 backdrop-blur-xl">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-white">Account Information</CardTitle>
              <CardDescription className="text-neutral-400">Read-only account details.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-neutral-400 text-sm mb-1">
                  <Shield className="h-4 w-4" />
                  <span>Role</span>
                </div>
                <p className="text-lg font-semibold text-white uppercase tracking-wider">{formData.role}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-neutral-400 text-sm mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Member Since</span>
                </div>
                <p className="text-lg font-semibold text-white">{formatDate(formData.createdAt)}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-neutral-400 text-sm mb-1">
                  <Clock className="h-4 w-4" />
                  <span>Last Updated</span>
                </div>
                <p className="text-lg font-semibold text-white">{formatDate(formData.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
