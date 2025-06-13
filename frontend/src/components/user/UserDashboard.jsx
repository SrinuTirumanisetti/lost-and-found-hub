import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Package, CheckCircle, AlertCircle, Filter, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ReportLostItem from './ReportLostItem';
import ReportFoundItem from './ReportFoundItem';
import ClaimModal from './ClaimModal';
import { useToast } from '@/hooks/use-toast';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaLink } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Add safe getter utility function
const safeGet = (obj, path, def = undefined) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) ?? def;
};

// Add fetchWithAuth utility function
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }

  return response;
};

// Helper to robustly extract userId
const getUserId = (val) => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val._id) return val._id;
  return '';
};

const UserDashboard = () => {
  const { logout, user } = useAuth();
  const [showReportLost, setShowReportLost] = useState(false);
  const [showReportFound, setShowReportFound] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedFoundItem, setSelectedFoundItem] = useState(null);
  const [userLostItems, setUserLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [successfulReturns, setSuccessfulReturns] = useState([]);
  const [userItems, setUserItems] = useState({
    lostItems: [],
    foundItems: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [userClaims, setUserClaims] = useState({
    submittedClaims: [],
    receivedClaims: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [filteredFoundItems, setFilteredFoundItems] = useState([]);
  const [trendingCategories, setTrendingCategories] = useState([]);

  const [activeSection, setActiveSection] = useState(null); // Change initial state to null

  // Add categories array
  const categories = [
    'Electronics',
    'Clothing',
    'Books',
    'Jewelry',
    'Accessories',
    'Documents',
    'Other'
  ];

  const fetchUserItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const userItemsResponse = await fetchWithAuth(`${API_BASE_URL}/api/user/items`);
      const userItemsData = await userItemsResponse.json();
      setUserItems(userItemsData);
      setUserLostItems(userItemsData.lostItems || []); // Ensure it's an array
      setSuccessfulReturns(userItemsData.successfulReturns || []); // Ensure it's an array
      
      // Fetch all found items for browsing (public route)
      const foundItemsResponse = await fetchWithAuth(`${API_BASE_URL}/api/items/found`);

      if (!foundItemsResponse.ok) {
        throw new Error('Failed to fetch found items');
      }

      const foundItemsData = await foundItemsResponse.json();
      setFoundItems(foundItemsData || []); // Ensure it's an array

    } catch (error) {
      console.error('Fetch user data error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load user data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchUserClaims = async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/items/claims`);

      if (!response.ok) {
        throw new Error('Failed to fetch claims');
      }

      const data = await response.json();
      console.log('Claims data received:', data); // Debug log

      setUserClaims({
        submittedClaims: data.submittedClaims || [],
        receivedClaims: data.receivedClaims || []
      });

    } catch (error) {
      console.error('Fetch claims error:', error);
      toast({
        title: "Error",
        description: "Failed to load claims",
        variant: "destructive",
      });
    }
  };

  const fetchTrendingCategories = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/items/stats/trending-categories`);

      if (!response.ok) {
        throw new Error('Failed to fetch trending categories');
      }

      const data = await response.json();
      setTrendingCategories(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load trending categories",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleClaim = (foundItem) => {
    setSelectedFoundItem(foundItem);
    setShowClaimModal(true);
  };

  const handleClaimSubmit = async (itemId, reason, answer) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/items/${itemId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason,
          answer
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit claim');
      }

      toast({
        title: "Success",
        description: "Claim submitted successfully",
      });

      setShowClaimModal(false);
      setSelectedFoundItem(null);
      fetchUserItems(); // Refresh items to update claim status display
      fetchUserClaims(); // Refresh claims to show submitted claim
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit claim",
        variant: "destructive",
      });
    }
  };

  const handleClaimResponse = async (itemId, claimId, status, responseMessage) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/items/claims/${claimId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, responseMessage })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to respond to claim');
      }

      toast({
        title: "Success",
        description: `Claim ${status} successfully`,
      });

      fetchUserItems(); // Refresh items to update status if claim was approved
      fetchUserClaims(); // Refresh claims list
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to respond to claim",
        variant: "destructive",
      });
    }
  };

  // Add function to check if item was reported by current user
  const isItemReportedByUser = (item) => {
    return item.reportedBy === user?._id;
  };

  // Handle updating lost item status
  const handleUpdateLostItemStatus = async (itemId, isClaimed) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/user/items/lost/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isClaimed })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update item status');
      }

      toast({
        title: "Success",
        description: "Lost item marked as found successfully",
      });

      fetchUserItems(); // Refresh the user's items list

    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update item status",
        variant: "destructive",
      });
    }
  };

  if (showReportLost) {
    return <ReportLostItem onBack={() => setShowReportLost(false)} onSuccess={fetchUserItems} />;
  }

  if (showReportFound) {
    return <ReportFoundItem onBack={() => setShowReportFound(false)} onSuccess={fetchUserItems} />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const sections = [
    { value: 'lost', title: 'My Lost Items', description: 'Items you\'ve reported as lost' },
    { value: 'found', title: 'Browse Found Items', description: 'Items others have found - claim if yours' },
    { value: 'my-found', title: 'My Reported Found Items', description: 'Items you have reported as found' },
    { value: 'claims', title: 'My Claims', description: 'Track the status of your claims' },
    { value: 'received-claims', title: 'Received Claims', description: 'Review claims on items you\'ve found' },
    { value: 'returns', title: 'Successful Returns', description: 'Items that have been successfully returned' },
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <div className="flex items-center">
                <h1 className="text-3xl font-bold text-gray-900 mr-2">Lost & Found Hub</h1>
                <Search className="h-8 w-8 text-gray-700" />
              </div>
              <p className="text-gray-600">Welcome, {user?.name}</p>
            </div>
            <Button onClick={logout} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700">
              <Users className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow hover:bg-red-50" onClick={() => setShowReportLost(true)}>
            <CardContent className="flex items-center p-6">
              <Search className="h-8 w-8 text-red-500 mr-4" />
              <div>
                <h3 className="font-medium">Report Lost Item</h3>
                <p className="text-sm text-gray-500">Lost something? Report it here</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow hover:bg-green-50" onClick={() => setShowReportFound(true)}>
            <CardContent className="flex items-center p-6">
              <Package className="h-8 w-8 text-green-500 mr-4" />
              <div>
                <h3 className="font-medium">Report Found Item</h3>
                <p className="text-sm text-gray-500">Found something? Help return it</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {sections.map(section => (
            <Card
              key={section.value}
              className={`cursor-pointer hover:shadow-lg transition-shadow text-white
                ${section.value === 'lost' && (activeSection === 'lost' ? 'bg-gradient-to-r from-red-400 to-pink-500 border-primary border-2' : 'bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600')}
                ${section.value === 'found' && (activeSection === 'found' ? 'bg-gradient-to-r from-green-400 to-green-600 border-primary border-2' : 'bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700')}
                ${section.value === 'my-found' && (activeSection === 'my-found' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 border-primary border-2' : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600')}
                ${section.value === 'claims' && (activeSection === 'claims' ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-primary border-2' : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700')}
                ${section.value === 'received-claims' && (activeSection === 'received-claims' ? 'bg-gradient-to-r from-red-400 to-pink-500 border-primary border-2' : 'bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600')}
                ${section.value === 'returns' && (activeSection === 'returns' ? 'bg-gradient-to-r from-green-400 to-green-600 border-primary border-2' : 'bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700')}
              `}
              onClick={() => setActiveSection(section.value)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{section.title}</CardTitle>
                <CardDescription className="text-gray-200">{section.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Section Content */}
        {
          activeSection === 'lost' && (
            <Card>
              <CardHeader>
                <CardTitle>My Lost Items</CardTitle>
                <CardDescription>Items you've reported as lost</CardDescription>
              </CardHeader>
              <CardContent>
                {userLostItems.length === 0 ? (
                  <p className="text-gray-500">You haven't reported any lost items yet.</p>
                ) : (
                  <div className="space-y-4">
                    {userLostItems.map(item => (
                      <div key={item._id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-500">{item.category}</p>
                          <p className="text-sm text-gray-500">Lost at: {item.locationLost}</p>
                          <p className="text-sm text-gray-500">Reward: {item.reward}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={item.isClaimed ? "default" : "secondary"}>
                            {item.isClaimed ? "Found" : "Still Lost"}
                          </Badge>
                          {!item.isClaimed && (
                            <Button
                              size="sm"
                              onClick={() => {
                                const updatedItems = userLostItems.map(lostItem => 
                                  lostItem._id === item._id ? { ...lostItem, isClaimed: true } : lostItem
                                );
                                setUserLostItems(updatedItems);
                                handleUpdateLostItemStatus(item._id, true); // Call API to update status
                              }}
                              variant="outline"
                            >
                              Mark as Found
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        }

        {
          activeSection === 'found' && (
            <Card>
              <CardHeader>
                <CardTitle>Found Items</CardTitle>
                <CardDescription>Items others have found - claim if yours</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filter Section */}
                <div className="space-y-4 mb-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by name, category, or location..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Date" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">Last 7 Days</SelectItem>
                          <SelectItem value="month">Last 30 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Results Count */}
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredFoundItems.length} of {foundItems.length} items
                  </p>
                </div>

                {/* Items List */}
                {filteredFoundItems.length === 0 ? (
                  <p className="text-gray-500">No items match your search criteria.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFoundItems.map(founditems => {
                      const hasPendingClaim = userClaims.submittedClaims.some(
                        claim => {
                          const claimFoundItemId = safeGet(claim, 'foundItemId');
                          const idToCompare = typeof claimFoundItemId === 'object' && claimFoundItemId !== null && claimFoundItemId._id
                            ? String(claimFoundItemId._id)
                            : String(claimFoundItemId);
                          return idToCompare === String(founditems._id) &&
                                 safeGet(claim, 'status') === 'pending';
                        }
                      );

                      return (
                        <Card key={founditems._id} className="overflow-hidden">
                          {founditems.image && (
                            <div className="aspect-video relative">
                              <img
                                src={`${API_BASE_URL}${founditems.image}`}
                                alt={founditems.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{founditems.name}</CardTitle>
                                <CardDescription>{founditems.category}</CardDescription>
                              </div>
                              <Badge variant={founditems.isClaimed ? "secondary" : "default"}>
                                {founditems.isClaimed ? "Claimed" : "Available"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm text-gray-600 mb-2">{founditems.description}</p>
                                <div className="space-y-1 text-sm">
                                  <p><strong>Location:</strong> {founditems.locationFound}</p>
                                  <p><strong>Found:</strong> {new Date(founditems.timeFound).toLocaleString()}</p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-medium text-sm">Security Question:</h4>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                                  {founditems.securityQuestion}
                                </p>
                              </div>

                              {getUserId(founditems.userId) !== String(user?._id) && !founditems.isClaimed && !hasPendingClaim && (
                                <Button
                                  onClick={() => handleClaim(founditems)}
                                  className="w-full"
                                >
                                  Claim This Item
                                </Button>
                              )}

                              {getUserId(founditems.userId) !== String(user?._id) && (founditems.isClaimed || hasPendingClaim) && (
                                <p className="text-sm text-gray-500 font-medium text-center">
                                  {founditems.isClaimed ? 'Claimed by someone' : 'Claim Submitted'}
                                </p>
                              )}

                              {getUserId(founditems.userId) === String(user?._id) && (
                                <p className="text-sm text-gray-500 font-medium text-center">
                                  You Reported This
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        }

        {
          activeSection === 'my-found' && (
            <Card>
              <CardHeader>
                <CardTitle>My Reported Found Items</CardTitle>
                <CardDescription>Items you have reported as found</CardDescription>
              </CardHeader>
              <CardContent>
                {userItems.foundItems.length === 0 ? (
                  <p className="text-gray-500">You haven't reported any items as found yet.</p>
                ) : (
                  <div className="space-y-4">
                    {userItems.foundItems.map(item => (
                      <div key={item._id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-500">{item.category}</p>
                          <p className="text-sm text-gray-500">Found at: {item.locationFound}</p>
                          <p className="text-sm text-gray-500">Found on: {new Date(item.timeFound).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                           <Badge variant={item.isClaimed ? "default" : "secondary"}>
                            {item.isClaimed ? "Claimed" : "Available"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        }

        {
          activeSection === 'claims' && (
            <Card>
              <CardHeader>
                <CardTitle>My Claims</CardTitle>
                <CardDescription>Track the status of your claims</CardDescription>
              </CardHeader>
              <CardContent>
                {userClaims.submittedClaims.length === 0 ? (
                  <p className="text-gray-500">You haven't submitted any claims yet.</p>
                ) : (
                  <div className="space-y-4">
                    {userClaims.submittedClaims.map(claim => (
                      <div key={claim._id} className="p-4 border rounded-lg space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">Claim for: {claim.foundItemId?.name}</h3>
                              <p className="text-sm text-gray-500">Category: {claim.foundItemId?.category}</p>
                              <p className="text-sm text-gray-500">Found at: {claim.foundItemId?.locationFound}</p>
                            </div>
                            <Badge variant={
                              claim.status === 'accepted' ? 'success' :
                              claim.status === 'rejected' ? 'destructive' :
                              'secondary'
                            }>
                              {claim.status || 'pending'}
                            </Badge>
                          </div>
                          
                          {/* Display Item Description */}
                          {claim.foundItemId?.description && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">Item Description:</h4>
                              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                                {claim.foundItemId.description}
                              </p>
                            </div>
                          )}

                          <div className="text-sm text-gray-700">
                            <p><strong>Claimant:</strong> {claim.claimantId?.name}</p>
                            <p><strong>Your Answer:</strong> {claim.answer}</p>
                            {claim.responseMessage && (
                              <p><strong>Response:</strong> {claim.responseMessage}</p>
                            )}
                             {/* Display Your Reason if it exists and is not empty*/}
                            {claim.reason && <p><strong>Your Reason:</strong> {claim.reason}</p>}
                          </div>

                          {/* Display reporter contact info and message if claim is accepted */}
                          {claim.status === 'accepted' && claim.foundItemId?.contactEmail && claim.foundItemId?.contactPhone && (
                              <div className="bg-green-50 border-green-200 p-3 rounded-md space-y-2 text-sm text-green-800">
                                  <h4 className="font-medium">Claim Accepted!</h4>
                                  <p>The item reporter has accepted your claim.</p>
                                  <p><strong>Contact the reporter to arrange the return:</strong></p>
                                  <p>Email: {claim.foundItemId.contactEmail}</p>
                                  <p>Phone: {claim.foundItemId.contactPhone}</p>
                                  <p className="mt-2">Please contact them to arrange how you will receive your item. You might need to ask them to post it to your address.</p>
                              </div>
                          )}

                        </div>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        }

        {
          activeSection === 'received-claims' && (
            <Card>
              <CardHeader>
                <CardTitle>Received Claims</CardTitle>
                <CardDescription>Review claims on items you've found</CardDescription>
              </CardHeader>
              <CardContent>
                {userClaims.receivedClaims.length === 0 ? (
                  <p className="text-gray-500">No claims received yet.</p>
                ) : (
                  <div className="space-y-4">
                    {userClaims.receivedClaims.map(claim => (
                      <div key={claim._id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                        <div>
                             {/* Access item details from claim.foundItemId */}
                            <h3 className="font-medium">Claim for: {claim.foundItemId?.name}</h3>
                            <p className="text-sm text-gray-500">Category: {claim.foundItemId?.category}</p>
                             <p className="text-sm text-gray-500">Found at: {claim.foundItemId?.locationFound}</p>
                          </div>
                           <Badge variant={
                              claim.status === 'approved' ? 'success' :
                              claim.status === 'rejected' ? 'destructive' :
                              'secondary'
                            }>
                              {claim.status} 
                            </Badge>
                        </div>
                         <div className="bg-gray-50 p-3 rounded-md space-y-2">
                            <p className="font-medium">Claim from: {claim.claimantId?.name}</p>
                            <p><strong>Answer:</strong> {claim.answer}</p>
                            <p><strong>Reason:</strong> {claim.reason}</p>
                            {claim.status === 'pending' && (
                              <div className="flex space-x-2 mt-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleClaimResponse(claim.foundItemId?._id, claim._id, 'accepted', 'Claim approved')}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleClaimResponse(claim.foundItemId?._id, claim._id, 'rejected', 'Claim rejected')}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                            {claim.responseMessage && (
                              <p className="text-sm text-gray-600 mt-2">
                                <strong>Your Response:</strong> {claim.responseMessage}
                              </p>
                            )}
                          </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        }

        {
          activeSection === 'returns' && (
            <Card>
              <CardHeader>
                <CardTitle>Successful Returns</CardTitle>
                <CardDescription>Items that have been successfully returned</CardDescription>
              </CardHeader>
              <CardContent>
                {successfulReturns.length === 0 ? (
                  <p className="text-gray-500">No successful returns yet.</p>
                ) : (
                  <div className="space-y-4">
                    {successfulReturns.map(item => (
                      <div key={item._id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                           <h3 className="font-medium">Returned: {item.lostItemId?.name || item.foundItemId?.name}</h3>
                           <p className="text-sm text-gray-500">Category: {item.lostItemId?.category || item.foundItemId?.category}</p>
                          <p className="text-sm text-gray-500">Return Date: {new Date(item.returnDate).toLocaleDateString()}</p>
                        </div>
                        <Badge variant="default">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Returned
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        }

        {/* Additional Sections Grid for User Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Trending Categories Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold">Trending Categories</CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-gray-600 mb-4">Most reported item categories this week</CardDescription>
              {trendingCategories.length === 0 ? (
                <p className="text-gray-500">No trending categories found recently.</p>
              ) : (
                <div className="space-y-3">
                  {trendingCategories.map((category, index) => (
                    <div key={category.category || index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-sm font-medium">{index + 1}</div>
                        <div>
                          <p className="text-base font-medium">{category.category}</p>
                          <p className="text-xs text-gray-500">{category.count} items</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Tips Card - Static based on image */}
           <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <AlertCircle className="h-6 w-6 text-yellow-300 mr-3" />
              <CardTitle className="text-lg font-bold">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Provide detailed descriptions for better matches</li>
                <li>Include the exact location where item was lost/found</li>
                <li>Check notifications regularly for updates</li>
                <li>Offer rewards to increase recovery chances</li>
              </ul>
            </CardContent>
          </Card>
        </div>

      </div>

      {showClaimModal && selectedFoundItem && (
        <ClaimModal
          isOpen={showClaimModal}
          onClose={() => setShowClaimModal(false)}
          itemId={selectedFoundItem._id}
          onClaim={handleClaimSubmit}
          selectedItem={selectedFoundItem}
        />
      )}
    </div>
  );
};

export default UserDashboard;
