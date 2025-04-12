import { FC, useState } from "react";
import { Question } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Plus, Search, Edit, Trash, ChevronDown, ChevronUp, Eye, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";

interface MessagesListProps {
  messages: Question[];
  loading: boolean;
  onCreateMessage: () => void;
  onEditMessage: (id: number) => void;
  onDeleteMessage: (id: number) => void;
  onManageContentSids: () => void; // Added prop for content SID management
}

const MessagesList: FC<MessagesListProps> = ({ 
  messages, 
  loading, 
  onCreateMessage, 
  onEditMessage, 
  onDeleteMessage,
  onManageContentSids 
}) => {
  const [selectedMessage, setSelectedMessage] = useState<Question | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleViewMessage = (message: Question) => {
    setSelectedMessage(message);
    setIsViewOpen(true);
  };

  // Filter messages based on question content
  const filteredMessages = messages.filter(message => 
    message.question.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div>
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h2 className="text-lg font-semibold text-slate-800">Manage Questions</h2>
        <div className="flex space-x-2">
          {onManageContentSids && (
            <Button variant="outline" onClick={onManageContentSids}>
              <Settings className="h-4 w-4 mr-2" /> Content SIDs
            </Button>
          )}
          <Button onClick={onCreateMessage}>
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Create New Question</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="font-medium text-slate-700">Existing Questions</h3>
            <div className="relative w-full sm:w-auto max-w-sm">
              <Input 
                type="text" 
                placeholder="Search questions..." 
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question Content</TableHead>
                  <TableHead className="hidden sm:table-cell">Has Fixed Reply</TableHead>
                  <TableHead className="hidden md:table-cell">Flow Step</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      {searchQuery ? "No matching questions found." : "No questions found. Create your first question."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMessages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {message.question}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge 
                          variant={message.triggerKeyword !== "" ? "default" : "secondary"}
                          className={message.triggerKeyword !== "" ? "bg-green-500" : ""}
                        >
                          {message.triggerKeyword !== "" ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {`Step ${message.step}`}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewMessage(message)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                          title="View full content"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onEditMessage(message.id)}
                          className="text-primary hover:text-primary/80 hover:bg-primary/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onDeleteMessage(message.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-100"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {messages.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-700">
                  {searchQuery 
                    ? `Showing ${filteredMessages.length} of ${messages.length} questions` 
                    : `Showing all ${messages.length} questions`}
                </p>
              </div>
              <div>
                {/* Simplified pagination for the demo */}
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <Button variant="outline" size="sm" className="rounded-l-md">
                    <span className="sr-only">Previous</span>
                    <span className="text-xs">&laquo;</span>
                  </Button>
                  <Button variant="outline" size="sm" className="bg-primary-50 text-primary-600">
                    1
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-r-md">
                    <span className="sr-only">Next</span>
                    <span className="text-xs">&raquo;</span>
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full Content Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Question Content - Step {selectedMessage?.step}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto mt-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 whitespace-pre-wrap">
              {selectedMessage?.question}
            </div>

            {selectedMessage?.triggerKeyword && (
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-700 mb-1">Trigger Keyword:</p>
                <p className="bg-primary/10 text-primary p-2 rounded inline-block font-mono">
                  {selectedMessage.triggerKeyword}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end mt-4">
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessagesList;