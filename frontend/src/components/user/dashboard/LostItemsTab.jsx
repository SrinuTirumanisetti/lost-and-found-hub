import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Package, MapPin, Award, Calendar, CheckCircle } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

const LostItemsTab = ({ items, isLoading, onReportLost, onUpdateStatus }) => {
    if (isLoading) {
        return (
            <Card className="border-0 shadow-2xl bg-neutral-900/50 backdrop-blur-md">
                <CardHeader className="bg-white/5 border-b border-white/10">
                    <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full bg-neutral-800" />
                        <Skeleton className="h-8 w-48 bg-neutral-800" />
                    </CardTitle>
                    <Skeleton className="h-4 w-64 mt-2 bg-neutral-800" />
                </CardHeader>
                <CardContent className="p-8">
                    <div className="grid gap-6">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="border border-white/10 bg-black/20">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-4 flex-1">
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="h-6 w-48 bg-neutral-800" />
                                                <Skeleton className="h-6 w-24 rounded-full bg-neutral-800" />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Skeleton className="h-4 w-32 bg-neutral-800" />
                                                <Skeleton className="h-4 w-40 bg-neutral-800" />
                                                <Skeleton className="h-4 w-28 bg-neutral-800" />
                                                <Skeleton className="h-4 w-36 bg-neutral-800" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-2xl bg-neutral-900/50 backdrop-blur-md text-neutral-200">
            <CardHeader className="bg-white/5 border-b border-white/10">
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                    <Search className="h-6 w-6 text-yellow-500" />
                    My Lost Items
                </CardTitle>
                <CardDescription className="text-neutral-400 text-lg">Items you've reported as lost</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
                {items.length === 0 ? (
                    <div className="text-center py-16 space-y-4">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto ring-1 ring-white/10">
                            <Search className="h-10 w-10 text-neutral-500" />
                        </div>
                        <p className="text-lg text-neutral-400">You haven't reported any lost items yet</p>
                        <Button
                            onClick={onReportLost}
                            className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-3 rounded-xl font-bold shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 transition-all duration-300"
                        >
                            Report Lost Item
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {items.map(item => (
                            <Card key={item._id} className="group hover:shadow-lg hover:shadow-black/50 transition-all duration-300 border border-white/10 bg-black/40 hover:bg-black/60">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-4 flex-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">{item.name}</h3>
                                                <Badge
                                                    variant={item.isClaimed ? "default" : "secondary"}
                                                    className={`px-3 py-1 text-sm font-medium ${item.isClaimed
                                                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                                                            : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                                        }`}
                                                >
                                                    {item.isClaimed ? "✓ Found" : "🔍 Still Lost"}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-neutral-400">
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-blue-400" />
                                                    <span className="font-medium text-neutral-300">Category:</span> {item.category}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-red-400" />
                                                    <span className="font-medium text-neutral-300">Lost at:</span> {item.locationLost}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Award className="h-4 w-4 text-yellow-400" />
                                                    <span className="font-medium text-neutral-300">Reward:</span> {item.reward}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-purple-400" />
                                                    <span className="font-medium text-neutral-300">Reported:</span> {new Date(item.dateLost).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        {!item.isClaimed && (
                                            <Button
                                                onClick={() => onUpdateStatus(item._id)}
                                                className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-semibold shadow-md shadow-green-900/20 hover:shadow-green-500/20 transition-all duration-300"
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
    );
};

export default React.memo(LostItemsTab);
