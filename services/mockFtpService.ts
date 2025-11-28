
import { Protocol, ScanResult, ServerConfig, GeoLocation, ProxyConfig } from "../types";

// Since browsers cannot make direct TCP/FTP connections, this service simulates
// the backend logic described in the Python script for demonstration purposes.

const SIMULATION_DELAY_MS = 600;

const MOCK_COUNTRIES: GeoLocation[] = [
  { country: 'United States', code: 'US', lat: 37.0902, lng: -95.7129 },
  { country: 'Germany', code: 'DE', lat: 51.1657, lng: 10.4515 },
  { country: 'Singapore', code: 'SG', lat: 1.3521, lng: 103.8198 },
  { country: 'Brazil', code: 'BR', lat: -14.2350, lng: -51.9253 },
  { country: 'Russia', code: 'RU', lat: 61.5240, lng: 105.3188 },
  { country: 'China', code: 'CN', lat: 35.8617, lng: 104.1954 },
  { country: 'Netherlands', code: 'NL', lat: 52.1326, lng: 5.2913 },
  { country: 'France', code: 'FR', lat: 46.2276, lng: 2.2137 },
];

const BANNERS = [
  "220 (vsFTPd 3.0.3)",
  "220 ProFTPD 1.3.5 Server (Debian)",
  "220 Microsoft FTP Service",
  "SSH-2.0-OpenSSH_8.2p1 Ubuntu-4ubuntu0.5",
  "SSH-2.0-Dropbear_2020.81",
  "220 FileZilla Server 1.4.1"
];

export const simulateCheck = async (config: ServerConfig, proxyDelay: number = 0): Promise<ScanResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate success logic
      const isSuccess = Math.random() > 0.3 || (config.password === 'password' || config.username === 'admin');
      
      // Simulate network conditions + Proxy Delay
      const baseLatency = Math.floor(Math.random() * 200) + 20;
      const connectionTime = baseLatency + proxyDelay;
      
      // Assign random location
      const randomGeo = MOCK_COUNTRIES[Math.floor(Math.random() * MOCK_COUNTRIES.length)];
      
      // Assign random banner
      const randomBanner = BANNERS[Math.floor(Math.random() * BANNERS.length)];

      let result: ScanResult = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        serverConfig: config,
        status: isSuccess ? 'success' : 'failed',
        connectionTimeMs: connectionTime,
        authTimeMs: isSuccess ? Math.floor(Math.random() * 100) + 10 : 0,
        message: '',
        errors: [],
        geo: randomGeo,
        banner: isSuccess ? randomBanner : undefined,
        usedProxy: proxyDelay > 0
      };

      if (isSuccess) {
        result.message = "Connected and Authenticated";
        result.pathExists = config.checkPath ? Math.random() > 0.5 : undefined;
        result.features = config.protocol === Protocol.FTP ? ['UTF8', 'SIZE', 'MDTM', 'REST STREAM'] : [];
      } else {
        const errors = [
          "Connection timed out",
          "Authentication failed: 530 Login incorrect",
          "Connection refused",
          "Host unreachable",
          "Error: 530 User cannot log in",
          "SSH: Handshake failed"
        ];
        const errorMsg = errors[Math.floor(Math.random() * errors.length)];
        result.message = errorMsg;
        result.errors = [errorMsg];
      }

      resolve(result);
    }, SIMULATION_DELAY_MS + proxyDelay);
  });
};

export const checkProxy = async (proxy: ProxyConfig): Promise<ProxyConfig> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const isAlive = Math.random() > 0.4;
            const lat = Math.floor(Math.random() * 800) + 50;
            
            const countries = ['US', 'DE', 'RU', 'CN', 'BR', 'FR', 'NL'];
            const types = ['elite', 'anonymous', 'transparent'] as const;

            resolve({
                ...proxy,
                status: isAlive ? 'active' : 'dead',
                latency: isAlive ? lat : undefined,
                country: isAlive ? countries[Math.floor(Math.random() * countries.length)] : undefined,
                anonymity: isAlive ? types[Math.floor(Math.random() * types.length)] : undefined,
                lastChecked: new Date().toISOString()
            });

        }, Math.random() * 1000 + 500);
    });
};

export const parseFileZillaXml = (xmlContent: string): ServerConfig[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
  const serverNodes = xmlDoc.getElementsByTagName("Server");
  const servers: ServerConfig[] = [];

  for (let i = 0; i < serverNodes.length; i++) {
    const node = serverNodes[i];
    const host = node.getElementsByTagName("Host")[0]?.textContent || "";
    const port = parseInt(node.getElementsByTagName("Port")[0]?.textContent || "21");
    const protocol = parseInt(node.getElementsByTagName("Protocol")[0]?.textContent || "0");
    const user = node.getElementsByTagName("User")[0]?.textContent || "";
    const pass = node.getElementsByTagName("Pass")[0]?.textContent || "";

    if (host && user) {
      servers.push({
        id: `fz-${i}-${Date.now()}`,
        host,
        port,
        protocol: protocol === 1 ? Protocol.SFTP : Protocol.FTP,
        username: user,
        password: pass
      });
    }
  }
  return servers;
};
