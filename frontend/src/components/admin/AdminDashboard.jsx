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
    <Card className="border border-white/10 shadow-lg bg-black/40 backdrop-blur-xl text-white overflow-hidden relative group hover:scale-[1.01] transition-all duration-300">
      <div className={`absolute inset-0 opacity-20 ${gradient}`}></div>
      <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent skew-x-12 transform translate-x-1/2"></div>
      <CardContent className="p-6 relative z-10">
        <div className="flex justify-between items-start">
          <div className="space-y-4 w-full">
            <div className="p-2 bg-white/10 rounded-lg w-fit backdrop-blur-md border border-white/10">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-1">
              <p className="text-neutral-400 text-sm font-medium">{title}</p>
              {isLoading ? (
                <Skeleton className="h-9 w-16 bg-white/10" />
              ) : (
                <h3 className="text-3xl font-bold text-white">{value}</h3>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 transition-all duration-300">
        <div className="w-full px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500/20 p-2 rounded-xl border border-indigo-500/30 shadow-lg shadow-indigo-500/20">
                <Shield className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Admin Portal</h1>
                <p className="text-sm text-neutral-400 font-medium">Overview & Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white">{user?.name}</p>
                <Badge variant="outline" className="text-xs border-indigo-500/30 text-indigo-300 bg-indigo-500/10">Administrator</Badge>
              </div>
              <Button onClick={logout} variant="outline" size="sm" className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-6 lg:px-8 py-6 space-y-6">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            gradient="bg-blue-500"
            isLoading={isLoading}
          />
          <StatCard
            title="Total Items"
            value={stats.totalItems}
            icon={Package}
            gradient="bg-emerald-500"
            isLoading={isLoading}
          />
          <StatCard
            title="Unclaimed Items"
            value={stats.unclaimedOpenItems}
            icon={FileQuestion}
            gradient="bg-orange-500"
            isLoading={isLoading}
          />
          <StatCard
            title="Resolved"
            value={stats.resolvedItems}
            icon={CheckCircle}
            gradient="bg-violet-500"
            isLoading={isLoading}
          />
        </div>

        {/* Main Content Area - Full Width Grid */}
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-280px)] min-h-[600px]">
          
          {/* Recent Users */}
          <Card className="col-span-12 lg:col-span-4 border border-white/10 shadow-xl bg-black/40 backdrop-blur-xl flex flex-col overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/5">
              <CardTitle className="flex items-center gap-2 text-white">
                <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/20">
                  <Users className="h-5 w-5 text-indigo-400" />
                </div>
                Recent Users
              </CardTitle>
              <CardDescription className="text-neutral-400">Manage platform users</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="divide-y divide-white/5">
                  {isLoading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32 bg-white/10" />
                            <Skeleton className="h-3 w-48 bg-white/10" />
                          </div>
                        </div>
                        <Skeleton className="h-8 w-20 bg-white/10" />
                      </div>
                    ))
                  ) : (
                    users.map(user => (
                      <div key={user._id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                        <div className="flex items-center gap-4">
                          <Avatar className="border border-white/10 shadow-sm">
                            <AvatarFallback className="bg-indigo-900/50 text-indigo-300 font-bold">
                              {((user?.name?.[0]) || (user?.email?.[0]) || '?').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-semibold text-white group-hover:text-indigo-400 transition-colors truncate">{user?.name || user?.email || 'Unknown'}</p>
                            <p className="text-sm text-neutral-500 truncate">{user?.email || ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={`border-0 ${user.role === 'admin' ? "bg-indigo-500/20 text-indigo-300" : "bg-white/10 text-neutral-400"}`}>
                            {user.role}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-neutral-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
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

          {/* Recent Found Items */}
          <Card className="col-span-12 lg:col-span-5 border border-white/10 shadow-xl bg-black/40 backdrop-blur-xl flex flex-col overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/5">
              <CardTitle className="flex items-center gap-2 text-white">
                <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/20">
                  <Package className="h-5 w-5 text-emerald-400" />
                </div>
                Recent Found Items
              </CardTitle>
              <CardDescription className="text-neutral-400">Latest reported found items</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="divide-y divide-white/5">
                  {isLoading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-10 w-10 rounded-lg bg-white/10" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-40 bg-white/10" />
                            <Skeleton className="h-3 w-56 bg-white/10" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-24 rounded-full bg-white/10" />
                      </div>
                    ))
                  ) : foundItems.length === 0 ? (
                    <div className="p-8 text-center text-neutral-500">No found items reported yet</div>
                  ) : (
                    foundItems.map(item => (
                      <div key={item._id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-sm">
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-white group-hover:text-emerald-400 transition-colors">{item.name}</p>
                            <p className="text-sm text-neutral-500 flex items-center gap-2">
                              <span className="bg-white/5 px-2 py-0.5 rounded text-xs font-medium text-neutral-300">{item.category}</span>
                              <span>•</span>
                              <span>{item.locationFound}</span>
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={item.isClaimed ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-0 bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg shadow-emerald-500/20"}
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

          {/* Sidebar Area */}
          <div className="col-span-12 lg:col-span-3 space-y-6 flex flex-col h-full">
            {/* Trending Section */}
            <Card className="flex-1 border border-white/10 shadow-xl bg-black/40 backdrop-blur-xl overflow-hidden relative flex flex-col">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
              
              <CardHeader className="relative z-10 border-b border-white/5 bg-white/5 shrink-0">
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="h-5 w-5 text-pink-400" />
                  Trending
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 relative z-10 flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="divide-y divide-white/5">
                    {isLoading ? (
                      [1, 2, 3].map((i) => (
                        <div key={i} className="p-4 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <Skeleton className="h-6 w-8 bg-white/10" />
                              <Skeleton className="h-4 w-24 bg-white/10" />
                           </div>
                           <Skeleton className="h-6 w-8 rounded-full bg-white/10" />
                        </div>
                      ))
                    ) : trendingCategories.length === 0 ? (
                      <div className="p-6 text-center text-neutral-500">No data available</div>
                    ) : (
                      trendingCategories.map((cat, idx) => (
                        <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-pink-400 font-bold opacity-80">0{idx + 1}</span>
                            <span className="font-medium text-white">{cat.category}</span>
                          </div>
                          <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-0 backdrop-blur-sm">
                            {cat.count}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
