import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, MapPin, Calendar, Search, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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

const FoundItemsTab = ({ foundItems, userClaims, onClaim }) => {
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

    return (
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
                                                className={`px-3 py-1 text-sm font-medium ${founditems.isClaimed
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
                                                onClick={() => onClaim(founditems)}
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
    );
};

export default React.memo(FoundItemsTab);
