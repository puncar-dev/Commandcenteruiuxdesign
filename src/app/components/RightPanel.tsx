import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { X, FileText, Activity, UserCog, Settings, Layers, Plus } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Tab } from "@/types";

interface RightPanelProps {
  tabs: Tab[];
  activeTabId: string | null;
  onCloseTab: (id: string) => void;
  onSelectTab: (id: string) => void;
}

export default function RightPanel({ tabs, activeTabId, onCloseTab, onSelectTab }: RightPanelProps) {
  const [isGridMode, setIsGridMode] = useState(false);
  const activeTab = tabs.find(t => t.id === activeTabId);

  // If no tabs, show empty state
  if (tabs.length === 0) {
    return (
        <div className="w-full md:w-[400px] border-l border-border bg-muted/5 flex items-center justify-center text-muted-foreground text-sm shrink-0 select-none h-full">
            <div className="text-center p-6 opacity-50">
                <p>No artifacts open</p>
                <p className="text-xs mt-1">Click an action in chat to open details</p>
            </div>
        </div>
    );
  }

  // --- Mobile Grid View ---
  if (isGridMode) {
      return (
          <div className="w-full h-full bg-muted/10 flex flex-col md:hidden">
              {/* Grid Header */}
              <div className="h-14 px-4 flex items-center justify-between bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-10">
                  <span className="font-semibold text-sm">{tabs.length} Tabs</span>
                  <button 
                    onClick={() => setIsGridMode(false)}
                    className="text-primary font-medium text-sm"
                  >
                      Done
                  </button>
              </div>
              
              {/* Grid Content */}
              <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-2 gap-4">
                      {tabs.map(tab => (
                          <div 
                            key={tab.id}
                            onClick={() => {
                                onSelectTab(tab.id);
                                setIsGridMode(false);
                            }}
                            className={cn(
                                "aspect-[4/5] rounded-xl border flex flex-col overflow-hidden relative shadow-sm transition-all active:scale-95 cursor-pointer bg-background",
                                activeTabId === tab.id ? "ring-2 ring-primary border-transparent" : "border-border/60"
                            )}
                          >
                                {/* Tab Mini Header */}
                                <div className="h-8 bg-muted/30 border-b border-border/50 flex items-center px-2 gap-2 shrink-0">
                                    {tab.type === 'market' && <Activity className="w-3 h-3 shrink-0 text-muted-foreground" />}
                                    {tab.type === 'agent' && <UserCog className="w-3 h-3 shrink-0 text-muted-foreground" />}
                                    {tab.type === 'doc' && <FileText className="w-3 h-3 shrink-0 text-muted-foreground" />}
                                    {tab.type === 'agent-settings' && <Settings className="w-3 h-3 shrink-0 text-muted-foreground" />}
                                    <span className="text-[10px] font-medium truncate flex-1 text-muted-foreground">{tab.title}</span>
                                </div>

                                {/* Mini Preview (Abstracted) */}
                                <div className="flex-1 bg-background p-2 relative overflow-hidden pointer-events-none">
                                    <div className="w-full h-full opacity-50 scale-[0.4] origin-top-left w-[250%]">
                                         <TabContent tab={tab} />
                                    </div>
                                </div>

                                {/* Close Button (Top Left - Safari Style) */}
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCloseTab(tab.id);
                                        if (tabs.length === 1) setIsGridMode(false); 
                                    }}
                                    className="absolute top-1 left-1 w-5 h-5 bg-foreground/10 hover:bg-destructive hover:text-white rounded-full flex items-center justify-center transition-colors z-20"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Bottom Bar (Safari Style) */}
              <div className="h-12 bg-background/80 backdrop-blur border-t border-border flex items-center justify-between px-6 shrink-0">
                    <button className="text-primary font-medium text-sm" onClick={() => setIsGridMode(false)}>Done</button>
                    <div className="text-xs text-muted-foreground font-medium">{tabs.length} Tabs</div>
                    <button className="text-muted-foreground opacity-50 cursor-not-allowed">
                        <Plus className="w-5 h-5" />
                    </button>
              </div>
          </div>
      )
  }

  return (
    <div className="w-full md:w-[400px] border-l border-border bg-background flex flex-col shrink-0 h-full relative">
      
      {/* Desktop Tabs Header (Hidden on Mobile) */}
      <div className="hidden md:flex items-center overflow-x-auto border-b border-border bg-muted/10 no-scrollbar shrink-0">
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
                {tab.type === 'agent-settings' && <Settings className="w-3 h-3 shrink-0" />}
                
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

      {/* Mobile Toolbar (Safari Style - Bottom Fixed or Top Fixed? User said "browser on mobile mode") */}
      {/* Usually Safari puts the address bar at bottom, and tabs button at bottom right. */}
      {/* But here we are inside a panel. Let's put a control bar at the TOP for Mobile to switch between Content and Grid. */}
      {/* Actually, user images show tabs at top. But user wants "safari browser on mobile mode". */}
      {/* Let's put a small floating bar or a header. */}
      
      <div className="md:hidden h-12 flex items-center justify-between px-4 border-b border-border bg-background shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
               {activeTab?.type === 'market' && <Activity className="w-4 h-4 shrink-0 text-muted-foreground" />}
               {activeTab?.type === 'agent' && <UserCog className="w-4 h-4 shrink-0 text-muted-foreground" />}
               {activeTab?.type === 'doc' && <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />}
               {activeTab?.type === 'agent-settings' && <Settings className="w-4 h-4 shrink-0 text-muted-foreground" />}
               <span className="font-semibold text-sm truncate">{activeTab?.title || "Select Tab"}</span>
          </div>
          
          <button 
            onClick={() => setIsGridMode(true)}
            className="p-2 hover:bg-muted rounded-md transition-colors relative"
          >
              <div className="w-5 h-5 border-2 border-foreground rounded-[4px] flex items-center justify-center relative">
                  <span className="text-[10px] font-bold">{tabs.length}</span>
              </div>
          </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-0 bg-background">
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
        case 'agent-settings':
            return <AgentSettingsView data={tab.data} />;
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
        <div className="flex flex-col h-full bg-background">
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
        <div className="p-4 space-y-6 bg-background">
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
        <div className="flex flex-col h-full bg-background">
            <div className="p-4 border-b border-border bg-muted/5">
                <h2 className="font-bold text-lg">{data.title || "Document"}</h2>
                <div className="text-xs text-muted-foreground mt-1">Generated by System • Just now</div>
            </div>
            <div className="p-6 prose prose-slate prose-sm max-w-none">
                {data.content ? (
                    <div className="whitespace-pre-wrap">{data.content}</div>
                ) : (
                    <>
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
                    </>
                )}
            </div>
        </div>
    )
}

