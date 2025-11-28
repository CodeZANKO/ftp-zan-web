import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface TerminalOutputProps {
  logs: LogEntry[];
}

const TerminalOutput: React.FC<TerminalOutputProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-black rounded-lg border border-slate-700 p-4 h-64 overflow-y-auto font-mono text-xs md:text-sm shadow-inner relative">
       <div className="absolute top-2 right-4 text-slate-600 text-xs select-none">TERMINAL_OUT</div>
      {logs.length === 0 ? (
        <div className="text-slate-600 italic">No logs available... Ready to scan.</div>
      ) : (
        logs.map((log) => (
          <div key={log.id} className="mb-1 break-all">
            <span className="text-slate-500 mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
            {log.type === 'info' && <span className="text-blue-400">INFO: </span>}
            {log.type === 'success' && <span className="text-green-400">OK: </span>}
            {log.type === 'error' && <span className="text-red-400">ERR: </span>}
            {log.type === 'warning' && <span className="text-yellow-400">WARN: </span>}
            <span className="text-slate-300">{log.message}</span>
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default TerminalOutput;
