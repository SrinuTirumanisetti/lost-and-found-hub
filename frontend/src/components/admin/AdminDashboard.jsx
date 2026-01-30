import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Package, CheckCircle, Clock, FileQuestion, TrendingUp, Trash, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

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
    // Initial load
    const init = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchStats(),
        loadData(),
        fetchTrendingCategories()
      ]);
      setIsLoading(false);
    };
    init();
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

  const StatCard = ({ title, value, icon: Icon, gradient, isLoading }) => (
    <Card className={`border-0 shadow-lg text-white ${gradient} overflow-hidden relative group hover:scale-[1.02] transition-all duration-300`}>
      <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-1/2"></div>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-4 w-full">
            <div className="p-2 bg-white/20 rounded-lg w-fit">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-1">
              <p className="text-white/80 text-sm font-medium">{title}</p>
              {isLoading ? (
                <Skeleton className="h-9 w-16 bg-white/30" />
              ) : (
                <h3 className="text-3xl font-bold">{value}</h3>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Admin Portal</h1>
                <p className="text-sm text-slate-500 font-medium">Overview & Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                <Badge variant="outline" className="text-xs border-indigo-200 text-indigo-700 bg-indigo-50">Administrator</Badge>
              </div>
              <Button onClick={logout} variant="outline" size="sm" className="border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors">
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
            isLoading={isLoading}
          />
          <StatCard
            title="Total Items"
            value={stats.totalItems}
            icon={Package}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            isLoading={isLoading}
          />
          <StatCard
            title="Active Claims"
            value={stats.itemsWithPendingClaims}
            icon={Clock}
            gradient="bg-gradient-to-br from-orange-400 to-pink-500"
            isLoading={isLoading}
          />
          <StatCard
            title="Resolved"
            value={stats.resolvedItems}
            icon={CheckCircle}
            gradient="bg-gradient-to-br from-violet-500 to-purple-600"
            isLoading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">

            {/* User Management */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                  Recent Users
                </CardTitle>
                <CardDescription>Manage platform users</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  <div className="divide-y divide-slate-100">
                    {isLoading ? (
                      [1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-48" />
                            </div>
                          </div>
                          <Skeleton className="h-8 w-20" />
                        </div>
                      ))
                    ) : (
                      users.map(user => (
                        <div key={user._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                          <div className="flex items-center gap-4">
                            <Avatar className="border-2 border-white shadow-sm">
                              <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 font-bold">
                                {((user?.name?.[0]) || (user?.email?.[0]) || '?').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{user?.name || user?.email || 'Unknown'}</p>
                              <p className="text-sm text-slate-500">{user?.email || ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={user.role === 'admin' ? "default" : "secondary"} className={user.role === 'admin' ? "bg-indigo-600" : "bg-slate-100 text-slate-600"}>
                              {user.role}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                              onClick={() => deleteUser(user._id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Found Items List */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Package className="h-5 w-5 text-emerald-600" />
                  </div>
                  Recent Found Items
                </CardTitle>
                <CardDescription>Latest reported found items</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  <div className="divide-y divide-slate-100">
                    {isLoading ? (
                      [1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-40" />
                              <Skeleton className="h-3 w-56" />
                            </div>
                          </div>
                          <Skeleton className="h-6 w-24 rounded-full" />
                        </div>
                      ))
                    ) : foundItems.length === 0 ? (
                      <div className="p-8 text-center text-slate-500">No found items reported yet</div>
                    ) : (
                      foundItems.map(item => (
                        <div key={item._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                              <Package className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">{item.name}</p>
                              <p className="text-sm text-slate-500 flex items-center gap-2">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-medium">{item.category}</span>
                                <span>•</span>
                                <span>{item.locationFound}</span>
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={item.isClaimed ? "outline" : "default"}
                            className={item.isClaimed ? "border-green-500 text-green-600 bg-green-50" : "bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-200"}
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
            <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 text-white overflow-hidden relative">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl"></div>
              
              <CardHeader className="relative z-10 border-b border-white/10">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-pink-400" />
                  Trending Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 relative z-10">
                <div className="divide-y divide-white/10">
                  {isLoading ? (
                    [1, 2, 3].map((i) => (
                      <div key={i} className="p-4 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <Skeleton className="h-6 w-8 bg-white/20" />
                            <Skeleton className="h-4 w-24 bg-white/20" />
                         </div>
                         <Skeleton className="h-6 w-8 rounded-full bg-white/20" />
                      </div>
                    ))
                  ) : trendingCategories.length === 0 ? (
                    <div className="p-6 text-center text-indigo-300">No data available</div>
                  ) : (
                    trendingCategories.map((cat, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-pink-400 font-bold opacity-80">0{idx + 1}</span>
                          <span className="font-medium">{cat.category}</span>
                        </div>
                        <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-0 backdrop-blur-sm">
                          {cat.count}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Unclaimed Items Warning */}
            <Card className="border-0 shadow-lg bg-orange-50 border-l-4 border-orange-500 transform hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-full shadow-sm">
                    <FileQuestion className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    {isLoading ? (
                       <div className="space-y-2">
                         <Skeleton className="h-8 w-16 bg-orange-200" />
                         <Skeleton className="h-4 w-32 bg-orange-200" />
                       </div>
                    ) : (
                      <>
                        <h4 className="font-bold text-orange-900 text-2xl">{stats.unclaimedOpenItems}</h4>
                        <p className="text-orange-800 font-bold text-sm uppercase tracking-wide">Unclaimed Items</p>
                        <p className="text-sm text-orange-600 mt-2 leading-relaxed">Items reported found but not yet claimed by anyone. Consider promoting these.</p>
                      </>
                    )}
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
