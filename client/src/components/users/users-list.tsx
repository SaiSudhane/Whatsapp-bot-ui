import { FC, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { 
  selectUser, 
  deselectUser, 
  setSelectedUsers, 
  clearSelectedUsers 
} from "@/store/users-slice";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, Layers, Trash, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "date-fns";

interface UsersListProps {
  users: User[];
  selectedUsers: number[];
  loading: boolean;
  onViewReplies: (userId: number) => void;
  onSendPromo: () => void;
  onDeleteUsers: () => void;
}

const UsersList: FC<UsersListProps> = ({ 
  users, 
  selectedUsers, 
  loading, 
  onViewReplies, 
  onSendPromo, 
  onDeleteUsers 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  
  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [users, searchTerm]);
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      dispatch(setSelectedUsers(filteredUsers.map(user => user.id)));
    } else {
      dispatch(clearSelectedUsers());
    }
  };
  
  const handleSelectUser = (userId: number, checked: boolean) => {
    if (checked) {
      dispatch(selectUser(userId));
    } else {
      dispatch(deselectUser(userId));
    }
  };
  
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <div>
      {/* Action Bar */}
      <div className="flex justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-800">Manage Users</h2>
        <div className="flex space-x-2">
          <Button 
            onClick={onSendPromo} 
            disabled={selectedUsers.length === 0}
          >
            <Layers className="h-4 w-4 mr-2" />
            Send Promo
          </Button>
          <Button 
            variant="destructive" 
            onClick={onDeleteUsers} 
            disabled={selectedUsers.length === 0}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-slate-700">User List</h3>
              <Badge variant="outline" className="bg-primary-100 text-primary">
                {selectedUsers.length} Selected
              </Badge>
            </div>
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Search users..." 
                className="pl-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                  <TableHead className="w-14">
                    <Checkbox 
                      checked={
                        filteredUsers.length > 0 && 
                        selectedUsers.length === filteredUsers.length
                      }
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all users"
                    />
                  </TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      {searchTerm ? "No users match your search." : "No users found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                          aria-label={`Select ${user.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">#{user.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 bg-slate-200">
                            <AvatarFallback className="text-slate-600">{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-slate-900">{user.name}</div>
                            <div className="text-sm text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        {user.joinedDate 
                          ? formatDate(new Date(user.joinedDate), 'yyyy-MM-dd') 
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onViewReplies(user.id)}
                          className="text-primary"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" /> Replies
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
        
        {filteredUsers.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredUsers.length}</span> of <span className="font-medium">{users.length}</span> users
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

export default UsersList;
