const ftp = require('basic-ftp');
const { Client } = require('ssh2');

/**
 * Core Logic for Scanning a Target
 * @param {string} host 
 * @param {number} port 
 * @param {number} protocol (0=FTP, 1=SFTP)
 * @param {string} username 
 * @param {string} password 
 * @param {string} checkPath 
 */
async function scanTarget(host, port, protocol, username, password, checkPath = null) {
    const start = Date.now();
    let result = {
        host,
        port,
        protocol: protocol === 0 ? 'FTP' : 'SFTP',
        status: 'failed',
        message: 'Unknown error',
        connectionTimeMs: 0,
        banner: null,
        pathExists: false,
        features: []
    };

    try {
        if (protocol === 0) { // FTP
            const client = new ftp.Client();
            client.ftp.verbose = false;
            
            try {
                await client.access({
                    host,
                    port: port || 21,
                    user: username,
                    password: password,
                    secure: false
                });

                result.status = 'success';
                result.message = 'Connected and Authenticated';
                result.features = client.ftp.features;
                
                try {
                    result.banner = await client.send("SYST").then(r => r.message).catch(() => "Unknown");
                } catch(e) {}

                if (checkPath) {
                    try {
                        await client.cd(checkPath);
                        result.pathExists = true;
                    } catch(e) {
                        result.pathExists = false;
                    }
                }
            } catch (err) {
                result.status = 'failed';
                result.message = err.message || "FTP Connection Failed";
                if (err.code === 530) result.message = "Authentication Failed (530)";
                if (err.code === 'ECONNREFUSED') result.message = "Connection Refused";
            } finally {
                client.close();
            }

        } else { // SFTP
            await new Promise((resolve) => {
                const conn = new Client();
                conn.on('ready', () => {
                    result.status = 'success';
                    result.message = 'SSH Handshake & Auth Successful';
                    
                    conn.sftp((err, sftp) => {
                        if (err) {
                            result.message = "SSH OK, SFTP Failed";
                            conn.end();
                            return resolve();
                        }
                        if (checkPath) {
                            sftp.stat(checkPath, (err, stats) => {
                                if (!err && stats) result.pathExists = true;
                                conn.end();
                                resolve();
                            });
                        } else {
                            conn.end();
                            resolve();
                        }
                    });
                }).on('banner', (msg) => {
                    result.banner = msg.trim();
                }).on('error', (err) => {
                    result.status = 'failed';
                    result.message = err.message;
                    if (err.level === 'client-authentication') result.message = "Authentication Failed";
                    resolve();
                }).connect({
                    host,
                    port: port || 22,
                    username,
                    password,
                    readyTimeout: 5000
                });
            });
        }
    } catch (error) {
        result.message = error.message;
    }

    result.connectionTimeMs = Date.now() - start;
    return result;
}

module.exports = { scanTarget };