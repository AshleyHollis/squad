/**
 * Squad Start — PTY Mirror Mode
 *
 * `squad start [--tunnel]`
 * Spawns copilot in a PTY (pseudo-terminal) — you see the EXACT same
 * TUI as running copilot directly. The raw terminal output is mirrored
 * to a remote PWA via WebSocket + devtunnel.
 *
 * Bidirectional: keyboard input from terminal AND phone both go to copilot.
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { RemoteBridge } from '@bradygaster/squad-sdk';
import { isDevtunnelAvailable, createTunnel, destroyTunnel, getMachineId, getGitInfo, } from './rc-tunnel.js';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
export async function runStart(cwd, options) {
    const { repo, branch } = getGitInfo(cwd);
    const machine = getMachineId();
    const squadDir = fs.existsSync(path.join(cwd, '.squad'))
        ? path.join(cwd, '.squad')
        : fs.existsSync(path.join(cwd, '.ai-team'))
            ? path.join(cwd, '.ai-team')
            : '';
    // ─── Setup remote bridge FIRST (before PTY takes over terminal) ───
    let bridge = null;
    let tunnelUrl = '';
    const config = {
        port: options.port || 0,
        maxHistory: 500,
        repo, branch, machine, squadDir,
        enableReplay: true,
    };
    bridge = new RemoteBridge(config);
    // PWA static files
    bridge.setStaticHandler((req, res) => {
        const uiDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../remote-ui');
        let decodedUrl;
        try {
            const parsed = new URL(req.url || '/', `http://${req.headers.host}`);
            decodedUrl = decodeURIComponent(parsed.pathname);
        }
        catch {
            res.writeHead(400);
            res.end();
            return;
        }
        if (decodedUrl.includes('..')) {
            res.writeHead(400);
            res.end();
            return;
        }
        let filePath = path.resolve(uiDir, decodedUrl === '/' ? 'index.html' : decodedUrl.replace(/^\//, ''));
        if (!filePath.startsWith(uiDir)) {
            res.writeHead(403);
            res.end();
            return;
        }
        try {
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                filePath = path.join(filePath, 'index.html');
                if (!fs.existsSync(filePath)) {
                    res.writeHead(404);
                    res.end();
                    return;
                }
            }
        }
        catch {
            res.writeHead(404);
            res.end();
            return;
        }
        const servePath = fs.existsSync(filePath) ? filePath : path.join(uiDir, 'index.html');
        const ext = path.extname(servePath);
        const mimes = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json' };
        const headers = {
            'Content-Type': mimes[ext] || 'application/octet-stream',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
        };
        if (ext === '.html') {
            headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; connect-src 'self' ws: wss:; img-src 'self' data:; font-src 'self' https://cdn.jsdelivr.net";
        }
        res.writeHead(200, headers);
        const stream = fs.createReadStream(servePath);
        stream.on('error', () => { if (!res.headersSent) {
            res.writeHead(500);
        } res.end(); });
        stream.pipe(res);
    });
    const actualPort = await bridge.start();
    // Tunnel
    if (options.tunnel && isDevtunnelAvailable()) {
        try {
            const tunnel = await createTunnel(actualPort, { repo, branch, machine });
            const tunnelUrlWithToken = `${tunnel.url}?token=${bridge.getSessionToken()}`;
            tunnelUrl = tunnelUrlWithToken;
            console.log(`${GREEN}✓${RESET} Remote: ${BOLD}${tunnelUrlWithToken}${RESET}`);
            try {
                // @ts-ignore
                const qrcode = (await import('qrcode-terminal'));
                qrcode.default.generate(tunnelUrlWithToken, { small: true }, (code) => { console.log(code); });
            }
            catch { }
            console.log(`${DIM}Scan QR or open URL on phone. Starting copilot...${RESET}\n`);
            console.log(`  ${DIM}Audit log:${RESET} ${bridge.getAuditLogPath()}`);
            console.log(`  ${DIM}Session expires:${RESET} ${new Date(bridge.getSessionExpiry()).toLocaleTimeString()}`);
        }
        catch (err) {
            console.log(`${YELLOW}⚠${RESET} Tunnel failed: ${err.message}`);
        }
    }
    else if (options.tunnel) {
        console.log(`${YELLOW}⚠${RESET} devtunnel not installed. Local mirror on port ${actualPort}.`);
    }
    // ─── Spawn copilot in PTY ─────────────────────────────────
    // Dynamic import node-pty (native module, optional dependency)
    let nodePty;
    try {
        nodePty = await import('node-pty');
    }
    catch {
        console.error(`${YELLOW}✗${RESET} node-pty is required for 'squad start' but could not be loaded.`);
        console.error(`  Install it with: npm install -g node-pty`);
        console.error(`  (Requires a C++ build toolchain — on Windows run: npm install -g windows-build-tools)`);
        process.exit(1);
    }
    let defaultCmd = 'copilot';
    // On Windows, try known install locations in order of preference
    if (process.platform === 'win32') {
        const candidates = [
            // Global npm install
            path.join('C:', 'ProgramData', 'global-npm', 'node_modules', '@github', 'copilot', 'node_modules', '@github', 'copilot-win32-x64', 'copilot.exe'),
        ];
        // WinGet install (dynamic path with package hash)
        const wingetBase = path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Packages');
        if (fs.existsSync(wingetBase)) {
            try {
                const dirs = fs.readdirSync(wingetBase).filter(d => d.startsWith('GitHub.Copilot_'));
                for (const dir of dirs) {
                    candidates.push(path.join(wingetBase, dir, 'copilot.exe'));
                }
            }
            catch { /* ignore */ }
        }
        // Resolve from PATH using where.exe
        try {
            const { execSync } = await import('node:child_process');
            const wherePath = execSync('where copilot', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim().split('\n')[0].trim();
            if (wherePath)
                candidates.push(wherePath);
        }
        catch { /* not in PATH */ }
        for (const candidate of candidates) {
            if (fs.existsSync(candidate)) {
                defaultCmd = candidate;
                break;
            }
        }
    }
    const copilotCmd = options.command || defaultCmd;
    const cols = process.stdout.columns || 120;
    const rows = process.stdout.rows || 30;
    const copilotExtraArgs = options.copilotArgs || [];
    if (copilotExtraArgs.length > 0) {
        console.log(`  ${DIM}Copilot flags:${RESET} ${copilotExtraArgs.join(' ')}\n`);
    }
    // F-07: Security — blocklist dangerous environment variables for PTY
    const DANGEROUS_VARS = new Set(['NODE_OPTIONS', 'NODE_REPL_HISTORY', 'NODE_EXTRA_CA_CERTS',
        'NODE_PATH', 'NODE_REDIRECT_WARNINGS', 'NODE_PENDING_DEPRECATION',
        'UV_THREADPOOL_SIZE', 'LD_PRELOAD', 'DYLD_INSERT_LIBRARIES',
        'SSH_AUTH_SOCK', 'GPG_TTY',
        'PYTHONPATH', 'BASH_ENV', 'BASH_FUNC', 'JAVA_TOOL_OPTIONS', 'JAVA_OPTIONS', '_JAVA_OPTIONS',
        'PROMPT_COMMAND', 'ENV', 'ZDOTDIR', 'PERL5OPT', 'RUBYOPT']);
    const sensitivePattern = /token|secret|key|password|credential|authorization|api_key|private_key|access_key|connection_string|db_pass|signing|kubeconfig|docker_host|docker_config/i;
    const safeEnv = {};
    for (const [k, v] of Object.entries(process.env)) {
        if (v !== undefined && !DANGEROUS_VARS.has(k) && !sensitivePattern.test(k)) {
            safeEnv[k] = v;
        }
    }
    const pty = nodePty.spawn(copilotCmd, copilotExtraArgs, {
        name: 'xterm-256color',
        cols,
        rows,
        cwd,
        env: safeEnv,
    });
    // Terminal output buffer for remote clients
    let outputBuffer = '';
    // PTY output → local terminal + remote
    pty.onData((data) => {
        // Write to local terminal (exact copilot output)
        process.stdout.write(data);
        // Buffer for remote clients
        outputBuffer += data;
        // Cap buffer at 100KB
        if (outputBuffer.length > 100000) {
            outputBuffer = outputBuffer.slice(-100000);
        }
        // Send to remote clients as raw terminal data
        bridge?.passthroughFromAgent(JSON.stringify({ type: 'pty', data }));
    });
    pty.onExit(({ exitCode }) => {
        console.log(`\n${DIM}Copilot exited (code ${exitCode}).${RESET}`);
        destroyTunnel();
        bridge?.stop();
        process.exit(exitCode);
    });
    // Local keyboard → PTY (raw mode for full terminal experience)
    if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    process.stdin.on('data', (data) => {
        pty.write(data.toString());
    });
    // Handle terminal resize
    process.stdout.on('resize', () => {
        pty.resize(process.stdout.columns || 120, process.stdout.rows || 30);
    });
    // Remote input → PTY (phone sends keystrokes + resize)
    bridge.setPassthrough((msg) => {
        try {
            const parsed = JSON.parse(msg);
            if (parsed.type === 'pty_input') {
                pty.write(parsed.data);
            }
            if (parsed.type === 'pty_resize') {
                const cols = Number(parsed.cols);
                const rows = Number(parsed.rows);
                if (Number.isFinite(cols) && Number.isFinite(rows)) {
                    pty.resize(Math.max(1, Math.min(500, cols)), Math.max(1, Math.min(200, rows)));
                }
            }
        }
        catch {
            // Only log, do NOT write raw input to PTY
            const auditPath = bridge?.getAuditLogPath();
            if (auditPath) {
                fs.appendFileSync(auditPath, `${new Date().toISOString()} [remote] [RAW] ${JSON.stringify(msg)}\n`);
            }
        }
    });
    // When remote client connects, send the buffer (full terminal history)
    // This is handled by the bridge's acpEventLog replay
    // Cleanup
    process.on('SIGINT', () => {
        pty.kill();
        destroyTunnel();
        bridge?.stop();
        process.exit(0);
    });
}
//# sourceMappingURL=start.js.map