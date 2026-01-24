import React, { useState } from "react";
import { 
  PanelLeft,
  PanelRight,
  Maximize2,
  Minimize2,
  Layout
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Chat, Agent, Run, Message, Tab, TabType } from "@/types";

// --- Mock Data ---

const INITIAL_AGENTS: Agent[] = [
  { id: "a1", name: "Market Maker", role: "Trader", status: "idle", color: "bg-blue-500", avatar: "MM" },
  { id: "a2", name: "Risk Guard", role: "Risk", status: "idle", color: "bg-red-500", avatar: "RG" },
  { id: "a3", name: "Sentiment", role: "Researcher", status: "idle", color: "bg-purple-500", avatar: "SE" },
  { id: "a4", name: "Exec", role: "Execution", status: "idle", color: "bg-green-500", avatar: "EX" },
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
    selectedAgentIds: ["a1", "a2"] // Default initial selection for this chat
  },
  {
    id: "c2",
    title: "BTC Volatility Strat",
    lastActivity: Date.now() - 86400000,
    messages: [],
    runs: [],
    selectedAgentIds: ["a3", "a4"] // Different default for this chat
  }
];

// --- Components ---
import Sidebar from "@/app/components/Sidebar";
import ChatTimeline from "@/app/components/ChatTimeline";
import RightPanel from "@/app/components/RightPanel";
import TerminalPanel, { TerminalLog } from "@/app/components/TerminalPanel";
import GlobalNavigation from "@/app/components/GlobalNavigation";

