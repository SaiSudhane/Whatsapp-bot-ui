import { FC } from "react";
import { User, Reply } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { X } from "lucide-react";

interface UserRepliesModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  replies: Reply[];
  loading: boolean;
}

const UserRepliesModal: FC<UserRepliesModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  replies, 
  loading 
}) => {
  if (!user) {
    return null;
  }
  
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  const formatDateTime = (date: Date): string => {
    return format(new Date(date), 'yyyy-MM-dd HH:mm');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{user.name}'s Replies</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div>
          <div className="bg-slate-50 p-4 rounded-md mb-4">
            <div className="flex items-center mb-2">
              <Avatar className="h-8 w-8 bg-slate-200">
                <AvatarFallback className="text-slate-600">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <div className="text-sm font-medium text-slate-900">{user.name}</div>
                <div className="text-xs text-slate-500">{user.phone}</div>
              </div>
            </div>
          </div>
          
          <div className="border rounded-md overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Message ID</TableHead>
                    <TableHead>Reply Content</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {replies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                        No replies found for this user.
                      </TableCell>
                    </TableRow>
                  ) : (
                    replies.map((reply) => (
                      <TableRow key={reply.id}>
                        <TableCell className="font-medium">#{reply.messageId}</TableCell>
                        <TableCell>
                          <div className="max-w-lg">{reply.content}</div>
                        </TableCell>
                        <TableCell>
                          {reply.replyDate ? formatDateTime(new Date(reply.replyDate)) : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserRepliesModal;
