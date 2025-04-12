
import { FC, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ConfigAPI } from "@/lib/api";
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
import { Loader2 } from "lucide-react";

interface ContentSidModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContentSidModal: FC<ContentSidModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [firstContentSid, setFirstContentSid] = useState("");
  const [lastContentSid, setLastContentSid] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadContentSids();
    }
  }, [isOpen]);

  const loadContentSids = async () => {
    setIsLoading(true);
    try {
      const response = await ConfigAPI.getContentSids();
      setFirstContentSid(response.first_content_sid || "");
      setLastContentSid(response.last_content_sid || "");
    } catch (error: any) {
      toast({
        title: "Error loading content SIDs",
        description: error.message || "Failed to load content SIDs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await ConfigAPI.updateContentSids({
        first_content_sid: firstContentSid,
        last_content_sid: lastContentSid,
      });
      
      toast({
        title: "Content SIDs saved",
        description: response.message || "Content SIDs updated successfully",
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Error saving content SIDs",
        description: error.message || "Failed to update content SIDs",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Content SID Configuration</DialogTitle>
          <DialogDescription>
            Update the first and last message content SIDs for your WhatsApp templates.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="first-content-sid">First Message SID</Label>
              <Input
                id="first-content-sid"
                value={firstContentSid}
                onChange={(e) => setFirstContentSid(e.target.value)}
                placeholder="Enter first message content SID"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-content-sid">Last Message SID</Label>
              <Input
                id="last-content-sid"
                value={lastContentSid}
                onChange={(e) => setLastContentSid(e.target.value)}
                placeholder="Enter last message content SID"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContentSidModal;
