import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { QuestionsAPI, UsersAPI } from "@/lib/api";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MessagesList from "@/components/messages/messages-list";
import UsersList from "@/components/users/users-list";
import MessageModal from "@/components/messages/message-modal";
import UserRepliesModal from "@/components/users/user-replies-modal";
import SendPromoModal from "@/components/users/send-promo-modal";
import DeleteConfirmationModal from "@/components/ui/delete-confirmation-modal";
import { Question, User, UserReply } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, advisor, logoutMutation } = useAuth();

  const [activeTab, setActiveTab] = useState<"messages" | "users">("messages");
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [repliesModalOpen, setRepliesModalOpen] = useState(false);
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<"message" | "users">("message");
  const [deleteMessageId, setDeleteMessageId] = useState<number | null>(null);
  const [currentMessage, setCurrentMessage] = useState<Question | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [currentReplies, setCurrentReplies] = useState<UserReply[]>([]);

  // Queries
  const advisorId = advisor?.id;

  const { 
    data: questions = [], 
    isLoading: questionsLoading,
    error: questionsError
  } = useQuery({
    queryKey: ['questions', advisorId],
    queryFn: () => advisorId ? QuestionsAPI.getQuestions(advisorId).then(res => res.questions) : Promise.resolve([]),
    enabled: !!advisorId
  });

  const { 
    data: users = [], 
    isLoading: usersLoading,
    error: usersError
  } = useQuery({
    queryKey: ['users', advisorId],
    queryFn: () => advisorId ? UsersAPI.getUsers(advisorId) : Promise.resolve([]),
    enabled: !!advisorId
  });

  // User replies query is only enabled when viewing replies
  const { 
    data: userReplies = [],
    isLoading: repliesLoading
  } = useQuery({
    queryKey: ['userReplies', advisorId, currentUser?.id],
    queryFn: () => advisorId && currentUser?.id 
      ? UsersAPI.getUserReplies(advisorId, currentUser.id) 
      : Promise.resolve([]),
    enabled: !!advisorId && !!currentUser?.id,
  });

  // Mutations
  const deleteQuestionMutation = useMutation({
    mutationFn: (id: number) => QuestionsAPI.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', advisorId] });
      toast({
        title: "Question deleted",
        description: "The question has been deleted successfully."
      });
      handleCloseDeleteModal();
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting question",
        description: error.message || "An error occurred while deleting the question.",
        variant: "destructive"
      });
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: (contentSid: string) => {
      if (!advisorId) throw new Error("Advisor ID not found");
      
      // Send promotional message with content_sid to all selected users
      return UsersAPI.sendPromoMessage(contentSid, advisorId, selectedUsers);
    },
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: `Promotional message sent to ${selectedUsers.length} users successfully.`
      });
      handleClosePromoModal();
      setSelectedUsers([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error sending message",
        description: error.message || "An error occurred while sending the message.",
        variant: "destructive"
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userIds: number[]) => {
      if (!advisorId) throw new Error("Advisor ID not found");
      
      // Delete users one by one
      return Promise.all(
        userIds.map(userId => 
          UsersAPI.deleteUser(userId, advisorId)
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', advisorId] });
      toast({
        title: "Users deleted",
        description: "The selected users have been deleted successfully."
      });
      handleCloseDeleteModal();
      setSelectedUsers([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting users",
        description: error.message || "An error occurred while deleting users.",
        variant: "destructive"
      });
    }
  });


  // Handlers
  const handleLogout = () => {
    if (user) {
      logoutMutation.mutate();
    }
  };

  const handleOpenMessageModal = (messageId?: number) => {
    if (messageId) {
      const message = questions.find(m => m.id === messageId);
      if (message) {
        setCurrentMessage(message);
      }
    } else {
      setCurrentMessage(null);
    }
    setMessageModalOpen(true);
  };

  const handleCloseMessageModal = () => {
    setMessageModalOpen(false);
    setCurrentMessage(null);
  };

  const handleOpenRepliesModal = (userId: number) => {
    const selectedUser = users.find(u => u.id === userId);
    if (selectedUser) {
      setCurrentUser(selectedUser);
      setRepliesModalOpen(true);
    }
  };

  const handleCloseRepliesModal = () => {
    setRepliesModalOpen(false);
    setCurrentUser(null);
  };

  const handleOpenPromoModal = () => {
    if (selectedUsers.length > 0) {
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

  const handleDeleteConfirm = () => {
    if (deleteTarget === "message" && deleteMessageId) {
      deleteQuestionMutation.mutate(deleteMessageId);
    } else if (deleteTarget === "users" && selectedUsers.length > 0) {
      deleteUserMutation.mutate(selectedUsers);
    }
  };

  const handleSendPromoMessage = (contentSid: string) => {
    sendMessageMutation.mutate(contentSid);
  };

  // If any critical queries are loading, show a loading state
  if (!advisor || (advisorId && (questionsLoading || usersLoading))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If there are errors, show them
  if (questionsError || usersError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg w-full text-center">
          <h2 className="text-red-700 text-xl font-bold mb-2">Error Loading Data</h2>
          <p className="text-red-600 mb-4">
            {(questionsError as Error)?.message || (usersError as Error)?.message || "Failed to load data from the server."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={handleLogout} 
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={activeTab === "messages" ? "Questions" : "Users"} 
          userName={advisor?.name || user?.email || "Admin User"} 
        />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-3 md:p-6">
          {activeTab === "messages" ? (
            <MessagesList 
              messages={questions}
              loading={questionsLoading}
              onCreateMessage={() => handleOpenMessageModal()}
              onEditMessage={(id) => handleOpenMessageModal(id)}
              onDeleteMessage={(id) => handleOpenDeleteModal("message", id)}
            />
          ) : (
            <UsersList 
              users={users}
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
              loading={usersLoading}
              onViewReplies={handleOpenRepliesModal}
              onSendPromo={handleOpenPromoModal}
              onDeleteUsers={() => handleOpenDeleteModal("users")}
            />
          )}
        </main>

        <Footer />
      </div>

      {/* Modals */}
      <MessageModal 
        isOpen={messageModalOpen}
        onClose={handleCloseMessageModal}
        message={currentMessage}
        advisorId={advisorId}
      />

      <UserRepliesModal 
        isOpen={repliesModalOpen}
        onClose={handleCloseRepliesModal}
        user={currentUser}
        replies={userReplies}
        loading={repliesLoading}
      />

      <SendPromoModal 
        isOpen={promoModalOpen}
        onClose={handleClosePromoModal}
        selectedCount={selectedUsers.length}
        selectedUsers={selectedUsers}
        onSendMessage={handleSendPromoMessage}
        isPending={sendMessageMutation.isPending}
      />

      <DeleteConfirmationModal 
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        target={deleteTarget}
        messageId={deleteMessageId}
        selectedUsers={selectedUsers}
        onConfirm={handleDeleteConfirm}
        isPending={deleteQuestionMutation.isPending || deleteUserMutation.isPending}
      />
    </div>
  );
}