import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Package, Calendar } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

const ReturnsTab = ({ returns, isLoading }) => {
    if (isLoading) {
        return (
            <Card className="border-0 shadow-xl bg-neutral-900/50 backdrop-blur-md">
                <CardHeader className="bg-white/5 border-b border-white/10">
                    <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                        <Skeleton className="h-6 w-6 rounded-full bg-white/10" />
                        <Skeleton className="h-8 w-48 bg-white/10" />
                    </CardTitle>
                    <Skeleton className="h-4 w-64 mt-2 bg-white/10" />
                </CardHeader>
                <CardContent className="p-8">
                    <div className="space-y-6">
                        {[1, 2].map((i) => (
                            <Card key={i} className="border border-white/10 bg-black/40">
                                <CardContent className="flex justify-between items-center p-6">
                                    <div className="space-y-3 flex-1">
                                        <Skeleton className="h-6 w-64 bg-white/10" />
                                        <div className="flex items-center gap-4">
                                            <Skeleton className="h-4 w-32 bg-white/10" />
                                            <Skeleton className="h-4 w-40 bg-white/10" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-8 w-32 rounded-full bg-white/10" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-xl bg-neutral-900/50 backdrop-blur-md text-neutral-200">
            <CardHeader className="bg-white/5 border-b border-white/10">
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    Successful Returns
                </CardTitle>
                <CardDescription className="text-neutral-400 text-lg">Items that have been successfully returned to their owners</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
                {returns.length === 0 ? (
                    <div className="text-center py-16 space-y-4">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="h-10 w-10 text-neutral-600" />
                        </div>
                        <p className="text-lg text-neutral-500">No successful returns yet</p>
                        <p className="text-neutral-600">Completed returns will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {returns.map(item => (
                            <Card key={item._id} className="border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 transition-all duration-300">
                                <CardContent className="flex justify-between items-center p-6">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            Returned: {item.lostItemId?.name || item.foundItemId?.name}
                                        </h3>
                                        <div className="flex items-center gap-4 text-neutral-400">
                                            <div className="flex items-center gap-1">
                                                <Package className="h-4 w-4 text-yellow-500" />
                                                {item.lostItemId?.category || item.foundItemId?.category}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4 text-purple-400" />
                                                Return Date: {new Date(item.returnDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2">
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
    );
};

export default React.memo(ReturnsTab);
