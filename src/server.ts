import express from 'express';
import { spawn } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, '..')));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Allowed commands for security
const ALLOWED = new Set([
  'npm run facts:build',
  'npm run facts:derive', 
  'npm run facts:promptpacks',
  'npm run graph:build',
  'npm run lore:state:full:all',
  'npm run lore:burg:full:all',
  'npm run lore:state:full',
  'npm run lore:burg:full',
  'npm run lore:state',
  'npm run lore:burg',
  'npm run lore:state:hooks',
  'npm run lore:burg:hooks',
  'npm run lore:dirty',
  'npm run validate:lore',
  'npm run validate:lore:subset',
  'npm run catalog:build',
  'npm run pipeline:abort:clear',
  'npm run pipeline:abort',
  'npm run pipeline:full:one',
  'npm run pipeline:full:all',
  'npm run pipeline:full:all+validate',
  'npm run pipeline:real:all',
  'npm run events:apply',
  'npm run events:apply+regen',
  'npm run test:hash',
  // Cross-env commands for concurrency control
  'cross-env LORE_CONCURRENCY=3 npm run lore:state:full:all',
  'cross-env LORE_CONCURRENCY=4 npm run lore:burg:full:all'
]);

// Execute command endpoint
app.post('/api/exec', (req, res) => {
  const { cmd } = req.body || {};
  
  if (typeof cmd !== 'string' || ![...ALLOWED].some(s => cmd.startsWith(s))) {
    return res.status(400).json({ error: 'command not allowed' });
  }

  console.log(`[API] Executing command: ${cmd}`);
  
  // Stream NDJSON
  res.setHeader('Content-Type', 'application/x-ndjson');
  
  const [bin, ...args] = cmd.split(' ');
  const child = spawn(bin, args, { 
    shell: process.platform === 'win32', 
    env: process.env,
    cwd: join(__dirname, '..')
  });
  
  function write(line: string) { 
    try { 
      res.write(JSON.stringify({ line }) + '\n'); 
    } catch (e) {
      // Connection closed
    }
  }
  
  child.stdout?.on('data', (d) => write(String(d)));
  child.stderr?.on('data', (d) => write(String(d)));
  child.on('close', (code) => { 
    write(`exit ${code}`); 
    res.end(); 
  });
  
  child.on('error', (error) => {
    write(`error: ${error.message}`);
    res.end();
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve the dashboard
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '..', 'loregen-dashboard.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LoreGen API server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard available at http://localhost:${PORT}`);
  console.log(`🔧 API endpoint: http://localhost:${PORT}/api/exec`);
});
