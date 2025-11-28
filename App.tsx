import React, { useState, useCallback } from 'react';
import { 
  Activity, ShieldAlert, Terminal, Play, 
  Upload, Search, Server, FileCheck, ShieldCheck,
  Bot, AlertTriangle, Download, RefreshCw
} from 'lucide-react';
import { Protocol, ServerConfig, ScanResult, LogEntry, BruteForceConfig } from './types';
import { simulateCheck, parseFileZillaXml } from './services/mockFtpService';
import { analyzeSecurityReport, explainError } from './services/geminiService';
import StatsCard from './components/StatsCard';
import TerminalOutput from './components/TerminalOutput';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'scan' | 'brute' | 'results' | 'analysis'>('scan');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Single Scan State
  const [singleHost, setSingleHost] = useState<ServerConfig>({
    id: 'manual',
    host: 'ftp.example.com',
    port: 21,
    protocol: Protocol.FTP,
    username: 'anonymous',
    password: '',
    checkPath: '/'
  });

  // Brute Force State
  const [bruteConfig, setBruteConfig] = useState<BruteForceConfig>({
    targetHost: '192.168.1.100',
    targetPort: 22,
    protocol: Protocol.SFTP,
    usernames: ['root', 'admin', 'user', 'backup'],
    passwords: ['123456', 'password', 'root', 'admin123', 'qwerty']
  });

  const addLog = (type: LogEntry['type'], message: string) => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36),
      timestamp: new Date().toISOString(),
      type,
      message
    }]);
  };

  const handleSingleScan = async () => {
    setIsScanning(true);
    addLog('info', `Starting scan for ${singleHost.host}:${singleHost.port}...`);
    try {
      const result = await simulateCheck(singleHost);
      setResults(prev => [result, ...prev]);
      addLog(result.status === 'success' ? 'success' : 'error', result.message);
    } catch (e) {
      addLog('error', 'Unexpected error during scan');
    }
    setIsScanning(false);
  };

  const handleBruteForce = async () => {
    setIsScanning(true);
    setActiveTab('results'); // Switch to results to watch it happen
    addLog('warning', `Starting BRUTE FORCE attack on ${bruteConfig.targetHost}...`);
    addLog('info', `Loaded ${bruteConfig.usernames.length} users and ${bruteConfig.passwords.length} passwords.`);

    const totalAttempts = bruteConfig.usernames.length * bruteConfig.passwords.length;
    let attempts = 0;

    for (const user of bruteConfig.usernames) {
      for (const pass of bruteConfig.passwords) {
        if (!isScanning && attempts > 0) break; // Allow stop? (Simple implementation doesn't support abort controller here for brevity)
        
        const config: ServerConfig = {
          id: `bf-${attempts}`,
          host: bruteConfig.targetHost,
          port: bruteConfig.targetPort,
          protocol: bruteConfig.protocol,
          username: user,
          password: pass
        };

        const result = await simulateCheck(config);
        setResults(prev => [result, ...prev]);
        
        if (result.status === 'success') {
          addLog('success', `CRACKED: ${user}:${pass} @ ${config.host}`);
        } else {
           // Reduce log noise
           if (attempts % 5 === 0) addLog('info', `Testing ${user}:****** ... Failed`);
        }
        attempts++;
      }
    }
    addLog('info', `Brute force completed. ${attempts} combinations tested.`);
    setIsScanning(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      addLog('info', `Parsing ${file.name}...`);
      try {
        const configs = parseFileZillaXml(text);
        addLog('success', `Found ${configs.length} servers in XML.`);
        
        // Auto-scan imported
        setIsScanning(true);
        for (const config of configs) {
            const result = await simulateCheck(config);
            setResults(prev => [result, ...prev]);
            addLog(result.status === 'success' ? 'success' : 'error', `[${config.host}] ${result.message}`);
        }
        setIsScanning(false);
      } catch (err) {
        addLog('error', 'Failed to parse XML file.');
      }
    };
    reader.readAsText(file);
  };

  const handleAnalyzeResults = async () => {
    setIsAnalyzing(true);
    setActiveTab('analysis');
    addLog('info', 'Sending logs to Gemini AI for security analysis...');
    const report = await analyzeSecurityReport(results);
    setAiAnalysis(report);
    addLog('success', 'AI Analysis complete.');
    setIsAnalyzing(false);
  };

  const handleExplainError = async (errorMsg: string) => {
     addLog('info', 'Asking AI about error...');
     const explanation = await explainError(errorMsg);
     alert(explanation); // Simple alert for specific error explanation
  };

  // Stats for charts
  const stats = {
    total: results.length,
    success: results.filter(r => r.status === 'success').length,
    failed: results.filter(r => r.status === 'failed').length,
  };
  
  const chartData = [
    { name: 'Success', value: stats.success, color: '#4ade80' },
    { name: 'Failed', value: stats.failed, color: '#f87171' }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-cyan-400 tracking-tighter flex items-center gap-2">
            <ShieldCheck className="w-6 h-6" />
            SEC_MANAGER
          </h1>
          <p className="text-xs text-slate-500 mt-1">FTP/SFTP Audit Tool</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('scan')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'scan' ? 'bg-cyan-900/20 text-cyan-400' : 'hover:bg-slate-900 text-slate-400'}`}
          >
            <Activity className="w-4 h-4" /> Scanner
          </button>
          <button 
            onClick={() => setActiveTab('brute')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'brute' ? 'bg-red-900/20 text-red-400' : 'hover:bg-slate-900 text-slate-400'}`}
          >
            <ShieldAlert className="w-4 h-4" /> Brute Force
          </button>
          <button 
            onClick={() => setActiveTab('results')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'results' ? 'bg-blue-900/20 text-blue-400' : 'hover:bg-slate-900 text-slate-400'}`}
          >
            <Terminal className="w-4 h-4" /> Results & Logs
          </button>
           <button 
            onClick={() => setActiveTab('analysis')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'analysis' ? 'bg-purple-900/20 text-purple-400' : 'hover:bg-slate-900 text-slate-400'}`}
          >
            <Bot className="w-4 h-4" /> AI Analysis
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-900 rounded-lg p-3 text-xs text-slate-500 border border-slate-800">
             <div className="flex items-center gap-2 mb-2">
               <AlertTriangle className="w-4 h-4 text-yellow-500" />
               <span className="font-semibold text-yellow-500">Simulation Mode</span>
             </div>
             Browser environment cannot execute raw TCP sockets. Operations are simulated for UI demo.
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Total Scans" value={stats.total} icon={Server} color="text-slate-400" />
          <StatsCard title="Successful" value={stats.success} icon={ShieldCheck} color="text-green-400" />
          <StatsCard title="Failed" value={stats.failed} icon={ShieldAlert} color="text-red-400" />
          <StatsCard title="Success Rate" value={`${stats.total ? Math.round((stats.success / stats.total) * 100) : 0}%`} icon={Activity} color="text-cyan-400" />
        </div>

        {/* Dynamic Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-2 space-y-6">
            
            {activeTab === 'scan' && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-white">Target Configuration</h2>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-md cursor-pointer text-xs font-medium transition-colors">
                      <Upload className="w-3 h-3" /> Import XML
                      <input type="file" accept=".xml" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Host / IP</label>
                    <input 
                      type="text" 
                      value={singleHost.host}
                      onChange={e => setSingleHost({...singleHost, host: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Port</label>
                    <input 
                      type="number" 
                      value={singleHost.port}
                      onChange={e => setSingleHost({...singleHost, port: parseInt(e.target.value)})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Protocol</label>
                    <select 
                      value={singleHost.protocol}
                      onChange={e => setSingleHost({...singleHost, protocol: parseInt(e.target.value)})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    >
                      <option value={Protocol.FTP}>FTP</option>
                      <option value={Protocol.SFTP}>SFTP (SSH)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                   <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Username</label>
                    <input 
                      type="text" 
                      value={singleHost.username}
                      onChange={e => setSingleHost({...singleHost, username: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
                    <input 
                      type="password" 
                      value={singleHost.password}
                      onChange={e => setSingleHost({...singleHost, password: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none" 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleSingleScan}
                    disabled={isScanning}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all"
                  >
                     {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                     {isScanning ? 'Scanning...' : 'Test Connection'}
                  </button>
                  <div className="text-xs text-slate-500 w-1/2">
                    Check specific path availability, connection latency, and protocol feature negotiation.
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'brute' && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg border-l-4 border-l-red-500">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    Brute Force Simulator
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Test credential strength by simulating a dictionary attack against a target.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                   <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Target Host</label>
                    <input 
                      type="text" 
                      value={bruteConfig.targetHost}
                      onChange={e => setBruteConfig({...bruteConfig, targetHost: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none" 
                    />
                   </div>
                   
                   <div className="col-span-2">
                     <label className="block text-xs font-medium text-slate-400 mb-1">Wordlists (Simulation)</label>
                     <div className="grid grid-cols-2 gap-4">
                       <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                         <div className="text-xs text-slate-500 mb-2">Usernames ({bruteConfig.usernames.length})</div>
                         <div className="h-20 overflow-y-auto text-xs font-mono text-slate-300">
                            {bruteConfig.usernames.map(u => <div key={u}>{u}</div>)}
                         </div>
                       </div>
                       <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                         <div className="text-xs text-slate-500 mb-2">Passwords ({bruteConfig.passwords.length})</div>
                         <div className="h-20 overflow-y-auto text-xs font-mono text-slate-300">
                            {bruteConfig.passwords.map(p => <div key={p}>{p}</div>)}
                         </div>
                       </div>
                     </div>
                   </div>
                </div>

                <button 
                  onClick={handleBruteForce}
                  disabled={isScanning}
                  className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/20"
                >
                    {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                    {isScanning ? 'Attacking...' : 'Launch Simulation'}
                </button>
              </div>
            )}

            {activeTab === 'results' && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">Scan Results</h2>
                  <div className="flex gap-2">
                     <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400" title="Download CSV">
                        <Download className="w-4 h-4" />
                     </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-900 text-slate-200 uppercase text-xs font-medium">
                      <tr>
                        <th className="px-4 py-3">Time</th>
                        <th className="px-4 py-3">Host</th>
                        <th className="px-4 py-3">User</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Latency</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {results.length === 0 ? (
                        <tr><td colSpan={6} className="px-4 py-8 text-center italic">No results yet</td></tr>
                      ) : (
                        results.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-700/30 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">
                              {new Date(r.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="px-4 py-3 text-white">{r.serverConfig.host}</td>
                            <td className="px-4 py-3">{r.serverConfig.username}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                r.status === 'success' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                              }`}>
                                {r.status === 'success' ? 'SUCCESS' : 'FAILED'}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs">{r.connectionTimeMs}ms</td>
                            <td className="px-4 py-3">
                                {r.status === 'failed' && (
                                    <button 
                                        onClick={() => handleExplainError(r.message)}
                                        className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                                    >
                                        <Bot className="w-3 h-3" /> Fix?
                                    </button>
                                )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === 'analysis' && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg h-full">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Bot className="w-5 h-5 text-purple-400" />
                        AI Security Report
                    </h2>
                    <button 
                        onClick={handleAnalyzeResults} 
                        disabled={results.length === 0 || isAnalyzing}
                        className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs px-3 py-2 rounded-lg"
                    >
                        {isAnalyzing ? 'Generating...' : 'Generate New Report'}
                    </button>
                 </div>
                 
                 <div className="bg-slate-900 rounded-lg p-4 border border-slate-800 min-h-[300px]">
                    {isAnalyzing ? (
                        <div className="flex items-center justify-center h-full text-slate-500 gap-2">
                            <RefreshCw className="w-5 h-5 animate-spin" /> Analyzing logs with Gemini 2.5 Flash...
                        </div>
                    ) : aiAnalysis ? (
                        <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                            {aiAnalysis}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                            <FileCheck className="w-8 h-8 opacity-20" />
                            <p>No report generated. Run scans then click Generate.</p>
                        </div>
                    )}
                 </div>
              </div>
            )}

          </div>

          {/* Right Column: Output & Visualization */}
          <div className="space-y-6">
            
            {/* Live Terminal */}
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                <Terminal className="w-4 h-4" /> System Logs
              </h3>
              <TerminalOutput logs={logs} />
            </div>

            {/* Charts */}
            {results.length > 0 && (
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <h3 className="text-sm font-medium text-slate-400 mb-4">Scan Distribution</h3>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis hide />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                </div>
                </div>
            )}
            
            {/* Quick Actions / Tips */}
             <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tips</h3>
                <ul className="text-xs text-slate-400 space-y-2">
                    <li className="flex gap-2">
                        <span className="text-cyan-500">•</span>
                        Use XML import to bulk test FileZilla exports.
                    </li>
                    <li className="flex gap-2">
                        <span className="text-cyan-500">•</span>
                        Click "Fix?" in Results to ask Gemini AI about error codes.
                    </li>
                     <li className="flex gap-2">
                        <span className="text-cyan-500">•</span>
                        Brute force sim checks against common default credentials.
                    </li>
                </ul>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
