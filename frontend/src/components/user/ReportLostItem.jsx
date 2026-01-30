import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, MapPin, Calendar, Clock, DollarSign, Tag, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ReportLostItem = ({ onBack, onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    locationLost: '',
    timeLost: '',
    contactEmail: '',
    contactPhone: '',
    reward: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast({
            title: "Error",
            description: "Authentication required to fetch profile.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const userData = await response.json();
        setFormData(prev => ({
          ...prev,
          contactEmail: userData.email || '',
          contactPhone: userData.phoneNumber || ''
        }));
      } catch (error) {
        // Silent fail for profile fetch, user can manually check if needed, 
        // but typically this just pre-fills.
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [toast]);

  const categories = [
    'Electronics', 'Clothing', 'Jewelry', 'Books', 'Keys', 'Wallet/Purse',
    'Documents', 'Sports Equipment', 'Bags', 'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required to report item.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/items/lost`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          description: formData.description,
          locationLost: formData.locationLost,
          timeLost: formData.timeLost,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          reward: formData.reward
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to report lost item');
      }

      toast({
        title: "Success",
        description: "Lost item reported successfully!",
        className: "bg-green-100 border-green-500 text-green-900"
      });
      onSuccess();
      onBack();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to report lost item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden font-sans selection:bg-yellow-500/30">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse delay-2000" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6 text-neutral-400 hover:text-white hover:bg-white/5"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl text-white overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-orange-500" />
          
          <CardHeader className="p-8 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 shadow-lg shadow-red-500/10">
                <Search className="h-8 w-8 text-red-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white">Report Lost Item</CardTitle>
                <CardDescription className="text-neutral-400 text-lg mt-1">
                  Help us help you find your lost belongings
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Basic Info Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                  <FileText className="h-5 w-5 text-red-400" />
                  Item Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-neutral-300">Item Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., iPhone 12, Black Wallet"
                      className="bg-white/5 border-white/10 focus:border-red-400/50 focus:ring-red-400/20 text-white placeholder:text-neutral-600"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-neutral-300">Category</Label>
                    <Select onValueChange={(value) => handleInputChange('category', value)} required>
                      <SelectTrigger className="bg-white/5 border-white/10 focus:ring-red-400/20 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-900 border-white/10 text-white">
                        {categories.map(category => (
                          <SelectItem key={category} value={category} className="focus:bg-white/10 focus:text-white">{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-neutral-300">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Detailed description including color, brand, model, distinguishing features..."
                    className="min-h-[120px] bg-white/5 border-white/10 focus:border-red-400/50 focus:ring-red-400/20 text-white placeholder:text-neutral-600"
                    required
                  />
                </div>
              </div>

              {/* Location & Time Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                  <MapPin className="h-5 w-5 text-red-400" />
                  When & Where
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="locationLost" className="text-neutral-300">Location Lost</Label>
                    <div className="relative group">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-neutral-500 group-focus-within:text-red-400 transition-colors" />
                      <Input
                        id="locationLost"
                        value={formData.locationLost}
                        onChange={(e) => handleInputChange('locationLost', e.target.value)}
                        placeholder="e.g., Campus Library"
                        className="pl-10 bg-white/5 border-white/10 focus:border-red-400/50 focus:ring-red-400/20 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeLost" className="text-neutral-300">Date & Time</Label>
                    <div className="relative group">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-neutral-500 group-focus-within:text-red-400 transition-colors" />
                      <Input
                        id="timeLost"
                        type="datetime-local"
                        value={formData.timeLost}
                        onChange={(e) => handleInputChange('timeLost', e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 focus:border-red-400/50 focus:ring-red-400/20 text-white [color-scheme:dark]"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                  <Tag className="h-5 w-5 text-red-400" />
                  Additional Info
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="reward" className="text-neutral-300">Reward Offered (Optional)</Label>
                  <div className="relative group">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-neutral-500 group-focus-within:text-red-400 transition-colors" />
                    <Input
                      id="reward"
                      value={formData.reward}
                      onChange={(e) => handleInputChange('reward', e.target.value)}
                      placeholder="e.g., $50, Coffee on me"
                      className="pl-10 bg-white/5 border-white/10 focus:border-red-400/50 focus:ring-red-400/20 text-white placeholder:text-neutral-600"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                <Button type="button" variant="ghost" onClick={onBack} size="lg" className="text-white hover:bg-white/10 hover:text-white">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 border-0 min-w-[200px]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Reporting...' : 'Report Lost Item'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportLostItem;
