
export enum Protocol {
  FTP = 0,
  SFTP = 1,
}

export interface ServerConfig {
  id: string;
  host: string;
  port: number;
  protocol: Protocol;
  username: string;
  password?: string;
  checkPath?: string;
}

export interface Target {
  id: string;
  name: string; // Friendly name (e.g. "Prod Server")
  host: string;
  port: number;
  protocol: Protocol;
  tags: string[]; // e.g., ["Critical", "External"]
  notes?: string;
  username?: string; // Default username for this target
  group?: string; // Folder/Group name
  createdAt: string;
}

export interface ProxyConfig {
  id: string;
  ip: string;
  port: number;
  protocol: 'HTTP' | 'SOCKS4' | 'SOCKS5';
  username?: string;
  password?: string;
  status: 'active' | 'dead' | 'untested';
  anonymity?: 'elite' | 'anonymous' | 'transparent';
  latency?: number;
  country?: string;
  lastChecked?: string;
}

export interface GeoLocation {
  country: string;
  code: string;
  lat: number;
  lng: number;
}

export interface ScanResult {
  id: string;
  timestamp: string;
  serverConfig: ServerConfig;
  status: 'success' | 'failed' | 'timeout';
  connectionTimeMs: number;
  authTimeMs: number;
  pathExists?: boolean;
  message: string;
  features?: string[];
  banner?: string; // Server OS/Version info
  geo?: GeoLocation; // Simulated location
  errors?: string[];
  usedProxy?: boolean;
}

export interface BruteForceConfig {
  targetHost: string;
  targetPort: number;
  protocol: Protocol;
  usernames: string[];
  passwords: string[];
  delayMs: number; // Delay between requests
  jitterMs: number; // Random variance in delay
  stopOnBan: boolean; // Stop if connection refused/timeout detected
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
}

export interface AiChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface SystemUser {
  id: string;
  username: string;
  password?: string; // Simulating auth storage
  role: 'admin' | 'analyst' | 'viewer';
  fullName: string;
  email: string;
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
}
