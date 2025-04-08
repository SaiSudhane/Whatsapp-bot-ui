import { FC } from "react";
import { MessageSquare, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeTab: "messages" | "users";
  onTabChange: (tab: "messages" | "users") => void;
  onLogout: () => void;
}

const Sidebar: FC<SidebarProps> = ({ activeTab, onTabChange, onLogout }) => {
  return (
    <div className="w-64 bg-slate-800 text-white flex flex-col z-10">
      <div className="p-4 border-b border-slate-700 flex items-center">
        {/* Logo Placeholder - would use actual logo in production */}
        <div className="h-10 w-32 bg-slate-700 rounded flex items-center justify-center">
          <span className="text-slate-300 text-sm">Company Logo</span>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul>
          <li className="px-2">
            <Button
              variant={activeTab === "messages" ? "default" : "ghost"}
              className={`w-full flex items-center px-4 py-3 text-sm rounded-md ${
                activeTab === "messages" 
                  ? "bg-primary hover:bg-primary/90" 
                  : "hover:bg-slate-700 text-white"
              } transition-colors font-medium justify-start`}
              onClick={() => onTabChange("messages")}
            >
              <MessageSquare className="mr-3 h-5 w-5" />
              <span>Messages</span>
            </Button>
          </li>
          <li className="px-2 mt-2">
            <Button
              variant={activeTab === "users" ? "default" : "ghost"}
              className={`w-full flex items-center px-4 py-3 text-sm rounded-md ${
                activeTab === "users" 
                  ? "bg-primary hover:bg-primary/90" 
                  : "hover:bg-slate-700 text-white"
              } transition-colors font-medium justify-start`}
              onClick={() => onTabChange("users")}
            >
              <Users className="mr-3 h-5 w-5" />
              <span>Users</span>
            </Button>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-slate-700">
        <Button
          variant="ghost"
          className="flex items-center text-sm text-slate-300 hover:text-white transition-colors justify-start p-0"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
