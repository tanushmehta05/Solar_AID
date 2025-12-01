
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Settings, ShieldCheck } from "lucide-react";

const UserMenu = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (!user) {
    return (
      <Button
        onClick={() => navigate("/auth")}
        variant="outline"
        className="dark:border-gray-600 dark:text-gray-300"
      >
        Log In
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700"
        >
          <User className="h-5 w-5 text-primary dark:text-gray-300" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
        <DropdownMenuLabel className="dark:text-white">
          {profile?.full_name || "My Account"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="dark:border-gray-700" />
        <DropdownMenuItem 
          className="cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700"
          onClick={() => navigate("/profile")}
        >
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        
        {isAdmin && (
          <DropdownMenuItem 
            className="cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700"
            onClick={() => navigate("/admin")}
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            <span>Admin Dashboard</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem 
          className="cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700"
          onClick={() => navigate("/settings")}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="dark:border-gray-700" />
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 dark:text-red-400 dark:hover:bg-gray-700"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
