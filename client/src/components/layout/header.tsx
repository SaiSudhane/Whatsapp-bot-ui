import { FC } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  title: string;
  userName: string;
}

const Header: FC<HeaderProps> = ({ title, userName }) => {
  const isMobile = useIsMobile();
  
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
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <h1 className={`${isMobile ? 'ml-12' : ''} text-lg md:text-xl font-semibold text-slate-800 truncate`}>
          {title}
        </h1>
        
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8 bg-primary">
              <AvatarFallback>{getInitials(userName)}</AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline text-sm font-medium text-slate-700">{userName}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
