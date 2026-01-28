import React from "react";
import { 
  Home, 
  Bell, 
  Trophy, 
  TrendingUp, 
  MessageCircle, 
  Bot, 
  Users, 
  Gift, 
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GlobalNavigationProps {
  activeItem?: string;
  onNavigate?: (item: string) => void;
  collapsed?: boolean;
}

export default function GlobalNavigation({ activeItem = "Command Center", onNavigate, collapsed = false }: GlobalNavigationProps) {
  const navItems = [
    { name: "Home", icon: Home },
    { name: "Notifications", icon: Bell },
    { name: "Leaderboard", icon: Trophy },
    { name: "Markets", icon: TrendingUp },
    { name: "Chats", icon: MessageCircle },
    { name: "Agents", icon: Bot },
    { name: "Rewards", icon: Gift },
    { name: "Profile", icon: User },
  ];

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <div className={cn(
          "hidden md:flex h-full bg-sidebar border-r border-sidebar-border flex-col shrink-0 text-sidebar-foreground font-sans transition-all duration-300 ease-in-out z-50",
          collapsed ? "w-20" : "w-64"
      )}>
        {/* Logo Area */}
        <div className={cn("h-16 flex items-center px-6 gap-3 select-none overflow-hidden", collapsed && "justify-center px-0")}>
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          {!collapsed && (
              <span className="text-xl font-bold text-blue-600 tracking-tight whitespace-nowrap opacity-100 transition-opacity duration-300">
                  babylon
              </span>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4 flex flex-col gap-1 overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = item.name === activeItem;
            return (
              <button
                key={item.name}
                onClick={() => onNavigate?.(item.name)}
                title={collapsed ? item.name : undefined}
                className={cn(
                  "flex items-center gap-4 py-3.5 text-sm font-medium transition-all duration-200 relative group",
                  collapsed ? "justify-center px-0" : "px-6",
                  isActive 
                    ? "bg-blue-600 text-white" 
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground")} />
                
                {!collapsed && (
                    <span className="whitespace-nowrap transition-opacity duration-300">{item.name}</span>
                )}
                
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-700 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* User Profile Footer */}
        <div className="p-4 mt-auto">
          <div className={cn(
              "flex items-center gap-3 p-3 rounded-xl hover:bg-sidebar-accent cursor-pointer transition-colors group overflow-hidden",
              collapsed && "justify-center px-0"
          )}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-[1px] shrink-0">
               <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                  <img 
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" 
                      alt="User" 
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
               </div>
            </div>
            {!collapsed && (
                <div className="flex flex-col whitespace-nowrap transition-opacity duration-300">
                  <span className="text-sm font-semibold text-sidebar-foreground group-hover:text-blue-600 transition-colors">puncar</span>
                  <span className="text-xs text-sidebar-foreground/60">@puncar</span>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[calc(3.5rem+env(safe-area-inset-bottom))] bg-background/80 backdrop-blur-md border-t border-border flex items-start justify-around px-2 z-50 pb-[env(safe-area-inset-bottom)]">
        {navItems.slice(0, 5).map((item) => { // Show first 5 items on mobile to avoid crowding
          const isActive = item.name === activeItem;
          return (
            <button
              key={item.name}
              onClick={() => onNavigate?.(item.name)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors relative w-full",
                isActive ? "text-blue-600" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "fill-current")} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </button>
          );
        })}
        {/* 'More' button for remaining items could go here */}
         <button
            onClick={() => {}} 
            className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-muted-foreground hover:text-foreground w-full"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden border border-border">
               <img 
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" 
                    alt="User" 
                    className="w-full h-full object-cover"
                />
            </div>
            <span className="text-[10px] font-medium">Profile</span>
          </button>
      </div>
    </>
  );
}
