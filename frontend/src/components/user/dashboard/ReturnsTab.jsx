import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Package, Calendar } from 'lucide-react';

const ReturnsTab = ({ returns }) => {
    return (
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-100">
                <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    Successful Returns
                </CardTitle>
                <CardDescription className="text-slate-600 text-lg">Items that have been successfully returned to their owners</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
                {returns.length === 0 ? (
                    <div className="text-center py-16 space-y-4">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="h-10 w-10 text-slate-400" />
                        </div>
                        <p className="text-lg text-slate-500">No successful returns yet</p>
                        <p className="text-slate-400">Completed returns will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {returns.map(item => (
                            <Card key={item._id} className="border border-green-200/60 bg-gradient-to-r from-green-50 to-emerald-50">
                                <CardContent className="flex justify-between items-center p-6">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            Returned: {item.lostItemId?.name || item.foundItemId?.name}
                                        </h3>
                                        <div className="flex items-center gap-4 text-slate-600">
                                            <div className="flex items-center gap-1">
                                                <Package className="h-4 w-4 text-blue-500" />
                                                {item.lostItemId?.category || item.foundItemId?.category}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4 text-purple-500" />
                                                Return Date: {new Date(item.returnDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2">
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
