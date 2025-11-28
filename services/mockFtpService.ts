import { Protocol, ScanResult, ServerConfig } from "../types";

// Since browsers cannot make direct TCP/FTP connections, this service simulates
// the backend logic described in the Python script for demonstration purposes.

const SIMULATION_DELAY_MS = 600;

export const simulateCheck = async (config: ServerConfig): Promise<ScanResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3 || (config.password === 'password' || config.username === 'admin');
      const connectionTime = Math.floor(Math.random() * 200) + 20;
      
      let result: ScanResult = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        serverConfig: config,
        status: isSuccess ? 'success' : 'failed',
        connectionTimeMs: connectionTime,
        authTimeMs: isSuccess ? Math.floor(Math.random() * 100) + 10 : 0,
        message: '',
        errors: []
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
          "Host unreachable"
        ];
        const errorMsg = errors[Math.floor(Math.random() * errors.length)];
        result.message = errorMsg;
        result.errors = [errorMsg];
      }

      resolve(result);
    }, SIMULATION_DELAY_MS);
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
