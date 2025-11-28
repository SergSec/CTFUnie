const express = require('express');
const { exec } = require('child_process');

const router = express.Router();

// ============================================
// SHELL VULNERABLE - COMMAND INJECTION
// Solo para pruebas de pentesting en puerto 6969
// ============================================

// @route   GET /api/shell
// @desc    Página de shell web
// @access  Public (VULNERABLE)
router.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Web Shell - AFYL</title>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body { 
                    font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    min-height: 100vh;
                    color: #fff;
                    padding: 20px;
                }
                .container {
                    max-width: 900px;
                    margin: 0 auto;
                }
                h1 { 
                    text-align: center;
                    color: #4fc3f7;
                    margin-bottom: 8px;
                    font-size: 2em;
                }
                .subtitle {
                    text-align: center;
                    color: #888;
                    margin-bottom: 25px;
                    font-size: 0.95em;
                }
                .info-box {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 20px;
                }
                .info-box h3 {
                    color: #4fc3f7;
                    margin-bottom: 12px;
                    font-size: 1em;
                }
                .info-box p {
                    color: #aaa;
                    line-height: 1.8;
                    font-size: 0.9em;
                }
                .info-box code {
                    background: rgba(79, 195, 247, 0.2);
                    color: #4fc3f7;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-family: 'Consolas', monospace;
                    font-size: 0.9em;
                }
                .terminal {
                    background: rgba(0, 0, 0, 0.5);
                    border: 1px solid rgba(79, 195, 247, 0.3);
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                }
                .terminal-header {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 15px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                .terminal-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                }
                .dot-red { background: #ff5f56; }
                .dot-yellow { background: #ffbd2e; }
                .dot-green { background: #27ca40; }
                .input-line {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 15px;
                }
                .prompt {
                    color: #4fc3f7;
                    font-family: 'Consolas', monospace;
                    white-space: nowrap;
                }
                #cmdInput {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-family: 'Consolas', monospace;
                    font-size: 14px;
                    outline: none;
                }
                #cmdInput::placeholder {
                    color: #555;
                }
                button {
                    background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%);
                    color: #000;
                    border: none;
                    padding: 10px 25px;
                    font-family: 'Poppins', sans-serif;
                    font-weight: 600;
                    font-size: 0.9em;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                }
                button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 20px rgba(79, 195, 247, 0.4);
                }
                #output {
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 15px;
                    margin-top: 15px;
                    min-height: 300px;
                    max-height: 400px;
                    overflow-y: auto;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    font-family: 'Consolas', monospace;
                    font-size: 13px;
                    color: #ccc;
                    border-radius: 8px;
                    line-height: 1.5;
                }
                #output .cmd {
                    color: #4fc3f7;
                }
                #output .error {
                    color: #ff6b6b;
                }
                .warning {
                    text-align: center;
                    margin-top: 20px;
                    padding: 12px;
                    background: rgba(255, 107, 107, 0.1);
                    border: 1px solid rgba(255, 107, 107, 0.3);
                    border-radius: 8px;
                    color: #ff6b6b;
                    font-size: 0.85em;
                }
                .back-link {
                    display: inline-block;
                    margin-top: 20px;
                    color: #4fc3f7;
                    text-decoration: none;
                    font-size: 0.9em;
                }
                .back-link:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Web Shell</h1>
                
                <div class="info-box">
                    <h3>El único comando permitido:</h3>
                    <p>
                        <code>whoami</code> 
                    </p>
                </div>

                <div class="terminal">
                    <div class="terminal-header">
                        <div class="terminal-dot dot-red"></div>
                        <div class="terminal-dot dot-yellow"></div>
                        <div class="terminal-dot dot-green"></div>
                    </div>
                    <div class="input-line">
                        <span class="prompt">afyl@shell:~$</span>
                        <input type="text" id="cmdInput" placeholder="Escribe un comando..." autofocus>
                        <button onclick="executeCmd()">Ejecutar</button>
                    </div>
                    <div id="output">Bienvenido a la Web Shell de AFYL.