export default function App() {
  // Global State
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<string>("c1");
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  
  // Layout State
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [globalNavExpanded, setGlobalNavExpanded] = useState(true); // Default to expanded

  // Right Panel State
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  // Terminal State
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [logs, setLogs] = useState<TerminalLog[]>([]);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];
  const selectedAgentIds = activeChat.selectedAgentIds || [];

  const addLog = (message: string, agentId?: string, level: TerminalLog['level'] = 'info') => {
      setLogs(prev => [...prev, {
          id: Date.now().toString() + Math.random(),
          timestamp: Date.now(),
          message,
          agentId,
          level
      }]);
  };

  const updateActiveChatAgents = (newAgentIds: string[]) => {
      setChats(prev => prev.map(c => 
          c.id === activeChatId 
            ? { ...c, selectedAgentIds: newAgentIds }
            : c
      ));
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
    const newRun: Run = {
      id: `run-${Date.now()}`,
      timestamp: Date.now(),
      prompt: text,
      agentIds: [...selectedAgentIds],
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
      selectedAgentIds.includes(a.id) ? { ...a, status: "working" } : a
    ));
    
    // Auto-open terminal on run
    setTerminalOpen(true);
    addLog(`Run started: ${text.substring(0, 30)}...`, 'System', 'info');

    // 5. Simulate Agent Responses (Mock)
    if (selectedAgentIds.length > 0) {
        // Simulate some "moves" / logs
        setTimeout(() => {
            addLog("Fetching market data for potential entry...", selectedAgentIds[0], 'info');
        }, 500);

        setTimeout(() => {
            // First completion
            completeRunPartial(newRun.id, selectedAgentIds[0], "I've analyzed the market structure. It looks bullish.");
            addLog("Market structure analysis complete. Bias: Bullish", selectedAgentIds[0], 'success');
            addLog("Checking resistance levels at 45k...", selectedAgentIds[0], 'info');
        }, 1500);

        if (selectedAgentIds.length > 1) {
             setTimeout(() => {
                addLog("Evaluating risk exposure for current portfolio...", selectedAgentIds[1], 'warning');
            }, 2000);

            setTimeout(() => {
                // Second completion
                completeRunPartial(newRun.id, selectedAgentIds[1], "Risk parameters are within safe limits. Recommend 5% allocation.");
                addLog("Risk check passed. Allocation recommended: 5%", selectedAgentIds[1], 'success');
            }, 2500);
        }
    }

     setTimeout(() => {
        // Final completion & cleanup
        finishRun(newRun.id);
        addLog("Run completed successfully.", 'System', 'success');
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
      setRightSidebarOpen(true); // Auto open when a tab is added
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      <GlobalNavigation activeItem="Command Center" collapsed={!globalNavExpanded} />
      
      {/* Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar (Chats) */}
        {leftSidebarOpen && (
            <Sidebar 
                chats={chats} 
                activeChatId={activeChatId} 
                onSelectChat={setActiveChatId}
                agents={agents}
                selectedAgentIds={selectedAgentIds}
                onToggleAgent={(id) => {
                    const currentIds = activeChat.selectedAgentIds || [];
                    const newIds = currentIds.includes(id) 
                        ? currentIds.filter(x => x !== id) 
                        : [...currentIds, id];
                    updateActiveChatAgents(newIds);
                }}
                onNewChat={() => {
                    const newChat: Chat = {
                        id: `c-${Date.now()}`,
                        title: "New Task",
                        lastActivity: Date.now(),
                        messages: [],
                        runs: [],
                        selectedAgentIds: agents.map(a => a.id) // Default to all agents for new chat
                    };
                    setChats([newChat, ...chats]);
                    setActiveChatId(newChat.id);
                }}
                onNewAgent={() => {
                    const colors = ["bg-blue-500", "bg-red-500", "bg-purple-500", "bg-green-500", "bg-yellow-500", "bg-pink-500", "bg-indigo-500", "bg-cyan-500"];
                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                    const newAgent: Agent = {
                        id: `a-${Date.now()}`,
                        name: "New Agent",
                        role: "Worker",
                        status: "idle",
                        color: randomColor,
                        avatar: "NA"
                    };
                    setAgents(prev => [...prev, newAgent]);
                    
                    // Add new agent to current chat's selection automatically
                    updateActiveChatAgents([...selectedAgentIds, newAgent.id]);
                }}
            />
        )}

        {/* Center Panel (Timeline + Header) */}
        <main className="flex-1 flex flex-col min-w-0 border-r border-border relative">
            <header className="h-12 border-b border-border flex items-center px-4 justify-between shrink-0 bg-background">
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
            
            {/* Composer & Terminal Container */}
            <div className="flex flex-col shrink-0 bg-background z-10">
                <div className="p-4 border-t border-border">
                    <Composer 
                        selectedAgents={agents.filter(a => selectedAgentIds.includes(a.id))}
                        onRemoveAgent={(id) => {
                            const newIds = selectedAgentIds.filter(x => x !== id);
                            updateActiveChatAgents(newIds);
                        }}
                        onSend={handleSendMessage}
                    />
                </div>
                
                <TerminalPanel 
                    logs={logs}
                    isOpen={terminalOpen}
                    onToggle={() => setTerminalOpen(!terminalOpen)}
                    onClear={() => setLogs([])}
                />
            </div>

        </main>

        {/* Right Panel (Artifacts) */}
        {rightSidebarOpen && (
            <RightPanel 
                tabs={tabs}
                activeTabId={activeTabId}
                onCloseTab={(id) => {
                    setTabs(prev => prev.filter(t => t.id !== id));
                    if (activeTabId === id) setActiveTabId(null);
                }}
                onSelectTab={setActiveTabId}
            />
        )}
      </div>
    </div>
  );
}

function Composer({ selectedAgents, onRemoveAgent, onSend }: { selectedAgents: Agent[], onRemoveAgent: (id: string) => void, onSend: (text: string) => void }) {
    const [text, setText] = useState("");
    
    return (
        <div className="flex flex-col gap-2 bg-muted/30 p-3 rounded-lg border border-border focus-within:ring-1 focus-within:ring-ring transition-all">
            {selectedAgents.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-1">
                    {selectedAgents.map(agent => (
                        <span key={agent.id} className="inline-flex items-center gap-1 bg-background/50 border border-border rounded-full px-2 py-0.5 text-xs text-muted-foreground select-none">
                            <span className={cn("w-1.5 h-1.5 rounded-full", agent.color)} />
                            {agent.name}
                            <button onClick={() => onRemoveAgent(agent.id)} className="hover:text-foreground ml-0.5">×</button>
                        </span>
                    ))}
                </div>
            )}
            <div className="flex gap-2">
                 <textarea 
                    className="flex-1 bg-transparent resize-none outline-none text-sm min-h-[40px] max-h-[200px]" 
                    placeholder="Ask the swarm..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            onSend(text);
                            setText("");
                        }
                    }}
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
                    {/* Removed @ Mention button */}
                 </div>
                 <span>⌘ Enter to send</span>
            </div>
        </div>
    )
}
