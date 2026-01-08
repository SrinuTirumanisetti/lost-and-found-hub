import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertCircle } from 'lucide-react';

const StatsSection = ({ trendingCategories }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
            {/* Trending Categories Card */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
                            <TrendingUp className="h-6 w-6 text-indigo-600" />
                            Trending Categories
                        </CardTitle>
                        <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">This Week</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <CardDescription className="text-slate-600 mb-6">Most reported item categories this week</CardDescription>
                    {trendingCategories.length === 0 ? (
                        <div className="text-center py-8">
                            <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No trending categories found recently</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {trendingCategories.map((category, index) => (
                                <div key={category.category || index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors duration-200">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">{category.category}</p>
                                            <p className="text-sm text-slate-600">{category.count} items reported</p>
                                        </div>
                                    </div>
                                    <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min((category.count / (trendingCategories[0]?.count || 1)) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Tips Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 text-white overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50"></div>
                <CardHeader className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-yellow-300" />
                        </div>
                        <CardTitle className="text-xl font-bold">Quick Tips</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6 relative z-10">
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-yellow-300 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Provide detailed descriptions for better matches</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-yellow-300 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Include the exact location where item was lost/found</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-yellow-300 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Check notifications regularly for updates</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-yellow-300 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Offer rewards to increase recovery chances</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
};

export default React.memo(StatsSection);
