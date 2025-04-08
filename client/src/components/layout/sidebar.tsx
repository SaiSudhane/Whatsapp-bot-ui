import { FC, useState, useEffect } from "react";
import { MessageSquare, Users, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  activeTab: "messages" | "users";
  onTabChange: (tab: "messages" | "users") => void;
  onLogout: () => void;
}

const Sidebar: FC<SidebarProps> = ({ activeTab, onTabChange, onLogout }) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  // Update sidebar visibility when screen size changes
  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  // Close sidebar when changing tabs on mobile
  const handleTabChange = (tab: "messages" | "users") => {
    onTabChange(tab);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 bg-slate-800 text-white hover:bg-slate-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}

      {/* Sidebar */}
      <div 
        className={`${
          isMobile 
            ? `fixed inset-y-0 left-0 z-40 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
            : 'relative'
        } w-72 bg-slate-800 text-white flex flex-col transition-transform duration-200 ease-in-out`}
      >
        <div className="p-4 border-b border-slate-700 flex items-center">
          <div className="h-10 flex items-center justify-center">
            <img src="/assets/logo.jpg" alt="MyAdvisor.sg Logo" className="h-10" />
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
                onClick={() => handleTabChange("messages")}
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
                onClick={() => handleTabChange("users")}
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

      {/* Overlay to close sidebar on mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
