
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { useToast } from "@/hooks/use-toast";

export function ContentSidModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [firstSid, setFirstSid] = useState("");
  const [lastSid, setLastSid] = useState("");
  const { toast } = useToast();

  const fetchContentSids = async () => {
    try {
      const response = await fetch("https://backend.myadvisor.sg/config/content-sids", {
        headers: getHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        setFirstSid(data.first_content_sid);
        setLastSid(data.last_content_sid);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch content SIDs",
        variant: "destructive",
      });
    }
  };

  const updateContentSids = async () => {
    try {
      const response = await fetch("https://backend.myadvisor.sg/config/update-content-sids", {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          first_content_sid: firstSid,
          last_content_sid: lastSid,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Content SIDs updated successfully",
        });
        setIsOpen(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update content SIDs",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={fetchContentSids}>
          Manage Content SIDs
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Content SID Management</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label>First Message SID</label>
            <Input
              value={firstSid}
              onChange={(e) => setFirstSid(e.target.value)}
              placeholder="Enter first message SID"
            />
          </div>
          <div className="space-y-2">
            <label>Last Message SID</label>
            <Input
              value={lastSid}
              onChange={(e) => setLastSid(e.target.value)}
              placeholder="Enter last message SID"
            />
          </div>
          <Button onClick={updateContentSids} className="w-full">
            Update
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
