import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Package, MapPin, CheckCircle, User } from 'lucide-react';

const ClaimsTab = ({ claims, type, onResponse }) => {
    const isReceived = type === 'received';
    const claimList = isReceived ? claims.receivedClaims : claims.submittedClaims;
    const title = isReceived ? "Received Claims" : "My Claims";
    const description = isReceived ? "Review claims on items you've found" : "Track the status of your claims";
    const Icon = isReceived ? User : AlertCircle;
    const iconColor = isReceived ? "text-orange-600" : "text-purple-600";
    const headerGradient = isReceived ? "from-orange-50 to-red-50" : "from-purple-50 to-pink-50";

    return (
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className={`bg-gradient-to-r ${headerGradient} border-b border-slate-100`}>
                <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                    {title}
                </CardTitle>
                <CardDescription className="text-slate-600 text-lg">{description}</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
                {claimList.length === 0 ? (
                    <div className="text-center py-16 space-y-4">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                            <Icon className="h-10 w-10 text-slate-400" />
                        </div>
                        <p className="text-lg text-slate-500">No claims {isReceived ? "received" : "submitted"} yet</p>
                        {!isReceived && <p className="text-slate-400">Browse found items to claim items that belong to you</p>}
                        {isReceived && <p className="text-slate-400">When someone claims items you've found, they'll appear here</p>}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {claimList.map(claim => (
                            <Card key={claim._id} className="border border-slate-200/60 hover:shadow-lg transition-all duration-300">
                                <CardContent className="p-6 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-bold text-slate-800">Claim for: {claim.foundItemId?.name}</h3>
                                            <div className="flex items-center gap-4 text-slate-600">
                                                <div className="flex items-center gap-1">
                                                    <Package className="h-4 w-4 text-blue-500" />
                                                    {claim.foundItemId?.category}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4 text-red-500" />
                                                    {claim.foundItemId?.locationFound}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge
                                            variant={
                                                claim.status === 'accepted' ? 'success' :
                                                    claim.status === 'rejected' ? 'destructive' :
                                                        'secondary'
                                            }
                                            className={`px-4 py-2 text-sm font-medium ${claim.status === 'accepted' ? 'bg-green-100 text-green-800 border-green-200' :
                                                    claim.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                                                        'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                }`}
                                        >
                                            {claim.status === 'accepted' ? (isReceived ? '✓ Accepted' : '✓ Accepted') : // Simplified label for reuse
                                                claim.status === 'rejected' ? (isReceived ? '✗ Rejected' : '✗ Rejected') :
                                                    '⏳ Pending'}
                                        </Badge>
                                    </div>

                                    {/* Shared Details Section */}
                                    <div className={`bg-slate-50 p-4 rounded-lg space-y-3`}>
                                        {!isReceived && claim.foundItemId?.description && (
                                            <div className="mb-4">
                                                <h4 className="font-semibold text-slate-800 mb-2">Item Description:</h4>
                                                <p className="text-slate-700">{claim.foundItemId.description}</p>
                                            </div>
                                        )}

                                        {isReceived ? (
                                            // Received Claim Specifics
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-blue-500" />
                                                    <p className="font-semibold text-slate-800">Claim from: {claim.claimantId?.name}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">Answer:</p>
                                                    <p className="text-slate-700 mt-1">{claim.answer}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">Reason:</p>
                                                    <p className="text-slate-700 mt-1">{claim.reason}</p>
                                                </div>

                                                {claim.status === 'pending' && onResponse && (
                                                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                                                        <Button
                                                            onClick={() => onResponse(claim.foundItemId?._id, claim._id, 'accepted', 'Claim approved')}
                                                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            onClick={() => onResponse(claim.foundItemId?._id, claim._id, 'rejected', 'Claim rejected')}
                                                            variant="destructive"
                                                            className="px-6 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                                                        >
                                                            <AlertCircle className="h-4 w-4 mr-2" />
                                                            Reject
                                                        </Button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            // Submitted Claim Specifics
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
                                                <div>
                                                    <span className="font-semibold">Claimant:</span> {claim.claimantId?.name}
                                                </div>
                                                <div>
                                                    <span className="font-semibold">Your Answer:</span> {claim.answer}
                                                </div>
                                                {claim.reason && (
                                                    <div className="md:col-span-2">
                                                        <span className="font-semibold">Your Reason:</span> {claim.reason}
                                                    </div>
                                                )}
                                                {claim.responseMessage && (
                                                    <div className="md:col-span-2">
                                                        <span className="font-semibold">Response:</span> {claim.responseMessage}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Common Response Message Display for Received (Updated) or Submitted */}
                                        {isReceived && claim.responseMessage && (
                                            <div className="pt-3 border-t border-slate-200">
                                                <p className="font-semibold text-slate-800">Your Response:</p>
                                                <p className="text-slate-700 mt-1">{claim.responseMessage}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Submitted Claim Accepted Steps */}
                                    {!isReceived && claim.status === 'accepted' && claim.foundItemId?.contactEmail && claim.foundItemId?.contactPhone && (
                                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-6 rounded-xl">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                                    <CheckCircle className="h-6 w-6 text-white" />
                                                </div>
                                                <h4 className="font-bold text-lg text-green-800">Claim Accepted! 🎉</h4>
                                            </div>
                                            <p className="text-green-700 mb-4">The item reporter has accepted your claim.</p>
                                            <div className="space-y-2 text-green-800">
                                                <p className="font-semibold">Contact the reporter to arrange the return:</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <p>📧 Email: {claim.foundItemId.contactEmail}</p>
                                                    <p>📞 Phone: {claim.foundItemId.contactPhone}</p>
                                                </div>
                                                <p className="text-sm text-green-600 bg-white/60 p-3 rounded-lg mt-4">
                                                    💡 Contact them to arrange how you will receive your item. They might be able to meet you or post it to your address.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default React.memo(ClaimsTab);
