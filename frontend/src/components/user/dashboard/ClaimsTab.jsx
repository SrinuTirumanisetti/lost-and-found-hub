import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Package, MapPin, CheckCircle, User } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

const ClaimsTab = ({ claims, type, isLoading, onResponse }) => {
    const isReceived = type === 'received';
    const claimList = isReceived ? claims.receivedClaims : claims.submittedClaims;
    const title = isReceived ? "Received Claims" : "My Claims";
    const description = isReceived ? "Review claims on items you've found" : "Track the status of your claims";
    const Icon = isReceived ? User : AlertCircle;
    const iconColor = isReceived ? "text-orange-600" : "text-purple-600";
    const headerGradient = isReceived ? "from-orange-50 to-red-50" : "from-purple-50 to-pink-50";

    if (isLoading) {
        return (
            <Card className="border-0 shadow-xl bg-neutral-900/50 backdrop-blur-md">
                <CardHeader className={`bg-white/5 border-b border-white/10`}>
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
                                <CardContent className="p-6 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-3 flex-1">
                                            <Skeleton className="h-6 w-64 bg-white/10" />
                                            <div className="flex items-center gap-4">
                                                <Skeleton className="h-4 w-32 bg-white/10" />
                                                <Skeleton className="h-4 w-40 bg-white/10" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-8 w-24 rounded-full bg-white/10" />
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-lg space-y-3">
                                        <Skeleton className="h-4 w-full bg-white/10" />
                                        <Skeleton className="h-4 w-3/4 bg-white/10" />
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
        <Card className="border-0 shadow-xl bg-neutral-900/50 backdrop-blur-md text-neutral-200">
            <CardHeader className={`bg-white/5 border-b border-white/10`}>
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                    <Icon className={`h-6 w-6 ${isReceived ? "text-yellow-500" : "text-purple-400"}`} />
                    {title}
                </CardTitle>
                <CardDescription className="text-neutral-400 text-lg">{description}</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
                {claimList.length === 0 ? (
                    <div className="text-center py-16 space-y-4">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                            <Icon className="h-10 w-10 text-neutral-600" />
                        </div>
                        <p className="text-lg text-neutral-500">No claims {isReceived ? "received" : "submitted"} yet</p>
                        {!isReceived && <p className="text-neutral-600">Browse found items to claim items that belong to you</p>}
                        {isReceived && <p className="text-neutral-600">When someone claims items you've found, they'll appear here</p>}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {claimList.map(claim => (
                            <Card key={claim._id} className="border border-white/10 bg-black/40 hover:bg-black/60 hover:shadow-lg transition-all duration-300">
                                <CardContent className="p-6 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-bold text-white">Claim for: {claim.foundItemId?.name}</h3>
                                            <div className="flex items-center gap-4 text-neutral-400">
                                                <div className="flex items-center gap-1">
                                                    <Package className="h-4 w-4 text-yellow-500" />
                                                    {claim.foundItemId?.category}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4 text-red-400" />
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
                                            className={`px-4 py-2 text-sm font-medium ${claim.status === 'accepted' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                                    claim.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                                        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                                }`}
                                        >
                                            {claim.status === 'accepted' ? (isReceived ? '✓ Accepted' : '✓ Accepted') : // Simplified label for reuse
                                                claim.status === 'rejected' ? (isReceived ? '✗ Rejected' : '✗ Rejected') :
                                                    '⏳ Pending'}
                                        </Badge>
                                    </div>

                                    {/* Shared Details Section */}
                                    <div className={`bg-white/5 p-4 rounded-lg space-y-3 border border-white/5`}>
                                        {!isReceived && claim.foundItemId?.description && (
                                            <div className="mb-4">
                                                <h4 className="font-semibold text-white mb-2">Item Description:</h4>
                                                <p className="text-neutral-300">{claim.foundItemId.description}</p>
                                            </div>
                                        )}

                                        {isReceived ? (
                                            // Received Claim Specifics
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-yellow-500" />
                                                    <p className="font-semibold text-white">Claim from: {claim.claimantId?.name}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white">Answer:</p>
                                                    <p className="text-neutral-300 mt-1">{claim.answer}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white">Reason:</p>
                                                    <p className="text-neutral-300 mt-1">{claim.reason}</p>
                                                </div>

                                                {claim.status === 'pending' && onResponse && (
                                                    <div className="flex gap-3 pt-4 border-t border-white/10">
                                                        <Button
                                                            onClick={() => onResponse(claim.foundItemId?._id, claim._id, 'accepted', 'Claim approved')}
                                                            className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-semibold shadow-md shadow-green-900/20 hover:shadow-green-500/20 transition-all duration-300"
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            onClick={() => onResponse(claim.foundItemId?._id, claim._id, 'rejected', 'Claim rejected')}
                                                            variant="destructive"
                                                            className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-semibold shadow-md shadow-red-900/20 hover:shadow-red-500/20 transition-all duration-300"
                                                        >
                                                            <AlertCircle className="h-4 w-4 mr-2" />
                                                            Reject
                                                        </Button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            // Submitted Claim Specifics
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-neutral-300">
                                                <div>
                                                    <span className="font-semibold text-white">Claimant:</span> {claim.claimantId?.name}
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-white">Your Answer:</span> {claim.answer}
                                                </div>
                                                {claim.reason && (
                                                    <div className="md:col-span-2">
                                                        <span className="font-semibold text-white">Your Reason:</span> {claim.reason}
                                                    </div>
                                                )}
                                                {claim.responseMessage && (
                                                    <div className="md:col-span-2">
                                                        <span className="font-semibold text-white">Response:</span> {claim.responseMessage}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Common Response Message Display for Received (Updated) or Submitted */}
                                        {isReceived && claim.responseMessage && (
                                            <div className="pt-3 border-t border-white/10">
                                                <p className="font-semibold text-white">Your Response:</p>
                                                <p className="text-neutral-300 mt-1">{claim.responseMessage}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Submitted Claim Accepted Steps */}
                                    {!isReceived && claim.status === 'accepted' && claim.foundItemId?.contactEmail && claim.foundItemId?.contactPhone && (
                                        <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-xl">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                                    <CheckCircle className="h-6 w-6 text-white" />
                                                </div>
                                                <h4 className="font-bold text-lg text-green-400">Claim Accepted! 🎉</h4>
                                            </div>
                                            <p className="text-green-300 mb-4">The item reporter has accepted your claim.</p>
                                            <div className="space-y-2 text-green-200">
                                                <p className="font-semibold text-green-300">Contact the reporter to arrange the return:</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <p>📧 Email: {claim.foundItemId.contactEmail}</p>
                                                    <p>📞 Phone: {claim.foundItemId.contactPhone}</p>
                                                </div>
                                                <p className="text-sm text-green-400 bg-black/20 p-3 rounded-lg mt-4">
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
