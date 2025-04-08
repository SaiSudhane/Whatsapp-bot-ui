import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { fetchMessages } from "@/store/messages-slice";
import { fetchUsers } from "@/store/users-slice";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MessagesList from "@/components/messages/messages-list";
import UsersList from "@/components/users/users-list";
import MessageModal from "@/components/messages/message-modal";
import UserRepliesModal from "@/components/users/user-replies-modal";
import SendPromoModal from "@/components/users/send-promo-modal";
import DeleteConfirmationModal from "@/components/ui/delete-confirmation-modal";

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"messages" | "users">("messages");
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [repliesModalOpen, setRepliesModalOpen] = useState(false);
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<"message" | "users">("message");
  const [deleteMessageId, setDeleteMessageId] = useState<number | null>(null);
  
  const messagesState = useSelector((state: RootState) => state.messages);
  const usersState = useSelector((state: RootState) => state.users);
  
  useEffect(() => {
    dispatch(fetchMessages())
      .unwrap()
      .catch((err) => {
        toast({
          title: "Error fetching messages",
          description: err,
          variant: "destructive"
        });
      });
    
    dispatch(fetchUsers())
      .unwrap()
      .catch((err) => {
        toast({
          title: "Error fetching users",
          description: err,
          variant: "destructive"
        });
      });
  }, [dispatch, toast]);
  
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const handleOpenMessageModal = (messageId?: number) => {
    if (messageId) {
      const message = messagesState.messages.find(m => m.id === messageId);
      if (message) {
        dispatch({ type: 'messages/setCurrentMessage', payload: message });
      }
    } else {
      dispatch({ type: 'messages/setCurrentMessage', payload: null });
    }
    setMessageModalOpen(true);
  };
  
  const handleCloseMessageModal = () => {
    setMessageModalOpen(false);
    dispatch({ type: 'messages/setCurrentMessage', payload: null });
  };
  
  const handleOpenRepliesModal = (userId: number) => {
    const selectedUser = usersState.users.find(u => u.id === userId);
    if (selectedUser) {
      dispatch({ type: 'users/setCurrentUser', payload: selectedUser });
      dispatch({ type: 'users/fetchReplies', payload: userId });
      setRepliesModalOpen(true);
    }
  };
  
  const handleCloseRepliesModal = () => {
    setRepliesModalOpen(false);
    dispatch({ type: 'users/setCurrentUser', payload: null });
  };
  
  const handleOpenPromoModal = () => {
    if (usersState.selectedUsers.length > 0) {
      setPromoModalOpen(true);
    } else {
      toast({
        title: "No users selected",
        description: "Please select at least one user to send a promotional message.",
        variant: "destructive"
      });
    }
  };
  
  const handleClosePromoModal = () => {
    setPromoModalOpen(false);
  };
  
  const handleOpenDeleteModal = (target: "message" | "users", messageId?: number) => {
    setDeleteTarget(target);
    if (target === "message" && messageId) {
      setDeleteMessageId(messageId);
    }
    setDeleteModalOpen(true);
  };
  
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteMessageId(null);
  };
  
  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={handleLogout} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={activeTab === "messages" ? "Messages" : "Users"} 
          userName={user?.name || "Admin User"} 
        />
        
        <main className="flex-1 overflow-y-auto bg-slate-50 p-3 md:p-6">
          {activeTab === "messages" ? (
            <MessagesList 
              messages={messagesState.messages}
              loading={messagesState.loading}
              onCreateMessage={() => handleOpenMessageModal()}
              onEditMessage={(id) => handleOpenMessageModal(id)}
              onDeleteMessage={(id) => handleOpenDeleteModal("message", id)}
            />
          ) : (
            <UsersList 
              users={usersState.users}
              selectedUsers={usersState.selectedUsers}
              loading={usersState.loading}
              onViewReplies={handleOpenRepliesModal}
              onSendPromo={handleOpenPromoModal}
              onDeleteUsers={() => handleOpenDeleteModal("users")}
            />
          )}
        </main>
      </div>
      
      {/* Modals */}
      <MessageModal 
        isOpen={messageModalOpen}
        onClose={handleCloseMessageModal}
        message={messagesState.currentMessage}
      />
      
      <UserRepliesModal 
        isOpen={repliesModalOpen}
        onClose={handleCloseRepliesModal}
        user={usersState.currentUser}
        replies={usersState.userReplies}
        loading={usersState.loading}
      />
      
      <SendPromoModal 
        isOpen={promoModalOpen}
        onClose={handleClosePromoModal}
        selectedCount={usersState.selectedUsers.length}
        selectedUsers={usersState.selectedUsers}
      />
      
      <DeleteConfirmationModal 
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        target={deleteTarget}
        messageId={deleteMessageId}
        selectedUsers={usersState.selectedUsers}
      />
    </div>
  );
}
