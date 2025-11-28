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
  errors?: string[];
}

export interface BruteForceConfig {
  targetHost: string;
  targetPort: number;
  protocol: Protocol;
  usernames: string[];
  passwords: string[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
}