Escribe un comando y presiona Enter o haz clic en Ejecutar.

</div>
                </div>
                <a href="/" class="back-link">← Volver al inicio</a>
            </div>

            <script>
                const input = document.getElementById('cmdInput');
                const output = document.getElementById('output');
                let history = [];
                let historyIndex = -1;

                input.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        executeCmd();
                    } else if (e.key === 'ArrowUp') {
                        if (historyIndex < history.length - 1) {
                            historyIndex++;
                            input.value = history[history.length - 1 - historyIndex];
                        }
                        e.preventDefault();
                    } else if (e.key === 'ArrowDown') {
                        if (historyIndex > 0) {
                            historyIndex--;
                            input.value = history[history.length - 1 - historyIndex];
                        } else {
                            historyIndex = -1;
                            input.value = '';
                        }
                        e.preventDefault();
                    }
                });

                async function executeCmd() {
                    const cmd = input.value.trim();
                    if (!cmd) return;

                    history.push(cmd);
                    historyIndex = -1;
                    
                    output.innerHTML += '<span class="cmd">$ ' + escapeHtml(cmd) + '</span>\\n';
                    input.value = '';

                    try {
                        const res = await fetch('/api/shell/exec?cmd=' + encodeURIComponent(cmd));
                        const data = await res.json();
                        
                        if (data.output) {
                            output.textContent += data.output;
                        }
                        if (data.error) {
                            output.innerHTML += '<span class="error">' + escapeHtml(data.error) + '</span>';
                        }
                        output.textContent += '\\n';
                    } catch (err) {
                        output.innerHTML += '<span class="error">Error: ' + escapeHtml(err.message) + '</span>\\n';
                    }

                    output.scrollTop = output.scrollHeight;
                }

                function escapeHtml(text) {
                    const div = document.createElement('div');
                    div.textContent = text;
                    return div.innerHTML;
                }
            </script>
        </body>
        </html>
    `);
});

// @route   GET /api/shell/exec
// @desc    Ejecutar comandos (RESTRINGIDO - Solo whoami)
// @access  Public
router.get('/exec', (req, res) => {
    const cmd = req.query.cmd;
    
    if (!cmd) {
        return res.status(400).json({ error: 'Parámetro "cmd" requerido' });
    }

    // Solo permitir el comando whoami
    if (cmd.trim().toLowerCase() !== 'whoami') {
        console.log(`[SHELL] Comando no permitido: ${cmd}`);
        return res.status(403).json({ 
            error: 'Comando no permitido. Solo se permite ejecutar: whoami',
            command: cmd 
        });
    }

    console.log(`[SHELL] Ejecutando comando permitido: ${cmd}`);

    exec('whoami', { timeout: 10000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        res.json({
            command: cmd,
            output: stdout || '',
            error: stderr || (error ? error.message : ''),
            exitCode: error ? error.code : 0
        });
    });
});

// @route   POST /api/shell/exec
// @desc    Ejecutar comandos via POST (RESTRINGIDO - Solo whoami)
// @access  Public
router.post('/exec', (req, res) => {
    const cmd = req.body.cmd;
    
    if (!cmd) {
        return res.status(400).json({ error: 'Campo "cmd" requerido en el body' });
    }

    // Solo permitir el comando whoami
    if (cmd.trim().toLowerCase() !== 'whoami') {
        console.log(`[SHELL] Comando no permitido (POST): ${cmd}`);
        return res.status(403).json({ 
            error: 'Comando no permitido. Solo se permite ejecutar: whoami',
            command: cmd 
        });
    }

    console.log(`[SHELL] Ejecutando comando permitido (POST): ${cmd}`);

    exec('whoami', { timeout: 10000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        res.json({
            command: cmd,
            output: stdout || '',
            error: stderr || (error ? error.message : ''),
            exitCode: error ? error.code : 0
        });
    });
});

module.exports = router;
