import React from "react";
import { cn } from "@/lib/utils";
import { X, FileText, Activity, UserCog } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Tab } from "@/types";

interface RightPanelProps {
  tabs: Tab[];
  activeTabId: string | null;
  onCloseTab: (id: string) => void;
  onSelectTab: (id: string) => void;
}

export default function RightPanel({ tabs, activeTabId, onCloseTab, onSelectTab }: RightPanelProps) {
  const activeTab = tabs.find(t => t.id === activeTabId);

  if (tabs.length === 0) {
    return (
        <div className="w-[400px] border-l border-border bg-muted/5 flex items-center justify-center text-muted-foreground text-sm shrink-0 select-none hidden md:flex">
            <div className="text-center p-6 opacity-50">
                <p>No artifacts open</p>
                <p className="text-xs mt-1">Click an action in chat to open details</p>
            </div>
        </div>
    );
  }

  return (
    <div className="w-[400px] border-l border-border bg-background flex flex-col shrink-0 hidden md:flex">
      {/* Tabs Header */}
      <div className="flex items-center overflow-x-auto border-b border-border bg-muted/10 no-scrollbar">
        {tabs.map(tab => (
            <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={cn(
                    "flex items-center gap-2 px-3 py-2.5 text-xs font-medium min-w-[100px] max-w-[160px] border-r border-border/50 transition-colors group relative",
                    activeTabId === tab.id 
                        ? "bg-background text-foreground border-t-2 border-t-primary" 
                        : "bg-transparent text-muted-foreground hover:bg-muted/30 border-t-2 border-t-transparent"
                )}
            >
                {tab.type === 'market' && <Activity className="w-3 h-3 shrink-0" />}
                {tab.type === 'agent' && <UserCog className="w-3 h-3 shrink-0" />}
                {tab.type === 'doc' && <FileText className="w-3 h-3 shrink-0" />}
                
                <span className="truncate flex-1 text-left">{tab.title}</span>
                
                <span 
                    onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id); }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-muted/50 rounded-sm"
                >
                    <X className="w-3 h-3" />
                </span>
            </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-0">
          {activeTab ? (
              <TabContent tab={activeTab} />
          ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">Select a tab</div>
          )}
      </div>
    </div>
  );
}

function TabContent({ tab }: { tab: Tab }) {
    switch (tab.type) {
        case 'market':
            return <MarketView data={tab.data} />;
        case 'agent':
            return <AgentView data={tab.data} />;
        case 'doc':
            return <DocView data={tab.data} />;
        default:
            return <div>Unknown tab type</div>;
    }
}

// --- Tab Views ---

const MOCK_CHART_DATA = [
  { time: '10:00', price: 64200 },
  { time: '11:00', price: 64500 },
  { time: '12:00', price: 64300 },
  { time: '13:00', price: 64800 },
  { time: '14:00', price: 65100 },
  { time: '15:00', price: 64900 },
  { time: '16:00', price: 65400 },
];

function MarketView({ data }: { data: any }) {
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-bold">{data.ticker || "BTC-PERP"}</h2>
                    <span className="text-green-600 font-mono text-sm">+2.4%</span>
                </div>
                <div className="text-2xl font-mono">$65,400.00</div>
            </div>
            
            <div className="h-[250px] w-full mt-4 pr-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_CHART_DATA}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis domain={['auto', 'auto']} hide />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            itemStyle={{ color: '#000' }}
                        />
                        <Area type="monotone" dataKey="price" stroke="#22c55e" fillOpacity={1} fill="url(#colorPrice)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4">
                <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                    <div className="text-xs text-muted-foreground mb-1">24h Vol</div>
                    <div className="font-mono text-sm font-medium">$1.2B</div>
                </div>
                <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                    <div className="text-xs text-muted-foreground mb-1">Open Interest</div>
                    <div className="font-mono text-sm font-medium">$450M</div>
                </div>
            </div>

            <div className="p-4 mt-auto border-t border-border flex gap-2">
                <button className="flex-1 bg-green-50 text-green-600 border border-green-200 py-2 rounded-md font-medium text-sm hover:bg-green-100 transition-colors">Buy Long</button>
                <button className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2 rounded-md font-medium text-sm hover:bg-red-100 transition-colors">Sell Short</button>
            </div>
        </div>
    )
}

function AgentView({ data }: { data: any }) {
    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-xl font-bold text-blue-600 border border-blue-200">
                    MM
                </div>
                <div>
                    <h2 className="text-lg font-bold">Market Maker</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">Trader Role</span>
                        <span className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-200 rounded text-xs">Active</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-muted/10 border border-border rounded-lg p-3">
                     <h3 className="text-xs font-medium text-muted-foreground uppercase mb-3">Configuration</h3>
                     <div className="space-y-3">
                         <div>
                             <label className="text-xs block mb-1">Risk Level</label>
                             <div className="h-2 bg-muted rounded-full overflow-hidden">
                                 <div className="h-full w-[40%] bg-blue-500" />
                             </div>
                         </div>
                         <div className="flex justify-between text-sm">
                             <span>Max Allocation</span>
                             <span className="font-mono">$100,000</span>
                         </div>
                     </div>
                </div>

                <div className="bg-muted/10 border border-border rounded-lg p-3">
                     <h3 className="text-xs font-medium text-muted-foreground uppercase mb-3">Recent Performance</h3>
                     <div className="space-y-2 text-sm">
                         <div className="flex justify-between">
                             <span>Daily PnL</span>
                             <span className="text-green-600 font-medium">+$1,240.50</span>
                         </div>
                         <div className="flex justify-between">
                             <span>Win Rate</span>
                             <span>68%</span>
                         </div>
                     </div>
                </div>
            </div>
        </div>
    )
}

function DocView({ data }: { data: any }) {
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border bg-muted/5">
                <h2 className="font-bold text-lg">Risk Assessment Report</h2>
                <div className="text-xs text-muted-foreground mt-1">Generated by Risk Guard • 2m ago</div>
            </div>
            <div className="p-6 prose prose-slate prose-sm max-w-none">
                <p><strong>Executive Summary</strong></p>
                <p>
                    The proposed entry into BTC-PERP exhibits a risk profile within the standard deviation of our "Aggressive Growth" portfolio mandate.
                </p>
                <ul className="list-disc pl-4 space-y-1 mt-2">
                    <li>Volatility (IV): 45% (Acceptable)</li>
                    <li>Liquidity depth: Sufficient for $50k entry</li>
                    <li>Correlation risk: Low relative to current holdings</li>
                </ul>
                
                <div className="mt-4 p-3 bg-blue-50 border-l-2 border-blue-500 text-sm text-blue-900">
                    Recommendation: Proceed with max 5% allocation.
                </div>
                
                {data?.content && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                        <p className="text-xs text-muted-foreground mb-2">Raw Agent Output:</p>
                        <p className="whitespace-pre-wrap font-mono text-xs opacity-80">{data.content}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
