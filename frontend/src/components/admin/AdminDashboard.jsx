import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Package, CheckCircle, Clock, FileQuestion, TrendingUp, Trash, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Stats error", error);
    }
  };

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const [usersRes, foundItemsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/admin/items/found`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (usersRes.ok && foundItemsRes.ok) {
        const [usersData, foundItemsData] = await Promise.all([
          usersRes.json(),
          foundItemsRes.json()
        ]);
        setUsers(usersData);
        setFoundItems(foundItemsData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrendingCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/admin/stats/trending-categories`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTrendingCategories(data);
      }
    } catch (error) {
      console.error("Trending error", error);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setUsers(users.filter(u => u._id !== userId));
        fetchStats();
        toast({ title: "Success", description: "User deleted successfully" });
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      toast({ title: "Error", description: "Could not delete user", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, gradient }) => (
    <Card className={`border-0 shadow-lg text-white ${gradient} overflow-hidden relative group hover:scale-[1.02] transition-all duration-300`}>
      <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-1/2"></div>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <div className="p-2 bg-white/20 rounded-lg w-fit">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
              <h3 className="text-3xl font-bold">{value}</h3>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Admin Portal</h1>
                <p className="text-sm text-slate-500">Overview & Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
              <Button onClick={logout} variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
          />
          <StatCard
            title="Total Items"
            value={stats.totalItems}
            icon={Package}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
          <StatCard
            title="Active Claims"
            value={stats.itemsWithPendingClaims}
            icon={Clock}
            gradient="bg-gradient-to-br from-orange-400 to-pink-500"
          />
          <StatCard
            title="Resolved"
            value={stats.resolvedItems}
            icon={CheckCircle}
            gradient="bg-gradient-to-br from-violet-500 to-purple-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">

            {/* User Management */}
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-500" />
                  Recent Users
                </CardTitle>
                <CardDescription>Manage platform users</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  <div className="divide-y divide-slate-100">
                    {users.map(user => (
                      <div key={user._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-slate-800">{user.name}</p>
                            <p className="text-sm text-slate-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={user.role === 'admin' ? "default" : "secondary"}>
                            {user.role}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => deleteUser(user._id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Found Items List */}
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-emerald-500" />
                  Recent Found Items
                </CardTitle>
                <CardDescription>Latest reported found items</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  <div className="divide-y divide-slate-100">
                    {foundItems.length === 0 ? (
                      <div className="p-8 text-center text-slate-500">No found items reported yet</div>
                    ) : (
                      foundItems.map(item => (
                        <div key={item._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                              <Package className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{item.name}</p>
                              <p className="text-sm text-slate-500">{item.category} • {item.locationFound}</p>
                            </div>
                          </div>
                          <Badge
                            variant={item.isClaimed ? "outline" : "default"}
                            className={item.isClaimed ? "border-green-500 text-green-600" : "bg-emerald-500 hover:bg-emerald-600"}
                          >
                            {item.isClaimed ? "Claimed" : "Active"}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* Trending Section */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-900 to-violet-900 text-white overflow-hidden">
              <CardHeader className="relative z-10 border-b border-white/10">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-pink-400" />
                  Trending Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 relative z-10">
                <div className="divide-y divide-white/10">
                  {trendingCategories.length === 0 ? (
                    <div className="p-6 text-center text-indigo-300">No data available</div>
                  ) : (
                    trendingCategories.map((cat, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-pink-400 font-bold">0{idx + 1}</span>
                          <span className="font-medium">{cat.category}</span>
                        </div>
                        <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-0">
                          {cat.count}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Unclaimed Items Warning */}
            <Card className="border-0 shadow-lg bg-orange-50 border-l-4 border-orange-500">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <FileQuestion className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-orange-900 text-lg">{stats.unclaimedOpenItems}</h4>
                    <p className="text-orange-700 font-medium">Unclaimed Items</p>
                    <p className="text-sm text-orange-600 mt-1">Items reported found but not yet claimed by anyone.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;