import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const ReportFoundItem = ({ onBack, onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    locationFound: '',
    timeFound: '',
    contactEmail: user?.email || '',
    contactPhone: user?.phoneNumber || '',
    securityQuestion: '',
    reward: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const categories = [
    'Electronics', 'Clothing', 'Jewelry', 'Books', 'Keys', 'Wallet/Purse',
    'Documents', 'Sports Equipment', 'Bags', 'Other'
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'timeFound') {
          // Convert the date to ISO string format
          formDataToSend.append(key, new Date(formData[key]).toISOString());
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add image if exists
      if (image) {
        formDataToSend.append('image', image);
      }

      const response = await fetch('http://localhost:5000/api/items/found', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to report found item');
      }

      toast({
        title: "Success",
        description: "Found item reported successfully!",
      });
      onSuccess();
      onBack();
    } catch (error) {
      console.error('Report Found Item Error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to report found item",
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
            <h1 className="text-3xl font-bold text-gray-900">Report Found Item</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Basic Information Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Tell us about the item you found</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., iPhone 12, Black Wallet"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
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
              <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detailed description including color, brand, model, condition..."
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Location & Time Card */}
        <Card>
          <CardHeader>
            <CardTitle>Location & Time</CardTitle>
            <CardDescription>When and where did you find the item?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="locationFound">Location Found <span className="text-red-500">*</span></Label>
              <Input
                id="locationFound"
                value={formData.locationFound}
                onChange={(e) => handleInputChange('locationFound', e.target.value)}
                placeholder="e.g., Campus Library, Main Street Park"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeFound">Date Found <span className="text-red-500">*</span></Label>
              {/* Assuming timeFound is a date input, adjust type as needed */}
              <Input
                id="timeFound"
                type="date"
                value={formData.timeFound}
                onChange={(e) => handleInputChange('timeFound', e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>How can we reach you if the item is claimed?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email Address <span className="text-red-500">*</span></Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone Number (Optional)</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </CardContent>
        </Card>

        {/* Photos Card */}
        <Card>
          <CardHeader>
            <CardTitle>Photos (Optional)</CardTitle>
            <CardDescription>Upload photos to help identify the item</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="image">Item Image</Label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image').click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
                {imagePreview && (
                  <div className="w-24 h-24 relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reward Card */}
        <Card>
          <CardHeader>
            <CardTitle>💰 Reward (Optional)</CardTitle>
            <CardDescription>Expected reward from the lost item user</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reward">Reward Amount</Label>
              <Input
                id="reward"
                type="text"
                value={formData.reward}
                onChange={(e) => handleInputChange('reward', e.target.value)}
                placeholder="e.g., $50, Negotiable"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Question Card */}
        <Card>
          <CardHeader>
            <CardTitle>Security Question</CardTitle>
            <CardDescription>Provide a question to help verify the owner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="space-y-2">
              <Label htmlFor="securityQuestion">Security Question <span className="text-red-500">*</span></Label>
              <Input
                id="securityQuestion"
                value={formData.securityQuestion}
                onChange={(e) => handleInputChange('securityQuestion', e.target.value)}
                placeholder="e.g., What is the item's serial number?"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button - Span across two columns on medium and larger screens */}
        <div className="md:col-span-2 flex justify-end space-x-4 mt-6">
          <Button type="submit">Report Found Item</Button>
          <Button type="button" variant="outline" onClick={onBack}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default ReportFoundItem;
