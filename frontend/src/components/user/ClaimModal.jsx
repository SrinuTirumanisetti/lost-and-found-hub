import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const ClaimModal = ({ isOpen, onClose, itemId, onClaim, selectedItem }) => {
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // User requested to remove additional info, so we pass a default reason string
      await onClaim(itemId, "Claim submitted via secure portal", answer);
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
      <DialogContent className="bg-neutral-900/95 backdrop-blur-xl border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Claim Item</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Please answer the security question to prove ownership.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-3">
            <Label className="text-neutral-300 font-medium">Security Question</Label>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-yellow-400 font-medium shadow-inner">
              {selectedItem?.securityQuestion}
            </div>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="answer" className="text-neutral-300 font-medium">Your Answer</Label>
            <Textarea
              id="answer"
              placeholder="Enter your answer..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
              className="min-h-[100px] bg-white/5 border-white/10 focus:border-yellow-400/50 focus:ring-yellow-400/20 text-white placeholder:text-neutral-600 resize-none"
            />
            <p className="text-xs text-neutral-500">
              Only the person who found the item will see this answer.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="text-neutral-400 hover:text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold shadow-lg shadow-yellow-400/20 border-0"
            >
              {isLoading ? 'Submitting...' : 'Submit Answer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimModal; 