function AgentSettingsView({ data }: { data: any }) {
    return (
        <div className="flex flex-col h-full bg-background">
             <div className="p-4 border-b border-border bg-muted/5 flex items-center gap-2">
                 <Settings className="w-4 h-4 text-muted-foreground" />
                 <h2 className="font-bold text-lg">Configuration</h2>
             </div>
             
             <div className="p-6 space-y-6 overflow-y-auto">
                 {/* Identity */}
                 <div className="space-y-3">
                     <h3 className="text-sm font-medium text-foreground">Identity</h3>
                     <div className="grid gap-2">
                         <label className="text-xs text-muted-foreground">Name</label>
                         <input type="text" defaultValue="Market Maker" className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                     </div>
                      <div className="grid gap-2">
                         <label className="text-xs text-muted-foreground">System Prompt</label>
                         <textarea 
                            className="w-full h-24 px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                            defaultValue="You are an expert market maker focused on maintaining liquidity..."
                         />
                     </div>
                 </div>
                 
                 {/* Parameters */}
                 <div className="space-y-3 pt-4 border-t border-border/50">
                     <h3 className="text-sm font-medium text-foreground">Risk Parameters</h3>
                     
                     <div className="flex items-center justify-between">
                         <label className="text-sm">Max Position Size</label>
                         <span className="font-mono text-sm">$100,000</span>
                     </div>
                     <input type="range" className="w-full accent-blue-500 h-1 bg-muted rounded-lg appearance-none cursor-pointer" />
                     
                     <div className="flex items-center justify-between pt-2">
                         <label className="text-sm">Stop Loss</label>
                         <input type="text" defaultValue="2.5%" className="w-20 px-2 py-1 text-right bg-background border border-border rounded text-sm" />
                     </div>
                 </div>

                 {/* Toggles */}
                 <div className="space-y-4 pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                              <label className="text-sm font-medium">Auto-Execution</label>
                              <p className="text-xs text-muted-foreground">Allow agent to submit orders</p>
                          </div>
                          <div className="w-9 h-5 bg-green-500 rounded-full relative cursor-pointer">
                              <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                          </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                              <label className="text-sm font-medium">Requires Approval</label>
                              <p className="text-xs text-muted-foreground">For orders &gt; $10k</p>
                          </div>
                           <div className="w-9 h-5 bg-muted rounded-full relative cursor-pointer">
                              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                          </div>
                      </div>
                 </div>
             </div>
             
             <div className="p-4 border-t border-border mt-auto">
                 <button className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium text-sm hover:opacity-90 transition-opacity">
                     Save Changes
                 </button>
             </div>
        </div>
    )
}
