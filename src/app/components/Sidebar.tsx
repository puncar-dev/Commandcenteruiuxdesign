import React from "react";
import { MessageSquare, Plus, MoreHorizontal, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { Chat, Agent } from "@/types";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string;
  onSelectChat: (id: string) => void;
  agents: Agent[];
  selectedAgentIds: string[];
  onAgentClick: (id: string) => void;
  onNewChat: () => void;
  onAgentSettings: (id: string) => void;
}

export default function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  agents,
  selectedAgentIds,
  onAgentClick,
  onNewChat,
  onAgentSettings,
}: SidebarProps) {
  
  const formatTime = (timestamp: number) => {
      if (!timestamp) return '';
      try {
        return formatDistanceToNow(timestamp, { addSuffix: false })
            .replace('about ', '')
            .replace('less than a minute', 'now')
            .replace(' minutes', 'm')
            .replace(' minute', 'm')
            .replace(' hours', 'h')
            .replace(' hour', 'h')
            .replace(' days', 'd')
            .replace(' day', 'd');
      } catch (e) {
          return '';
      }
  };

  return (
    <div className="w-full h-full flex flex-col border-r border-border bg-muted/10 shrink-0 select-none">
      
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-6 scrollbar-hide">
        
        {/* Chats Section */}
        <div className="px-4">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Chats</h2>
                <button 
                    onClick={onNewChat} 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title="New Chat"
                >
                    <Plus className="w-3.5 h-3.5" />
                </button>
            </div>
            <div className="flex flex-col gap-1">
                {chats.map(chat => (
                    <button
                        key={chat.id}
                        onClick={() => onSelectChat(chat.id)}
                        className={cn(
                            "flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors text-left group",
                            activeChatId === chat.id 
                                ? "bg-white shadow-sm text-foreground font-medium" 
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                    >
                        <MessageSquare className={cn("w-4 h-4 shrink-0", activeChatId === chat.id ? "text-blue-500" : "opacity-70")} />
                        <span className="truncate flex-1">{chat.title}</span>
                        <span className="text-[10px] opacity-0 group-hover:opacity-50 whitespace-nowrap">
                            {formatTime(chat.lastActivity)}
                        </span>
                    </button>
                ))}
            </div>
        </div>

        {/* Agents Section */}
        <div className="px-4">
            <div className="flex items-center justify-between mb-3">
                 <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Agents</h2>
                 <div className="flex items-center gap-2">
                     <span className="text-[10px] text-muted-foreground">{agents.filter(a => a.status === 'working').length} active</span>
                 </div>
            </div>
            <div className="flex flex-col gap-2">
                {agents.map(agent => {
                    const pnl = agent.pnl ?? 0;
                    const pnl24h = agent.pnl24h ?? 0;
                    const pnlColor = pnl >= 0 ? "text-green-600" : "text-red-600";
                    const pnl24hColor = pnl24h >= 0 ? "text-green-600" : "text-red-600";
                    
                    return (
                        <div
                            key={agent.id}
                            className="relative group rounded-xl bg-white border border-border/50 shadow-sm hover:border-border transition-all overflow-hidden"
                        >
                            <button
                                onClick={() => onAgentClick(agent.id)}
                                className="flex flex-col gap-1 py-2 px-3 text-left w-full h-full"
                            >
                                {/* Top Row: Icon + Name + 24h% */}
                                <div className="flex items-center gap-3 w-full relative z-10">
                                    {/* Status Indicator */}
                                    <div className={cn(
                                        "w-2 h-2 rounded-full shrink-0",
                                        agent.color
                                    )} />
                                    
                                    <span className="flex-1 truncate text-sm font-medium text-foreground">{agent.name}</span>
                                    
                                    {/* This span will be obscured by the menu on hover */}
                                    <div className="group-hover:opacity-0 transition-opacity">
                                        {agent.status === 'working' ? (
                                             <span className="text-[10px] text-blue-500 font-medium animate-pulse">Running</span>
                                        ) : (
                                             <span className={cn("text-[10px] font-medium", pnl24hColor)}>
                                                {pnl24h > 0 ? '+' : ''}{pnl24h}%
                                             </span>
                                        )}
                                    </div>
                                </div>

                                {/* Bottom Row: Metrics (P&L | Positions | Time) */}
                                <div className="pl-5 flex items-center gap-2 text-[10px] text-muted-foreground/80 w-full overflow-hidden relative z-10">
                                    <span className={cn("font-medium", pnlColor)}>
                                        {pnl > 0 ? '+' : ''}{pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </span>
                                    <span className="text-muted-foreground/40">·</span>
                                    <span className="truncate">{agent.activePositions ?? 0} pos</span>
                                    <span className="text-muted-foreground/40">·</span>
                                    <span className="truncate">{formatTime(agent.lastActivity || Date.now())}</span>
                                </div>
                            </button>

                            {/* Dropdown Menu - Top Right */}
                            <div className="absolute top-1.5 right-1.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                <DropdownMenu.Root>
                                    <DropdownMenu.Trigger asChild>
                                        <button 
                                            className="p-1 h-6 w-6 flex items-center justify-center rounded-md hover:bg-muted bg-white border border-border/50 shadow-sm text-muted-foreground"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreHorizontal className="w-3.5 h-3.5" />
                                        </button>
                                    </DropdownMenu.Trigger>
                                    
                                    <DropdownMenu.Portal>
                                        <DropdownMenu.Content 
                                            className="min-w-[140px] bg-popover rounded-md border border-border shadow-md p-1 z-50 animate-in fade-in-80 zoom-in-95"
                                            align="end"
                                            sideOffset={5}
                                        >
                                            <DropdownMenu.Item 
                                                className="flex items-center gap-2 px-2 py-1.5 text-sm outline-none cursor-pointer hover:bg-muted focus:bg-muted rounded-sm text-foreground"
                                                onSelect={(e) => {
                                                    // Prevent bubbling if needed, but onSelect happens after click
                                                    onAgentSettings(agent.id);
                                                }}
                                            >
                                                <Settings className="w-3.5 h-3.5" />
                                                <span>Settings</span>
                                            </DropdownMenu.Item>
                                        </DropdownMenu.Content>
                                    </DropdownMenu.Portal>
                                </DropdownMenu.Root>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>

      </div>
      
    </div>
  );
}
