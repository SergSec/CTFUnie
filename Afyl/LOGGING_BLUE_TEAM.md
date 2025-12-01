# 🔐 Sistema de Logging para Blue Team - AFYL

## 📋 Resumen

El sistema de logging ha sido completamente rediseñado para proporcionar información útil para análisis forense y defensa (Blue Team). Se eliminó el ruido de logs innecesarios (assets estáticos) y se añadió detección de ataques en tiempo real.

---

## 🗂️ Estructura de Logs

### Archivos Generados

```
backend/logs/
├── logs_DD-MM-YYYY_HHhMMm.txt     # Log principal formateado
├── logs_DD-MM-YYYY_HHhMMm.json    # Log en JSON para análisis automatizado
└── security/
    └── security_YYYY-MM-DD.log    # Eventos de seguridad críticos (JSON lines)
```

---

## 🚨 Tipos de Eventos

| Tipo | Emoji | Descripción |
|------|-------|-------------|
| `INFO` | 📋 | Información general del servidor |
| `REQUEST` | 🌐 | Peticiones HTTP relevantes |
| `ERROR` | ❌ | Errores del sistema |
| `AUTH_SUCCESS` | ✅ | Login exitoso |
| `AUTH_FAIL` | 🚫 | Login fallido |
| `BRUTE_FORCE` | ⚡ | Detección de fuerza bruta (5+ intentos fallidos) |
| `INJECTION` | 💉 | SQL/NoSQL/XSS Injection detectado |
| `ATTACK` | 🔥 | Ataque genérico detectado |
| `FILE_UPLOAD` | 📁 | Subida de archivo |
| `SUSPICIOUS` | 🔍 | Comportamiento sospechoso |
| `RECON` | 🕵️ | Actividad de reconocimiento |
| `SECURITY` | 🚨 | Acceso a rutas sensibles |

---

## 🎯 Niveles de Riesgo

| Nivel | Color | Descripción |
|-------|-------|-------------|
| `CRITICAL` | 🔴 | Ataque exitoso, brecha de seguridad |
| `HIGH` | 🟠 | Ataque detectado, potencialmente exitoso |
| `MEDIUM` | 🟡 | Intento de ataque bloqueado |
| `LOW` | 🔵 | Comportamiento sospechoso |
| `INFO` | ⚪ | Información de auditoría |

---

## 🛡️ Detección de Ataques

El sistema detecta automáticamente los siguientes patrones:

### SQL/NoSQL Injection
```javascript
// Patrones detectados:
- Operadores MongoDB: {"$ne": null}, {"$gt": ""}, {"$regex": ""}
- SQL keywords: UNION, SELECT, INSERT, DROP, etc.
- Comentarios SQL: --, /*, */
- Funciones peligrosas: SLEEP(), BENCHMARK(), etc.
```

### XSS (Cross-Site Scripting)
```javascript
// Patrones detectados:
- Tags HTML: <script>, <img>, <svg>, <iframe>
- Event handlers: onclick=, onerror=, onload=
- JavaScript URIs: javascript:
- DOM manipulation: document., window., eval()
```

### Command Injection
```javascript
// Patrones detectados:
- Separadores de comandos: |, ;, &&, ||
- Backticks y substitución: `, $()
- Comandos peligrosos: wget, curl, nc, bash
```

### Path Traversal
```javascript
// Patrones detectados:
- Directory traversal: ../, ..\
- Rutas sensibles: /etc/, /proc/, c:\
- URL encoding: %2e%2e, %252e
```

### File Inclusion
```javascript
// Patrones detectados:
- Extensiones ejecutables: .php, .asp, .jsp, .cgi
- Wrappers PHP: php://, data://, expect://
```

---

## 📊 Formato del Reporte

### Reporte TXT

```
════════════════════════════════════════════════════════════════════════════════
  AFYL BLUE TEAM - SECURITY LOG REPORT
════════════════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────────────┐
│  📊 RESUMEN EJECUTIVO                                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│  Inicio: 2025-12-01T10:00:00.000Z                                            │
│  Fin: 2025-12-01T12:00:00.000Z                                               │
│  Duración: 2h 0m 0s                                                          │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  🚨 ESTADÍSTICAS DE SEGURIDAD                                                │
├──────────────────────────────────────────────────────────────────────────────┤
│  Total eventos: 150                                                          │
│  🔴 CRÍTICOS: 3                                                              │
│  🟠 ALTOS: 12                                                                │
│  🟡 MEDIOS: 45                                                               │
│  🔵 BAJOS: 90                                                                │
├──────────────────────────────────────────────────────────────────────────────┤
│  ⚔️  Ataques detectados: 8                                                   │
│  💉 Intentos de inyección: 5                                                 │
│  🚫 Fallos de autenticación: 23                                              │
│  📁 Uploads de archivos: 4                                                   │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  🕵️ IPs SOSPECHOSAS                                                         │
├──────────────────────────────────────────────────────────────────────────────┤
│  IP: 192.168.1.100                                                           │
│    → Requests: 450 | Ataques: 8 | Auth Fails: 15                             │
│    → Rutas: /api/auth/login, /api/shell/exec, /api/upload-admin              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Reporte JSON

