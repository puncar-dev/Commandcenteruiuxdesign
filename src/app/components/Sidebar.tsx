import React from "react";
import { MessageSquare, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { Chat, Agent } from "@/types";

interface SidebarProps {
  chats: Chat[];
  activeChatId: string;
  onSelectChat: (id: string) => void;
  agents: Agent[];
  selectedAgentIds: string[];
  onAgentClick: (id: string) => void;
  onNewChat: () => void;
}

export default function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  agents,
  selectedAgentIds,
  onAgentClick,
  onNewChat,
}: SidebarProps) {
  return (
    <div className="w-full md:w-[260px] flex flex-col border-r border-border bg-muted/10 shrink-0 select-none h-full">
      
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
                            {formatDistanceToNow(chat.lastActivity, { addSuffix: false })
                                .replace('about ', '')
                                .replace('less than a minute', 'now')
                                .replace(' minutes', 'm')
                                .replace(' hours', 'h')
                                .replace(' days', 'd')}
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
                     <span className="text-[10px] text-muted-foreground">{selectedAgentIds.length} active</span>
                 </div>
            </div>
            <div className="flex flex-col gap-2">
                {agents.map(agent => {
                    const isActiveInChat = selectedAgentIds.includes(agent.id);
                    // Map generic colors to specific border colors if needed, or use inline styles for dynamic mapping
                    const borderColorClass = isActiveInChat ? agent.color.replace('bg-', 'border-') : 'border-gray-300';
                    const textColorClass = isActiveInChat ? "text-foreground font-medium" : "text-muted-foreground";
                    
                    return (
                        <button
                            key={agent.id}
                            onClick={() => onAgentClick(agent.id)}
                            className={cn(
                                "flex items-center gap-3 py-1.5 text-sm transition-colors text-left w-full group",
                                "hover:opacity-80"
                            )}
                        >
                            {/* Status Indicator (Matching Figma Image) */}
                            <div className={cn(
                                "w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0",
                                isActiveInChat ? borderColorClass : "border-muted-foreground/30"
                            )}>
                                {isActiveInChat && <div className={cn("w-2 h-2 rounded-full", agent.color)} />}
                            </div>
                            
                            <span className={cn("flex-1 truncate", textColorClass)}>{agent.name}</span>
                            
                            {agent.status === 'working' && isActiveInChat && (
                                <span className="text-[10px] text-blue-500 font-medium animate-pulse">Running</span>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>

      </div>
      
    </div>
  );
}
