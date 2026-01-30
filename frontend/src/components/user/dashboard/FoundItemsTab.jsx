import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, MapPin, Calendar, Search, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from "@/components/ui/skeleton";

// Helper to robustly extract userId
const getUserId = (val) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val._id) return val._id;
    return '';
};

// Safe getter utility function
const safeGet = (obj, path, def = undefined) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) ?? def;
};

const FoundItemsTab = ({ foundItems, userClaims, isLoading, onClaim }) => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [filteredFoundItems, setFilteredFoundItems] = useState([]);

    const categories = [
        'Electronics', 'Clothing', 'Books', 'Jewelry', 'Accessories', 'Documents', 'Other'
    ];

    const filterItems = useCallback(() => {
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

    useEffect(() => {
        setFilteredFoundItems(filterItems());
    }, [filterItems]);

    if (isLoading) {
        return (
            <div className="space-y-8">
                <Card className="border-0 shadow-lg bg-neutral-900/50 backdrop-blur-md">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Skeleton className="h-10 w-full bg-white/10" />
                            <Skeleton className="h-10 w-full bg-white/10" />
                            <Skeleton className="h-10 w-full bg-white/10" />
                            <Skeleton className="h-10 w-full bg-white/10" />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="group border-0 overflow-hidden bg-neutral-900/50 backdrop-blur-md h-full flex flex-col">
                            <div className="relative h-48 w-full overflow-hidden">
                                <Skeleton className="h-full w-full bg-white/10" />
                            </div>
                            <CardContent className="p-6 flex-1 flex flex-col gap-4">
                                <div className="flex justify-between items-start mb-2">
                                    <Skeleton className="h-6 w-32 bg-white/10" />
                                    <Skeleton className="h-5 w-20 rounded-full bg-white/10" />
                                </div>
                                <div className="space-y-3 mb-6 flex-1">
                                    <Skeleton className="h-4 w-full bg-white/10" />
                                    <Skeleton className="h-4 w-3/4 bg-white/10" />
                                    <Skeleton className="h-4 w-1/2 bg-white/10" />
                                </div>
                                <Skeleton className="h-12 w-full rounded-xl bg-white/10" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <Card className="border-0 shadow-xl bg-neutral-900/50 backdrop-blur-md text-neutral-200">
            <CardHeader className="bg-white/5 border-b border-white/10">
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                    <Package className="h-6 w-6 text-yellow-500" />
                    Found Items
                </CardTitle>
                <CardDescription className="text-neutral-400 text-lg">Items others have found - claim if yours</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
                {/* Search and Filter Section */}
                <div className="space-y-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-4 top-4 h-5 w-5 text-neutral-500" />
                                <Input
                                    placeholder="Search by name, category, or location..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-12 h-14 text-lg border-white/10 focus:border-yellow-500 focus:ring-yellow-500/20 rounded-xl bg-black/40 text-white placeholder:text-neutral-600"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-[200px] h-14 text-lg border-white/10 rounded-xl bg-black/40 text-white">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl bg-neutral-900 border-white/10 text-white">
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category} value={category} className="focus:bg-white/10 focus:text-white">
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={dateFilter} onValueChange={setDateFilter}>
                                <SelectTrigger className="w-[200px] h-14 text-lg border-white/10 rounded-xl bg-black/40 text-white">
                                    <SelectValue placeholder="Date" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl bg-neutral-900 border-white/10 text-white">
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
                        <p className="text-lg text-neutral-400 font-medium">
                            Showing <span className="font-bold text-yellow-500">{filteredFoundItems.length}</span> of <span className="font-bold">{foundItems.length}</span> items
                        </p>
                    </div>
                </div>

                {/* Items Grid */}
                {filteredFoundItems.length === 0 ? (
                    <div className="text-center py-16 space-y-4">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                            <Package className="h-10 w-10 text-neutral-600" />
                        </div>
                        <p className="text-lg text-neutral-500">No items match your search criteria</p>
                        <Button
                            onClick={() => {
                                setSearchQuery('');
                                setCategoryFilter('all');
                                setDateFilter('all');
                            }}
                            variant="outline"
                            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
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
                                <Card key={founditems._id} className="group overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-white/10 bg-black/40 hover:bg-black/60">
                                    <CardHeader className="bg-white/5 border-b border-white/10 p-6">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-2">
                                                <CardTitle className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">{founditems.name}</CardTitle>
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-yellow-500" />
                                                    <CardDescription className="text-neutral-400 font-medium">{founditems.category}</CardDescription>
                                                </div>
                                            </div>
                                            <Badge
                                                variant={founditems.isClaimed ? "default" : "secondary"}
                                                className={`px-3 py-1 text-sm font-medium ${founditems.isClaimed
                                                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                                                        : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                                    }`}
                                            >
                                                {founditems.isClaimed ? "✓ Claimed" : "📍 Available"}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-6 space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-neutral-400">
                                                <MapPin className="h-4 w-4 text-red-400" />
                                                <span className="font-medium text-neutral-300">Found at:</span> {founditems.locationFound}
                                            </div>
                                            <div className="flex items-center gap-2 text-neutral-400">
                                                <Calendar className="h-4 w-4 text-purple-400" />
                                                <span className="font-medium text-neutral-300">Date:</span> {new Date(founditems.timeFound).toLocaleDateString()}
                                            </div>
                                            {founditems.description && (
                                                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                                    <p className="text-sm text-neutral-300">
                                                        <span className="font-semibold text-neutral-200">Description:</span> {founditems.description}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {getUserId(founditems.userId) !== String(user?._id) && !founditems.isClaimed && !hasPendingClaim && (
                                            <Button
                                                onClick={() => onClaim(founditems)}
                                                className="w-full h-12 text-lg font-semibold bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 transition-all duration-300"
                                            >
                                                <Package className="h-5 w-5 mr-2" />
                                                Claim This Item
                                            </Button>
                                        )}

                                        {getUserId(founditems.userId) !== String(user?._id) && (founditems.isClaimed || hasPendingClaim) && (
                                            <div className="text-center py-3">
                                                <p className="text-neutral-500 font-medium">
                                                    {founditems.isClaimed ? '✓ Already claimed by someone' : '⏳ Claim submitted'}
                                                </p>
                                            </div>
                                        )}

                                        {getUserId(founditems.userId) === String(user?._id) && (
                                            <div className="text-center py-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                                <p className="text-blue-400 font-medium flex items-center justify-center gap-2">
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
    );
};

export default React.memo(FoundItemsTab);
