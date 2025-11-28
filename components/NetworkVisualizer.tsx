import React from 'react';
import { ScanResult } from '../types';
import { Server, Lock, Globe } from 'lucide-react';

interface NetworkVisualizerProps {
  results: ScanResult[];
}

const NetworkVisualizer: React.FC<NetworkVisualizerProps> = ({ results }) => {
  if (results.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl bg-slate-900/50 text-slate-500">
        <Globe className="w-12 h-12 mb-3 opacity-20" />
        <p>No active network nodes detected.</p>
        <p className="text-xs">Run a scan to visualize infrastructure.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-inner">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-500" />
          Infrastructure Map
        </h3>
        <span className="text-xs text-slate-500">{results.length} Nodes</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-64 overflow-y-auto p-1">
        {results.map((result) => (
          <div 
            key={result.id}
            className={`
              relative group flex flex-col items-center justify-center p-3 rounded-lg border 
              transition-all duration-300 cursor-pointer hover:scale-105
              ${result.status === 'success' 
                ? 'bg-emerald-900/20 border-emerald-800 hover:border-emerald-500' 
                : 'bg-red-900/20 border-red-800 hover:border-red-500'
              }
            `}
          >
            <div className={`
              p-2 rounded-full mb-2
              ${result.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}
            `}>
              {result.status === 'success' ? <Server className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            
            <div className="text-[10px] font-mono text-slate-400 truncate w-full text-center">
              {result.serverConfig.host}
            </div>
            
            <div className="text-[9px] text-slate-600 uppercase">
              {result.geo?.code || 'UNK'}
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-950 border border-slate-700 p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity">
              <div className="text-xs font-bold text-white mb-1">{result.serverConfig.host}</div>
              <div className="text-[10px] text-slate-400">
                <div>IP: {result.serverConfig.host}</div>
                <div>Loc: {result.geo?.country}</div>
                <div>Latency: {result.connectionTimeMs}ms</div>
                <div>Banner: {result.banner || 'N/A'}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NetworkVisualizer;