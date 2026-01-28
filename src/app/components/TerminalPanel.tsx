import React, { useRef, useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { Activity, X, Filter, ChevronDown, ChevronUp, Users, Check, TrendingUp, Disc, FileText, History } from 'lucide-react';
import type { Agent } from "@/types";

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
  agents: Agent[];
  isOpen: boolean;
  onToggle: () => void;
  onClear: () => void;
  className?: string;
  defaultAgentId?: string;
}

type BottomTab = 'moves' | 'social' | 'pnl' | 'positions' | 'orders' | 'trades';

export default function TerminalPanel({ logs, agents, isOpen, onToggle, onClear, className, defaultAgentId = 'all' }: TerminalPanelProps) {
  const [activeTab, setActiveTab] = useState<BottomTab>('moves');
  const [selectedAgentId, setSelectedAgentId] = useState<string>(defaultAgentId);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);

  // Sync state with prop if it changes
  useEffect(() => {
      setSelectedAgentId(defaultAgentId);
  }, [defaultAgentId]);

  // Filter logs based on selected agent
  const filteredLogs = logs.filter(l => {
      return selectedAgentId === 'all' || l.agentId === selectedAgentId || l.category === 'system';
  });

  if (!isOpen) {
      return (
          <div className={cn("border-t border-border bg-background px-4 py-2 flex items-center justify-between hover:bg-muted/40 transition-colors cursor-pointer select-none", className)} onClick={onToggle}>
             <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <Activity className="w-3.5 h-3.5 text-blue-500" />
                    <span>Agent Moves</span>
                    {logs.length > 0 && <span className="bg-blue-100 text-blue-700 px-1.5 rounded-full text-[10px] min-w-[1.25rem] text-center">{logs.length}</span>}
                </div>
                <div className="h-4 w-[1px] bg-border" />
                <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>PnL Analysis</span>
                    <span>Positions</span>
                    <span>Orders</span>
                </div>
             </div>
             <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
      )
  }

  return (
    <div className={cn("flex flex-col bg-background text-foreground shrink-0 transition-all shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] h-full", className)}>
      {/* Header / Tabs */}
      <div className="flex items-center justify-between px-2 border-b border-border bg-background select-none shrink-0 h-10 relative">
        
        {/* Mobile View Selector */}
        <div className="md:hidden flex items-center flex-1 min-w-0">
             <div className="relative">
                <button 
                    onClick={() => setViewMenuOpen(!viewMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm font-semibold text-foreground hover:bg-muted/50 rounded-md transition-colors"
                >
                    {activeTab === 'moves' && <Activity className="w-4 h-4 text-blue-500" />}
                    {activeTab === 'social' && <Users className="w-4 h-4 text-orange-500" />} 
                    {activeTab === 'pnl' && <TrendingUp className="w-4 h-4 text-green-500" />} 
                    {activeTab === 'positions' && <Disc className="w-4 h-4 text-purple-500" />}
                    {activeTab === 'orders' && <FileText className="w-4 h-4 text-slate-500" />}
                    {activeTab === 'trades' && <History className="w-4 h-4 text-indigo-500" />}
                    
                    <span className="capitalize truncate">{activeTab === 'pnl' ? 'PnL Analysis' : activeTab}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground opacity-50" />

                    {activeTab === 'moves' && filteredLogs.length > 0 && (
                        <span className="bg-blue-100 text-blue-700 px-1.5 rounded-full text-[10px] min-w-[1.25rem] text-center ml-1">
                            {filteredLogs.length}
                        </span>
                    )}
                </button>

                {/* Mobile View Dropdown */}
                {viewMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-40 bg-black/5" onClick={() => setViewMenuOpen(false)} />
                        <div className="absolute left-0 top-full mt-1 w-48 bg-popover border border-border rounded-lg shadow-xl z-50 py-1 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                             <MobileTabItem id="moves" label="Agent Moves" icon={<Activity className="w-4 h-4 text-blue-500" />} active={activeTab} onClick={setActiveTab} close={() => setViewMenuOpen(false)} count={filteredLogs.length} />
                             <MobileTabItem id="social" label="Social" icon={<Users className="w-4 h-4 text-orange-500" />} active={activeTab} onClick={setActiveTab} close={() => setViewMenuOpen(false)} />
                             <MobileTabItem id="pnl" label="PnL Analysis" icon={<TrendingUp className="w-4 h-4 text-green-500" />} active={activeTab} onClick={setActiveTab} close={() => setViewMenuOpen(false)} />
                             <MobileTabItem id="positions" label="Positions" icon={<Disc className="w-4 h-4 text-purple-500" />} active={activeTab} onClick={setActiveTab} close={() => setViewMenuOpen(false)} />
                             <MobileTabItem id="orders" label="Orders" icon={<FileText className="w-4 h-4 text-slate-500" />} active={activeTab} onClick={setActiveTab} close={() => setViewMenuOpen(false)} />
                             <MobileTabItem id="trades" label="Trades" icon={<History className="w-4 h-4 text-indigo-500" />} active={activeTab} onClick={setActiveTab} close={() => setViewMenuOpen(false)} />
                        </div>
                    </>
                )}
             </div>
        </div>

        {/* Desktop Tabs (Hidden on Mobile) */}
        <div className="hidden md:flex items-center h-full overflow-x-auto no-scrollbar mask-linear-fade pr-28">
            <TabButton active={activeTab === 'moves'} onClick={() => setActiveTab('moves')} label="Agent Moves" count={filteredLogs.length} />
            <TabButton active={activeTab === 'social'} onClick={() => setActiveTab('social')} label="Social" />
            <TabButton active={activeTab === 'pnl'} onClick={() => setActiveTab('pnl')} label="PnL Analysis" />
            <TabButton active={activeTab === 'positions'} onClick={() => setActiveTab('positions')} label="Positions" />
            <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} label="Orders" />
            <TabButton active={activeTab === 'trades'} onClick={() => setActiveTab('trades')} label="Trades" />
        </div>
        
        <div className="flex items-center gap-1 pl-2 bg-background shrink-0 ml-auto">
             
            {/* Agent Filter Dropdown */}
            <div className="hidden md:flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md border border-border/50 max-w-[120px]">
                <Users className="w-3 h-3 text-muted-foreground shrink-0" />
                <select 
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="bg-transparent text-[10px] font-medium text-foreground outline-none border-none p-0 cursor-pointer w-full truncate appearance-none"
                >
                    <option value="all">All Agents</option>
                    {agents.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                </select>
                <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0 opacity-50" />
            </div>

             {/* Mobile: Agent Select merged into a simple icon */}
             <div className="md:hidden relative group">
                  <select 
                        value={selectedAgentId}
                        onChange={(e) => setSelectedAgentId(e.target.value)}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                    >
                        <option value="all">All Agents</option>
                        {agents.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                    </select>
                   <button className="p-1.5 text-muted-foreground hover:bg-muted rounded-md">
                        <Users className="w-4 h-4" />
                   </button>
             </div>

            <div className="w-px h-4 bg-border mx-1" />

            <button onClick={onToggle} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted rounded-md shrink-0">
                <ChevronDown className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative bg-muted/5">
        {activeTab === 'moves' && (
            <AgentMovesTab logs={filteredLogs} />
        )}
        {activeTab === 'pnl' && (
            <PnLAnalysisTab selectedAgentId={selectedAgentId} />
        )}
        {(activeTab === 'positions' || activeTab === 'orders' || activeTab === 'trades' || activeTab === 'social') && (
            <PlaceholderTab title={activeTab} />
        )}
      </div>
    </div>
  );
}

// --- Sub-components ---

function MobileTabItem({ id, label, icon, active, onClick, close, count }: { id: BottomTab, label: string, icon: React.ReactNode, active: BottomTab, onClick: (id: BottomTab) => void, close: () => void, count?: number }) {
    return (
        <button 
            onClick={() => { onClick(id); close(); }}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted transition-colors text-left relative",
                active === id ? "text-foreground font-medium bg-muted/30" : "text-muted-foreground"
            )}
        >
            {icon}
            <span className="flex-1">{label}</span>
            {count !== undefined && count > 0 && (
                <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-[10px]">{count}</span>
            )}
            {active === id && <Check className="w-4 h-4 text-primary absolute right-3" />}
        </button>
    )
}

