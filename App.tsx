
import React, { useState, useRef, useEffect } from 'react';
import { 
  Activity, ShieldAlert, Terminal, Play, 
  Upload, Search, Server, FileCheck, ShieldCheck,
  Bot, AlertTriangle, Download, RefreshCw, LayoutDashboard,
  Map, Globe, Wifi, Filter, X, Send, Lock, FileText, FolderOpen, Save,
  Database, Plus, Trash2, Tag, ChevronDown, Monitor, Clock, Zap, ShieldOff, Settings, Sliders,
  Network, CheckCircle, XCircle, Power, LogOut, User, Key, Shield, FileCode, Cloud, Folder,
  Users, UserPlus, BookOpen, HelpCircle, Info, GitBranch, CreditCard, Cpu
} from 'lucide-react';
import { Protocol, ServerConfig, ScanResult, LogEntry, BruteForceConfig, AiChatMessage, Target, ProxyConfig, SystemUser } from './types';
import { simulateCheck, parseFileZillaXml, checkProxy } from './services/mockFtpService';
import { analyzeSecurityReport, explainError, chatWithSecurityData } from './services/geminiService';
import { saveTarget, getTargets, deleteTarget, saveResult, getResults, clearResults, saveProxy, getProxies, deleteProxy } from './services/dbService';
import { performRealScan, checkAgentHealth } from './services/agentService';
import StatsCard from './components/StatsCard';
import TerminalOutput from './components/TerminalOutput';
import NetworkVisualizer from './components/NetworkVisualizer';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';

// Pre-defined dictionary presets
const DICTIONARY_PRESETS = {
  default: {
    name: 'Default Credentials',
    users: ['root', 'admin', 'user', 'test', 'guest', 'info', 'oracle', 'postgres'],
    pass: ['123456', 'password', '12345678', '12345', 'admin', 'root', 'welcome', 'guest']
  },
  iot: {
    name: 'IoT / Embedded',
    users: ['admin', 'root', 'ubnt', 'support', 'user', 'service', 'pi', 'operator'],
    pass: ['admin', 'root', 'ubnt', 'password', '1234', '54321', '888888', '123456', 'realtek']
  },
  top100: {
    name: 'Top Common',
    users: ['root', 'admin', 'administrator', 'webadmin', 'sysadmin', 'netadmin', 'backup', 'operator'],
    pass: ['123456', 'password', '12345678', 'qwerty', '1234567890', '111111', '1234567', 'sunshine', 'princess', 'admin', 'welcome', '654321']
  }
};

interface LoginProps {
    users: SystemUser[];
    onLogin: (user: SystemUser) => void;
}

