import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

  useEffect(() => {
    // Fetch user profile data to get contact information
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
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
        toast({
          title: "Error",
          description: "Failed to load contact information. Please update your profile.",
          variant: "destructive",
        });
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
    
    try {
      const response = await fetch('http://localhost:5000/api/items/lost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          timeLost: new Date(formData.timeLost)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to report lost item');
      }

      toast({
        title: "Success",
        description: "Lost item reported successfully!",
      });
      onSuccess();
      onBack();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to report lost item",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button onClick={onBack} variant="ghost" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Report Lost Item</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Lost Item Details</CardTitle>
            <CardDescription>Please provide as much detail as possible to help others identify your item</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., iPhone 12, Black Wallet"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => handleInputChange('category', value)} required>
                    <SelectTrigger>
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
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="locationLost">Location Lost</Label>
                  <Input
                    id="locationLost"
                    value={formData.locationLost}
                    onChange={(e) => handleInputChange('locationLost', e.target.value)}
                    placeholder="e.g., Campus Library, Main Street Park"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeLost">Date & Time Lost</Label>
                  <Input
                    id="timeLost"
                    type="datetime-local"
                    value={formData.timeLost}
                    onChange={(e) => handleInputChange('timeLost', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reward">Reward (Optional)</Label>
                <Input
                  id="reward"
                  value={formData.reward}
                  onChange={(e) => handleInputChange('reward', e.target.value)}
                  placeholder="e.g., $50, Coffee & gratitude"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onBack}>
                  Cancel
                </Button>
                <Button type="submit">
                  Report Lost Item
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
