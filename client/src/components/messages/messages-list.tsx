import { FC } from "react";
import { Message } from "@shared/schema";
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
import { Plus, Search, Edit, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "date-fns";

interface MessagesListProps {
  messages: Message[];
  loading: boolean;
  onCreateMessage: () => void;
  onEditMessage: (id: number) => void;
  onDeleteMessage: (id: number) => void;
}

const MessagesList: FC<MessagesListProps> = ({ 
  messages, 
  loading, 
  onCreateMessage, 
  onEditMessage, 
  onDeleteMessage 
}) => {
  return (
    <div>
      {/* Action Bar */}
      <div className="flex justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-800">Manage Messages</h2>
        <Button onClick={onCreateMessage}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Message
        </Button>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-slate-700">Existing Messages</h3>
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Search messages..." 
                className="pl-8" 
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
                  <TableHead>ID</TableHead>
                  <TableHead>Message Preview</TableHead>
                  <TableHead>Fixed Reply</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      No messages found. Create your first message.
                    </TableCell>
                  </TableRow>
                ) : (
                  messages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell className="font-medium">#{message.id}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {message.content}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={message.fixedReplyRequired ? "success" : "secondary"}>
                          {message.fixedReplyRequired ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {message.createdAt 
                          ? formatDate(new Date(message.createdAt), 'yyyy-MM-dd') 
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
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
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{messages.length}</span> of <span className="font-medium">{messages.length}</span> results
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
    </div>
  );
};

export default MessagesList;