function TabButton({ active, onClick, label, icon, count }: { active: boolean, onClick: () => void, label: string, icon?: React.ReactNode, count?: number }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "h-full px-3 flex items-center gap-2 text-xs font-medium transition-all relative whitespace-nowrap",
                active ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground/80"
            )}
        >
            {icon}
            {label}
            {count !== undefined && count > 0 && (
                <span className={cn(
                    "px-1.5 py-0.5 rounded-full text-[9px] min-w-[16px] text-center",
                    active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>{count}</span>
            )}
            {active && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
            )}
        </button>
    )
}

function AgentMovesTab({ logs }: { logs: TerminalLog[] }) {
    const endRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      if (endRef.current) {
          endRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, [logs]);
  
    return (
        <div className="flex flex-col h-full bg-white">
            {/* Logs List - No inner header anymore */}
            <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1 bg-white">
                {logs.length === 0 && (
                    <div className="h-full flex items-center justify-center text-muted-foreground/40 italic flex-col gap-1">
                        <span>No logs found</span>
                    </div>
                )}
                {logs.map((log) => (
                    <div key={log.id} className="flex gap-2 items-start leading-tight hover:bg-muted/20 p-0.5 rounded px-1 transition-colors group">
                        <span className="text-muted-foreground/60 shrink-0 select-none w-[60px] text-[10px] pt-0.5">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        
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

function PnLAnalysisTab({ selectedAgentId }: { selectedAgentId: string }) {
    // Mock Data based on agent selection
    const isSingleAgent = selectedAgentId !== 'all';
    
    // Dynamic values for demo
    const pnl = isSingleAgent ? "+1.24" : "+4.58";
    const winRate = isSingleAgent ? "60%" : "75%";
    const trades = isSingleAgent ? "1" : "4";
    
    return (
        <div className="flex flex-col h-full bg-white">
            {/* Metrics Row */}
            <div className="flex items-center gap-12 px-6 py-4 border-b border-border bg-white">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">PnL (7D)</span>
                    <span className="text-2xl font-medium text-green-600">{pnl}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Win Rate</span>
                    <span className="text-2xl font-medium text-foreground">{winRate}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Trades</span>
                    <span className="text-2xl font-medium text-foreground">{trades}</span>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-xs text-left">
                    <thead className="text-muted-foreground font-medium bg-muted/20 sticky top-0">
                        <tr>
                            <th className="px-6 py-2 font-medium">Side</th>
                            <th className="px-6 py-2 font-medium">Size</th>
                            <th className="px-6 py-2 font-medium">Entry</th>
                            <th className="px-6 py-2 font-medium">Exit</th>
                            <th className="px-6 py-2 font-medium text-right">Realized PnL</th>
                            <th className="px-6 py-2 font-medium text-right">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                         {/* Row 1 */}
                         <tr className="group hover:bg-muted/10 transition-colors">
                            <td className="px-6 py-3 font-medium text-green-600">LONG</td>
                            <td className="px-6 py-3 font-medium">$5,000</td>
                            <td className="px-6 py-3 font-medium">$65,000</td>
                            <td className="px-6 py-3 font-medium">$66,500</td>
                            <td className="px-6 py-3 font-medium text-green-600 text-right">+115.38 (2.3%)</td>
                            <td className="px-6 py-3 text-muted-foreground text-right">1/27/2026</td>
                         </tr>
                         {!isSingleAgent && (
                             <>
                                <tr className="group hover:bg-muted/10 transition-colors">
                                    <td className="px-6 py-3 font-medium text-green-600">YES</td>
                                    <td className="px-6 py-3 font-medium">$1,000</td>
                                    <td className="px-6 py-3 font-medium">$0.45</td>
                                    <td className="px-6 py-3 font-medium">$0.52</td>
                                    <td className="px-6 py-3 font-medium text-green-600 text-right">+155.50 (15.5%)</td>
                                    <td className="px-6 py-3 text-muted-foreground text-right">1/26/2026</td>
                                </tr>
                                <tr className="group hover:bg-muted/10 transition-colors">
                                    <td className="px-6 py-3 font-medium text-red-600">SHORT</td>
                                    <td className="px-6 py-3 font-medium">$2,500</td>
                                    <td className="px-6 py-3 font-medium">$64,200</td>
                                    <td className="px-6 py-3 font-medium">$64,800</td>
                                    <td className="px-6 py-3 font-medium text-red-600 text-right">-23.40 (-0.9%)</td>
                                    <td className="px-6 py-3 text-muted-foreground text-right">1/25/2026</td>
                                </tr>
                             </>
                         )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function PlaceholderTab({ title }: { title: string }) {
    return (
        <div className="flex flex-col h-full items-center justify-center text-muted-foreground bg-white">
            <span className="text-4xl opacity-10 mb-2 capitalize">{title}</span>
            <span className="text-sm">No {title.toLowerCase()} data available</span>
        </div>
    )
}