```json
{
  "metadata": {
    "startTime": "2025-12-01T10:00:00.000Z",
    "endTime": "2025-12-01T12:00:00.000Z",
    "duration": 7200
  },
  "stats": {
    "total": 150,
    "critical": 3,
    "high": 12,
    "medium": 45,
    "low": 90,
    "authFails": 23,
    "attacks": 8,
    "injections": 5,
    "uploads": 4
  },
  "suspiciousIps": {
    "192.168.1.100": {
      "requests": 450,
      "attacks": 8,
      "authFails": 15,
      "methods": ["GET", "POST"],
      "paths": ["/api/auth/login", "/api/shell/exec"]
    }
  },
  "criticalEvents": [...],
  "allEvents": [...]
}
```

---

## 🔍 Logs de Seguridad Específicos

### Archivo: `security/security_YYYY-MM-DD.log`

Cada línea es un JSON con eventos de seguridad críticos:

```json
{"timestamp":"2025-12-01T10:30:00.000Z","eventId":"SEC-1234567890-abc123","type":"NOSQL_INJECTION","severity":"CRITICAL","message":"⚠️ NOSQL INJECTION EXITOSO - Bypass de autenticación","ip":"192.168.1.100","userAgent":"Mozilla/5.0...","userCompromised":"admin@afyl.com","userRole":"admin","payload":{"identifier":{"$ne":null},"passwordType":"object"}}
```

---

## 🛠️ Módulos de Logging

### 1. `server.js` - Logging HTTP General
- Filtra automáticamente assets estáticos (CSS, JS, imágenes)
- Detecta ataques en cada request
- Calcula nivel de riesgo automáticamente
- Tracking de requests por IP (detección DDoS)
- Tracking de intentos de login (detección Brute Force)

### 2. `utils/securityLogger.js` - Eventos de Seguridad
Funciones disponibles:
```javascript
const securityLogger = require('./utils/securityLogger');

// Login exitoso/fallido
securityLogger.logAuth(req, success, user, additionalInfo);

// Inyección detectada
securityLogger.logInjection(req, 'nosql', payload);

// Fuerza bruta
securityLogger.logBruteForce(req, attempts);

// Subida de archivo
securityLogger.logFileUpload(req, file, isSuspicious);

// Acceso no autorizado
securityLogger.logUnauthorizedAccess(req, resource, reason);

// Reconocimiento
securityLogger.logReconnaissance(req, scanType);

// Ataque genérico
securityLogger.logAttack(req, attackType, details);
```

---

## 📈 Uso para Análisis

### Buscar ataques exitosos
```bash
grep "CRITICAL" logs/security/security_*.log
```

### Contar intentos por IP
```bash
grep -o '"ip":"[^"]*"' logs/*.json | sort | uniq -c | sort -rn
```

### Analizar con Python
```python
import json

with open('logs/logs_01-12-2025_10h00m.json') as f:
    data = json.load(f)
    
# Top IPs atacantes
for ip, stats in sorted(data['suspiciousIps'].items(), 
                        key=lambda x: x[1]['attacks'], 
                        reverse=True)[:10]:
    print(f"{ip}: {stats['attacks']} ataques")
```

---

## ⚠️ Eventos Críticos Logueados Automáticamente

1. **NoSQL Injection exitoso** en `/api/auth/login`
2. **Subida de webshell** (archivos .php, .asp, .jsp, etc.)
3. **Ejecución de comandos** en `/api/shell/exec`
4. **Brute Force** (5+ intentos fallidos de login)
5. **DDoS** (100+ requests/minuto desde misma IP)

---

## 🎓 Para el Informe Blue Team

Los logs proporcionan:
1. **Timeline de eventos** - Secuencia temporal de ataques
2. **Estadísticas de IPs** - Identificación de atacantes
3. **Payloads capturados** - Evidencia de técnicas usadas
4. **Correlación de eventos** - Patrones de ataque
5. **Métricas de seguridad** - KPIs para el informe

---

*Última actualización: Diciembre 2025*
