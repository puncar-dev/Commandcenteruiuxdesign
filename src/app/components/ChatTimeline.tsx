import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { User, Bot, Loader2, StopCircle, ArrowRight, FileText, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import type { Chat, Run, Agent, Message, TabType } from "@/types";

interface ChatTimelineProps {
  chat: Chat;
  agents: Agent[];
  onOpenTab: (type: TabType, title: string, data?: any) => void;
}

export default function ChatTimeline({ chat, agents, onOpenTab }: ChatTimelineProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages.length, chat.runs.length, chat.runs.map(r => r.status).join(',')]);

  // Merge messages and runs into a single chronological list
  const timelineItems = [
    ...chat.messages.map(m => ({ type: "message" as const, data: m, time: m.timestamp })),
    ...chat.runs.map(r => ({ type: "run" as const, data: r, time: r.timestamp }))
  ].sort((a, b) => a.time - b.time);

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
      <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-4">
        {timelineItems.length === 0 && (
            <EmptyState />
        )}

        {timelineItems.map((item) => {
          if (item.type === "message") {
            return <UserMessage key={item.data.id} message={item.data} />;
          } else {
            return (
              <RunBlock 
                key={item.data.id} 
                run={item.data} 
                agents={agents} 
                onOpenTab={onOpenTab}
              />
            );
          }
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4 opacity-50 select-none">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center">
                <Bot className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
                <h3 className="text-lg font-medium">Command Center</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                    Select agents from the sidebar and start a task.
                    Parallel swarms will execute your commands.
                </p>
            </div>
        </div>
    )
}

function UserMessage({ message }: { message: Message }) {
  return (
    <div className="flex gap-4 group">
      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
        <User className="w-4 h-4 text-secondary-foreground" />
      </div>
      <div className="space-y-1 max-w-[90%]">
        <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground">You</span>
            <span className="text-[10px] text-muted-foreground">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    </div>
  );
}

function RunBlock({ run, agents, onOpenTab }: { run: Run, agents: Agent[], onOpenTab: (type: TabType, title: string, data?: any) => void }) {
  const involvedAgents = agents.filter(a => run.agentIds.includes(a.id));
  const isRunning = run.status === "running";
  const isCompleted = run.status === "completed";

  // Coordinator Summary (Simulated for completed runs)
  const showSummary = isCompleted;

  return (
    <div className={cn(
        "flex flex-col gap-3 p-4 rounded-xl border transition-colors",
        isRunning ? "bg-muted/5 border-primary/20" : "bg-card border-border"
    )}>
      {/* Run Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border",
                isRunning ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : 
                run.status === 'failed' ? "bg-destructive/10 text-destructive border-destructive/20" :
                "bg-green-500/10 text-green-500 border-green-500/20"
            )}>
                {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : 
                 isCompleted ? <CheckCircle2 className="w-3 h-3" /> :
                 <AlertCircle className="w-3 h-3" />
                }
                <span className="uppercase tracking-wider text-[10px]">
                    {run.status}
                </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex -space-x-1.5">
                {involvedAgents.map(agent => (
                    <div key={agent.id} className={cn("w-5 h-5 rounded-full border border-background flex items-center justify-center text-[8px] font-bold text-white", agent.color)} title={agent.name}>
                        {agent.avatar}
                    </div>
                ))}
            </div>
        </div>
        
        {isRunning && (
            <button className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
                <StopCircle className="w-3.5 h-3.5" />
                Stop
            </button>
        )}
      </div>

      {/* Coordinator Summary (Optional) */}
      {showSummary && (
          <div className="mt-2 mb-2 p-3 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-foreground">Coordinator Summary</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                  Agents have completed the analysis. <strong>Market Maker</strong> identified bullish structure, while <strong>Risk Guard</strong> confirmed entry is within limits.
              </p>
          </div>
      )}

      {/* Parallel Agent Outputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
        {involvedAgents.map(agent => {
            const output = run.outputs[agent.id];
            const hasOutput = !!output;
            const isAgentWorking = isRunning && !hasOutput; // Very simple logic for MVP

            return (
                <div key={agent.id} className="group relative flex flex-col gap-2 p-3 rounded-lg border border-border bg-background hover:border-foreground/20 transition-colors">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                             <div className={cn("w-2 h-2 rounded-full", agent.color)} />
                             <span className="text-xs font-medium">{agent.name}</span>
                         </div>
                         {isAgentWorking && <span className="text-[10px] text-muted-foreground animate-pulse">Thinking...</span>}
                    </div>
                    
                    <div className="min-h-[60px] text-sm text-muted-foreground/90 leading-relaxed font-mono text-[13px]">
                        {hasOutput ? (
                            <Typewriter text={output} speed={10} />
                        ) : (
                            <span className="opacity-20 italic">Waiting for output...</span>
                        )}
                    </div>

                    {/* Action Cards (Mocked based on output content) */}
                    {hasOutput && (
                        <div className="flex gap-2 mt-2 pt-2 border-t border-border/50">
                            {/* Heuristic to show relevant action button based on role */}
                            {agent.role === "Trader" && (
                                <ActionButton 
                                    icon={<TrendingUp className="w-3 h-3" />} 
                                    label="Open Market" 
                                    onClick={() => onOpenTab("market", "BTC-PERP", { ticker: "BTC-PERP" })}
                                />
                            )}
                            {agent.role === "Risk" && (
                                <ActionButton 
                                    icon={<FileText className="w-3 h-3" />} 
                                    label="View Report" 
                                    onClick={() => onOpenTab("doc", "Risk Assessment", { content: output })} 
                                />
                            )}
                             {agent.role === "Researcher" && (
                                <ActionButton 
                                    icon={<ArrowRight className="w-3 h-3" />} 
                                    label="Go to Source" 
                                    onClick={() => {}} 
                                />
                            )}
                        </div>
                    )}
                </div>
            )
        })}
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className="flex items-center gap-1.5 px-2 py-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded text-[10px] font-medium transition-colors"
        >
            {icon}
            {label}
        </button>
    )
}

// Simple typewriter effect for MVP
function Typewriter({ text, speed = 5 }: { text: string, speed?: number }) {
  const [displayedText, setDisplayedText] = React.useState("");

  useEffect(() => {
    let i = 0;
    setDisplayedText("");
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <span>{displayedText}</span>;
}
