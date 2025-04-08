import { FC, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { sendPromo } from "@/store/users-slice";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layers } from "lucide-react";

interface SendPromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  selectedUsers: number[];
}

const SendPromoModal: FC<SendPromoModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedCount, 
  selectedUsers 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  
  const [contentId, setContentId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const handleSendPromo = async () => {
    if (!contentId.trim()) {
      toast({
        title: "Validation error",
        description: "Content ID is required",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      await dispatch(sendPromo({ userIds: selectedUsers, contentId })).unwrap();
      toast({
        title: "Success",
        description: `Promotional message sent to ${selectedCount} users`
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error as string,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Promotional Message</DialogTitle>
          <DialogDescription>
            You are about to send a promotional message to {selectedCount} selected users.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <Label htmlFor="promo-content-id">Content ID</Label>
          <Input
            id="promo-content-id"
            value={contentId}
            onChange={(e) => setContentId(e.target.value)}
            placeholder="Enter content ID"
            className="mt-1"
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSendPromo} disabled={submitting}>
            {submitting ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                Sending...
              </span>
            ) : (
              <>
                <Layers className="h-4 w-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendPromoModal;
