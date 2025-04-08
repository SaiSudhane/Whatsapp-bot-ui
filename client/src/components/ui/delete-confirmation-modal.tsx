import { FC } from "react";
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
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: "message" | "users";
  messageId: number | null;
  selectedUsers: number[];
  onConfirm: () => void;
  isPending: boolean;
}

const DeleteConfirmationModal: FC<DeleteConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  target, 
  messageId, 
  selectedUsers,
  onConfirm,
  isPending
}) => {
  const { toast } = useToast();
  
  const handleDelete = () => {
    onConfirm();
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
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
