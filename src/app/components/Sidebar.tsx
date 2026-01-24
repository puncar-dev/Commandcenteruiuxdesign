import React from "react";
import { MessageSquare, Users, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { Chat, Agent } from "@/types";

interface SidebarProps {
  chats: Chat[];
  activeChatId: string;
  onSelectChat: (id: string) => void;
  agents: Agent[];
  selectedAgentIds: string[];
  onToggleAgent: (id: string) => void;
  onNewChat: () => void;
  onNewAgent: () => void;
}

export default function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  agents,
  selectedAgentIds,
  onToggleAgent,
  onNewChat,
  onNewAgent
}: SidebarProps) {
  return (
    <div className="w-[260px] flex flex-col border-r border-border bg-muted/10 shrink-0 select-none">
      
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-6 scrollbar-hide">
        
        {/* Chats Section */}
        <div className="px-3">
            <div className="flex items-center justify-between px-2 mb-2">
                <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Chats</h2>
                <button 
                    onClick={onNewChat} 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title="New Chat"
                >
                    <Plus className="w-3.5 h-3.5" />
                </button>
            </div>
            <div className="flex flex-col gap-0.5">
                {chats.map(chat => (
                    <button
                        key={chat.id}
                        onClick={() => onSelectChat(chat.id)}
                        className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left group",
                            activeChatId === chat.id 
                                ? "bg-accent text-accent-foreground" 
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                    >
                        <MessageSquare className="w-3.5 h-3.5 shrink-0" />
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
        <div className="px-3">
            <div className="flex items-center justify-between px-2 mb-2">
                 <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Agents</h2>
                 <div className="flex items-center gap-2">
                     <span className="text-[10px] text-muted-foreground">{selectedAgentIds.length} active</span>
                     <button 
                        onClick={onNewAgent} 
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="New Agent"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                 </div>
            </div>
            <div className="flex flex-col gap-0.5">
                {agents.map(agent => {
                    const isSelected = selectedAgentIds.includes(agent.id);
                    return (
                        <button
                            key={agent.id}
                            onClick={() => onToggleAgent(agent.id)}
                            className={cn(
                                "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left w-full group border border-transparent",
                                isSelected 
                                    ? "bg-accent/50 text-foreground border-accent" 
                                    : "text-muted-foreground hover:bg-muted/30"
                            )}
                        >
                            {/* Checkbox imitation / Status Indicator */}
                            <div className={cn(
                                "w-3 h-3 rounded-full border flex items-center justify-center transition-colors shrink-0",
                                isSelected ? agent.color.replace('bg-', 'border-') : "border-muted-foreground/30",
                                agent.status === 'working' && "animate-pulse"
                            )}>
                                {isSelected && <div className={cn("w-1.5 h-1.5 rounded-full", agent.color)} />}
                            </div>
                            
                            <span className="flex-1 truncate">{agent.name}</span>
                            
                            {agent.status === 'working' && (
                                <span className="text-[10px] text-primary animate-pulse">Running...</span>
                            )}
                            {agent.status === 'idle' && (
                                <span className="text-[10px] text-muted-foreground opacity-50">{agent.role}</span>
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
