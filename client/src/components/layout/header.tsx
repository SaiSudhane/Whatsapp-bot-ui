import { FC } from "react";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  title: string;
  userName: string;
}

const Header: FC<HeaderProps> = ({ title, userName }) => {
  // Get initials from user name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="flex items-center text-slate-600 hover:text-slate-800">
              <Bell className="h-5 w-5" />
            </button>
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8 bg-primary">
              <AvatarFallback>{getInitials(userName)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-slate-700">{userName}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
