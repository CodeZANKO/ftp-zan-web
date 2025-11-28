const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { scanTarget } = require('./lib/core');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// --- Health Check ---
app.get('/api/health', (req, res) => {
    res.json({ status: 'online', version: '3.0.0', timestamp: new Date().toISOString() });
});

// --- Real Scan Logic ---
app.post('/api/scan', async (req, res) => {
    const { host, port, protocol, username, password, checkPath } = req.body;
    
    // Use the shared core library
    const result = await scanTarget(host, port, protocol, username, password, checkPath);
    
    // Map to Frontend expected format if necessary, though core.js is designed to match
    res.json(result);
});

app.listen(PORT, () => {
    console.log(`\n NET_SENTRY LOCAL AGENT RUNNING ON PORT ${PORT}`);
    console.log(` ------------------------------------------------`);
    console.log(` ➜ API Status:  http://localhost:${PORT}/api/health`);
    console.log(` ➜ CLI Tool:    Run 'npm run cli' or 'netsentry'`);
});