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
import { Textarea } from "@/components/ui/textarea";
import { Layers, Loader2 } from "lucide-react";
import WhatsAppTextEditor from "@/components/ui/whatsapp-text-editor";

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
  
  const [message, setMessage] = useState("");
  
  const handleSendPromo = () => {
    if (!message.trim()) {
      toast({
        title: "Validation error",
        description: "Message content is required",
        variant: "destructive"
      });
      return;
    }
    
    onSendMessage(message);
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
        
        <div className="mt-4">
          <WhatsAppTextEditor
            value={message}
            onChange={setMessage}
            placeholder="Type your message here... Use WhatsApp formatting if needed"
            maxLength={500}
            label="Message Content"
          />

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
