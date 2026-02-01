import React, { useState, useEffect, useRef, useCallback } from 'react';
import { loggingService, LogEntry, SSEConnectionState } from '../../utils/loggingService';
import { env } from '../../utils/env';
import type { LogLevel, LogSource } from '../../types';

// Import Firebase Auth to check initialization status
import { authClient, app as firebaseApp } from '../../services/firebaseConfig';

type FilterLevel = LogLevel | 'ALL';
type FilterSource = LogSource | 'all';

export const LogViewer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [firebaseStatus, setFirebaseStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');

  // New filter states
  const [filterLevel, setFilterLevel] = useState<FilterLevel>('ALL');
  const [filterSource, setFilterSource] = useState<FilterSource>('all');

  // SSE connection state
  const [sseState, setSSEState] = useState<SSEConnectionState>('disconnected');

  const checkHealth = useCallback(async (retries = 0) => {
    if (backendStatus !== 'online') {
      setBackendStatus('checking');
    }

    try {
      // Check Backend using the cheap /healthz endpoint
      const baseUrl = env.BACKEND_URL.replace(/\/$/, '');
      const res = await fetch(`${baseUrl}/healthz`);

      if (res.ok) {
        setBackendStatus('online');
        // Check Firebase (client-side)
        if (authClient || firebaseApp) {
          setFirebaseStatus('connected');
        } else {
          setFirebaseStatus('unknown');
        }
      } else {
        throw new Error(`Status ${res.status}`);
      }
    } catch (error) {
      setBackendStatus('offline');
      setFirebaseStatus('error');
      loggingService.error('Backend Health Check Failed', { error: String(error) });

      // Exponential backoff logic
      if (retries < 3) {
        const delay = Math.pow(2, retries) * 1000 + (Math.random() * 500); // jitter
        loggingService.debug(`Retrying backend check in ${Math.round(delay)}ms...`);
        setTimeout(() => checkHealth(retries + 1), delay);
      }
    }
  }, [backendStatus]);

  // Health check effects
  useEffect(() => {
    checkHealth();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loggingService.debug('Tab visible, checking health...');
        checkHealth();
      }
    };

    const handleOnline = () => {
      loggingService.debug('Network online, checking health...');
      checkHealth();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [checkHealth]);

  // Log subscription
  useEffect(() => {
    setLogs(loggingService.getLogs());

    const unsubscribe = loggingService.subscribe((entry) => {
      if (entry) {
        setLogs((prev) => [...prev, entry]);
      } else {
        // Full refresh (e.g., after merge or clear)
        setLogs(loggingService.getLogs());
      }
    });

    return () => { unsubscribe(); };
  }, []);

  // SSE state subscription
  useEffect(() => {
    const unsubscribe = loggingService.subscribeSSEState(setSSEState);
    return () => { unsubscribe(); };
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (isOpen && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  // Connect to SSE when backend is online
  useEffect(() => {
    if (backendStatus === 'online' && sseState === 'disconnected') {
      // Only connect if we might be authenticated (dev mode allows unauthenticated)
      loggingService.connectToBackendStream();
    }
  }, [backendStatus, sseState]);

  // Only show in DEV or TEST modes
  const isDevOrTest = env.IS_DEV || env.MODE === 'test' || env.MODE === 'development';
  if (!isDevOrTest) return null;

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    if (filterLevel !== 'ALL' && log.level !== filterLevel) return false;
    if (filterSource !== 'all' && log.source !== filterSource) return false;
    return true;
  });

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusText = () => {
    if (backendStatus === 'online') return 'Systems Online';
    if (backendStatus === 'offline') return 'System Failure';
    return 'Checking Systems...';
  };

  const getSSEIndicator = () => {
    switch (sseState) {
      case 'connected': return { color: 'bg-green-500', text: '🟢', title: 'SSE Connected' };
      case 'connecting': return { color: 'bg-yellow-500 animate-pulse', text: '🟡', title: 'SSE Connecting...' };
      case 'reconnecting': return { color: 'bg-yellow-500 animate-pulse', text: '🟡', title: 'SSE Reconnecting...' };
      default: return { color: 'bg-red-500', text: '🔴', title: 'SSE Disconnected' };
    }
  };

  const sseIndicator = getSSEIndicator();

  return (
    <div className="fixed bottom-4 left-4 z-[9999] font-mono text-xs">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-black/90 text-white px-3 py-2 rounded-full shadow-lg hover:bg-black transition-colors flex items-center gap-3 border border-white/10"
          title={`Backend: ${backendStatus} | SSE: ${sseState}`}
        >
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor()} ${backendStatus === 'checking' ? 'animate-pulse' : ''} shadow-[0_0_8px_rgba(0,0,0,0.5)]`}></span>
            <span className="font-bold tracking-tight">{env.MODE.toUpperCase()}</span>
          </div>
          {backendStatus === 'offline' && <span className="text-[10px] text-red-500 font-bold bg-red-900/20 px-1 rounded animate-pulse">FAILURE</span>}
        </button>
      )}

      {isOpen && (
        <div className="bg-[#1e1e1e] text-gray-300 w-[90vw] md:w-[700px] h-[28rem] rounded-lg shadow-2xl flex flex-col border border-gray-700 animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between p-2 bg-[#2d2d2d] border-b border-gray-700 rounded-t-lg shrink-0">
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="text-white font-bold whitespace-nowrap flex items-center gap-2">
                Console
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${backendStatus === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {getStatusText()}
                </span>
                <span className="text-[10px]" title={sseIndicator.title}>{sseIndicator.text}</span>
              </span>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => loggingService.resetReconnect()}
                className="px-2 py-1 hover:bg-white/10 rounded text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                title="Reconnect SSE stream"
              >
                ⟳ SSE
              </button>
              <button
                onClick={() => checkHealth()}
                className="px-2 py-1 hover:bg-white/10 rounded text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                title="Re-check backend connection"
              >
                ↻ Check
              </button>
              <button
                onClick={() => loggingService.clearLogs()}
                className="px-2 py-1 hover:bg-white/10 rounded text-xs text-gray-400 hover:text-white transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-2 py-1 hover:bg-white/10 rounded text-xs text-gray-400 hover:text-white transition-colors"
              >
                Hide
              </button>
            </div>
          </div>

          {/* Status Panel */}
          <div className="bg-[#181818] p-2 border-b border-white/5 flex gap-4 text-[10px]">
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${backendStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="opacity-70">Backend:</span>
              <span className="font-bold">{env.BACKEND_URL}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${firebaseStatus === 'connected' ? 'bg-green-500' : firebaseStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'}`}></span>
              <span className="opacity-70">Firebase:</span>
              <span className="font-bold">{firebaseStatus === 'connected' ? 'Ready' : 'Unknown'}</span>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-[#252525] px-2 py-1.5 border-b border-white/5 flex gap-3 items-center text-[10px]">
            <span className="opacity-50">Filters:</span>

            {/* Level Filter */}
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as FilterLevel)}
              className="bg-[#1e1e1e] text-gray-300 border border-gray-600 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Levels</option>
              <option value="ERROR">ERROR</option>
              <option value="WARN">WARN</option>
              <option value="INFO">INFO</option>
              <option value="LOG">LOG</option>
              <option value="DEBUG">DEBUG</option>
              <option value="TRACE">TRACE</option>
            </select>

            {/* Source Filter */}
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value as FilterSource)}
              className="bg-[#1e1e1e] text-gray-300 border border-gray-600 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Sources</option>
              <option value="frontend">🖥️ Frontend</option>
              <option value="backend">☁️ Backend</option>
            </select>

            <span className="opacity-50 ml-auto">
              {filteredLogs.length} / {logs.length} logs
            </span>
          </div>

          {/* Logs List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar bg-[#1e1e1e]">
            {filteredLogs.length === 0 && (
              <div className="text-gray-600 italic p-2 text-center mt-10">
                {logs.length === 0 ? 'No logs captured yet...' : 'No logs match current filters'}
              </div>
            )}
            {filteredLogs.map((log, i) => (
              <div
                key={`${log.timestamp}-${i}`}
                className={`flex gap-2 break-words font-mono text-[11px] hover:bg-white/5 p-1 rounded ${getColorForLevel(log.level)}`}
                title={log.requestId ? `Request ID: ${log.requestId}` : undefined}
              >
                {/* Source Badge */}
                <span className="shrink-0 w-4 text-center" title={log.source === 'backend' ? 'Backend' : 'Frontend'}>
                  {log.source === 'backend' ? '☁️' : '🖥️'}
                </span>

                {/* Timestamp */}
                <span className="opacity-50 shrink-0 text-[10px] w-14">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>

                {/* Level */}
                <span className="font-bold shrink-0 w-10">{log.level}</span>

                {/* File:Line */}
                {log.file && (
                  <span className="opacity-40 shrink-0 text-[10px] w-28 truncate" title={`${log.file}:${log.line}`}>
                    {log.file}:{log.line}
                  </span>
                )}

                {/* Message & Data */}
                <div className="min-w-0 flex-1">
                  <span className="whitespace-pre-wrap">{log.message}</span>
                  {log.data && (
                    <div className="mt-1 opacity-80 bg-black/30 p-1 rounded border-l-2 border-white/10 overflow-x-auto">
                      <pre className="text-[10px]">{JSON.stringify(log.data, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}
    </div>
  );
};

const getColorForLevel = (level: string) => {
  switch (level) {
    case 'ERROR': return 'text-red-300 bg-red-900/20';
    case 'WARN': return 'text-amber-300';
    case 'INFO': return 'text-blue-300';
    case 'DEBUG': return 'text-gray-400';
    case 'TRACE': return 'text-gray-500';
    default: return 'text-gray-300';
  }
}
