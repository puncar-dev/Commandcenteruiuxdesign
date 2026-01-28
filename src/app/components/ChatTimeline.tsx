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
              <RunGroup 
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
    <div className="flex justify-end mb-2">
        <div className="flex gap-3 max-w-[80%] flex-row-reverse group">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="space-y-1 text-right">
                <div className="text-sm bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-sm leading-relaxed whitespace-pre-wrap text-left">
                    {message.content}
                </div>
                <span className="text-[10px] text-muted-foreground pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    </div>
  );
}

function RunGroup({ run, agents, onOpenTab }: { run: Run, agents: Agent[], onOpenTab: (type: TabType, title: string, data?: any) => void }) {
  const involvedAgents = agents.filter(a => run.agentIds.includes(a.id));
  const isRunning = run.status === "running";
  const isCompleted = run.status === "completed";

  // Coordinator Summary
  const showSummary = isCompleted;

  return (
    <div className="flex flex-col gap-6 py-2 relative">
      
      {/* System Divider / Status */}
      <div className="flex items-center justify-center gap-3 opacity-60 my-2">
          <div className="h-px bg-border flex-1 max-w-[60px]" />
            <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider bg-muted/30 px-2 py-1 rounded-full">
                {isRunning ? (
                    <>
                        <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                        <span>Swarm Active</span>
                    </>
                ) : run.status === 'failed' ? (
                     <>
                        <AlertCircle className="w-3 h-3 text-destructive" />
                        <span>Failed</span>
                    </>
                ) : (
                    <>
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span>Completed</span>
                    </>
                )}
            </div>
          <div className="h-px bg-border flex-1 max-w-[60px]" />
      </div>

      {/* Coordinator Summary Bubble */}
      {showSummary && (
          <AgentMessage 
            agent={{
                id: 'coordinator',
                name: 'Coordinator',
                role: 'System',
                color: 'bg-zinc-800',
                avatar: 'CO',
                status: 'idle',
                pnl: 0,
                pnl24h: 0,
                activePositions: 0,
                lastActivity: 0
            }}
            content={
                <>
                    <p className="mb-3">
                        Agents have completed the analysis. <strong>Market Maker</strong> identified bullish structure, while <strong>Risk Guard</strong> confirmed entry is within limits.
                    </p>
                    <ActionButton 
                        icon={<FileText className="w-3.5 h-3.5" />} 
                        label="View Consolidated Report" 
                        onClick={() => {
                             const reportContent = `
# Consolidated Strategy Report
**Date:** ${new Date().toLocaleDateString()}
**Status:** Completed

## Executive Summary
The swarm has completed its analysis of the current market conditions. **Market Maker** identified a bullish market structure with increasing liquidity, while **Risk Guard** confirmed that the proposed entry fits within our current portfolio risk parameters.

## Agent Contributions

${involvedAgents.map(agent => {
    const output = run.outputs[agent.id];
    if (!output) return "";
    return `### ${agent.name} (${agent.role})\n${output}\n`;
}).join('\n')}

## Final Recommendation
**ACTION: LONG BTC-PERP**

Proceed with the trade execution as outlined by the Market Maker. 
- **Entry Zone:** Current Market Price
- **Stop Loss:** Strict adherence to Risk Guard's levels
- **Take Profit:** Dynamic based on volatility

*Generated by Coordinator Agent*
`.trim();
                             onOpenTab('doc', 'Consolidated Report', { content: reportContent });
                        }}
                    />
                </>
            }
          />
      )}

      {/* Individual Agent Messages */}
      {involvedAgents.map(agent => {
            const output = run.outputs[agent.id];
            const hasOutput = !!output;
            const isAgentWorking = isRunning && !hasOutput;

            if (!hasOutput && !isAgentWorking) return null;

            return (
                <AgentMessage 
                    key={agent.id}
                    agent={agent}
                    isThinking={isAgentWorking}
                    content={
                        hasOutput ? (
                            <div className="flex flex-col gap-2">
                                <div className="text-sm font-mono text-foreground/90 whitespace-pre-wrap">
                                    <Typewriter text={output} speed={10} />
                                </div>
                                <div className="flex gap-2 pt-1">
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
                                </div>
                            </div>
                        ) : null
                    }
                />
            )
        })}

        {isRunning && (
            <div className="flex justify-center">
                 <button className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/50 hover:bg-muted/50 transition-colors">
                    <StopCircle className="w-3 h-3" />
                    Stop Execution
                </button>
            </div>
        )}

    </div>
  );
}

function AgentMessage({ agent, content, isThinking }: { agent: Agent, content: React.ReactNode, isThinking?: boolean }) {
    return (
        <div className="flex gap-3 max-w-[90%] group">
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-background",
                agent.color
            )} title={agent.name}>
                {agent.avatar}
            </div>
            <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{agent.name}</span>
                    <span className="text-[10px] text-muted-foreground bg-muted/30 px-1.5 rounded uppercase tracking-wider">{agent.role}</span>
                </div>
                
                <div className={cn(
                    "p-3.5 rounded-2xl rounded-tl-sm text-sm leading-relaxed shadow-sm min-w-[200px]",
                    isThinking ? "bg-muted/10 border border-border/40" : "bg-white border border-border"
                )}>
                    {isThinking ? <ThinkingIndicator /> : content}
                </div>
            </div>
        </div>
    )
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/80 hover:bg-secondary text-secondary-foreground rounded-lg text-xs font-medium transition-all shadow-sm border border-border/50 hover:border-border"
        >
            {icon}
            {label}
        </button>
    )
}

// Simple typewriter effect for MVP
function Typewriter({ text, speed = 5 }: { text: string, speed?: number }) {
  const [displayedText, setDisplayedText] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(true);

  useEffect(() => {
    let i = 0;
    setDisplayedText("");
    setIsTyping(true);
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span>
      {displayedText}
      {isTyping && <span className="inline-block w-1.5 h-3 bg-blue-500 ml-0.5 animate-pulse align-middle" />}
    </span>
  );
}

function ThinkingIndicator() {
  const [dots, setDots] = React.useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "." : prev + ".");
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return <span className="text-[10px] text-muted-foreground animate-pulse">Thinking{dots}</span>;
}
