#!/usr/bin/env bash

# ===============================================
#  RECON SCRIPT
# ===============================================

set -euo pipefail
IFS=$'\n\t'

TARGET="$1"
DATE=$(date -u +%Y-%m-%d_%H%M%SZ)

OUTDIR="results/${TARGET}_recon_${DATE}"
RAW="${OUTDIR}/raw"
PROCESSED="${OUTDIR}/processed"
SCREENSHOTS="${OUTDIR}/screenshots"
LOGS="${OUTDIR}/logs"

CONCURRENCY=50
NAABU_RATE=4000

mkdir -p "$RAW" "$PROCESSED" "$SCREENSHOTS" "$LOGS"

# -----------------------------------------------
#  Verificación de herramientas
# -----------------------------------------------
check_tool() {
    if ! command -v "$1" &>/dev/null; then
        echo " Herramienta faltante: $1"
        MISSING=true
    fi
}

echo "[*] Verificando herramientas..."
MISSING=false
REQUIRED_TOOLS=("subfinder" "amass" "assetfinder" "findomain" "dnsx" "httpx" "naabu" "whatweb" "gowitness")
for TOOL in "${REQUIRED_TOOLS[@]}"; do
    check_tool "$TOOL"
done
if [ "$MISSING" = true ]; then
    echo "Instala las herramientas faltantes y vuelve a ejecutar."
    exit 1
fi
echo "[*] Todas las herramientas necesarias están instaladas ✓"

# -----------------------------------------------
# 🔹 Detección de si es dominio o IP
# -----------------------------------------------
if [[ "$TARGET" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    MODE="IP"
else
    MODE="DOMAIN"
fi

echo "[*] Modo detectado: $MODE"

# -----------------------------------------------
#  Fase 1: Recon pasivo (solo si es dominio)
# -----------------------------------------------
passive_recon() {
    echo "[*] Iniciando recon pasivo..."

    subfinder -d "$TARGET" -silent -o "$RAW/subfinder.txt" 2>>"$LOGS/subfinder.log" || true
    amass enum -passive -d "$TARGET" -o "$RAW/amass.txt" 2>>"$LOGS/amass.log" || true
    assetfinder --subs-only "$TARGET" > "$RAW/assetfinder.txt" 2>>"$LOGS/assetfinder.log" || true
    findomain -t "$TARGET" -u "$RAW/findomain.txt" 2>>"$LOGS/findomain.log" || true

    echo "[*] Recon pasivo finalizado ✓"
}

# -----------------------------------------------
#  Fase 2: Limpieza y unificación de subdominios
# -----------------------------------------------
unify_subdomains() {
    echo "[*] Unificando subdominios..."
    cat "$RAW"/*.txt 2>/dev/null | sort -u > "$PROCESSED/all_subdomains.txt"
    echo "[*] Subdominios únicos: $(wc -l < "$PROCESSED/all_subdomains.txt")"
}

# -----------------------------------------------
#  Fase 3: Resolución DNS
# -----------------------------------------------
dns_resolution() {
    echo "[*] Resolución DNS..."
    dnsx -l "$PROCESSED/all_subdomains.txt" -a -cname -resp \
    -o "$PROCESSED/resolved.txt" 2>>"$LOGS/dnsx.log" || true
}

# -----------------------------------------------
#  Fase 4: HTTP Probing
# -----------------------------------------------
http_probe() {
    echo "[*] Descubrimiento HTTP/S..."
    httpx -l "$PROCESSED/all_subdomains.txt" -silent -follow-redirects \
    -threads "$CONCURRENCY" -title -tech-detect \
    -o "$PROCESSED/httpx.txt" 2>>"$LOGS/httpx.log" || true
}

# -----------------------------------------------
#  Fase 5: Descubrimiento de puertos
# -----------------------------------------------
port_scan() {
    echo "[*] Escaneo de puertos..."
    naabu -list "$PROCESSED/all_subdomains.txt" -top-ports 1000 \
    -rate "$NAABU_RATE" -o "$PROCESSED/naabu.txt" 2>>"$LOGS/naabu.log" || true
}

# -----------------------------------------------
#  Fase 6: Fingerprinting web
# -----------------------------------------------
web_fingerprinting() {
    echo "[*] Fingerprinting Web..."
    awk '{print $1}' "$PROCESSED/httpx.txt" | xargs -I{} \
    whatweb --no-errors -a 3 {} >> "$PROCESSED/whatweb.txt" 2>>"$LOGS/whatweb.log" || true
}

# -----------------------------------------------
#  Fase 7: Screenshots automáticos
# -----------------------------------------------
take_screenshots() {
    echo "[*] Screenshots..."
    gowitness file -f "$PROCESSED/httpx.txt" --threads 10 \
    --destination "$SCREENSHOTS" 2>>"$LOGS/gowitness.log" || true
}

# ===============================================
#  EJECUCIÓN DEL RECON
# ===============================================
START=$(date +%s)
echo "[*] Iniciando reconocimiento a $TARGET..."

if [[ "$MODE" == "DOMAIN" ]]; then
    passive_recon
    unify_subdomains
    dns_resolution
    http_probe
    port_scan
    web_fingerprinting
    take_screenshots
else
    echo "[*] IP detectada: solo puertos + fingerprint"
    echo "$TARGET" > "$PROCESSED/all_subdomains.txt"
    port_scan
    web_fingerprinting
    take_screenshots
fi

END=$(date +%s)
echo "==============================================="
echo "✔Reconocimiento COMPLETADO"
echo " Resultados guardados en: $OUTDIR"
echo " Tiempo total: $((END-START)) segundos"
echo "==============================================="
