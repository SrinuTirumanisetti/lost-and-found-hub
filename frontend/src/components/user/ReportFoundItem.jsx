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
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" />
          
          <CardHeader className="p-8 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                <Package className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white">Report Found Item</CardTitle>
                <CardDescription className="text-neutral-400 text-lg mt-1">
                  Return a lost item to its owner
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Basic Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                  <FileText className="h-5 w-5 text-emerald-400" />
                  Item Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-neutral-300">Item Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Blue Umbrella"
                      className="bg-white/5 border-white/10 focus:border-emerald-400/50 focus:ring-emerald-400/20 text-white placeholder:text-neutral-600"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-neutral-300">Category</Label>
                    <Select onValueChange={(value) => handleInputChange('category', value)} required>
                      <SelectTrigger className="bg-white/5 border-white/10 focus:ring-emerald-400/20 text-white">
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
                    placeholder="Brief description..."
                    className="min-h-[100px] bg-white/5 border-white/10 focus:border-emerald-400/50 focus:ring-emerald-400/20 text-white placeholder:text-neutral-600"
                    required
                  />
                </div>
              </div>

              {/* Location & Time */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                  <MapPin className="h-5 w-5 text-emerald-400" />
                  Location & Time
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="locationFound" className="text-neutral-300">Location Found</Label>
                    <div className="relative group">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
                      <Input
                        id="locationFound"
                        value={formData.locationFound}
                        onChange={(e) => handleInputChange('locationFound', e.target.value)}
                        placeholder="e.g., Cafeteria"
                        className="pl-10 bg-white/5 border-white/10 focus:border-emerald-400/50 focus:ring-emerald-400/20 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeFound" className="text-neutral-300">Date & Time Found</Label>
                    <div className="relative group">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
                      <Input
                        id="timeFound"
                        type="datetime-local"
                        value={formData.timeFound}
                        onChange={(e) => handleInputChange('timeFound', e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 focus:border-emerald-400/50 focus:ring-emerald-400/20 text-white [color-scheme:dark]"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                  <Lock className="h-5 w-5 text-emerald-400" />
                  Verification
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="securityQuestion" className="text-neutral-300">Security Question/Detail (Crucial)</Label>
                  <Input
                    id="securityQuestion"
                    value={formData.securityQuestion}
                    onChange={(e) => handleInputChange('securityQuestion', e.target.value)}
                    placeholder="e.g., What is the wallpaper on the phone? (Answer only known to owner)"
                    className="bg-white/5 border-white/10 focus:border-emerald-400/50 focus:ring-emerald-400/20 text-white placeholder:text-neutral-600"
                    required
                  />
                  <p className="text-sm text-neutral-500">Ask a question that only the true owner would know the answer to.</p>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                <Button type="button" variant="ghost" onClick={onBack} size="lg" className="text-white hover:bg-white/10 hover:text-white">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 border-0 min-w-[200px]"
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
