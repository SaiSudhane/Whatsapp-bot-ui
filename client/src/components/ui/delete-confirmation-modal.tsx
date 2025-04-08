import { FC, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { deleteMessage } from "@/store/messages-slice";
import { deleteUsers } from "@/store/users-slice";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: "message" | "users";
  messageId: number | null;
  selectedUsers: number[];
}

const DeleteConfirmationModal: FC<DeleteConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  target, 
  messageId, 
  selectedUsers 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  
  const [deleting, setDeleting] = useState(false);
  
  const handleDelete = async () => {
    setDeleting(true);
    
    try {
      if (target === "message" && messageId) {
        await dispatch(deleteMessage(messageId)).unwrap();
        toast({
          title: "Success",
          description: "Message deleted successfully"
        });
      } else if (target === "users" && selectedUsers.length > 0) {
        await dispatch(deleteUsers(selectedUsers)).unwrap();
        toast({
          title: "Success",
          description: `${selectedUsers.length} users deleted successfully`
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
      setDeleting(false);
    }
  };
  
  const getTitle = () => {
    return target === "message" ? "Delete Message" : "Delete Users";
  };
  
  const getDescription = () => {
    if (target === "message") {
      return "Are you sure you want to delete this message? This action cannot be undone.";
    } else {
      return `Are you sure you want to delete ${selectedUsers.length} selected users? This action cannot be undone.`;
    }
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <span className="bg-red-100 p-2 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </span>
            <div>
              <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
              <AlertDialogDescription>
                {getDescription()}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={deleting}
          >
            {deleting ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                Deleting...
              </span>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmationModal;
