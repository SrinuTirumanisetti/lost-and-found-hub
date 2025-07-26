import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Package, CheckCircle, AlertCircle, Filter, TrendingUp, MapPin, Calendar, User, Clock, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ReportLostItem from './ReportLostItem';
import ReportFoundItem from './ReportFoundItem';
import ClaimModal from './ClaimModal';
import { useToast } from '@/hooks/use-toast';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        try {
          setIsLoading(true);
          // Run these in parallel but wait for all to complete
          await Promise.all([
            fetchUserItems(),
            fetchUserClaims(),
            fetchTrendingCategories()
          ]);
        } catch (error) {
          console.error('Error loading dashboard data:', error);
          toast({
            title: "Error",
            description: "Failed to load dashboard data. Please refresh the page.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      loadData();
    }
  }, [user]);

  // Memoize the filter function to prevent unnecessary re-renders
  const filterItems = React.useCallback(() => {
    const query = searchQuery.toLowerCase();
    const now = new Date();
    
    return foundItems.filter(item => {
      // Search filter
      if (searchQuery && !(
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.locationFound.toLowerCase().includes(query)
      )) {
        return false;
      }
      
      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }
      
      // Date filter
      if (dateFilter !== 'all') {
        const itemDate = new Date(item.timeFound);
        switch (dateFilter) {
          case 'today':
            return itemDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date();
            weekAgo.setDate(now.getDate() - 7);
            return itemDate >= weekAgo;
          case 'month':
            const monthAgo = new Date();
            monthAgo.setMonth(now.getMonth() - 1);
            return itemDate >= monthAgo;
          default:
            return true;
        }
      }
      
      return true;
    });
  }, [searchQuery, categoryFilter, dateFilter, foundItems]);
  
  // Update filtered items when dependencies change
  useEffect(() => {
    const filtered = filterItems();
    setFilteredFoundItems(filtered);
  }, [filterItems]);

  const fetchUserItems = async () => {
    try {
      // Fetch user's lost items and successful returns in parallel with found items
      const [userItemsResponse, foundItemsResponse] = await Promise.all([
        fetchWithAuth(`${API_BASE_URL}/api/user/items`),
        fetchWithAuth(`${API_BASE_URL}/api/items/found`)
      ]);

      if (!userItemsResponse.ok) {
        throw new Error('Failed to fetch user items');
      }
      if (!foundItemsResponse.ok) {
        throw new Error('Failed to fetch found items');
      }

      const [userData, foundItemsData] = await Promise.all([
        userItemsResponse.json(),
        foundItemsResponse.json()
      ]);

      // Batch state updates
      setUserItems(userData);
      setUserLostItems(userData.lostItems || []);
      setSuccessfulReturns(userData.successfulReturns || []);
      setFoundItems(foundItemsData || []);

      return true;
    } catch (error) {
      console.error('Fetch user data error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load user data",
        variant: "destructive",
      });
      throw error; // Re-throw to be caught by the parent try-catch
    }
  };

  const fetchUserClaims = async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/items/claims`);

      if (!response.ok) {
        throw new Error('Failed to fetch claims');
      }

      const data = await response.json();

      setUserClaims({
        submittedClaims: data.submittedClaims || [],
        receivedClaims: data.receivedClaims || []
      });

      return true;
    } catch (error) {
      console.error('Fetch claims error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load claims",
        variant: "destructive",
      });
      throw error; // Re-throw to be caught by the parent try-catch
    }
  };

  const fetchTrendingCategories = async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/items/stats/trending-categories`);

      if (!response.ok) {
        throw new Error('Failed to fetch trending categories');
      }

      const data = await response.json();
      setTrendingCategories(data);
      return true;
    } catch (error) {
      console.error('Fetch trending categories error:', error);
      // Don't show error toast for non-critical data
      return false;
    }
  };

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
      if (!itemId || !claimId) {
        throw new Error('Missing required item or claim ID');
      }

      // Use the same status value for both frontend and backend
      const backendStatus = status; // 'accepted' or 'rejected'
      
      // Optimistically update the UI
      setUserClaims(prevClaims => ({
        ...prevClaims,
        receivedClaims: prevClaims.receivedClaims.map(claim => 
          claim._id === claimId 
            ? { 
                ...claim, 
                status: status, // 'accepted' or 'rejected'
                responseMessage, 
                updatedAt: new Date().toISOString() 
              } 
            : claim
        )
      }));

      console.log('Sending claim response:', { claimId, status, backendStatus });
      const response = await fetchWithAuth(`${API_BASE_URL}/api/items/claims/${claimId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: backendStatus,
          responseMessage 
        })
      });

      if (!response.ok) {
        // Revert optimistic update on error
        fetchUserClaims();
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to respond to claim');
      }

      const data = await response.json();
      
      // Update the item status if claim was accepted
      if (status === 'accepted') {
        setFoundItems(prevItems => 
          prevItems.map(item => 
            item._id === itemId ? { ...item, isClaimed: true } : item
          )
        );
      }

      // Show success message
      toast({
        title: 'Success',
        description: `Claim ${status === 'accepted' ? 'accepted' : 'rejected'} successfully`,
      });

      // Refresh data to ensure consistency
      await Promise.all([
        fetchUserItems(),
        fetchUserClaims()
      ]);
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Lost & Found Hub
              </h1>
              <p className="text-slate-600 font-medium">Welcome back, {user?.name} 👋</p>
            </div>
            <Button 
              onClick={logout} 
              variant="outline"
              className="border-slate-300 hover:bg-slate-50 transition-all duration-200"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Card 
            className="group cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-red-500 to-rose-600 text-white border-0 overflow-hidden relative"
            onClick={() => setShowReportLost(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50"></div>
            <CardContent className="flex items-center p-8 relative z-10">
              <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mr-6 group-hover:scale-110 transition-transform duration-300">
                <Search className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Report Lost Item</h3>
                <p className="text-red-100 text-lg">Lost something? Let us help you find it</p>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="group cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 overflow-hidden relative"
            onClick={() => setShowReportFound(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50"></div>
            <CardContent className="flex items-center p-8 relative z-10">
              <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mr-6 group-hover:scale-110 transition-transform duration-300">
                <Package className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Report Found Item</h3>
                <p className="text-emerald-100 text-lg">Found something? Help return it to owner</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="lost" className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-16 mb-8 bg-white/80 backdrop-blur-sm border border-slate-200/60">
            <TabsTrigger value="lost" className="text-sm font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              My Lost Items
            </TabsTrigger>
            <TabsTrigger value="found" className="text-sm font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Browse Found Items
            </TabsTrigger>
            <TabsTrigger value="claims" className="text-sm font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              My Claims
            </TabsTrigger>
            <TabsTrigger value="received-claims" className="text-sm font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Received Claims
            </TabsTrigger>
            <TabsTrigger value="returns" className="text-sm font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Returns
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lost" className="mt-6">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100">
                <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <Search className="h-6 w-6 text-blue-600" />
                  My Lost Items
                </CardTitle>
                <CardDescription className="text-slate-600 text-lg">Items you've reported as lost</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {userLostItems.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                      <Search className="h-10 w-10 text-slate-400" />
                    </div>
                    <p className="text-lg text-slate-500">You haven't reported any lost items yet</p>
                    <Button 
                      onClick={() => setShowReportLost(true)}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Report Lost Item
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {userLostItems.map(item => (
                      <Card key={item._id} className="group hover:shadow-lg transition-all duration-300 border border-slate-200/60">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-4 flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="text-xl font-bold text-slate-800">{item.name}</h3>
                                <Badge 
                                  variant={item.isClaimed ? "default" : "secondary"}
                                  className={`px-3 py-1 text-sm font-medium ${
                                    item.isClaimed 
                                      ? "bg-green-100 text-green-800 border-green-200" 
                                      : "bg-orange-100 text-orange-800 border-orange-200"
                                  }`}
                                >
                                  {item.isClaimed ? "✓ Found" : "🔍 Still Lost"}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600">
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-blue-500" />
                                  <span className="font-medium">Category:</span> {item.category}
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-red-500" />
                                  <span className="font-medium">Lost at:</span> {item.locationLost}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Award className="h-4 w-4 text-yellow-500" />
                                  <span className="font-medium">Reward:</span> {item.reward}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-purple-500" />
                                  <span className="font-medium">Reported:</span> {new Date(item.dateLost).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            {!item.isClaimed && (
                              <Button
                                onClick={() => {
                                  const updatedItems = userLostItems.map(lostItem => 
                                    lostItem._id === item._id ? { ...lostItem, isClaimed: true } : lostItem
                                  );
                                  setUserLostItems(updatedItems);
                                  handleUpdateLostItemStatus(item._id, true);
                                }}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Found
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="found" className="mt-6">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-slate-100">
                <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <Package className="h-6 w-6 text-emerald-600" />
                  Found Items
                </CardTitle>
                <CardDescription className="text-slate-600 text-lg">Items others have found - claim if yours</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {/* Search and Filter Section */}
                <div className="space-y-6 mb-8">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                        <Input
                          placeholder="Search by name, category, or location..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-12 h-14 text-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl bg-white/80 backdrop-blur-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[200px] h-14 text-lg border-slate-200 rounded-xl bg-white/80 backdrop-blur-sm">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="w-[200px] h-14 text-lg border-slate-200 rounded-xl bg-white/80 backdrop-blur-sm">
                          <SelectValue placeholder="Date" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">Last 7 Days</SelectItem>
                          <SelectItem value="month">Last 30 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Results Count */}
                  <div className="flex items-center justify-between">
                    <p className="text-lg text-slate-600 font-medium">
                      Showing <span className="font-bold text-blue-600">{filteredFoundItems.length}</span> of <span className="font-bold">{foundItems.length}</span> items
                    </p>
                  </div>
                </div>

                {/* Items Grid */}
                {filteredFoundItems.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                      <Package className="h-10 w-10 text-slate-400" />
                    </div>
                    <p className="text-lg text-slate-500">No items match your search criteria</p>
                    <Button 
                      onClick={() => {
                        setSearchQuery('');
                        setCategoryFilter('all');
                        setDateFilter('all');
                      }}
                      variant="outline"
                      className="border-slate-300 hover:bg-slate-50"
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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
                        <Card key={founditems._id} className="group overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm">
                          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                <CardTitle className="text-xl font-bold text-slate-800">{founditems.name}</CardTitle>
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-blue-500" />
                                  <CardDescription className="text-slate-600 font-medium">{founditems.category}</CardDescription>
                                </div>
                              </div>
                              <Badge 
                                variant={founditems.isClaimed ? "default" : "secondary"}
                                className={`px-3 py-1 text-sm font-medium ${
                                  founditems.isClaimed 
                                    ? "bg-green-100 text-green-800 border-green-200" 
                                    : "bg-blue-100 text-blue-800 border-blue-200"
                                }`}
                              >
                                {founditems.isClaimed ? "✓ Claimed" : "📍 Available"}
                              </Badge>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="p-6 space-y-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-slate-600">
                                <MapPin className="h-4 w-4 text-red-500" />
                                <span className="font-medium">Found at:</span> {founditems.locationFound}
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <Calendar className="h-4 w-4 text-purple-500" />
                                <span className="font-medium">Date:</span> {new Date(founditems.timeFound).toLocaleDateString()}
                              </div>
                              {founditems.description && (
                                <div className="p-3 bg-slate-50 rounded-lg">
                                  <p className="text-sm text-slate-700">
                                    <span className="font-semibold">Description:</span> {founditems.description}
                                  </p>
                                </div>
                              )}
                            </div>

                            {getUserId(founditems.userId) !== String(user?._id) && !founditems.isClaimed && !hasPendingClaim && (
                              <Button
                                onClick={() => handleClaim(founditems)}
                                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                              >
                                <Package className="h-5 w-5 mr-2" />
                                Claim This Item
                              </Button>
                            )}

                            {getUserId(founditems.userId) !== String(user?._id) && (founditems.isClaimed || hasPendingClaim) && (
                              <div className="text-center py-3">
                                <p className="text-slate-500 font-medium">
                                  {founditems.isClaimed ? '✓ Already claimed by someone' : '⏳ Claim submitted'}
                                </p>
                              </div>
                            )}

                            {getUserId(founditems.userId) === String(user?._id) && (
                              <div className="text-center py-3 bg-blue-50 rounded-lg">
                                <p className="text-blue-700 font-medium flex items-center justify-center gap-2">
                                  <User className="h-4 w-4" />
                                  You reported this item
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claims" className="mt-6">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-100">
                <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-purple-600" />
                  My Claims
                </CardTitle>
                <CardDescription className="text-slate-600 text-lg">Track the status of your claims</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {userClaims.submittedClaims.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="h-10 w-10 text-slate-400" />
                    </div>
                    <p className="text-lg text-slate-500">You haven't submitted any claims yet</p>
                    <p className="text-slate-400">Browse found items to claim items that belong to you</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {userClaims.submittedClaims.map(claim => (
                      <Card key={claim._id} className="border border-slate-200/60 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6 space-y-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <h3 className="text-xl font-bold text-slate-800">Claim for: {claim.foundItemId?.name}</h3>
                              <div className="flex items-center gap-4 text-slate-600">
                                <div className="flex items-center gap-1">
                                  <Package className="h-4 w-4 text-blue-500" />
                                  {claim.foundItemId?.category}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4 text-red-500" />
                                  {claim.foundItemId?.locationFound}
                                </div>
                              </div>
                            </div>
                            <Badge 
                              variant={
                                claim.status === 'accepted' ? 'success' :
                                claim.status === 'rejected' ? 'destructive' :
                                'secondary'
                              }
                              className={`px-4 py-2 text-sm font-medium ${
                                claim.status === 'accepted' ? 'bg-green-100 text-green-800 border-green-200' :
                                claim.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                                'bg-yellow-100 text-yellow-800 border-yellow-200'
                              }`}
                            >
                              {claim.status === 'accepted' ? '✓ Accepted' :
                               claim.status === 'rejected' ? '✗ Rejected' :
                               '⏳ Pending'}
                            </Badge>
                          </div>
                          
                          {claim.foundItemId?.description && (
                            <div className="bg-slate-50 p-4 rounded-lg">
                              <h4 className="font-semibold text-slate-800 mb-2">Item Description:</h4>
                              <p className="text-slate-700">{claim.foundItemId.description}</p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
                            <div>
                              <span className="font-semibold">Claimant:</span> {claim.claimantId?.name}
                            </div>
                            <div>
                              <span className="font-semibold">Your Answer:</span> {claim.answer}
                            </div>
                            {claim.reason && (
                              <div className="md:col-span-2">
                                <span className="font-semibold">Your Reason:</span> {claim.reason}
                              </div>
                            )}
                            {claim.responseMessage && (
                              <div className="md:col-span-2">
                                <span className="font-semibold">Response:</span> {claim.responseMessage}
                              </div>
                            )}
                          </div>

                          {claim.status === 'accepted' && claim.foundItemId?.contactEmail && claim.foundItemId?.contactPhone && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-6 rounded-xl">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                  <CheckCircle className="h-6 w-6 text-white" />
                                </div>
                                <h4 className="font-bold text-lg text-green-800">Claim Accepted! 🎉</h4>
                              </div>
                              <p className="text-green-700 mb-4">The item reporter has accepted your claim.</p>
                              <div className="space-y-2 text-green-800">
                                <p className="font-semibold">Contact the reporter to arrange the return:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <p>📧 Email: {claim.foundItemId.contactEmail}</p>
                                  <p>📞 Phone: {claim.foundItemId.contactPhone}</p>
                                </div>
                                <p className="text-sm text-green-600 bg-white/60 p-3 rounded-lg mt-4">
                                  💡 Contact them to arrange how you will receive your item. They might be able to meet you or post it to your address.
                                </p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="received-claims" className="mt-6">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-slate-100">
                <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <User className="h-6 w-6 text-orange-600" />
                  Received Claims
                </CardTitle>
                <CardDescription className="text-slate-600 text-lg">Review claims on items you've found</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {userClaims.receivedClaims.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                      <User className="h-10 w-10 text-slate-400" />
                    </div>
                    <p className="text-lg text-slate-500">No claims received yet</p>
                    <p className="text-slate-400">When someone claims items you've found, they'll appear here</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {userClaims.receivedClaims.map(claim => (
                      <Card key={claim._id} className="border border-slate-200/60 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <h3 className="text-xl font-bold text-slate-800">Claim for: {claim.foundItemId?.name}</h3>
                              <div className="flex items-center gap-4 text-slate-600">
                                <div className="flex items-center gap-1">
                                  <Package className="h-4 w-4 text-blue-500" />
                                  {claim.foundItemId?.category}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4 text-red-500" />
                                  {claim.foundItemId?.locationFound}
                                </div>
                              </div>
                            </div>
                            <Badge 
                              variant={
                                claim.status === 'accepted' ? 'success' :
                                claim.status === 'rejected' ? 'destructive' :
                                'secondary'
                              }
                              className={`px-4 py-2 text-sm font-medium ${
                                claim.status === 'accepted' ? 'bg-green-100 text-green-800 border-green-200' :
                                claim.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                                'bg-yellow-100 text-yellow-800 border-yellow-200'
                              }`}
                            >
                              {claim.status === 'accepted' ? '✓ Accepted' :
                               claim.status === 'rejected' ? '✗ Rejected' :
                               '⏳ Pending'}
                            </Badge>
                          </div>
                          
                          <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-blue-500" />
                              <p className="font-semibold text-slate-800">Claim from: {claim.claimantId?.name}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">Answer:</p>
                              <p className="text-slate-700 mt-1">{claim.answer}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">Reason:</p>
                              <p className="text-slate-700 mt-1">{claim.reason}</p>
                            </div>
                            
                            {claim.status === 'pending' && (
                              <div className="flex gap-3 pt-4 border-t border-slate-200">
                                <Button
                                  onClick={() => handleClaimResponse(claim.foundItemId?._id, claim._id, 'accepted', 'Claim approved')}
                                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => handleClaimResponse(claim.foundItemId?._id, claim._id, 'rejected', 'Claim rejected')}
                                  variant="destructive"
                                  className="px-6 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                                >
                                  <AlertCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            )}
                            
                            {claim.responseMessage && (
                              <div className="pt-3 border-t border-slate-200">
                                <p className="font-semibold text-slate-800">Your Response:</p>
                                <p className="text-slate-700 mt-1">{claim.responseMessage}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="returns" className="mt-6">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-100">
                <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  Successful Returns
                </CardTitle>
                <CardDescription className="text-slate-600 text-lg">Items that have been successfully returned to their owners</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {successfulReturns.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-10 w-10 text-slate-400" />
                    </div>
                    <p className="text-lg text-slate-500">No successful returns yet</p>
                    <p className="text-slate-400">Completed returns will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {successfulReturns.map(item => (
                      <Card key={item._id} className="border border-green-200/60 bg-gradient-to-r from-green-50 to-emerald-50">
                        <CardContent className="flex justify-between items-center p-6">
                          <div className="space-y-2">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              Returned: {item.lostItemId?.name || item.foundItemId?.name}
                            </h3>
                            <div className="flex items-center gap-4 text-slate-600">
                              <div className="flex items-center gap-1">
                                <Package className="h-4 w-4 text-blue-500" />
                                {item.lostItemId?.category || item.foundItemId?.category}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-purple-500" />
                                Return Date: {new Date(item.returnDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Successfully Returned
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          {/* Trending Categories Card */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                  Trending Categories
                </CardTitle>
                <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">This Week</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <CardDescription className="text-slate-600 mb-6">Most reported item categories this week</CardDescription>
              {trendingCategories.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No trending categories found recently</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trendingCategories.map((category, index) => (
                    <div key={category.category || index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors duration-200">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{category.category}</p>
                          <p className="text-sm text-slate-600">{category.count} items reported</p>
                        </div>
                      </div>
                      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((category.count / (trendingCategories[0]?.count || 1)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Tips Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-yellow-300" />
                </div>
                <CardTitle className="text-xl font-bold">Quick Tips</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 relative z-10">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-300 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Provide detailed descriptions for better matches</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-300 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Include the exact location where item was lost/found</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-300 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Check notifications regularly for updates</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-300 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Offer rewards to increase recovery chances</span>
                </li>
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