const LoginScreen = ({ users, onLogin }: LoginProps) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate network authentication delay
    setTimeout(() => {
      const user = users.find(u => u.username === username && u.password === password);
      
      if (user) {
        onLogin(user);
      } else {
        setError('Access Denied: Invalid credentials.');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
       {/* Background Grid Animation */}
       <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

       <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 relative z-10 backdrop-blur-xl">
          <div className="flex justify-center mb-8">
             <div className="bg-slate-800 p-4 rounded-full border border-slate-600 shadow-lg shadow-cyan-900/20">
                <ShieldCheck className="w-12 h-12 text-cyan-400" />
             </div>
          </div>
          
          <div className="text-center mb-8">
             <h1 className="text-2xl font-bold text-white tracking-tight">NetSentry Security Gateway</h1>
             <p className="text-slate-500 text-sm mt-2">Restricted Access. Authorized Personnel Only.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
             <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                   <User className="w-3 h-3" /> Identity
                </label>
                <input 
                   type="text" 
                   value={username}
                   onChange={(e) => setUsername(e.target.value)}
                   className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                   placeholder="Enter username"
                />
             </div>
             
             <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                   <Key className="w-3 h-3" /> Credential
                </label>
                <input 
                   type="password" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                   placeholder="Enter password"
                />
             </div>

             {error && (
                <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-3 flex items-center gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                   <AlertTriangle className="w-4 h-4" />
                   {error}
                </div>
             )}

             <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3.5 rounded-lg shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
             >
                {isLoading ? (
                   <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Authenticating...
                   </>
                ) : (
                   <>
                      <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Authenticate Session
                   </>
                )}
             </button>
          </form>
          
          <div className="mt-6 text-center">
             <p className="text-[10px] text-slate-600 font-mono">
                SECURE HANDSHAKE PROTOCOL v2.1<br/>
                ENCRYPTED CONNECTION ESTABLISHED
             </p>
          </div>
       </div>
    </div>
  );
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'targets' | 'proxy' | 'scan' | 'brute' | 'results' | 'profile' | 'about'>('dashboard');
  
  // Real Agent State
  const [useRealAgent, setUseRealAgent] = useState(false);
  const [agentOnline, setAgentOnline] = useState(false);
  
  // System Users State
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([
      {
          id: 'root-001',
          username: 'admin',
          password: 'admin',
          role: 'admin',
          fullName: 'System Administrator',
          email: 'admin@netsentry.local',
          createdAt: new Date(Date.now() - 86400000 * 365).toISOString(),
          lastLogin: new Date().toISOString()
      },
      {
          id: 'user-002',
          username: 'analyst',
          password: 'password',
          role: 'analyst',
          fullName: 'Security Analyst',
          email: 'ops@netsentry.local',
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
      }
  ]);
  const [newUser, setNewUser] = useState<Partial<SystemUser>>({ role: 'analyst' });
  const [isAddingUser, setIsAddingUser] = useState(false);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [savedTargets, setSavedTargets] = useState<Target[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [showAdvancedBrute, setShowAdvancedBrute] = useState(true);
  
  // Proxy State
  const [proxies, setProxies] = useState<ProxyConfig[]>([]);
  const [proxyImportMode, setProxyImportMode] = useState<'paste' | 'file' | 'api'>('paste');
  const [proxyInputText, setProxyInputText] = useState("");
  const [isCheckingProxies, setIsCheckingProxies] = useState(false);
  const [useGlobalProxy, setUseGlobalProxy] = useState(false);

  // AI State
  const [aiReport, setAiReport] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<AiChatMessage[]>([
    { role: 'model', text: 'Hello! I am your Security Operations Assistant. I can analyze your scan results, explain errors, or summarize infrastructure health. How can I help?' }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Filter State
  const [filterText, setFilterText] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed'>('all');

  // Single Scan State
  const [singleHost, setSingleHost] = useState<ServerConfig>({
    id: 'manual',
    host: '127.0.0.1',
    port: 21,
    protocol: Protocol.FTP,
    username: 'admin',
    password: '',
    checkPath: '/'
  });

  // Target Management State
  const [newTarget, setNewTarget] = useState<Partial<Target>>({
    name: '',
    host: '',
    port: 21,
    protocol: Protocol.FTP,
    tags: [],
    username: 'admin',
    group: 'Default'
  });
  const [newTagInput, setNewTagInput] = useState("");

  // Brute Force State
  const [bruteConfig, setBruteConfig] = useState<BruteForceConfig>({
    targetHost: '192.168.1.15',
    targetPort: 22,
    protocol: Protocol.SFTP,
    usernames: DICTIONARY_PRESETS.default.users,
    passwords: DICTIONARY_PRESETS.default.pass,
    delayMs: 200,
    jitterMs: 100,
    stopOnBan: true
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const shouldStopRef = useRef(false);

  // Initial Data Load from DB
  useEffect(() => {
    if (isAuthenticated) {
        const loadData = async () => {
            try {
                const dbTargets = await getTargets();
                setSavedTargets(dbTargets);
                
                const dbResults = await getResults();
                setResults(dbResults);
                
                const dbProxies = await getProxies();
                setProxies(dbProxies);

                addLog('info', `System initialized. Loaded ${dbTargets.length} targets, ${dbProxies.length} proxies, and ${dbResults.length} historical records.`);
            } catch (e) {
                console.error("Failed to load DB", e);
                addLog('error', 'Failed to load local database.');
            }
        };
        loadData();

        // Check Agent Health periodically
        const interval = setInterval(async () => {
            const isOnline = await checkAgentHealth();
            setAgentOnline(isOnline);
            if(useRealAgent && !isOnline) {
                // If we want real mode but it's down
                // addLog('warning', 'Local Agent connection lost. Reverting to Simulation mode may be required.');
            }
        }, 5000);
        
        // Initial check
        checkAgentHealth().then(setAgentOnline);

        return () => clearInterval(interval);
    }
  }, [isAuthenticated, useRealAgent]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const addLog = (type: LogEntry['type'], message: string) => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36),
      timestamp: new Date().toISOString(),
      type,
      message
    }]);
  };

  const handleStopScan = () => {
    shouldStopRef.current = true;
    addLog('warning', '🛑 Operation aborted by user command.');
  };

  const handleLoginSuccess = (user: SystemUser) => {
      setCurrentUser(user);
      setIsAuthenticated(true);
      // Update last login
      const updatedUsers = systemUsers.map(u => u.id === user.id ? {...u, lastLogin: new Date().toISOString()} : u);
      setSystemUsers(updatedUsers);
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setLogs([]);
      setActiveTab('dashboard');
  };

  const handleCreateUser = () => {
      if (!newUser.username || !newUser.password || !newUser.email) {
          alert("Please fill all required fields");
          return;
      }
      const user: SystemUser = {
          id: Math.random().toString(36).substr(2, 9),
          username: newUser.username,
          password: newUser.password,
          role: newUser.role as any,
          email: newUser.email,
          fullName: newUser.fullName || newUser.username,
          createdAt: new Date().toISOString()
      };
      setSystemUsers([...systemUsers, user]);
      setIsAddingUser(false);
      setNewUser({ role: 'analyst' });
      addLog('success', `New user account created: ${user.username} (${user.role})`);
  };

  // --- Target Management Functions ---

  const handleAddTag = () => {
    if (newTagInput.trim() && !newTarget.tags?.includes(newTagInput.trim())) {
      setNewTarget(prev => ({ ...prev, tags: [...(prev.tags || []), newTagInput.trim()] }));
      setNewTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setNewTarget(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tag) }));
  };

  const handleSaveTarget = async () => {
    if (!newTarget.name || !newTarget.host) {
      addLog('error', 'Target Name and Host are required.');
      return;
    }

    const targetToSave: Target = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTarget.name,
      host: newTarget.host,
      port: newTarget.port || 21,
      protocol: newTarget.protocol || Protocol.FTP,
      tags: newTarget.tags || [],
      username: newTarget.username,
      group: newTarget.group || 'Default',
      notes: newTarget.notes,
      createdAt: new Date().toISOString()
    };

    await saveTarget(targetToSave);
    setSavedTargets(prev => [...prev, targetToSave]);
    addLog('success', `Target "${targetToSave.name}" saved to library.`);
    
    // Reset form
    setNewTarget({
        name: '',
        host: '',
        port: 21,
        protocol: Protocol.FTP,
        tags: [],
        username: 'admin',
        group: 'Default',
        notes: ''
    });
  };

  const handleDeleteTarget = async (id: string) => {
    await deleteTarget(id);
    setSavedTargets(prev => prev.filter(t => t.id !== id));
    addLog('info', 'Target removed from library.');
  };

  const loadTargetToScan = (target: Target) => {
    setSingleHost({
        id: target.id,
        host: target.host,
        port: target.port,
        protocol: target.protocol,
        username: target.username || 'admin',
        password: '',
        checkPath: '/'
    });
    setActiveTab('scan');
    addLog('info', `Loaded target "${target.name}" into scanner.`);
  };

  const loadTargetToBrute = (target: Target) => {
    setBruteConfig(prev => ({
        ...prev,
        targetHost: target.host,
        targetPort: target.port,
        protocol: target.protocol
    }));
    setActiveTab('brute');
    addLog('warning', `Target "${target.name}" loaded into Brute Force module.`);
  };

  // --- Proxy Functions ---

  const parseAndAddProxies = async (text: string) => {
    const lines = text.split(/[\n\s,]+/);
    let addedCount = 0;
    const newProxies: ProxyConfig[] = [];
    
    // Regex for IP:Port
    const proxyRegex = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{1,5})$/;

    for (const line of lines) {
        const cleanLine = line.trim();
        const match = cleanLine.match(proxyRegex);
        if (match) {
            newProxies.push({
                 id: Math.random().toString(36).substr(2, 9),
                 ip: match[1],
                 port: parseInt(match[2]),
                 protocol: 'HTTP', // Default logic
                 status: 'untested'
            });
            addedCount++;
        }
    }
    
    if (addedCount > 0) {
        for(const p of newProxies) {
            await saveProxy(p);
        }
        setProxies(prev => [...prev, ...newProxies]);
        return addedCount;
    }
    return 0;
  };

  const handleImportProxies = async () => {
      if (!proxyInputText.trim()) return;
      
      addLog('info', 'Parsing proxy list...');
      const count = await parseAndAddProxies(proxyInputText);
      
      if(count > 0) {
          addLog('success', `Imported ${count} unique proxies to manager.`);
          setProxyInputText("");
      } else {
          addLog('error', 'No valid IP:Port patterns found in input.');
      }
  };

  const handleProxyFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
          const text = event.target?.result as string;
          addLog('info', `Processing proxy file: ${file.name}`);
          const count = await parseAndAddProxies(text);
          if (count > 0) {
              addLog('success', `File Import: Added ${count} proxies.`);
          } else {
              addLog('warning', 'File contained no valid proxy formats.');
          }
      };
      reader.readAsText(file);
  };

  const handleFetchPublicProxies = () => {
      addLog('info', 'Connecting to Public Proxy Directory API (Simulated)...');
      setTimeout(async () => {
          // Simulated API Response
          const mockList = `
            104.16.20.15:80
            45.79.12.118:8080
            203.0.113.45:3128
            185.199.111.153:80
            51.15.22.10:8080
            172.67.198.12:443
          `;
          setProxyInputText(mockList.trim());
          addLog('success', 'API Response: Received 6 proxy candidates. Review and click Import.');
      }, 1000);
  };

  const handleDeleteProxy = async (id: string) => {
      await deleteProxy(id);
      setProxies(prev => prev.filter(p => p.id !== id));
  };

  const handleCheckProxies = async () => {
      setIsCheckingProxies(true);
      addLog('info', `Testing ${proxies.length} proxies...`);
      
      const checkedProxies: ProxyConfig[] = [];
      for(const proxy of proxies) {
          const updated = await checkProxy(proxy);
          await saveProxy(updated); // Update DB
          checkedProxies.push(updated);
      }
      setProxies(checkedProxies);
      setIsCheckingProxies(false);
      addLog('info', 'Proxy check completed.');
  };

  const getActiveProxyDelay = () => {
      // Simulate proxy latency if global proxy enabled
      return useGlobalProxy ? Math.floor(Math.random() * 500) + 200 : 0;
  };

  // --- Scanning Functions ---

  const handleSingleScan = async () => {
    if (useRealAgent && !agentOnline) {
        addLog('error', 'Local Agent is OFFLINE. Please run "node server.js" or switch to Simulation mode.');
        return;
    }

    setIsScanning(true);
    const proxyDelay = getActiveProxyDelay();
    if(useGlobalProxy) addLog('info', `Routing scan through proxy chain (+${proxyDelay}ms latency)...`);

    addLog('info', `Initiating Handshake [${useRealAgent ? 'REAL' : 'SIM'}] with ${singleHost.host}:${singleHost.port}...`);
    try {
      let result;
      if (useRealAgent) {
          result = await performRealScan(singleHost);
      } else {
          result = await simulateCheck(singleHost, proxyDelay);
      }
      
      // Save to state and DB
      setResults(prev => [result, ...prev]);
      await saveResult(result);

      addLog(result.status === 'success' ? 'success' : 'error', `${result.status.toUpperCase()}: ${result.message} (${result.connectionTimeMs}ms)`);
    } catch (e) {
      addLog('error', 'Critical error during socket operation');
    }
    setIsScanning(false);
  };

  const handleBruteForce = async () => {
    if (useRealAgent && !agentOnline) {
        addLog('error', 'Local Agent is OFFLINE. Cannot perform real attacks without backend.');
        return;
    }

    shouldStopRef.current = false;
    setIsScanning(true);
    
    const userList = bruteConfig.usernames.filter(u => u.trim());
    const passList = bruteConfig.passwords.filter(p => p.trim());
    const totalCombos = userList.length * passList.length;

    const proxyDelay = getActiveProxyDelay();
    if(useGlobalProxy) addLog('warning', `[PROXY] Attack traffic routed via proxy (+${proxyDelay}ms avg latency).`);

    addLog('warning', `[BRUTE_FORCE] Target: ${bruteConfig.targetHost}:${bruteConfig.targetPort} [MODE: ${useRealAgent ? 'REAL' : 'SIMULATION'}]`);
    addLog('info', `[CONFIG] Delay: ${bruteConfig.delayMs}ms | Jitter: ${bruteConfig.jitterMs}ms | BanDetect: ${bruteConfig.stopOnBan ? 'ON' : 'OFF'}`);
    addLog('info', `[BRUTE_FORCE] Loaded Dictionary: ${userList.length} users, ${passList.length} passwords (${totalCombos} combinations)`);

    let attempts = 0;
    let found = false;
    let consecutiveConnectionErrors = 0;

    // Cluster Bomb Mode
    for (const user of userList) {
      if (shouldStopRef.current) break;
      
      for (const pass of passList) {
        if (shouldStopRef.current) break;
        
        // --- Rate Limiting & Jitter Implementation ---
        const jitter = Math.floor(Math.random() * bruteConfig.jitterMs);
        const waitTime = bruteConfig.delayMs + jitter;
        
        if (waitTime > 0) {
            await new Promise(r => setTimeout(r, waitTime));
        }

        const config: ServerConfig = {
          id: `bf-${Date.now()}-${attempts}`,
          host: bruteConfig.targetHost,
          port: bruteConfig.targetPort,
          protocol: bruteConfig.protocol,
          username: user,
          password: pass
        };

        try {
            let result;
            if (useRealAgent) {
                result = await performRealScan(config);
            } else {
                result = await simulateCheck(config, proxyDelay);
            }

            setResults(prev => [result, ...prev]);
            await saveResult(result); // Persist
            
            // --- Ban Detection Logic ---
            if (result.status === 'failed' && (
                result.message.toLowerCase().includes("refused") || 
                result.message.toLowerCase().includes("unreachable") || 
                result.message.toLowerCase().includes("timed out")
            )) {
                consecutiveConnectionErrors++;
            } else {
                consecutiveConnectionErrors = 0;
            }

            if (bruteConfig.stopOnBan && consecutiveConnectionErrors >= 3) {
                addLog('error', '🛑 IDS/IPS Ban detected! Multiple connection failures. Aborting sequence to prevent lockout.');
                shouldStopRef.current = true;
                break;
            }

            if (result.status === 'success') {
              addLog('success', `[PWNED] 🔓 CRITICAL: Valid credentials found! ${user}:${pass} @ ${config.host}`);
              found = true;
              if (useRealAgent) shouldStopRef.current = true; // Stop on success for real usage
            } else {
               if (attempts % 3 === 0) {
                 // Show attempt log occasionally to reduce noise, but show failures
                 addLog('info', `[ATTEMPT] ${user}:****** failed (${result.message})`);
               }
            }
        } catch (e) {
            addLog('error', `Simulation error: ${e}`);
        }
        attempts++;
      }
    }
    
    if (shouldStopRef.current) {
        addLog('warning', `Brute force sequence stopped. ${attempts} vectors tested.`);
    } else {
        addLog('info', `Brute force sequence concluded. ${attempts} vectors tested.`);
        if (!found) addLog('info', 'No valid credentials discovered in current dictionary.');
    }
    
    setIsScanning(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      addLog('info', `Importing configuration: ${file.name}...`);
      try {
        const configs = parseFileZillaXml(text);
        addLog('success', `Parsed ${configs.length} endpoints from XML.`);
        
        setIsScanning(true);
        shouldStopRef.current = false;
        const proxyDelay = getActiveProxyDelay();

        // Batch process
        for (const config of configs) {
            if (shouldStopRef.current) break;
            
            let result;
            if (useRealAgent) {
                result = await performRealScan(config);
            } else {
                result = await simulateCheck(config, proxyDelay);
            }
            setResults(prev => [result, ...prev]);
            await saveResult(result);
        }
        setIsScanning(false);
        addLog('success', 'Batch scan completed.');
      } catch (err) {
        addLog('error', 'Malformed XML structure detected.');
      }
    };
    reader.readAsText(file);
  };

  // --- Dictionary Management Handlers ---

  const handlePresetLoad = (type: keyof typeof DICTIONARY_PRESETS) => {
    const preset = DICTIONARY_PRESETS[type];
    setBruteConfig(prev => ({
        ...prev,
        usernames: preset.users,
        passwords: preset.pass
    }));
    addLog('info', `Loaded dictionary preset: ${preset.name}`);
  };

  const handleListUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'usernames' | 'passwords') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const text = event.target?.result as string;
        const items = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        setBruteConfig(prev => ({
            ...prev,
            [target]: items
        }));
        addLog('success', `Loaded ${items.length} unique entries into ${target} list.`);
    };
    reader.readAsText(file);
  };

  const handleComboUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/);
        const newUsers = new Set<string>();
        const newPass = new Set<string>();
        
        let count = 0;
        lines.forEach(line => {
            if (line.includes(':')) {
                const parts = line.split(':');
                if (parts.length >= 2) {
                   const u = parts[0].trim();
                   const p = parts.slice(1).join(':').trim(); // Handle passwords with colons
                   if (u) newUsers.add(u);
                   if (p) newPass.add(p);
                   count++;
                }
            }
        });
        
        setBruteConfig(prev => ({
            ...prev,
            usernames: Array.from(newUsers),
            passwords: Array.from(newPass)
        }));
        addLog('success', `Parsed Combo List: ${count} pairs processed. Extracted ${newUsers.size} unique users and ${newPass.size} unique passwords.`);
    };
    reader.readAsText(file);
  };

  const downloadList = (content: string[], filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([content.join('\n')], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleClearHistory = async () => {
      await clearResults();
      setResults([]);
      addLog('info', 'Database cleared.');
  };

  const handleAiChat = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput("");
    setIsAiThinking(true);

    const response = await chatWithSecurityData(userMsg, { results, logs });
    
    setChatMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsAiThinking(false);
  };

  const handleGenerateReport = async () => {
    setIsAiThinking(true);
    setAiReport("");
    addLog('info', 'Generating Executive Security Report...');
    const report = await analyzeSecurityReport(results);
    setAiReport(report);
    setIsAiThinking(false);
  };

  const handleExport = (format: 'csv' | 'json' | 'xml') => {
    const data = filteredResults;
    if (data.length === 0) {
        addLog('warning', 'No data to export.');
        return;
    }

    let content = '';
    let type = 'text/plain';
    let extension = '';

    if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        type = 'application/json';
        extension = 'json';
    } else if (format === 'csv') {
        const headers = ['Timestamp', 'Host', 'Port', 'Protocol', 'User', 'Status', 'Time(ms)', 'Message'];
        const rows = data.map(r => [
            r.timestamp,
            r.serverConfig.host,
            r.serverConfig.port,
            r.serverConfig.protocol === Protocol.FTP ? 'FTP' : 'SFTP',
            r.serverConfig.username,
            r.status,
            r.connectionTimeMs,
            `"${r.message.replace(/"/g, '""')}"` // Escape quotes
        ]);
        content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        type = 'text/csv';
        extension = 'csv';
    } else if (format === 'xml') {
        content = `<?xml version="1.0" encoding="UTF-8"?>
<results>
  ${data.map(r => `
  <scan>
    <timestamp>${r.timestamp}</timestamp>
    <host>${r.serverConfig.host}</host>
    <port>${r.serverConfig.port}</port>
    <protocol>${r.serverConfig.protocol === Protocol.FTP ? 'FTP' : 'SFTP'}</protocol>
    <user>${r.serverConfig.username}</user>
    <status>${r.status}</status>
    <latency>${r.connectionTimeMs}</latency>
    <message>${r.message}</message>
  </scan>`).join('')}
</results>`;
        type = 'application/xml';
        extension = 'xml';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scan_results_${new Date().toISOString().split('T')[0]}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    addLog('success', `Exported ${data.length} records to ${extension.toUpperCase()}.`);
  };

  // Stats for charts
  const stats = {
    total: results.length,
    success: results.filter(r => r.status === 'success').length,
    failed: results.filter(r => r.status === 'failed').length,
    avgLatency: results.length > 0 
      ? Math.round(results.reduce((acc, curr) => acc + curr.connectionTimeMs, 0) / results.length) 
      : 0
  };
  
  const protocolData = [
    { name: 'FTP', value: results.filter(r => r.serverConfig.protocol === Protocol.FTP).length, color: '#0ea5e9' },
    { name: 'SFTP', value: results.filter(r => r.serverConfig.protocol === Protocol.SFTP).length, color: '#8b5cf6' }
  ];

  const filteredResults = results.filter(r => {
    const matchesText = r.serverConfig.host.toLowerCase().includes(filterText.toLowerCase()) || 
                       r.serverConfig.username.toLowerCase().includes(filterText.toLowerCase());
    const matchesStatus = filterStatus === 'all' ? true : r.status === filterStatus;
    return matchesText && matchesStatus;
  });

  // --- Auth Check ---
  if (!isAuthenticated) {
      return <LoginScreen users={systemUsers} onLogin={handleLoginSuccess} />;
  }

  return (
    <div className="h-screen bg-slate-950 text-slate-200 flex overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900/50 border-r border-slate-800 flex flex-col backdrop-blur-sm z-20">
        <div className="p-6 border-b border-slate-800 bg-slate-900">
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tighter flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            NET_SENTRY
          </h1>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-mono">SecOps Dashboard v2.1</p>
        </div>
        
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
           <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Dashboard" />
           <NavButton active={activeTab === 'targets'} onClick={() => setActiveTab('targets')} icon={Database} label="Target Library" />
           <NavButton active={activeTab === 'proxy'} onClick={() => setActiveTab('proxy')} icon={Network} label="Proxy Manager" />
           <NavButton active={activeTab === 'scan'} onClick={() => setActiveTab('scan')} icon={Activity} label="Scanner & Discovery" />
           <NavButton active={activeTab === 'brute'} onClick={() => setActiveTab('brute')} icon={ShieldAlert} label="Penetration Test" />
           <NavButton active={activeTab === 'results'} onClick={() => setActiveTab('results')} icon={Server} label="Results & Audit" />
           <div className="my-2 border-t border-slate-800 mx-3"></div>
           <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={Users} label="Profile & Users" />
           <NavButton active={activeTab === 'about'} onClick={() => setActiveTab('about')} icon={BookOpen} label="Docs & About" />
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-3">
           {/* Real/Sim Switch */}
           <div className={`flex flex-col gap-2 p-3 rounded-lg border transition-all ${useRealAgent ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-800/50 border-slate-700'}`}>
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                        <Cpu className="w-3 h-3" />
                        {useRealAgent ? 'REAL AGENT' : 'SIMULATION'}
                    </span>
                    <button 
                        onClick={() => setUseRealAgent(!useRealAgent)}
                        className={`w-8 h-4 rounded-full relative transition-colors ${useRealAgent ? 'bg-indigo-500' : 'bg-slate-600'}`}
                    >
                        <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${useRealAgent ? 'left-4.5' : 'left-0.5'}`} />
                    </button>
                </div>
                {useRealAgent && (
                    <div className="flex items-center gap-2 text-[10px]">
                        <span className={`w-2 h-2 rounded-full ${agentOnline ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></span>
                        <span className={agentOnline ? 'text-emerald-400' : 'text-red-400'}>
                            {agentOnline ? 'ONLINE (127.0.0.1)' : 'OFFLINE (Run server.js)'}
                        </span>
                    </div>
                )}
           </div>

           <div className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono border ${useGlobalProxy ? 'bg-amber-900/20 border-amber-900/50 text-amber-500' : 'bg-slate-800/50 border-slate-700 text-slate-500'}`}>
              <span className="flex items-center gap-2"><Globe className="w-3 h-3" /> PROXY MODE</span>
              <span>{useGlobalProxy ? 'ON' : 'OFF'}</span>
           </div>
           
           <button 
             onClick={() => setIsAiChatOpen(!isAiChatOpen)}
             className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
               isAiChatOpen ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-900/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
             }`}
           >
             <div className="flex items-center gap-2">
               <Bot className="w-5 h-5" />
               <span>AI Assistant</span>
             </div>
             <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
           </button>

           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-red-900/20 hover:text-red-400 transition-colors border border-transparent hover:border-red-900/30"
             title="Terminate Session"
           >
             <LogOut className="w-4 h-4" />
             Terminate
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Top Bar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 backdrop-blur-sm">
           <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></span>
              {isScanning ? 'SCANNING IN PROGRESS...' : 'System Online'}
              <span className="mx-2 text-slate-600">|</span>
              <span className="font-mono text-xs">{new Date().toISOString().split('T')[0]}</span>
              {useRealAgent && !agentOnline && (
                  <span className="ml-4 px-2 py-0.5 rounded bg-red-900/50 border border-red-500 text-red-200 text-xs font-bold animate-pulse">
                      AGENT CONNECTION FAILED
                  </span>
              )}
           </div>
           
           <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-white">{currentUser?.fullName}</div>
                  <div className="text-[10px] text-slate-500 uppercase">{currentUser?.role}</div>
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold shadow-lg shadow-cyan-900/30">
                  {currentUser?.username.substring(0, 2).toUpperCase()}
              </div>
           </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scroll-smooth">
          
          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard title="Total Scans" value={stats.total} icon={Server} color="text-slate-400" />
                  <StatsCard title="Active Proxies" value={proxies.filter(p => p.status === 'active').length} icon={Network} color="text-purple-400" subtext={`${proxies.length} Loaded`} />
                  <StatsCard title="Security Incidents" value={stats.failed} icon={ShieldAlert} color="text-rose-500" subtext="Failed Authentications" />
                  <StatsCard title="Avg Latency" value={`${stats.avgLatency}ms`} icon={Wifi} color="text-emerald-400" subtext="Average Response" />
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Network Map */}
                  <div className="lg:col-span-2">
                     <NetworkVisualizer results={results} />
                  </div>
                  
                  {/* Protocol Dist Chart */}
                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-sm">
                     <h3 className="text-sm font-semibold text-slate-300 mb-4">Protocol Distribution</h3>
                     <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={protocolData}>
                              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                              <Tooltip 
                                 cursor={{fill: 'transparent'}}
                                 contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                              />
                              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                 {protocolData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                 ))}
                              </Bar>
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
               </div>
               
               {/* Terminal at bottom of dashboard */}
               <div className="bg-slate-900 border border-slate-700 rounded-xl p-1 overflow-hidden shadow-lg">
                  <TerminalOutput logs={logs} />
               </div>
            </div>
          )}

          {activeTab === 'targets' && (
             <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Add Target Form */}
                    <div className="w-full lg:w-1/3 space-y-4">
                        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-cyan-400" />
                                Add New Target
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-semibold">Friendly Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm mt-1 focus:border-cyan-500 outline-none"
                                        placeholder="Production DB 01"
                                        value={newTarget.name}
                                        onChange={(e) => setNewTarget({...newTarget, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-semibold">Hostname / IP</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm mt-1 focus:border-cyan-500 outline-none"
                                        placeholder="192.168.1.10"
                                        value={newTarget.host}
                                        onChange={(e) => setNewTarget({...newTarget, host: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-slate-400 uppercase font-semibold">Port</label>
                                        <input 
                                            type="number" 
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm mt-1 focus:border-cyan-500 outline-none"
                                            value={newTarget.port}
                                            onChange={(e) => setNewTarget({...newTarget, port: parseInt(e.target.value)})}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 uppercase font-semibold">Protocol</label>
                                        <select 
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm mt-1 focus:border-cyan-500 outline-none"
                                            value={newTarget.protocol}
                                            onChange={(e) => setNewTarget({...newTarget, protocol: parseInt(e.target.value)})}
                                        >
                                            <option value={Protocol.FTP}>FTP</option>
                                            <option value={Protocol.SFTP}>SFTP</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-semibold">Default User</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm mt-1 focus:border-cyan-500 outline-none"
                                        placeholder="admin"
                                        value={newTarget.username}
                                        onChange={(e) => setNewTarget({...newTarget, username: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-semibold">Group / Folder</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            list="existing-groups"
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm mt-1 focus:border-cyan-500 outline-none pl-8"
                                            placeholder="e.g. Production"
                                            value={newTarget.group}
                                            onChange={(e) => setNewTarget({...newTarget, group: e.target.value})}
                                        />
                                        <Folder className="w-4 h-4 text-slate-500 absolute left-2.5 top-[18px]" />
                                        <datalist id="existing-groups">
                                            {Array.from(new Set(savedTargets.map(t => t.group))).filter(Boolean).map(g => (
                                                <option key={g} value={g} />
                                            ))}
                                        </datalist>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-semibold">Tags</label>
                                    <div className="flex gap-2 mt-1">
                                        <input 
                                            type="text" 
                                            className="flex-1 bg-slate-950 border border-slate-700 rounded p-2 text-sm focus:border-cyan-500 outline-none"
                                            placeholder="Add tag..."
                                            value={newTagInput}
                                            onChange={(e) => setNewTagInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                        />
                                        <button onClick={handleAddTag} className="bg-slate-800 p-2 rounded hover:bg-slate-700"><Plus className="w-4 h-4" /></button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {newTarget.tags?.map(tag => (
                                            <span key={tag} className="text-xs bg-cyan-900/30 text-cyan-400 px-2 py-1 rounded flex items-center gap-1">
                                                {tag}
                                                <button onClick={() => removeTag(tag)} className="hover:text-white"><X className="w-3 h-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button 
                                    onClick={handleSaveTarget}
                                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded shadow-lg shadow-cyan-900/20 transition-all mt-4"
                                >
                                    Save Target to Database
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Target List */}
                    <div className="flex-1">
                        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl h-full flex flex-col">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                                <span className="flex items-center gap-2"><Database className="w-5 h-5 text-purple-400" /> Target Library</span>
                                <span className="text-xs font-normal text-slate-500">{savedTargets.length} saved entries</span>
                            </h2>
                            
                            {/* Grouping Logic */}
                            {(() => {
                                const groups = Array.from(new Set(savedTargets.map(t => t.group || 'Default'))).sort();
                                
                                if (savedTargets.length === 0) {
                                    return (
                                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-lg">
                                            <Monitor className="w-12 h-12 mb-2 opacity-20" />
                                            <p>No targets saved.</p>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="overflow-y-auto pr-2 custom-scrollbar max-h-[600px] space-y-6">
                                        {groups.map(groupName => (
                                            <div key={groupName}>
                                                <div className="flex items-center gap-2 mb-3 text-slate-400 border-b border-slate-800 pb-2 sticky top-0 bg-slate-900 z-10">
                                                    <FolderOpen className="w-4 h-4 text-purple-400" />
                                                    <span className="font-semibold text-sm">{groupName}</span>
                                                    <span className="text-xs bg-slate-800 px-2 rounded-full text-slate-500">
                                                        {savedTargets.filter(t => (t.group || 'Default') === groupName).length}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {savedTargets
                                                        .filter(t => (t.group || 'Default') === groupName)
                                                        .map(target => (
                                                            <div key={target.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 group hover:border-cyan-500/50 transition-colors relative">
                                                                <button 
                                                                    onClick={() => handleDeleteTarget(target.id)}
                                                                    className="absolute top-2 right-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                                
                                                                <div className="flex items-start gap-3 mb-3">
                                                                    <div className="p-2 bg-slate-900 rounded-lg">
                                                                        {target.protocol === Protocol.FTP ? <FileText className="w-5 h-5 text-blue-400" /> : <Lock className="w-5 h-5 text-purple-400" />}
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="font-bold text-slate-200">{target.name}</h3>
                                                                        <div className="text-xs text-slate-500 font-mono">{target.host}:{target.port}</div>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="flex gap-2 mb-4 flex-wrap">
                                                                    {target.tags.map(tag => (
                                                                        <span key={tag} className="text-[10px] uppercase bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                                                                            {tag}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                                
                                                                <div className="flex gap-2">
                                                                    <button 
                                                                        onClick={() => loadTargetToScan(target)}
                                                                        className="flex-1 text-xs bg-slate-900 hover:bg-cyan-900/30 text-cyan-400 py-2 rounded border border-slate-800 hover:border-cyan-800 transition-colors flex items-center justify-center gap-2"
                                                                    >
                                                                        <Play className="w-3 h-3" />
                                                                        Scan
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => loadTargetToBrute(target)}
                                                                        className="flex-1 text-xs bg-slate-900 hover:bg-red-900/30 text-red-400 py-2 rounded border border-slate-800 hover:border-red-800 transition-colors flex items-center justify-center gap-2"
                                                                    >
                                                                        <ShieldAlert className="w-3 h-3" />
                                                                        Attack
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
             </div>
          )}

          {activeTab === 'profile' && (
              <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* My Profile Card */}
                      <div className="lg:col-span-1 space-y-6">
                          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-20"></div>
                              <div className="relative flex flex-col items-center mb-6 pt-4">
                                  <div className="w-20 h-20 rounded-full bg-slate-800 border-4 border-slate-900 shadow-xl flex items-center justify-center text-2xl font-bold text-cyan-400 mb-3">
                                      {currentUser?.username.substring(0, 2).toUpperCase()}
                                  </div>
                                  <h2 className="text-xl font-bold text-white">{currentUser?.fullName}</h2>
                                  <span className="bg-cyan-900/30 text-cyan-400 px-3 py-1 rounded-full text-xs font-mono border border-cyan-900/50 mt-2 uppercase">{currentUser?.role}</span>
                              </div>
                              <div className="space-y-4 border-t border-slate-800 pt-6">
                                  <div className="flex items-center justify-between text-sm">
                                      <span className="text-slate-500 flex items-center gap-2"><User className="w-4 h-4"/> Username</span>
                                      <span className="text-slate-300 font-mono">{currentUser?.username}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                      <span className="text-slate-500 flex items-center gap-2"><Info className="w-4 h-4"/> Email</span>
                                      <span className="text-slate-300">{currentUser?.email}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                      <span className="text-slate-500 flex items-center gap-2"><Clock className="w-4 h-4"/> Last Login</span>
                                      <span className="text-slate-300">{currentUser?.lastLogin ? new Date(currentUser.lastLogin).toLocaleDateString() : 'Never'}</span>
                                  </div>
                              </div>
                          </div>

                          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl">
                              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                                  <Shield className="w-4 h-4" /> Security Status
                              </h3>
                              <div className="space-y-3">
                                  <div className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                      <div className="flex-1">
                                          <div className="text-xs font-bold text-white">2FA Authentication</div>
                                          <div className="text-[10px] text-slate-500">Enabled (Authenticator App)</div>
                                      </div>
                                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                                  </div>
                                  <div className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                      <div className="flex-1">
                                          <div className="text-xs font-bold text-white">Password Strength</div>
                                          <div className="text-[10px] text-slate-500">Last changed 30 days ago</div>
                                      </div>
                                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* User Management */}
                      <div className="lg:col-span-2">
                          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl h-full flex flex-col">
                              <div className="flex justify-between items-center mb-6">
                                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                      <Users className="w-5 h-5 text-purple-400" />
                                      Authorized Users
                                  </h2>
                                  {currentUser?.role === 'admin' && (
                                      <button 
                                          onClick={() => setIsAddingUser(!isAddingUser)}
                                          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${isAddingUser ? 'bg-slate-800 text-slate-400' : 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-900/20'}`}
                                      >
                                          {isAddingUser ? <X className="w-4 h-4"/> : <UserPlus className="w-4 h-4"/>}
                                          {isAddingUser ? 'Cancel' : 'Add User'}
                                      </button>
                                  )}
                              </div>

                              {isAddingUser && (
                                  <div className="mb-6 bg-slate-950 border border-purple-900/30 p-4 rounded-xl animate-in slide-in-from-top-2">
                                      <h3 className="text-xs font-bold text-purple-400 uppercase mb-4">New User Details</h3>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                          <div>
                                              <label className="text-xs text-slate-500 mb-1 block">Full Name</label>
                                              <input 
                                                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-purple-500 outline-none"
                                                  value={newUser.fullName || ''}
                                                  onChange={e => setNewUser({...newUser, fullName: e.target.value})}
                                              />
                                          </div>
                                          <div>
                                              <label className="text-xs text-slate-500 mb-1 block">Email Address</label>
                                              <input 
                                                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-purple-500 outline-none"
                                                  value={newUser.email || ''}
                                                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                                              />
                                          </div>
                                          <div>
                                              <label className="text-xs text-slate-500 mb-1 block">Username</label>
                                              <input 
                                                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-purple-500 outline-none"
                                                  value={newUser.username || ''}
                                                  onChange={e => setNewUser({...newUser, username: e.target.value})}
                                              />
                                          </div>
                                          <div>
                                              <label className="text-xs text-slate-500 mb-1 block">Temporary Password</label>
                                              <input 
                                                  type="password"
                                                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-purple-500 outline-none"
                                                  value={newUser.password || ''}
                                                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                                              />
                                          </div>
                                      </div>
                                      <div className="flex justify-between items-center">
                                          <div className="flex gap-4">
                                              <label className="flex items-center gap-2 cursor-pointer">
                                                  <input type="radio" name="role" checked={newUser.role === 'admin'} onChange={() => setNewUser({...newUser, role: 'admin'})} />
                                                  <span className="text-sm text-slate-300">Admin</span>
                                              </label>
                                              <label className="flex items-center gap-2 cursor-pointer">
                                                  <input type="radio" name="role" checked={newUser.role === 'analyst'} onChange={() => setNewUser({...newUser, role: 'analyst'})} />
                                                  <span className="text-sm text-slate-300">Analyst</span>
                                              </label>
                                              <label className="flex items-center gap-2 cursor-pointer">
                                                  <input type="radio" name="role" checked={newUser.role === 'viewer'} onChange={() => setNewUser({...newUser, role: 'viewer'})} />
                                                  <span className="text-sm text-slate-300">Viewer</span>
                                              </label>
                                          </div>
                                          <button 
                                              onClick={handleCreateUser}
                                              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-purple-900/20"
                                          >
                                              Create Account
                                          </button>
                                      </div>
                                  </div>
                              )}

                              <div className="flex-1 overflow-auto">
                                  <table className="w-full text-left">
                                      <thead className="text-xs text-slate-500 uppercase bg-slate-950/50 sticky top-0">
                                          <tr>
                                              <th className="px-4 py-3">User</th>
                                              <th className="px-4 py-3">Role</th>
                                              <th className="px-4 py-3">Created</th>
                                              <th className="px-4 py-3 text-right">Action</th>
                                          </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-800">
                                          {systemUsers.map(user => (
                                              <tr key={user.id} className="hover:bg-slate-800/50 group">
                                                  <td className="px-4 py-3">
                                                      <div className="flex items-center gap-3">
                                                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                                                              {user.username.substring(0,2).toUpperCase()}
                                                          </div>
                                                          <div>
                                                              <div className="text-sm font-medium text-white">{user.fullName}</div>
                                                              <div className="text-xs text-slate-500">{user.email}</div>
                                                          </div>
                                                      </div>
                                                  </td>
                                                  <td className="px-4 py-3">
                                                      <span className={`text-xs px-2 py-1 rounded border capitalize ${
                                                          user.role === 'admin' ? 'bg-rose-900/20 text-rose-400 border-rose-900/30' :
                                                          user.role === 'analyst' ? 'bg-blue-900/20 text-blue-400 border-blue-900/30' :
                                                          'bg-slate-800 text-slate-400 border-slate-700'
                                                      }`}>
                                                          {user.role}
                                                      </span>
                                                  </td>
                                                  <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                                                      {new Date(user.createdAt).toLocaleDateString()}
                                                  </td>
                                                  <td className="px-4 py-3 text-right">
                                                      <button className="text-slate-600 hover:text-white transition-colors">
                                                          <Settings className="w-4 h-4" />
                                                      </button>
                                                  </td>
                                              </tr>
                                          ))}
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'about' && (
              <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center space-y-4 py-8">
                      <div className="inline-block p-4 rounded-full bg-slate-900 border border-slate-800 shadow-2xl">
                          <ShieldCheck className="w-16 h-16 text-cyan-400" />
                      </div>
                      <h1 className="text-4xl font-bold text-white tracking-tight">NetSentry <span className="text-cyan-400">v2.1</span></h1>
                      <p className="text-slate-400 max-w-lg mx-auto">
                          Advanced Security Operations Dashboard for Network Reconnaissance, Vulnerability Assessment, and Infrastructure Auditing.
                      </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-purple-400" /> Documentation
                          </h3>
                          <div className="space-y-4">
                              <details className="group">
                                  <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-slate-300 hover:text-white">
                                      <span>Local Agent Mode (Real Scanning)</span>
                                      <span className="transition group-open:rotate-180"><ChevronDown className="w-4 h-4"/></span>
                                  </summary>
                                  <div className="text-slate-400 text-sm mt-3 group-open:animate-in group-open:slide-in-from-top-1 leading-relaxed">
                                      To perform real scans, you must run the backend agent locally.
                                      <code className="block bg-black p-2 rounded mt-2 text-xs font-mono">
                                          npm install<br/>
                                          node server.js
                                      </code>
                                      Then toggle "REAL AGENT" in the sidebar.
                                  </div>
                              </details>
                              <div className="border-t border-slate-800"></div>
                              <details className="group">
                                  <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-slate-300 hover:text-white">
                                      <span>Brute Force Simulation</span>
                                      <span className="transition group-open:rotate-180"><ChevronDown className="w-4 h-4"/></span>
                                  </summary>
                                  <div className="text-slate-400 text-sm mt-3 group-open:animate-in group-open:slide-in-from-top-1 leading-relaxed">
                                      Go to <strong>Penetration Test</strong>. Load a target. Configure username/password lists using the Dictionary Manager. Adjust delay/jitter for evasion. Toggle "IDS Detection" to stop if the server blocks connections.
                                  </div>
                              </details>
                          </div>
                      </div>

                      <div className="space-y-6">
                          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                  <Info className="w-5 h-5 text-blue-400" /> System Info
                              </h3>
                              <div className="space-y-3 text-sm">
                                  <div className="flex justify-between">
                                      <span className="text-slate-500">Build Version</span>
                                      <span className="text-slate-300 font-mono">2.1.4-stable</span>
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="text-slate-500">React Runtime</span>
                                      <span className="text-slate-300 font-mono">v18.2.0</span>
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="text-slate-500">Agent Status</span>
                                      <span className={`font-mono font-bold ${agentOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                                          {agentOnline ? 'ONLINE' : 'DISCONNECTED'}
                                      </span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'proxy' && (
              <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Proxy Manager Left */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-emerald-400" />
                                Import Proxies
                            </h2>
                            
                            {/* Import Tabs */}
                            <div className="flex bg-slate-950 p-1 rounded-lg mb-4 border border-slate-800">
                                <button 
                                  onClick={() => setProxyImportMode('paste')} 
                                  className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${proxyImportMode === 'paste' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                >Paste</button>
                                <button 
                                  onClick={() => setProxyImportMode('file')} 
                                  className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${proxyImportMode === 'file' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                >File</button>
                                <button 
                                  onClick={() => setProxyImportMode('api')} 
                                  className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${proxyImportMode === 'api' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                >API</button>
                            </div>

                            <div className="space-y-4">
                                {proxyImportMode === 'paste' && (
                                    <div className="animate-in fade-in">
                                        <label className="text-xs text-slate-400 uppercase font-semibold mb-2 block">Bulk List (IP:PORT)</label>
                                        <textarea 
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs focus:border-emerald-500 outline-none font-mono h-32 resize-none custom-scrollbar"
                                            placeholder={`192.168.1.1:8080\n10.0.0.1:3128`}
                                            value={proxyInputText}
                                            onChange={(e) => setProxyInputText(e.target.value)}
                                        />
                                        <button 
                                            onClick={handleImportProxies}
                                            className="w-full mt-3 bg-emerald-700 hover:bg-emerald-600 py-2 rounded text-white text-xs font-bold transition-colors"
                                        >
                                            Process & Import
                                        </button>
                                    </div>
                                )}

                                {proxyImportMode === 'file' && (
                                    <div className="animate-in fade-in py-8 border-2 border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:border-emerald-500/50 hover:bg-slate-900/50 transition-all cursor-pointer relative group">
                                        <FileCode className="w-8 h-8 mb-2 group-hover:text-emerald-500 transition-colors" />
                                        <span className="text-xs">Drop .txt or .csv file</span>
                                        <input 
                                            type="file" 
                                            accept=".txt,.csv"
                                            onChange={handleProxyFileUpload}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                )}

                                {proxyImportMode === 'api' && (
                                    <div className="animate-in fade-in space-y-3">
                                        <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs text-slate-400">
                                            <p className="mb-2">Simulate fetching public proxies from external directories.</p>
                                            <div className="flex items-center gap-2 text-emerald-500">
                                                <Cloud className="w-3 h-3" />
                                                <span>Remote Source Ready</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={handleFetchPublicProxies}
                                            className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 py-2 rounded border border-slate-700 flex items-center justify-center gap-2 text-xs font-bold"
                                        >
                                            <RefreshCw className="w-3 h-3" />
                                            Fetch Public List
                                        </button>
                                        {proxyInputText && (
                                             <button 
                                                onClick={handleImportProxies}
                                                className="w-full bg-emerald-700 hover:bg-emerald-600 py-2 rounded text-white text-xs font-bold transition-colors animate-in slide-in-from-top-1"
                                            >
                                                Import {proxyInputText.split('\n').filter(Boolean).length} Fetched Proxies
                                            </button>
                                        )}
                                    </div>
                                )}

                                <div className="pt-4 border-t border-slate-800">
                                    <button 
                                        onClick={handleCheckProxies} 
                                        disabled={isCheckingProxies}
                                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded border border-slate-700 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                                    >
                                        {isCheckingProxies ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                                        Test All Proxies
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Global Switch */}
                        <div className={`p-6 rounded-xl border transition-all ${useGlobalProxy ? 'bg-amber-900/10 border-amber-500/50 shadow-lg shadow-amber-900/20' : 'bg-slate-900 border-slate-700'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className={`font-bold flex items-center gap-2 ${useGlobalProxy ? 'text-amber-500' : 'text-slate-400'}`}>
                                    <Power className="w-5 h-5" />
                                    Global Proxy Mode
                                </h3>
                                <div 
                                    onClick={() => setUseGlobalProxy(!useGlobalProxy)}
                                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${useGlobalProxy ? 'bg-amber-500' : 'bg-slate-700'}`}>
                                    <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${useGlobalProxy ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">
                                When enabled, all scans and attacks will be routed through the simulated proxy chain. This increases anonymity but adds latency.
                            </p>
                        </div>
                    </div>

                    {/* Proxy List */}
                    <div className="lg:col-span-2">
                         <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-xl flex flex-col h-[600px]">
                            <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Network className="w-5 h-5 text-emerald-400" />
                                    Proxy Chain
                                </h2>
                                <span className="text-xs text-slate-500">{proxies.length} Nodes</span>
                            </div>
                            <div className="flex-1 overflow-auto">
                                <table className="w-full text-left text-sm text-slate-400">
                                    <thead className="bg-slate-950 text-slate-500 uppercase text-xs font-medium sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3">Address</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Latency</th>
                                            <th className="px-4 py-3">Anonymity</th>
                                            <th className="px-4 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {proxies.length === 0 ? (
                                            <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-600">No proxies configured. Import some to get started.</td></tr>
                                        ) : (
                                            proxies.map(proxy => (
                                                <tr key={proxy.id} className="hover:bg-slate-800/50">
                                                    <td className="px-4 py-3 font-mono text-white">
                                                        {proxy.ip}:{proxy.port}
                                                        <div className="text-[10px] text-slate-500">{proxy.protocol} • {proxy.country || 'UNK'}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {proxy.status === 'active' && <span className="flex items-center gap-1 text-emerald-400 text-xs"><CheckCircle className="w-3 h-3" /> Live</span>}
                                                        {proxy.status === 'dead' && <span className="flex items-center gap-1 text-red-400 text-xs"><XCircle className="w-3 h-3" /> Dead</span>}
                                                        {proxy.status === 'untested' && <span className="flex items-center gap-1 text-slate-500 text-xs"><Activity className="w-3 h-3" /> Untested</span>}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-xs">
                                                        {proxy.latency ? (
                                                            <span className={proxy.latency < 300 ? 'text-emerald-400' : 'text-amber-400'}>{proxy.latency}ms</span>
                                                        ) : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-xs capitalize">
                                                        {proxy.anonymity || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button onClick={() => handleDeleteProxy(proxy.id)} className="text-slate-600 hover:text-red-400 p-1">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                         </div>
                    </div>
                 </div>
              </div>
          )}

          {activeTab === 'scan' && (
             <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Server className="w-64 h-64" />
                   </div>
                   
                   <div className="relative z-10">
                      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                         <Search className="w-6 h-6 text-cyan-400" />
                         Target Discovery
                      </h2>

                      {/* Quick Load From DB */}
                      {savedTargets.length > 0 && (
                          <div className="mb-6 bg-slate-950/50 p-3 rounded-lg border border-slate-800 flex items-center gap-4">
                              <span className="text-xs font-bold text-cyan-500 uppercase">Quick Load:</span>
                              <div className="relative flex-1">
                                  <select 
                                    className="w-full bg-slate-900 text-slate-300 text-sm rounded px-3 py-2 border border-slate-700 outline-none appearance-none cursor-pointer"
                                    onChange={(e) => {
                                        const target = savedTargets.find(t => t.id === e.target.value);
                                        if (target) loadTargetToScan(target);
                                    }}
                                    defaultValue=""
                                  >
                                      <option value="" disabled>Select a saved target...</option>
                                      {savedTargets.map(t => (
                                          <option key={t.id} value={t.id}>{t.name} ({t.host})</option>
                                      ))}
                                  </select>
                                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                          </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                         <div className="space-y-4">
                            <label className="block text-sm font-medium text-slate-400">Target Hostname / IP</label>
                            <input 
                              type="text" 
                              value={singleHost.host}
                              onChange={e => setSingleHost({...singleHost, host: e.target.value})}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all"
                              placeholder="ftp.example.com"
                            />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                               <label className="block text-sm font-medium text-slate-400">Port</label>
                               <input 
                                 type="number" 
                                 value={singleHost.port}
                                 onChange={e => setSingleHost({...singleHost, port: parseInt(e.target.value)})}
                                 className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                               />
                            </div>
                            <div className="space-y-4">
                               <label className="block text-sm font-medium text-slate-400">Protocol</label>
                               <select 
                                 value={singleHost.protocol}
                                 onChange={e => setSingleHost({...singleHost, protocol: parseInt(e.target.value)})}
                                 className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all appearance-none"
                               >
                                 <option value={Protocol.FTP}>FTP (21)</option>
                                 <option value={Protocol.SFTP}>SFTP (22)</option>
                               </select>
                            </div>
                         </div>
                         <div className="space-y-4">
                            <label className="block text-sm font-medium text-slate-400">Username</label>
                            <input 
                              type="text" 
                              value={singleHost.username}
                              onChange={e => setSingleHost({...singleHost, username: e.target.value})}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                            />
                         </div>
                         <div className="space-y-4">
                            <label className="block text-sm font-medium text-slate-400">Password</label>
                            <input 
                              type="password" 
                              value={singleHost.password}
                              onChange={e => setSingleHost({...singleHost, password: e.target.value})}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                            />
                         </div>
                      </div>

                      <div className="flex items-center gap-4 border-t border-slate-800 pt-6">
                         <button 
                           onClick={handleSingleScan}
                           disabled={isScanning}
                           className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 px-8 rounded-lg shadow-lg shadow-cyan-900/20 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                            {isScanning ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                            Execute Scan
                         </button>
                         
                         <div className="h-8 w-px bg-slate-800"></div>
                         
                         <label className="flex items-center gap-2 text-slate-400 hover:text-white cursor-pointer transition-colors text-sm font-medium">
                            <Upload className="w-4 h-4" />
                            <span>Import FileZilla XML</span>
                            <input type="file" accept=".xml" onChange={handleFileUpload} className="hidden" />
                         </label>
                      </div>
                   </div>
                </div>
                
                <TerminalOutput logs={logs} />
             </div>
          )}

          {activeTab === 'brute' && (
             <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-slate-900 border border-red-900/30 rounded-xl p-8 shadow-xl relative overflow-hidden">
                   <div className="absolute inset-0 bg-red-900/5 pointer-events-none"></div>
                   <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                         <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <ShieldAlert className="w-6 h-6 text-red-500" />
                            Penetration Testing
                         </h2>
                         <div className="flex items-center gap-3">
                             <button 
                                onClick={() => setShowAdvancedBrute(!showAdvancedBrute)}
                                className={`p-2 rounded hover:bg-slate-800 transition-colors ${showAdvancedBrute ? 'text-red-400 bg-red-900/20' : 'text-slate-500'}`}
                                title="Toggle Evasion Settings"
                             >
                                 <Sliders className="w-5 h-5" />
                             </button>
                             <span className="px-3 py-1 rounded-full bg-red-900/30 text-red-400 text-xs font-mono border border-red-900/50">AUTHORIZED USE ONLY</span>
                         </div>
                      </div>
                      
                      <div className="bg-black/40 rounded-lg p-4 mb-4 border border-red-900/20">
                         <label className="block text-xs text-red-400 mb-2 uppercase tracking-wide font-bold">Target Vector</label>
                         <div className="flex flex-col sm:flex-row gap-4">
                            <input 
                               value={bruteConfig.targetHost}
                               onChange={e => setBruteConfig({...bruteConfig, targetHost: e.target.value})}
                               className="flex-1 bg-transparent border-b border-red-900/50 text-xl font-mono text-white focus:border-red-500 outline-none py-1 placeholder-slate-700" 
                               placeholder="Target IP"
                            />
                            <div className="w-full sm:w-24 bg-transparent border-b border-red-900/50 text-xl font-mono text-white flex items-center">
                               <span className="text-slate-500 mr-2 text-sm">PORT:</span>
                               <input 
                                 type="number"
                                 value={bruteConfig.targetPort}
                                 onChange={e => setBruteConfig({...bruteConfig, targetPort: parseInt(e.target.value)})}
                                 className="bg-transparent w-full outline-none"
                               />
                            </div>
                            <select 
                                 value={bruteConfig.protocol}
                                 onChange={e => setBruteConfig({...bruteConfig, protocol: parseInt(e.target.value)})}
                                 className="bg-transparent border-b border-red-900/50 text-xl font-mono text-white focus:border-red-500 outline-none py-1 appearance-none"
                               >
                                 <option value={Protocol.FTP} className="bg-slate-900">FTP</option>
                                 <option value={Protocol.SFTP} className="bg-slate-900">SFTP</option>
                            </select>
                         </div>
                      </div>

                      {/* Advanced Evasion Settings */}
                      {showAdvancedBrute && (
                          <div className="mb-6 bg-slate-950/60 border border-slate-800 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                             <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                <Settings className="w-3 h-3" /> Stealth & Evasion Configuration
                             </h3>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Delay per Attempt (ms)</label>
                                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded px-3 py-2">
                                        <Clock className="w-4 h-4 text-purple-400" />
                                        <input 
                                            type="number"
                                            value={bruteConfig.delayMs}
                                            onChange={(e) => setBruteConfig({...bruteConfig, delayMs: parseInt(e.target.value) || 0})}
                                            className="bg-transparent w-full text-sm outline-none text-slate-200"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Jitter/Randomness (ms)</label>
                                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded px-3 py-2">
                                        <Zap className="w-4 h-4 text-amber-400" />
                                        <input 
                                            type="number"
                                            value={bruteConfig.jitterMs}
                                            onChange={(e) => setBruteConfig({...bruteConfig, jitterMs: parseInt(e.target.value) || 0})}
                                            className="bg-transparent w-full text-sm outline-none text-slate-200"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${bruteConfig.stopOnBan ? 'bg-red-900' : 'bg-slate-700'}`}>
                                            <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${bruteConfig.stopOnBan ? 'translate-x-4' : 'translate-x-0'}`} />
                                            <input 
                                                type="checkbox" 
                                                checked={bruteConfig.stopOnBan}
                                                onChange={(e) => setBruteConfig({...bruteConfig, stopOnBan: e.target.checked})}
                                                className="hidden" 
                                            />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-300">IDS/Ban Detection</div>
                                            <div className="text-xs text-slate-500">Auto-stop on connection refusal</div>
                                        </div>
                                    </label>
                                </div>
                             </div>
                          </div>
                      )}

                      {/* Dictionary Management Toolbar */}
                      <div className="mb-4 bg-slate-950/50 border border-slate-800 p-3 rounded-lg flex flex-wrap gap-3 items-center">
                          <span className="text-xs font-bold text-slate-500 uppercase mr-2">Dictionary Manager:</span>
                          
                          <select 
                            onChange={(e) => handlePresetLoad(e.target.value as any)}
                            className="bg-slate-800 text-slate-300 text-xs rounded px-2 py-1.5 border border-slate-700 outline-none hover:border-slate-500"
                            defaultValue=""
                          >
                             <option value="" disabled>Load Preset...</option>
                             <option value="default">Default Credentials</option>
                             <option value="iot">IoT / Embedded</option>
                             <option value="top100">Top 100 Common</option>
                          </select>

                          <div className="h-4 w-px bg-slate-700 mx-1"></div>

                          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 cursor-pointer border border-slate-700 transition-colors">
                              <FileText className="w-3 h-3" />
                              Import User List
                              <input type="file" className="hidden" onChange={(e) => handleListUpload(e, 'usernames')} />
                          </label>

                          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 cursor-pointer border border-slate-700 transition-colors">
                              <Lock className="w-3 h-3" />
                              Import Pass List
                              <input type="file" className="hidden" onChange={(e) => handleListUpload(e, 'passwords')} />
                          </label>

                          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-900/30 hover:bg-purple-900/50 rounded text-xs text-purple-300 cursor-pointer border border-purple-800 transition-colors" title="Format: user:pass">
                              <FolderOpen className="w-3 h-3" />
                              Import Combo List
                              <input type="file" className="hidden" onChange={handleComboUpload} />
                          </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                         <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 relative group">
                            <div className="text-xs text-slate-500 mb-2 flex justify-between items-center">
                               <span className="font-bold flex items-center gap-2"><Server className="w-3 h-3" /> USER_LIST</span>
                               <div className="flex items-center gap-2">
                                  <span>{bruteConfig.usernames.length} ENTRIES</span>
                                  <button onClick={() => downloadList(bruteConfig.usernames, 'user_list.txt')} className="hover:text-cyan-400"><Save className="w-3 h-3" /></button>
                               </div>
                            </div>
                            <textarea
                               className="w-full h-48 bg-transparent text-sm font-mono text-slate-300 resize-none outline-none custom-scrollbar border-l-2 border-slate-800 pl-2 focus:border-cyan-500/50 transition-colors"
                               value={bruteConfig.usernames.join('\n')}
                               onChange={(e) => setBruteConfig({...bruteConfig, usernames: e.target.value.split('\n')})}
                               placeholder="root&#10;admin&#10;user"
                            />
                         </div>
                         <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 relative group">
                            <div className="text-xs text-slate-500 mb-2 flex justify-between items-center">
                               <span className="font-bold flex items-center gap-2"><Lock className="w-3 h-3" /> PASS_LIST</span>
                               <div className="flex items-center gap-2">
                                  <span>{bruteConfig.passwords.length} ENTRIES</span>
                                  <button onClick={() => downloadList(bruteConfig.passwords, 'pass_list.txt')} className="hover:text-cyan-400"><Save className="w-3 h-3" /></button>
                               </div>
                            </div>
                            <textarea
                               className="w-full h-48 bg-transparent text-sm font-mono text-slate-300 resize-none outline-none custom-scrollbar border-l-2 border-slate-800 pl-2 focus:border-red-500/50 transition-colors"
                               value={bruteConfig.passwords.join('\n')}
                               onChange={(e) => setBruteConfig({...bruteConfig, passwords: e.target.value.split('\n')})}
                               placeholder="password&#10;123456&#10;admin123"
                            />
                         </div>
                      </div>

                      <button 
                        onClick={isScanning ? handleStopScan : handleBruteForce}
                        className={`w-full font-bold py-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all uppercase tracking-widest ${
                          isScanning 
                            ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 cursor-pointer' 
                            : 'bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white shadow-red-900/30'
                        }`}
                      >
                         {isScanning ? (
                            <>
                               <X className="w-5 h-5" />
                               Abort Simulation
                            </>
                         ) : (
                            <>
                               <ShieldAlert className="w-5 h-5" />
                               Launch Attack Simulation
                            </>
                         )}
                      </button>
                   </div>
                </div>
                <TerminalOutput logs={logs} />
             </div>
          )}

          {activeTab === 'results' && (
             <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-300">
                <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-lg flex-1 flex flex-col overflow-hidden">
                   {/* Table Toolbar */}
                   <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/80 backdrop-blur">
                      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                         <FileCheck className="w-5 h-5 text-purple-400" />
                         Audit Log
                      </h2>
                      
                      <div className="flex items-center gap-3">
                         <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input 
                               value={filterText}
                               onChange={(e) => setFilterText(e.target.value)}
                               placeholder="Filter host/user..." 
                               className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:ring-1 focus:ring-purple-500 outline-none w-48"
                            />
                         </div>
                         <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm outline-none"
                         >
                            <option value="all">All Status</option>
                            <option value="success">Success</option>
                            <option value="failed">Failed</option>
                         </select>

                         <div className="flex items-center gap-1 border-l border-slate-700 pl-3 ml-1">
                            <span className="text-xs text-slate-500 font-mono mr-1">EXPORT:</span>
                            <button onClick={() => handleExport('csv')} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700">CSV</button>
                            <button onClick={() => handleExport('json')} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700">JSON</button>
                            <button onClick={() => handleExport('xml')} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700">XML</button>
                         </div>

                         <button 
                            onClick={handleGenerateReport}
                            className="p-2 text-purple-400 hover:bg-purple-900/20 rounded-lg border border-purple-900/30 transition-colors"
                            title="Generate AI Report"
                         >
                            <Bot className="w-4 h-4" />
                         </button>
                         <button 
                            onClick={handleClearHistory}
                            className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg border border-red-900/30 transition-colors"
                            title="Clear History"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                   </div>

                   {/* Table */}
                   <div className="flex-1 overflow-auto">
                      <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-950 text-slate-500 uppercase text-xs font-medium sticky top-0 z-10">
                           <tr>
                              <th className="px-6 py-4 font-semibold tracking-wider">Timestamp</th>
                              <th className="px-6 py-4 font-semibold tracking-wider">Host & Location</th>
                              <th className="px-6 py-4 font-semibold tracking-wider">Identity</th>
                              <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                              <th className="px-6 py-4 font-semibold tracking-wider">Details</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                           {filteredResults.length === 0 ? (
                              <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-600">No records found matching filters.</td></tr>
                           ) : (
                              filteredResults.map((r) => (
                                 <tr key={r.id} className="hover:bg-slate-800/50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-500">
                                       {new Date(r.timestamp).toLocaleTimeString()}
                                    </td>
                                    <td className="px-6 py-4">
                                       <div className="text-white font-medium flex items-center gap-2">
                                          {r.serverConfig.host}
                                          {r.usedProxy && (
                                            <span title="Routed via Proxy">
                                              <Globe className="w-3 h-3 text-amber-500" />
                                            </span>
                                          )}
                                       </div>
                                       <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                          <span className="text-[10px] bg-slate-800 px-1 rounded text-slate-400">{r.geo?.code || 'UNK'}</span>
                                          {r.serverConfig.protocol === Protocol.FTP ? 'FTP:21' : 'SFTP:22'}
                                       </div>
                                    </td>
                                    <td className="px-6 py-4">
                                       <div className="font-mono text-xs">{r.serverConfig.username}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                          r.status === 'success' 
                                             ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/30' 
                                             : 'bg-rose-900/20 text-rose-400 border-rose-900/30'
                                       }`}>
                                          {r.status === 'success' ? 'CONNECTED' : 'FAILED'}
                                       </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono">
                                       <div className="flex items-center justify-between">
                                          <span className={r.status === 'success' ? 'text-slate-400' : 'text-rose-400'}>
                                             {r.connectionTimeMs}ms - {r.message}
                                          </span>
                                          {r.status === 'failed' && (
                                              <button onClick={() => {
                                                  setIsAiChatOpen(true);
                                                  setChatInput(`Explain this error: ${r.message}`);
                                              }} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 rounded transition-opacity">
                                                 <Bot className="w-3 h-3 text-cyan-400" />
                                              </button>
                                          )}
                                       </div>
                                    </td>
                                 </tr>
                              ))
                           )}
                        </tbody>
                      </table>
                   </div>
                </div>

                {/* AI Report Modal/Section */}
                {aiReport && (
                   <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
                      <div className="flex justify-between items-start mb-4">
                         <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                            Executive Security Summary
                         </h3>
                         <button onClick={() => setAiReport("")} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                      </div>
                      <div className="prose prose-invert prose-sm max-w-none font-mono text-xs bg-black/30 p-4 rounded-lg border border-slate-800 overflow-x-auto">
                         <pre className="whitespace-pre-wrap font-sans">{aiReport}</pre>
                      </div>
                   </div>
                )}
             </div>
          )}
        </div>

        {/* AI Assistant Chat Sidebar (Overlay) */}
        <div 
           className={`absolute top-0 right-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl border-l border-slate-700 transform transition-transform duration-300 z-50 flex flex-col shadow-2xl ${
              isAiChatOpen ? 'translate-x-0' : 'translate-x-full'
           }`}
        >
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
               <h3 className="font-semibold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-400" />
                  Security Assistant
               </h3>
               <button onClick={() => setIsAiChatOpen(false)} className="text-slate-500 hover:text-white">
                  <X className="w-4 h-4" />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                        msg.role === 'user' 
                           ? 'bg-blue-600 text-white' 
                           : 'bg-slate-800 text-slate-300 border border-slate-700'
                     }`}>
                        {msg.text}
                     </div>
                  </div>
               ))}
               {isAiThinking && (
                  <div className="flex justify-start">
                     <div className="bg-slate-800 rounded-lg p-3 text-sm flex gap-1">
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                     </div>
                  </div>
               )}
               <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900">
               <div className="relative">
                  <input 
                     value={chatInput}
                     onChange={(e) => setChatInput(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleAiChat()}
                     placeholder="Ask about scans..."
                     className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-4 pr-10 py-3 text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                  />
                  <button 
                     onClick={handleAiChat}
                     disabled={isAiThinking || !chatInput}
                     className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-purple-500 hover:bg-purple-900/20 rounded-md transition-colors disabled:opacity-50"
                  >
                     <Send className="w-4 h-4" />
                  </button>
               </div>
            </div>
        </div>

      </main>
    </div>
  );
}

const NavButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
      active 
        ? 'bg-slate-800 text-cyan-400 shadow-lg shadow-cyan-900/10 border border-slate-700/50' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
    }`}
  >
    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${active ? 'text-cyan-400' : 'text-slate-500'}`} />
    {label}
  </button>
);
