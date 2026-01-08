import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Package, MapPin, Calendar, Lock, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ReportFoundItem = ({ onBack, onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    locationFound: '',
    timeFound: '',
    contactEmail: '',
    contactPhone: '',
    securityQuestion: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch user profile data to get contact information
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setFormData(prev => ({
            ...prev,
            contactEmail: userData.email || '',
            contactPhone: userData.phoneNumber || ''
          }));
        }
      } catch (error) {
        console.error("Failed to pre-fill user data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

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
          description: "Authentication required.",
          variant: "destructive",
        });
        return;
      }

      // Found Item uses JSON body as per backend route
      const response = await fetch(`${API_BASE_URL}/api/items/found`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          description: formData.description,
          locationFound: formData.locationFound,
          timeFound: formData.timeFound,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          securityQuestion: formData.securityQuestion
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to report found item');
      }

      toast({
        title: "Success! 🌟",
        description: "Thank you for reporting a found item.",
        className: "bg-green-100 border-green-500 text-green-900"
      });
      onSuccess();
      onBack();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to report item",
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
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Report Found Item</CardTitle>
                <CardDescription className="text-emerald-100 text-lg mt-1">
                  Return a lost item to its owner
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Basic Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b pb-2">
                  <FileText className="h-5 w-5 text-emerald-500" />
                  Item Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Blue Umbrella"
                      className="border-slate-200 focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select onValueChange={(value) => handleInputChange('category', value)} required>
                      <SelectTrigger className="border-slate-200 focus:ring-emerald-500">
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
                    placeholder="Brief description..."
                    className="min-h-[100px] border-slate-200 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Location & Time */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b pb-2">
                  <MapPin className="h-5 w-5 text-emerald-500" />
                  Location & Time
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="locationFound">Location Found</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="locationFound"
                        value={formData.locationFound}
                        onChange={(e) => handleInputChange('locationFound', e.target.value)}
                        placeholder="e.g., Cafeteria"
                        className="pl-10 border-slate-200 focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeFound">Date & Time Found</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="timeFound"
                        type="datetime-local"
                        value={formData.timeFound}
                        onChange={(e) => handleInputChange('timeFound', e.target.value)}
                        className="pl-10 border-slate-200 focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b pb-2">
                  <Lock className="h-5 w-5 text-emerald-500" />
                  Verification
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="securityQuestion">Security Question/Detail (Crucial)</Label>
                  <Input
                    id="securityQuestion"
                    value={formData.securityQuestion}
                    onChange={(e) => handleInputChange('securityQuestion', e.target.value)}
                    placeholder="e.g., What is the wallpaper on the phone? (Answer only known to owner)"
                    className="border-slate-200 focus:border-emerald-500"
                    required
                  />
                  <p className="text-sm text-slate-500">Ask a question that only the true owner would know the answer to.</p>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onBack} size="lg">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white min-w-[200px]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Submitting...' : 'Report Found Item'}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportFoundItem;
