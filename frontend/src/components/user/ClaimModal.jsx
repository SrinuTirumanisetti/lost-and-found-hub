import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const ClaimModal = ({ isOpen, onClose, itemId, onClaim, selectedItem }) => {
  const [reason, setReason] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onClaim(itemId, reason, answer);
      toast({
        title: 'Success',
        description: 'Your claim has been submitted successfully',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit claim',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Claim Item</DialogTitle>
          <DialogDescription>
            Please answer the security question and provide a reason why you believe this item belongs to you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Security Question</Label>
            <div className="p-3 bg-gray-50 rounded-md">
              {selectedItem?.securityQuestion}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="answer">Your Answer</Label>
            <Textarea
              id="answer"
              placeholder="Enter your answer to the security question..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Additional Information</Label>
            <Textarea
              id="reason"
              placeholder="Please provide any additional information that proves this item belongs to you..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Claim'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimModal; 