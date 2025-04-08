import { FC, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { createMessage, updateMessage } from "@/store/messages-slice";
import { Message } from "@shared/schema";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import WhatsAppTextEditor from "@/components/ui/whatsapp-text-editor";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message | null;
}

const MessageModal: FC<MessageModalProps> = ({ isOpen, onClose, message }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  
  const [content, setContent] = useState("");
  const [fixedReplyRequired, setFixedReplyRequired] = useState(false);
  const [fixedReply, setFixedReply] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const isEditing = !!message;
  
  useEffect(() => {
    if (message) {
      setContent(message.content);
      setFixedReplyRequired(message.fixedReplyRequired);
      setFixedReply(message.fixedReply || "");
    } else {
      setContent("");
      setFixedReplyRequired(false);
      setFixedReply("");
    }
  }, [message]);
  
  const handleSave = async () => {
    if (!content.trim()) {
      toast({
        title: "Validation error",
        description: "Message content is required",
        variant: "destructive"
      });
      return;
    }
    
    if (fixedReplyRequired && !fixedReply.trim()) {
      toast({
        title: "Validation error",
        description: "Fixed reply is required when enabled",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const messageData = {
        content,
        fixedReplyRequired,
        fixedReply: fixedReplyRequired ? fixedReply : null
      };
      
      if (isEditing && message) {
        await dispatch(updateMessage({ id: message.id, message: messageData })).unwrap();
        toast({
          title: "Success",
          description: "Message updated successfully"
        });
      } else {
        await dispatch(createMessage(messageData)).unwrap();
        toast({
          title: "Success",
          description: "Message created successfully"
        });
      }
      
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
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Message" : "Create New Message"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Edit your message and its properties below." 
              : "Create a new message for your users."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="message-content" className="block text-sm font-medium text-slate-700 mb-1">
              Message Content
            </Label>
            <WhatsAppTextEditor
              id="message-content"
              value={content}
              onChange={setContent}
              placeholder="Type your message content here..."
              maxLength={1000}
              rows={6}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="fixed-reply-toggle"
              checked={fixedReplyRequired}
              onCheckedChange={(checked) => setFixedReplyRequired(checked as boolean)}
            />
            <Label htmlFor="fixed-reply-toggle">
              Fixed Reply Required
            </Label>
          </div>
          
          {fixedReplyRequired && (
            <div>
              <Label htmlFor="fixed-reply" className="block text-sm font-medium text-slate-700 mb-1">
                Fixed Reply Content
              </Label>
              <WhatsAppTextEditor
                id="fixed-reply"
                value={fixedReply}
                onChange={setFixedReply}
                placeholder="Type your fixed reply here..."
                maxLength={500}
                rows={4}
              />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={submitting}>
            {submitting ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                Saving...
              </span>
            ) : (
              "Save Message"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MessageModal;
