
import React, { useState } from "react";
import { Sun, ShoppingCart, MessageSquare, BarChart, PanelTop } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/components/theme-provider";
import UserMenu from "@/components/UserMenu";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { theme } = useTheme();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900 transition-colors duration-300">
      <header className="border-b shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 sticky top-0 z-30 transition-colors duration-300">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <Sun className="h-8 w-8 text-solar-orange" />
            <span className="font-semibold text-xl dark:text-white transition-colors duration-300">Solar Vision AI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className={`text-sm font-medium hover:text-primary transition-colors ${isActive('/') ? 'text-primary dark:text-white' : 'text-muted-foreground dark:text-gray-300'}`}
            >
              Home
            </Link>
            <Link 
              to="/marketplace" 
              className={`text-sm font-medium hover:text-primary transition-colors ${isActive('/marketplace') ? 'text-primary dark:text-white' : 'text-muted-foreground dark:text-gray-300'}`}
            >
              Marketplace
            </Link>
            <Link 
              to="/analysis" 
              className={`text-sm font-medium hover:text-primary transition-colors ${isActive('/analysis') ? 'text-primary dark:text-white' : 'text-muted-foreground dark:text-gray-300'}`}
            >
              Analysis Tool
            </Link>
            <Link 
              to="/chat" 
              className={`text-sm font-medium hover:text-primary transition-colors ${isActive('/chat') ? 'text-primary dark:text-white' : 'text-muted-foreground dark:text-gray-300'}`}
            >
              AI Assistant
            </Link>
            <Link 
              to="/optimization" 
              className={`text-sm font-medium hover:text-primary transition-colors ${isActive('/optimization') ? 'text-primary dark:text-white' : 'text-muted-foreground dark:text-gray-300'}`}
            >
              Optimization
            </Link>
            <div className="ml-4 flex items-center gap-2">
              <ThemeToggle />
              <UserMenu />
            </div>
          </nav>
          <div className="md:hidden flex items-center space-x-4">
            <ThemeToggle />
            <UserMenu />
            <MobileMenu />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 bg-secondary/20 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-6 text-center md:text-left">
          <p className="text-sm text-muted-foreground dark:text-gray-400 transition-colors duration-300">
            &copy; {new Date().getFullYear()} Solar Vision AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground dark:text-gray-400 transition-colors duration-300">
            <Link to="/" className="hover:underline">
              Privacy
            </Link>
            <Link to="/" className="hover:underline">
              Terms
            </Link>
            <Link to="/chat" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <div className="relative">
      <button 
        onClick={toggleMenu}
        className="flex items-center p-2"
        aria-label="Toggle menu"
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d={isOpen 
              ? "M18 6L6 18M6 6L18 18" 
              : "M4 6h16M4 12h16M4 18h16"
            } 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md border dark:border-gray-700 py-2 z-50 transition-colors duration-300">
          <Link 
            to="/" 
            className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition-colors duration-300"
            onClick={() => setIsOpen(false)}
          >
            <Sun className="h-4 w-4 mr-2" />
            Home
          </Link>
          <Link 
            to="/marketplace" 
            className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition-colors duration-300"
            onClick={() => setIsOpen(false)}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Marketplace
          </Link>
          <Link 
            to="/analysis" 
            className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition-colors duration-300"
            onClick={() => setIsOpen(false)}
          >
            <PanelTop className="h-4 w-4 mr-2" />
            Analysis Tool
          </Link>
          <Link 
            to="/chat" 
            className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition-colors duration-300"
            onClick={() => setIsOpen(false)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            AI Assistant
          </Link>
          <Link 
            to="/optimization" 
            className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition-colors duration-300"
            onClick={() => setIsOpen(false)}
          >
            <BarChart className="h-4 w-4 mr-2" />
            Optimization
          </Link>
        </div>
      )}
    </div>
  );
};

export default Layout;
