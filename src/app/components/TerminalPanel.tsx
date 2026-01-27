import React, { useRef, useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { Activity, X, Filter } from 'lucide-react';

export type LogCategory = 'trade' | 'post' | 'comment' | 'analysis' | 'system';

export interface TerminalLog {
  id: string;
  timestamp: number;
  agentId?: string;
  level: 'info' | 'warning' | 'error' | 'success';
  category: LogCategory;
  message: string;
}

interface TerminalPanelProps {
  logs: TerminalLog[];
  isOpen: boolean;
  onToggle: () => void;
  onClear: () => void;
  className?: string;
}

export default function TerminalPanel({ logs, isOpen, onToggle, onClear, className }: TerminalPanelProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState<LogCategory | 'all'>('all');

  useEffect(() => {
    if (isOpen && endRef.current) {
        endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isOpen, activeFilter]);

  const filteredLogs = logs.filter(log => activeFilter === 'all' || log.category === activeFilter);

  const filters: { id: LogCategory | 'all'; label: string }[] = [
      { id: 'all', label: 'All' },
      { id: 'trade', label: 'Trades' },
      { id: 'post', label: 'Posts' },
      { id: 'comment', label: 'Comments' },
      { id: 'analysis', label: 'Analyses' },
      // Added System to help debug/see generic logs if needed, but keeping it hidden from main list if user didn't ask, 
      // actually user said "feel free to add", so 'System' is good for app events.
      { id: 'system', label: 'System' } 
  ];

  if (!isOpen) {
      return (
          <div className={cn("border-t border-border bg-muted/20 px-4 py-1 flex items-center justify-between hover:bg-muted/40 transition-colors cursor-pointer", className)} onClick={onToggle}>
             <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="w-3.5 h-3.5" />
                <span>Agents Moves</span>
                {logs.length > 0 && <span className="bg-primary/10 text-primary px-1.5 rounded-full text-[10px]">{logs.length}</span>}
             </div>
          </div>
      )
  }

  return (
    <div className={cn("flex flex-col border-t border-border bg-background text-foreground shrink-0 transition-all shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]", className, "h-[200px]")}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/30 select-none">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="w-3.5 h-3.5" />
            <span className="font-medium text-foreground">Agents Moves</span>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={onClear} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">Clear</button>
            <button onClick={onToggle} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border/50 overflow-x-auto no-scrollbar bg-background">
          <Filter className="w-3 h-3 text-muted-foreground mr-1 shrink-0" />
          {filters.map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors whitespace-nowrap border",
                    activeFilter === f.id 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "bg-transparent text-muted-foreground border-transparent hover:bg-muted"
                )}
              >
                  {f.label}
              </button>
          ))}
      </div>

      {/* Logs Area */}
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1 bg-white">
        {filteredLogs.length === 0 && (
             <div className="h-full flex items-center justify-center text-muted-foreground/40 italic flex-col gap-1">
                <span>No logs found</span>
                {activeFilter !== 'all' && <span className="text-[10px]">Filter: {activeFilter}</span>}
             </div>
        )}
        {filteredLogs.map((log) => (
            <div key={log.id} className="flex gap-2 items-start leading-tight hover:bg-muted/20 p-0.5 rounded px-1 transition-colors group">
                <span className="text-muted-foreground/60 shrink-0 select-none w-[60px] text-[10px] pt-0.5">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                
                {/* Category Badge (mini) */}
                <span className={cn(
                    "text-[9px] uppercase tracking-wider px-1 rounded-sm opacity-50 w-[60px] text-center shrink-0 pt-0.5 hidden sm:block",
                    log.category === 'trade' && "bg-green-100 text-green-700",
                    log.category === 'post' && "bg-blue-100 text-blue-700",
                    log.category === 'comment' && "bg-yellow-100 text-yellow-700",
                    log.category === 'analysis' && "bg-purple-100 text-purple-700",
                    log.category === 'system' && "bg-gray-100 text-gray-700",
                )}>
                    {log.category}
                </span>

                {log.agentId && (
                    <span className="text-blue-600 shrink-0 font-semibold w-[70px] truncate" title={log.agentId}>
                        {log.agentId}
                    </span>
                )}
                <span className={cn(
                    "break-all whitespace-pre-wrap flex-1",
                    log.level === 'error' && "text-red-600",
                    log.level === 'warning' && "text-amber-600",
                    log.level === 'success' && "text-green-600",
                    log.level === 'info' && "text-gray-700"
                )}>
                    {log.message}
                </span>
            </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
