import React, { useState } from "react";
import { 
  PanelLeft,
  PanelRight,
  Maximize2,
  Minimize2,
  Layout,
  MessageSquare,
  FileText,
  Activity,
  Bot,
  Plus,
  Check,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Chat, Agent, Run, Message, Tab, TabType } from "@/types";

// --- Mock Data ---

const INITIAL_AGENTS: Agent[] = [
  { 
      id: "a1", 
      name: "Market Maker", 
      role: "Trader", 
      status: "idle", 
      color: "bg-blue-500", 
      avatar: "MM",
      pnl: 420.50,
      pnl24h: 12.3,
      activePositions: 3,
      lastActivity: Date.now() - 1000 * 60 * 16 // 16m
  },
  { 
      id: "a2", 
      name: "Risk Guard", 
      role: "Risk", 
      status: "idle", 
      color: "bg-red-500", 
      avatar: "RG",
      pnl: -52.00,
      pnl24h: -8.1,
      activePositions: 0,
      lastActivity: Date.now() - 1000 * 60 * 60 // 1h
  },
  { 
      id: "a3", 
      name: "Sentiment", 
      role: "Researcher", 
      status: "idle", 
      color: "bg-purple-500", 
      avatar: "SE",
      pnl: 1250.00,
      pnl24h: 5.2,
      activePositions: 5,
      lastActivity: Date.now() - 1000 * 60 * 19 // 19m
  },
  { 
      id: "a4", 
      name: "Exec", 
      role: "Execution", 
      status: "idle", 
      color: "bg-green-500", 
      avatar: "EX",
      pnl: 89.00,
      pnl24h: 1.2,
      activePositions: 1,
      lastActivity: Date.now() - 1000 * 60 * 60 * 24 // 1d
  },
];

const INITIAL_CHATS: Chat[] = [
  {
    id: "c1",
    title: "Particle Props Research",
    lastActivity: Date.now(),
    messages: [
      { id: "m1", role: "user", content: "Analyze the latest Particle Props proposal.", timestamp: Date.now() - 100000 }
    ],
    runs: [],
    selectedAgentIds: ["a1", "a2", "a3", "a4"] // All agents
  },
  {
    id: "c2",
    title: "BTC Volatility Strat",
    lastActivity: Date.now() - 86400000,
    messages: [],
    runs: [],
    selectedAgentIds: ["a1", "a2", "a3", "a4"] // All agents
  }
];

// --- Components ---
import Sidebar from "@/app/components/Sidebar";
import ChatTimeline from "@/app/components/ChatTimeline";
import RightPanel from "@/app/components/RightPanel";
import TerminalPanel, { TerminalLog, LogCategory } from "@/app/components/TerminalPanel";
import GlobalNavigation from "@/app/components/GlobalNavigation";
import Composer from "@/app/components/Composer";

type MobileView = 'chats' | 'thread' | 'artifacts';

