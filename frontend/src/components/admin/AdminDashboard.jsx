import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Package, CheckCircle, Search, Plus, Edit, Trash, Clock, FileQuestion, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    pendingItems: 0,
    resolvedItems: 0,
    itemsWithPendingClaims: 0,
    unclaimedOpenItems: 0
  });
  const [users, setUsers] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [trendingCategories, setTrendingCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
    loadData();
    fetchTrendingCategories();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No token found");
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No token found");
        return;
      }

      const [usersRes, lostItemsRes, foundItemsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/api/admin/items/lost`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/api/admin/items/found`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      ]);

      if (!usersRes.ok || !lostItemsRes.ok || !foundItemsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [usersData, lostItemsData, foundItemsData] = await Promise.all([
        usersRes.json(),
        lostItemsRes.json(),
        foundItemsRes.json()
      ]);

      setUsers(usersData);
      setLostItems(lostItemsData);
      setFoundItems(foundItemsData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const fetchTrendingCategories = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No token found");
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/admin/stats/trending-categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

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
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No token found for user deletion");
        return { success: false, error: "Authentication required." };
      }
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

       if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      const updatedUsers = users.filter(user => user._id !== userId);
      setUsers(updatedUsers);
      fetchStats();
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {/* Total Users Card with Gradient */}
          <Card className="bg-gradient-to-r from-blue-500 to-blue-700 text-white w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-5 w-5 text-blue-200" />
            </CardHeader>
            <CardContent className="p-8 md:p-10">
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          {/* Total Items Card with Gradient */}
          <Card className="bg-gradient-to-r from-green-400 to-green-600 text-white w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-5 w-5 text-green-200" />
            </CardHeader>
            <CardContent className="p-8 md:p-10">
              <div className="text-2xl font-bold">{stats.totalItems}</div>
            </CardContent>
          </Card>
          {/* Successful Returns Card with Gradient */}
          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful Returns</CardTitle>
              <CheckCircle className="h-5 w-5 text-emerald-200" />
            </CardHeader>
            <CardContent className="p-8 md:p-10">
              <div className="text-2xl font-bold">{stats.resolvedItems}</div>
            </CardContent>
          </Card>
          {/* Items with Pending Claims Card with Gradient */}
          <Card className="bg-gradient-to-r from-red-500 to-red-700 text-white w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Claimed and Pending Acceptances</CardTitle>
              <Clock className="h-5 w-5 text-red-200" />
            </CardHeader>
            <CardContent className="p-8 md:p-10">
              <div className="text-2xl font-bold">{stats.itemsWithPendingClaims}</div>
            </CardContent>
          </Card>
          {/* Unclaimed Open Items Card with Gradient */}
          <Card className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unclaimed Items</CardTitle>
              <FileQuestion className="h-5 w-5 text-indigo-200" />
            </CardHeader>
            <CardContent className="p-8 md:p-10">
              <div className="text-2xl font-bold">{stats.unclaimedOpenItems}</div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Sections Grid */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {/* Trending Categories Card */}
          <Card className="bg-gradient-to-br from-purple-700 to-pink-700 text-white rounded-xl shadow-xl overflow-hidden w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-xl font-bold text-white">Trending Categories</CardTitle>
              <TrendingUp className="h-8 w-8 text-pink-300" />
            </CardHeader>
            <CardContent className="p-8 md:p-10">
              <CardDescription className="text-sm text-purple-200 mb-6">Most reported item categories this week</CardDescription>
              {trendingCategories.length === 0 ? (
                <p className="text-purple-200">No trending categories found recently.</p>
              ) : (
                <div className="space-y-5">
                  {trendingCategories.map((category, index) => (
                    <div key={category.category || index} className="flex items-center justify-between p-4 bg-white bg-opacity-20 rounded-lg shadow-md transition-transform transform hover:scale-105">
                      <div className="flex items-center space-x-5">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-900 text-white text-lg font-bold shadow-lg flex-shrink-0">{index + 1}</div>
                        <div>
                          <p className="text-base font-semibold text-white">{category.category}</p>
                          <p className="text-sm text-purple-300 mt-1">{category.count} items</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Users Management */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.length === 0 ? (
                <p className="text-gray-500">No users registered yet.</p>
              ) : (
                users.map(user => (
                  <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-sm text-gray-500">{user.phoneNumber}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{user.role}</Badge>
                      <Button
                        onClick={() => deleteUser(user._id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Found Items Management */}
        <Card>
          <CardHeader>
            <CardTitle>Found Items</CardTitle>
            <CardDescription>Monitor found items reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {foundItems.length === 0 ? (
                <p className="text-gray-500">No found items reported yet.</p>
              ) : (
                foundItems.map(item => (
                  <div key={item._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.category}</p>
                      <p className="text-sm text-gray-500">{item.locationFound}</p>
                    </div>
                    <Badge variant={item.isClaimed ? "default" : "secondary"}>
                      {item.isClaimed ? "Claimed" : "Available"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;