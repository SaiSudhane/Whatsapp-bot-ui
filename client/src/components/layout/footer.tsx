import { FC } from "react";

const Footer: FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-4 text-center text-sm text-slate-600">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-2 md:mb-0">
            <img src="/logo.jpg" alt="MyAdvisor.sg Logo" className="h-6 mr-2" />
            <span className="text-primary font-medium">MyAdvisor.sg</span>
          </div>
          <div>
            &copy; {2025} MyAdvisor.sg. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;