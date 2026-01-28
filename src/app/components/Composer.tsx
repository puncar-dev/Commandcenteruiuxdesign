import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import type { Agent } from "@/types";

interface ComposerProps {
  onSend: (text: string) => void;
  agents: Agent[];
}

export default function Composer({ onSend, agents }: ComposerProps) {
    const [text, setText] = useState("");
    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const [mentionIndex, setMentionIndex] = useState<number>(-1);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const filteredAgents = mentionQuery !== null 
        ? agents.filter(a => a.name.toLowerCase().includes(mentionQuery.toLowerCase()) || a.role.toLowerCase().includes(mentionQuery.toLowerCase()))
        : [];

    useEffect(() => {
        if (mentionQuery !== null) {
            setSelectedIndex(0);
        }
    }, [mentionQuery]);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setText(newValue);

        const selectionEnd = e.target.selectionEnd;
        const textBeforeCursor = newValue.slice(0, selectionEnd);
        const lastAtPos = textBeforeCursor.lastIndexOf("@");

        if (lastAtPos !== -1) {
            const query = textBeforeCursor.slice(lastAtPos + 1);
            // Check if there's a space after the @, which usually means we stopped tagging unless it's a multi-word name we are typing?
            // For simplicity, let's say tagging stops if we hit a newline or special char, but spaces are okay for names.
            // Actually, usually tagging is a single word token or we support spaces if we match.
            // Let's allow spaces but check if it matches any agent partial.
            if (!query.includes('\n')) {
                setMentionQuery(query);
                setMentionIndex(lastAtPos);
                return;
            }
        }
        
        setMentionQuery(null);
        setMentionIndex(-1);
    };

    const insertMention = (agent: Agent) => {
        if (mentionIndex === -1) return;
        
        const before = text.slice(0, mentionIndex);
        const after = text.slice(textareaRef.current?.selectionEnd || text.length);
        const newText = `${before}@${agent.name} ${after}`;
        
        setText(newText);
        setMentionQuery(null);
        setMentionIndex(-1);
        
        // Reset focus and cursor
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const newCursorPos = mentionIndex + agent.name.length + 2; // @ + name + space
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (mentionQuery !== null && filteredAgents.length > 0) {
            if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredAgents.length) % filteredAgents.length);
                return;
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredAgents.length);
                return;
            }
            if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                insertMention(filteredAgents[selectedIndex]);
                return;
            }
            if (e.key === "Escape") {
                setMentionQuery(null);
                return;
            }
        }

        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend(text);
            setText("");
            setMentionQuery(null);
        }
    };

    return (
        <div className="relative">
            {/* Mention Popover */}
            {mentionQuery !== null && filteredAgents.length > 0 && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-popover border border-border rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-100">
                    <div className="px-2 py-1.5 bg-muted/30 text-[10px] font-semibold text-muted-foreground border-b border-border/50 uppercase tracking-wider">
                        Mention Agent
                    </div>
                    <div className="max-h-[200px] overflow-y-auto p-1">
                        {filteredAgents.map((agent, i) => (
                            <button
                                key={agent.id}
                                onClick={() => insertMention(agent)}
                                className={cn(
                                    "w-full flex items-center gap-2 px-2 py-2 text-xs rounded-md transition-colors text-left",
                                    i === selectedIndex ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
                                )}
                            >
                                <div className={cn(
                                    "w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 border border-background/20", 
                                    i === selectedIndex ? "text-white" : "text-white",
                                    agent.color
                                )}>
                                    {agent.avatar}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="font-medium truncate">{agent.name}</span>
                                    <span className={cn("text-[10px] truncate opacity-80", i === selectedIndex ? "text-primary-foreground/80" : "text-muted-foreground")}>{agent.role}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-2 bg-muted/30 p-3 rounded-lg border border-border focus-within:ring-1 focus-within:ring-ring transition-all relative">
                <div className="flex gap-2">
                     <textarea 
                        ref={textareaRef}
                        className="flex-1 bg-transparent resize-none outline-none text-sm min-h-[40px] max-h-[200px]" 
                        placeholder="Ask the swarm... (Type @ to mention agents)"
                        value={text}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                    />
                    <button 
                        onClick={() => { onSend(text); setText(""); }}
                        className="self-end p-1.5 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity flex items-center justify-center"
                    >
                        <div className="w-4 h-4 text-center text-xs leading-none flex items-center justify-center">↑</div>
                    </button>
                </div>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1">
                     <div className="flex gap-2">
                     </div>
                     <span className="hidden md:inline">⌘ Enter to send</span>
                     <span className="md:hidden">Tap to send</span>
                </div>
            </div>
        </div>
    )
}