export default function App() {
  // Global State
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<string>("c1");
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  
  // Layout State
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [globalNavExpanded, setGlobalNavExpanded] = useState(true); 
  
  // Mobile Layout State
  const [mobileView, setMobileView] = useState<MobileView>('thread');

  // Right Panel State
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  // Terminal State
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [logs, setLogs] = useState<TerminalLog[]>([]);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];
  const selectedAgentIds = activeChat.selectedAgentIds || [];

  const addLog = (message: string, agentId?: string, level: TerminalLog['level'] = 'info', category: LogCategory = 'system') => {
      setLogs(prev => [...prev, {
          id: Date.now().toString() + Math.random(),
          timestamp: Date.now(),
          message,
          agentId,
          level,
          category
      }]);
  };

  const updateActiveChatAgents = (newAgentIds: string[]) => {
      setChats(prev => prev.map(c => 
          c.id === activeChatId 
            ? { ...c, selectedAgentIds: newAgentIds }
            : c
      ));
  };

  const handleDirectChat = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    // Check if DM exists
    const existingChat = chats.find(c => 
        c.selectedAgentIds.length === 1 && 
        c.selectedAgentIds[0] === agentId &&
        c.title.startsWith("Chat with")
    );

    if (existingChat) {
        setActiveChatId(existingChat.id);
    } else {
        const newChat: Chat = {
            id: `dm-${Date.now()}`,
            title: `Chat with ${agent.name}`,
            lastActivity: Date.now(),
            messages: [],
            runs: [],
            selectedAgentIds: [agentId]
        };
        setChats([newChat, ...chats]);
        setActiveChatId(newChat.id);
    }
    setMobileView('thread');
  };

  // Actions
  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // 1. Create User Message
    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: Date.now()
    };

    // 2. Create Run
    // If we are in a group chat, we use all agents. 
    // If in a DM, we use the specific agent.
    const runAgentIds = activeChat.selectedAgentIds.length > 0 ? activeChat.selectedAgentIds : agents.map(a => a.id);

    const newRun: Run = {
      id: `run-${Date.now()}`,
      timestamp: Date.now(),
      prompt: text,
      agentIds: runAgentIds,
      status: "running",
      outputs: {}
    };

    // 3. Update Chat State
    setChats(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          messages: [...c.messages, newMessage],
          runs: [...c.runs, newRun]
        };
      }
      return c;
    }));

    // 4. Set Agents to Working
    setAgents(prev => prev.map(a => 
      runAgentIds.includes(a.id) ? { ...a, status: "working" } : a
    ));
    
    // Auto-open terminal on run
    setTerminalOpen(true);
    addLog(`Run started: ${text.substring(0, 30)}...`, 'System', 'info', 'system');

    // 5. Simulate Agent Responses (Mock)
    if (runAgentIds.length > 0) {
        // Simulate some "moves" / logs with different categories
        setTimeout(() => {
            addLog("Fetching market data for potential entry...", runAgentIds[0], 'info', 'analysis');
        }, 500);

        setTimeout(() => {
            addLog("Scanning recent X posts for ticker mentions...", runAgentIds[0], 'info', 'post');
        }, 800);

        setTimeout(() => {
            // First completion
            completeRunPartial(newRun.id, runAgentIds[0], "I've analyzed the market structure. It looks bullish.");
            addLog("Market structure analysis complete. Bias: Bullish", runAgentIds[0], 'success', 'analysis');
            addLog("Resistance at 45k confirmed by order book.", runAgentIds[0], 'info', 'analysis');
        }, 1500);

        if (runAgentIds.length > 1) {
             setTimeout(() => {
                addLog("Evaluating risk exposure for current portfolio...", runAgentIds[1], 'warning', 'analysis');
            }, 2000);

            setTimeout(() => {
                // Second completion
                completeRunPartial(newRun.id, runAgentIds[1], "Risk parameters are within safe limits. Recommend 5% allocation.");
                addLog("Risk check passed. Allocation recommended: 5%", runAgentIds[1], 'success', 'analysis');
                
                // Simulate a "Trade" log
                addLog("EXECUTING BUY ORDER: BTC-PERP @ 65420 Size: 0.5 BTC", runAgentIds[1], 'success', 'trade');
            }, 2500);
        }
    }

     setTimeout(() => {
        // Final completion & cleanup
        finishRun(newRun.id);
        addLog("Run completed successfully.", 'System', 'success', 'system');
    }, 3500);
  };

  const completeRunPartial = (runId: string, agentId: string, output: string) => {
      setChats(prev => prev.map(c => {
          if (c.id !== activeChatId) return c;
          const runIndex = c.runs.findIndex(r => r.id === runId);
          if (runIndex === -1) return c;

          const updatedRuns = [...c.runs];
          updatedRuns[runIndex] = {
              ...updatedRuns[runIndex],
              outputs: {
                  ...updatedRuns[runIndex].outputs,
                  [agentId]: output
              }
          };
          return { ...c, runs: updatedRuns };
      }));
       setAgents(prev => prev.map(a => 
        a.id === agentId ? { ...a, status: "idle" } : a
      ));
  };

  const finishRun = (runId: string) => {
      setChats(prev => prev.map(c => {
          if (c.id !== activeChatId) return c;
          const runIndex = c.runs.findIndex(r => r.id === runId);
          if (runIndex === -1) return c;

          const updatedRuns = [...c.runs];
          updatedRuns[runIndex] = {
              ...updatedRuns[runIndex],
              status: "completed"
          };
          return { ...c, runs: updatedRuns };
      }));
       // Ensure all back to idle
       setAgents(prev => prev.map(a => ({ ...a, status: "idle" })));
  };
  
  const handleOpenTab = (type: TabType, title: string, data?: any) => {
      const newTab: Tab = {
          id: Date.now().toString(),
          type,
          title,
          data
      };
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newTab.id);
      setRightSidebarOpen(true); // Auto open when a tab is added on desktop
      setMobileView('artifacts'); // Auto switch to artifacts on mobile
  };

  const handleAddAgent = (agentId: string) => {
      if (!selectedAgentIds.includes(agentId)) {
          updateActiveChatAgents([...selectedAgentIds, agentId]);
      }
  };

  const handleAgentSettings = (agentId: string) => {
      const agent = agents.find(a => a.id === agentId);
      if (!agent) return;
      handleOpenTab('agent-settings', `${agent.name} Settings`, { agentId });
  };

  // Determine the default filter for the terminal based on the active chat
  const terminalFilterId = activeChat.selectedAgentIds.length === 1 ? activeChat.selectedAgentIds[0] : 'all';

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans flex-col md:flex-row pb-16 md:pb-0">
      <GlobalNavigation activeItem="Agents" collapsed={!globalNavExpanded} />
      
      {/* Mobile Header (Persistent) */}
      <div className="md:hidden flex flex-col border-b border-border bg-background shrink-0 z-50">
          {/* Logo Bar */}
          <div className="h-14 flex items-center px-4 justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px]">
                        <Bot className="w-4 h-4" />
                </div>
                <span className="font-bold text-lg text-blue-600 tracking-tight">babylon</span>
              </div>
              
              {/* Terminal Quick Access (Toggle for bottom split) */}
               <button 
                onClick={() => setTerminalOpen(!terminalOpen)}
                className={cn(
                    "text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors",
                    terminalOpen ? "bg-blue-600 text-white" : "bg-muted/50 text-muted-foreground"
                )}
            >
                <Activity className="w-3.5 h-3.5" />
                <span>{logs.length}</span>
             </button>
          </div>

          {/* Persistent View Switcher (Tabs) */}
          <div className="flex w-full px-2 pb-2">
              <div className="w-full flex p-1 bg-muted/20 rounded-lg border border-border/50">
                 <button 
                    onClick={() => setMobileView('chats')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all", 
                        mobileView === 'chats' ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                     <MessageSquare className="w-4 h-4" />
                     <span>Agents</span>
                 </button>
                 <button 
                    onClick={() => setMobileView('thread')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all", 
                        mobileView === 'thread' ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                     <Bot className="w-4 h-4" />
                     <span>Chat</span>
                 </button>
                 <button 
                    onClick={() => setMobileView('artifacts')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all relative", 
                        mobileView === 'artifacts' ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                     <FileText className="w-4 h-4" />
                     <span>Context</span>
                     {tabs.length > 0 && <span className="absolute top-2 right-3 w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                 </button>
             </div>
          </div>
      </div>

      {/* Workspace Area - Flex Column to support full-width terminal at bottom */}
      <div className="flex-1 flex flex-col overflow-hidden relative w-full h-full">
        
        {/* Top Columns Section: Sidebar + Main + RightPanel */}
        <div className="flex-1 flex overflow-hidden w-full relative">
            
            {/* Left Sidebar (Chats) */}
            <div className={cn(
                "md:block transition-all duration-300 ease-in-out bg-background md:bg-transparent",
                // Desktop Logic
                leftSidebarOpen ? "md:w-[260px]" : "md:w-0 md:overflow-hidden",
                // Mobile Logic
                mobileView === 'chats' ? "absolute inset-0 z-20 w-full" : "hidden md:block"
            )}>
                <Sidebar 
                    chats={chats} 
                    activeChatId={activeChatId} 
                    onSelectChat={(id) => {
                        setActiveChatId(id);
                        setMobileView('thread');
                    }}
                    agents={agents}
                    selectedAgentIds={selectedAgentIds}
                    onAgentClick={handleDirectChat}
                    onNewChat={() => {
                    const newChat: Chat = {
                            id: `c-${Date.now()}`,
                            title: "New Task",
                            lastActivity: Date.now(),
                            messages: [],
                            runs: [],
                            selectedAgentIds: agents.map(a => a.id)
                        };
                        setChats([newChat, ...chats]);
                        setActiveChatId(newChat.id);
                        setMobileView('thread'); // Auto switch on new chat
                    }}
                    onAgentSettings={handleAgentSettings}
                />
            </div>

            {/* Center Panel (Timeline + Header) */}
            <main className={cn(
                "flex-1 flex flex-col min-w-0 border-r border-border relative w-full h-full bg-background transition-opacity duration-200",
                mobileView === 'thread' ? "flex opacity-100" : "hidden md:flex md:opacity-100"
            )}>
                <header className="h-12 border-b border-border flex items-center px-4 justify-between shrink-0 bg-background hidden md:flex">
                    {/* Desktop Header Left Controls */}
                    <div className="flex items-center gap-3">
                        {!globalNavExpanded && (
                            <button 
                                onClick={() => setGlobalNavExpanded(true)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                title="Expand Navigation"
                            >
                                <Layout className="w-4 h-4" />
                            </button>
                        )}
                        <button 
                            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                            className={cn(
                                "text-muted-foreground hover:text-foreground transition-colors",
                                !leftSidebarOpen && "text-primary"
                            )}
                            title="Toggle Chat Sidebar"
                        >
                            <PanelLeft className="w-4 h-4" />
                        </button>
                        <h1 className="font-medium text-sm text-foreground/80 ml-2">{activeChat.title}</h1>
                    </div>

                    {/* Desktop Header Right Controls */}
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setGlobalNavExpanded(!globalNavExpanded)}
                            className={cn(
                                "text-muted-foreground hover:text-foreground transition-colors",
                                !globalNavExpanded && "hidden"
                            )}
                            title="Collapse Navigation"
                        >
                            <Minimize2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <button 
                            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                            className={cn(
                                "text-muted-foreground hover:text-foreground transition-colors",
                                !rightSidebarOpen && "text-primary"
                            )}
                            title="Toggle Artifacts Panel"
                        >
                            <PanelRight className="w-4 h-4" />
                        </button>
                    </div>
                </header>
                
                {/* Timeline */}
                <div className="flex-1 overflow-hidden relative flex flex-col">
                    <div className="flex-1 overflow-hidden relative">
                        <ChatTimeline 
                            chat={activeChat} 
                            agents={agents}
                            onOpenTab={handleOpenTab}
                        />
                    </div>
                </div>
                
                {/* Composer Container */}
                <div className="flex flex-col shrink-0 bg-background z-10">
                    <div className="p-4 border-t border-border">
                        <Composer 
                            onSend={handleSendMessage}
                            agents={agents}
                        />
                    </div>
                </div>
            </main>

            {/* Right Panel (Artifacts) */}
            <div className={cn(
                "md:flex transition-all duration-300 ease-in-out bg-background md:bg-transparent",
                // Desktop Logic
                rightSidebarOpen ? "md:w-[400px]" : "md:w-0 md:overflow-hidden",
                // Mobile Logic
                mobileView === 'artifacts' ? "absolute inset-0 z-20 w-full md:static md:inset-auto" : "hidden md:flex"
            )}>
                <RightPanel 
                    tabs={tabs}
                    activeTabId={activeTabId}
                    onCloseTab={(id) => {
                        setTabs(prev => prev.filter(t => t.id !== id));
                        if (activeTabId === id) setActiveTabId(null);
                        if (tabs.length <= 1) setMobileView('thread'); // Auto close if last tab
                    }}
                    onSelectTab={setActiveTabId}
                />
            </div>

        </div>

        {/* Terminal Section - Full Width Bottom Drawer */}
        <div className="shrink-0 z-30 bg-background w-full">
            {/* Expanded Content Container */}
            <div className={cn(
                "transition-all duration-300 ease-in-out border-t border-border overflow-hidden",
                terminalOpen ? "h-[33vh] md:h-[250px]" : "h-0 border-t-0"
            )}>
                 <TerminalPanel 
                    logs={logs}
                    agents={agents}
                    isOpen={true}
                    onToggle={() => setTerminalOpen(false)}
                    onClear={() => setLogs([])}
                    className="h-full border-t-0" 
                    defaultAgentId={terminalFilterId}
                 />
            </div>
            
            {/* Collapsed Bar - Desktop Only (Mobile uses header button) */}
             {!terminalOpen && (
                <div className="hidden md:block">
                    <TerminalPanel 
                        logs={logs}
                        agents={agents}
                        isOpen={false}
                        onToggle={() => setTerminalOpen(true)}
                        onClear={() => setLogs([])}
                        className="border-t border-border"
                        defaultAgentId={terminalFilterId}
                    />
                </div>
            )}
        </div>

      </div>
    </div>
  );
}

