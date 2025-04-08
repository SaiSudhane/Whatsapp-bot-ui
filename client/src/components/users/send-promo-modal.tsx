import { FC, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Layers, Loader2 } from "lucide-react";

interface SendPromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  selectedUsers: number[];
  onSendMessage: (message: string) => void;
  isPending: boolean;
}

const SendPromoModal: FC<SendPromoModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedCount, 
  selectedUsers,
  onSendMessage,
  isPending
}) => {
  const { toast } = useToast();
  
  const [contentSid, setContentSid] = useState("");
  
  const handleSendPromo = () => {
    if (!contentSid.trim()) {
      toast({
        title: "Validation error",
        description: "Content SID is required",
        variant: "destructive"
      });
      return;
    }
    
    onSendMessage(contentSid);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isPending && !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Promotional Message</DialogTitle>
          <DialogDescription>
            You are about to send a promotional message to {selectedCount} selected users.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="content-sid">Content SID</Label>
            <Input
              id="content-sid"
              value={contentSid}
              onChange={(e) => setContentSid(e.target.value)}
              placeholder="Enter Content SID"
              className="mt-1"
            />
            <p className="text-xs text-slate-500 mt-1">
              Enter the Content SID for the WhatsApp template message
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSendPromo} disabled={isPending}>
            {isPending ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </span>
            ) : (
              <>
                <Layers className="h-4 w-4 mr-2" />
                Send to {selectedCount} Users
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendPromoModal;
