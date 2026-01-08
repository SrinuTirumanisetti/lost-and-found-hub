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
    <div className="min-h-screen bg-transparent">
      {/* Wrapper to match dashboard style if needed, or keeping it clean */}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6 hover:bg-white/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-red-500 to-rose-600 text-white p-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Search className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Report Lost Item</CardTitle>
                <CardDescription className="text-red-100 text-lg mt-1">
                  Help us help you find your lost belongings
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Basic Info Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b pb-2">
                  <FileText className="h-5 w-5 text-red-500" />
                  Item Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., iPhone 12, Black Wallet"
                      className="border-slate-200 focus:border-red-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select onValueChange={(value) => handleInputChange('category', value)} required>
                      <SelectTrigger className="border-slate-200 focus:ring-red-500">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Detailed description including color, brand, model, distinguishing features..."
                    className="min-h-[120px] border-slate-200 focus:border-red-500"
                    required
                  />
                </div>
              </div>

              {/* Location & Time Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b pb-2">
                  <MapPin className="h-5 w-5 text-red-500" />
                  When & Where
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="locationLost">Location Lost</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="locationLost"
                        value={formData.locationLost}
                        onChange={(e) => handleInputChange('locationLost', e.target.value)}
                        placeholder="e.g., Campus Library"
                        className="pl-10 border-slate-200 focus:border-red-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeLost">Date & Time</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="timeLost"
                        type="datetime-local"
                        value={formData.timeLost}
                        onChange={(e) => handleInputChange('timeLost', e.target.value)}
                        className="pl-10 border-slate-200 focus:border-red-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b pb-2">
                  <Tag className="h-5 w-5 text-red-500" />
                  Additional Info
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="reward">Reward Offered (Optional)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="reward"
                      value={formData.reward}
                      onChange={(e) => handleInputChange('reward', e.target.value)}
                      placeholder="e.g., $50, Coffee on me"
                      className="pl-10 border-slate-200 focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onBack} size="lg">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white min-w-[200px]"
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
