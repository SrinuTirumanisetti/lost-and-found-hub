import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ReportLostItem from './ReportLostItem';
import ReportFoundItem from './ReportFoundItem';
import ClaimModal from './ClaimModal';
import { useToast } from '@/hooks/use-toast';

// Import new components
import FoundItemsTab from './dashboard/FoundItemsTab';
import LostItemsTab from './dashboard/LostItemsTab';
import ClaimsTab from './dashboard/ClaimsTab';
import ReturnsTab from './dashboard/ReturnsTab';
import StatsSection from './dashboard/StatsSection';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
  const [trendingCategories, setTrendingCategories] = useState([]);

  // Data fetching functions
  const fetchUserItems = useCallback(async () => {
    try {
      const [userItemsResponse, foundItemsResponse] = await Promise.all([
        fetchWithAuth(`${API_BASE_URL}/api/user/items`),
        fetchWithAuth(`${API_BASE_URL}/api/items/found`)
      ]);

      if (!userItemsResponse.ok) throw new Error('Failed to fetch user items');
      if (!foundItemsResponse.ok) throw new Error('Failed to fetch found items');

      const [userData, foundItemsData] = await Promise.all([
        userItemsResponse.json(),
        foundItemsResponse.json()
      ]);

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
      throw error;
    }
  }, [toast]);

  const fetchUserClaims = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/items/claims`);
      if (!response.ok) throw new Error('Failed to fetch claims');

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
      throw error;
    }
  }, [toast]);

  const fetchTrendingCategories = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/items/stats/trending-categories`);
      if (!response.ok) throw new Error('Failed to fetch trending categories');

      const data = await response.json();
      setTrendingCategories(data);
      return true;
    } catch (error) {
      console.error('Fetch trending categories error:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        try {
          setIsLoading(true);
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
  }, [user, fetchUserItems, fetchUserClaims, fetchTrendingCategories, toast]);

  // Handlers wrapped in useCallback
  const handleClaim = useCallback((foundItem) => {
    setSelectedFoundItem(foundItem);
    setShowClaimModal(true);
  }, []);

  const handleClaimSubmit = useCallback(async (itemId, reason, answer) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/items/${itemId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason, answer })
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
      fetchUserItems();
      fetchUserClaims();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit claim",
        variant: "destructive",
      });
    }
  }, [toast, fetchUserItems, fetchUserClaims]);

  const handleClaimResponse = useCallback(async (itemId, claimId, status, responseMessage) => {
    try {
      if (!itemId || !claimId) throw new Error('Missing required item or claim ID');

      // Optimistic update
      setUserClaims(prevClaims => ({
        ...prevClaims,
        receivedClaims: prevClaims.receivedClaims.map(claim =>
          claim._id === claimId
            ? { ...claim, status: status, responseMessage, updatedAt: new Date().toISOString() }
            : claim
        )
      }));

      const response = await fetchWithAuth(`${API_BASE_URL}/api/items/claims/${claimId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, responseMessage })
      });

      if (!response.ok) {
        fetchUserClaims(); // Revert
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to respond to claim');
      }

      const data = await response.json();

      if (status === 'accepted') {
        setFoundItems(prevItems =>
          prevItems.map(item =>
            item._id === itemId ? { ...item, isClaimed: true } : item
          )
        );
      }

      toast({
        title: 'Success',
        description: `Claim ${status === 'accepted' ? 'accepted' : 'rejected'} successfully`,
      });

      await Promise.all([fetchUserItems(), fetchUserClaims()]);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to respond to claim",
        variant: "destructive",
      });
    }
  }, [fetchUserItems, fetchUserClaims, toast]);

  const handleUpdateLostItemStatus = useCallback(async (itemId, isClaimed) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/user/items/lost/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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

      fetchUserItems();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update item status",
        variant: "destructive",
      });
    }
  }, [fetchUserItems, toast]);

  // Views for adding items
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
            <LostItemsTab
              items={userLostItems}
              onReportLost={() => setShowReportLost(true)}
              onUpdateStatus={handleUpdateLostItemStatus}
            />
          </TabsContent>

          <TabsContent value="found" className="mt-6">
            <FoundItemsTab
              foundItems={foundItems}
              userClaims={userClaims}
              onClaim={handleClaim}
            />
          </TabsContent>

          <TabsContent value="claims" className="mt-6">
            <ClaimsTab
              claims={userClaims}
              type="submitted"
            />
          </TabsContent>

          <TabsContent value="received-claims" className="mt-6">
            <ClaimsTab
              claims={userClaims}
              type="received"
              onResponse={handleClaimResponse}
            />
          </TabsContent>

          <TabsContent value="returns" className="mt-6">
            <ReturnsTab returns={successfulReturns} />
          </TabsContent>
        </Tabs>

        {/* Statistics Section */}
        <StatsSection trendingCategories={trendingCategories} />
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
