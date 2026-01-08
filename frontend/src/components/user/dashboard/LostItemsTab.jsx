import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Package, MapPin, Award, Calendar, CheckCircle } from 'lucide-react';

const LostItemsTab = ({ items, onReportLost, onUpdateStatus }) => {
    return (
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100">
                <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <Search className="h-6 w-6 text-blue-600" />
                    My Lost Items
                </CardTitle>
                <CardDescription className="text-slate-600 text-lg">Items you've reported as lost</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
                {items.length === 0 ? (
                    <div className="text-center py-16 space-y-4">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                            <Search className="h-10 w-10 text-slate-400" />
                        </div>
                        <p className="text-lg text-slate-500">You haven't reported any lost items yet</p>
                        <Button
                            onClick={onReportLost}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            Report Lost Item
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {items.map(item => (
                            <Card key={item._id} className="group hover:shadow-lg transition-all duration-300 border border-slate-200/60">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-4 flex-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-bold text-slate-800">{item.name}</h3>
                                                <Badge
                                                    variant={item.isClaimed ? "default" : "secondary"}
                                                    className={`px-3 py-1 text-sm font-medium ${item.isClaimed
                                                            ? "bg-green-100 text-green-800 border-green-200"
                                                            : "bg-orange-100 text-orange-800 border-orange-200"
                                                        }`}
                                                >
                                                    {item.isClaimed ? "✓ Found" : "🔍 Still Lost"}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-blue-500" />
                                                    <span className="font-medium">Category:</span> {item.category}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-red-500" />
                                                    <span className="font-medium">Lost at:</span> {item.locationLost}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Award className="h-4 w-4 text-yellow-500" />
                                                    <span className="font-medium">Reward:</span> {item.reward}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-purple-500" />
                                                    <span className="font-medium">Reported:</span> {new Date(item.dateLost).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        {!item.isClaimed && (
                                            <Button
                                                onClick={() => onUpdateStatus(item._id)}
                                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300"
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
