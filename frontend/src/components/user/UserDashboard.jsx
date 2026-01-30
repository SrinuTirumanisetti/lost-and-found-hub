import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Package, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ReportLostItem from './ReportLostItem';
import ReportFoundItem from './ReportFoundItem';
import ClaimModal from './ClaimModal';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Import new components
import FoundItemsTab from './dashboard/FoundItemsTab';
import LostItemsTab from './dashboard/LostItemsTab';
import ClaimsTab from './dashboard/ClaimsTab';
import ReturnsTab from './dashboard/ReturnsTab';
import ProfileSettings from './dashboard/ProfileSettings';

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
  const [activeTab, setActiveTab] = useState('lost');
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

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        try {
          setIsLoading(true);
          await Promise.all([
            fetchUserItems(),
            fetchUserClaims()
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
  }, [user, fetchUserItems, fetchUserClaims, toast]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden font-sans selection:bg-yellow-500/30">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse delay-2000" />
      </div>

      {/* Header */}
      <div className="bg-black/20 backdrop-blur-xl text-white py-4 px-6 border-b border-white/5 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-10 bg-yellow-400 rotate-3 flex items-center justify-center shadow-lg shadow-yellow-400/20 rounded-xl overflow-hidden group hover:rotate-6 transition-transform">
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-[10px] font-black text-black -rotate-3 text-center leading-tight tracking-tighter">LOST<br/>&FOUND</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent hidden sm:block">
              Portal
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => setActiveTab('lost')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === 'lost' 
                    ? 'bg-white/10 text-white shadow-inner border border-white/10' 
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Home
              </button>
              <div className="w-px h-6 bg-white/10 hidden sm:block mx-2" />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/10 transition-colors">
                    <Avatar className="h-10 w-10 border border-white/10 shadow-lg">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-black font-bold">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-neutral-900/95 backdrop-blur-xl border-white/10 text-white" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-white">{user?.name}</p>
                      <p className="text-xs leading-none text-neutral-400">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={() => setActiveTab('profile')} className="focus:bg-white/10 focus:text-white cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Welcome back, <span className="text-yellow-400">{user?.name?.split(' ')[0] || 'User'}</span>
            </h2>
            <p className="text-neutral-400 max-w-xl">
              Manage your lost items, browse found items, and help others reunite with their belongings.
            </p>
          </div>
          <div className="flex gap-3">
             <Button 
                onClick={() => setShowReportLost(true)}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold shadow-lg shadow-yellow-400/20 border-0"
              >
                <Plus className="mr-2 h-4 w-4" /> I Lost Something
              </Button>
             <Button 
                onClick={() => setShowReportFound(true)}
                variant="outline"
                className="bg-transparent border-white/20 text-white hover:bg-white/5 hover:text-white"
              >
                <Search className="mr-2 h-4 w-4" /> I Found Something
              </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
          <TabsList className="grid w-full grid-cols-5 h-16 bg-neutral-900/50 backdrop-blur-xl border border-white/10 p-1.5 shadow-2xl rounded-2xl">
            {['lost', 'found', 'claims', 'received-claims', 'returns'].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="text-sm font-semibold rounded-xl text-neutral-400 data-[state=active]:bg-yellow-400 data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-yellow-400/20 transition-all duration-300 hover:text-neutral-200 hover:bg-white/5"
              >
                {tab === 'lost' && 'My Lost Items'}
                {tab === 'found' && 'Browse Found Items'}
                {tab === 'claims' && 'My Claims'}
                {tab === 'received-claims' && 'Received Claims'}
                {tab === 'returns' && 'Returns'}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="lost" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <LostItemsTab
              items={userLostItems}
              isLoading={isLoading}
              onReportLost={() => setShowReportLost(true)}
              onUpdateStatus={handleUpdateLostItemStatus}
            />
          </TabsContent>

          <TabsContent value="found" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <FoundItemsTab
              foundItems={foundItems}
              userClaims={userClaims}
              isLoading={isLoading}
              onClaim={handleClaim}
            />
          </TabsContent>

          <TabsContent value="claims" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <ClaimsTab
              claims={userClaims}
              type="submitted"
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="received-claims" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <ClaimsTab
              claims={userClaims}
              type="received"
              isLoading={isLoading}
              onResponse={handleClaimResponse}
            />
          </TabsContent>

          <TabsContent value="returns" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <ReturnsTab returns={successfulReturns} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="profile" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <ProfileSettings />
          </TabsContent>
        </Tabs>
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
