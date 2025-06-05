import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ClaimModal = ({ foundItem, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const claim = {
      _id: `claim_${Date.now()}`,
      lostItemId: null, // This would be matched in a real implementation
      foundItemId: foundItem._id,
      claimantId: user?._id,
      answer,
      status: 'pending',
      createdAt: new Date()
    };

    const existingClaims = JSON.parse(localStorage.getItem('claims') || '[]');
    existingClaims.push(claim);
    localStorage.setItem('claims', JSON.stringify(existingClaims));

    toast.success('Claim submitted! The finder will review your answer.');
    setIsSubmitting(false);
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Claim Item: {foundItem.name}</DialogTitle>
          <DialogDescription>
            Answer the security question to claim this item
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Item Details</Label>
            <div className="p-3 bg-gray-50 rounded-md">
              <p><strong>Name:</strong> {foundItem.name}</p>
              <p><strong>Category:</strong> {foundItem.category}</p>
              <p><strong>Found at:</strong> {foundItem.locationFound}</p>
              <p><strong>Description:</strong> {foundItem.description}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="securityQuestion">Security Question</Label>
            <Textarea
              value={foundItem.securityQuestion}
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">Your Answer</Label>
            <Textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Please provide a detailed answer..."
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Claim'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimModal;
