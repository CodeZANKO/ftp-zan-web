import { ScanResult, ServerConfig, Protocol } from "../types";

const AGENT_URL = "http://localhost:3001/api";

export const checkAgentHealth = async (): Promise<boolean> => {
    try {
        const res = await fetch(`${AGENT_URL}/health`, { method: 'GET' });
        return res.ok;
    } catch (e) {
        return false;
    }
};

export const performRealScan = async (config: ServerConfig): Promise<ScanResult> => {
    try {
        const response = await fetch(`${AGENT_URL}/scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                host: config.host,
                port: config.port,
                protocol: config.protocol, // 0 = FTP, 1 = SFTP
                username: config.username,
                password: config.password,
                checkPath: config.checkPath
            })
        });

        if (!response.ok) {
            throw new Error(`Agent Error: ${response.statusText}`);
        }

        const data = await response.json();

        // Map backend response to frontend ScanResult
        return {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            serverConfig: config,
            status: data.status,
            connectionTimeMs: data.connectionTimeMs,
            authTimeMs: 0, // Backend simplifies this for now
            message: data.message,
            pathExists: data.pathExists,
            features: data.features,
            banner: data.banner || undefined,
            geo: { country: 'Local Network / Unknown', code: 'LOC', lat: 0, lng: 0 }, // Real geo requires external API
            errors: data.status === 'failed' ? [data.message] : [],
            usedProxy: false // Agent currently direct
        };

    } catch (error: any) {
        return {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            serverConfig: config,
            status: 'failed',
            connectionTimeMs: 0,
            authTimeMs: 0,
            message: error.message || "Failed to contact Local Agent",
            errors: [error.message || "Agent Unreachable"]
        };
    }
};