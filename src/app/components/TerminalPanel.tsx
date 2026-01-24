import React, { useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Activity, X } from 'lucide-react';

export interface TerminalLog {
  id: string;
  timestamp: number;
  agentId?: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

interface TerminalPanelProps {
  logs: TerminalLog[];
  isOpen: boolean;
  onToggle: () => void;
  onClear: () => void;
}

export default function TerminalPanel({ logs, isOpen, onToggle, onClear }: TerminalPanelProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && endRef.current) {
        endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isOpen]);

  if (!isOpen) {
      return (
          <div className="border-t border-border bg-muted/20 px-4 py-1 flex items-center justify-between hover:bg-muted/40 transition-colors cursor-pointer" onClick={onToggle}>
             <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="w-3.5 h-3.5" />
                <span>Agents Moves</span>
                {logs.length > 0 && <span className="bg-primary/10 text-primary px-1.5 rounded-full text-[10px]">{logs.length}</span>}
             </div>
          </div>
      )
  }

  return (
    <div className="flex flex-col border-t border-border bg-background text-foreground h-[200px] shrink-0 transition-all shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
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

      {/* Logs Area */}
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1 bg-white">
        {logs.length === 0 && (
             <div className="h-full flex items-center justify-center text-muted-foreground/40 italic">
                No active moves...
             </div>
        )}
        {logs.map((log) => (
            <div key={log.id} className="flex gap-2 items-start leading-tight hover:bg-muted/20 p-0.5 rounded px-1 transition-colors">
                <span className="text-muted-foreground/60 shrink-0 select-none w-[70px]">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                {log.agentId && (
                    <span className="text-blue-600 shrink-0 font-semibold w-[80px] truncate">
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
