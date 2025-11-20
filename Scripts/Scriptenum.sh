#!/usr/bin/env bash
# enum_full.sh - versión automática con menú y soporte para puerto 3000

set -euo pipefail
IFS=$'\n\t'

#################################
###  CONFIGURACIÓN GLOBAL     ###
#################################

TARGET="${1:-}"
if [[ -z "$TARGET" ]]; then
  echo "Uso: $0 <dominio|IP> [directorio_recon]"
  exit 1
fi

RECON_DIR="${2:-results/${TARGET}_recon_*}"
OUTDIR="results/${TARGET}_enum_$(date -u +%Y-%m-%d_%H%M%SZ)"

RAW="$OUTDIR/raw"
PROCESSED="$OUTDIR/processed"
LOGS="$OUTDIR/logs"
WEB="$OUTDIR/web_enum"

mkdir -p "$RAW" "$PROCESSED" "$LOGS" "$WEB"

log() { echo "[ENUM][$(date -u +%H:%M:%S)] $*"; }

#################################
###  MENÚ INTERACTIVO         ###
#################################

echo ""
echo "Selecciona modo de enumeración:"
echo "1) Laboratorio / HTB (AGRESIVO)"
echo "2) Bug Bounty Permitido (SEGURO)"
echo "3) OSINT Pasivo (NO intrusivo)"
read -rp "> " MODE_OPT

case "$MODE_OPT" in
  1) MODE_NAME="CTF"; RATE="fast" ;;
  2) MODE_NAME="BUGBOUNTY"; RATE="slow" ;;
  3) MODE_NAME="PASSIVE"; RATE="none" ;;
  *) echo "Opción inválida"; exit 1 ;;
esac

log "Modo seleccionado: $MODE_NAME"

#################################
###  DETECTAR TARGET          ###
#################################

if [[ "$TARGET" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; then
  MODE="IP"
else
  MODE="DOMAIN"
fi

log "Objetivo: $TARGET ($MODE)"

#################################
###  AUTOGENERACIÓN RECON    ###
#################################

AUTO_RECON="results/${TARGET}_recon_auto"
mkdir -p "$AUTO_RECON/processed"

HTTPX_FILE="$AUTO_RECON/processed/httpx.txt"

if [[ "$TARGET" =~ ^http ]]; then
  echo "$TARGET" > "$HTTPX_FILE"
elif [[ "$TARGET" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; then
  echo "http://$TARGET:3000" > "$HTTPX_FILE"
else
  echo "http://$TARGET:3000" > "$HTTPX_FILE"
fi

echo "$TARGET" > "$AUTO_RECON/processed/all_subs.txt"
echo "$TARGET:3000" > "$AUTO_RECON/naabu.txt"

RECON_DIR="$AUTO_RECON"
log "Reconstruido automáticamente: $RECON_DIR"

#################################
###  WORDLISTS NECESARIAS     ###
#################################

WORDLIST_DIR="/usr/share/wordlists/seclists"
declare -A WORDS=(
  ["common.txt"]="Discovery/Web-Content/common.txt"
  ["directory-list-2.3-medium.txt"]="Discovery/Web-Content/directory-list-2.3-medium.txt"
  ["raft-medium-directories.txt"]="Discovery/Web-Content/raft-medium-directories.txt"
  ["api-wordlist.txt"]="Miscellaneous/api-wordlist.txt"
)

install_wordlists() {
  if [[ ! -d "$WORDLIST_DIR" ]]; then
    sudo apt update && sudo apt install -y seclists
  fi

  for f in "${!WORDS[@]}"; do
    if [[ ! -f "$WORDLIST_DIR/${WORDS[$f]}" ]]; then
      sudo apt install -y seclists
      break
    fi
  done
}
install_wordlists

#################################
###  VERIFICAR HERRAMIENTAS   ###
#################################

tools=(nmap ffuf feroxbuster gobuster wafw00f whatweb nuclei sslscan)
missing=()

for t in "${tools[@]}"; do
  if ! command -v "$t" >/dev/null; then
    missing+=("$t")
  fi
done

if (( ${#missing[@]} > 0 )); then
  for x in "${missing[@]}"; do
    sudo apt install -y "$x" || true
  done
fi

#################################
###  HOSTS A ENUMERAR         ###
#################################

HOSTS="$PROCESSED/hosts.txt"
echo "$TARGET" > "$HOSTS"
log "Total hosts detectados: $(wc -l < "$HOSTS")"

#################################
###  ENUMERACIÓN PUERTOS      ###
#################################

enum_ports() {
  log "Enumeración de servicios con Nmap (scripts seguros)"

  PORT_FILE="$RECON_DIR/naabu.txt"

  while read -r host; do
    ports="3000"

    case "$MODE_NAME" in
      BUGBOUNTY) SCRIPTS="--script safe --max-rate 50" ;;
      CTF) SCRIPTS="--script vuln" ;;
      PASSIVE) continue ;;
    esac

    nmap -sV -Pn -p "$ports" $SCRIPTS "$host" \
      -oN "$PROCESSED/nmap_$host.txt" \
>> "$LOGS/nmap.log" 2>/dev/null || true

  done < "$HOSTS"
}

#################################
###  ENUMERACIÓN WEB          ###
#################################

enum_web() {
  log "Enumeración Web"

  [[ "$MODE_NAME" == "PASSIVE" ]] && return

  while read -r url; do
    [[ -z "$url" ]] && continue

    safe=$(echo "$url" | sed 's/[^a-zA-Z0-9]/_/g')

    wafw00f "$url" > "$WEB/waf_$safe.txt" 2>/dev/null || true
    whatweb "$url" > "$WEB/whatweb_$safe.txt" 2>/dev/null || true
    sslscan "$url" > "$WEB/ssl_$safe.txt" 2>/dev/null || true

    ffuf -w "$WORDLIST_DIR/Discovery/Web-Content/common.txt" -u "$url/FUZZ" \
      -mc 200,204,301,302,307,401 -t 30 \
      -o "$WEB/ffuf_$safe.txt" 2>/dev/null || true

  done < "$RECON_DIR/processed/httpx.txt"
}

#################################
###  VULN SCAN LIGERO         ###
#################################

enum_nuclei() {
  [[ "$MODE_NAME" == "PASSIVE" ]] && return

  log "Nuclei (templates safe en Bug Bounty)"

  case "$MODE_NAME" in
    BUGBOUNTY) TEMPL="-severity low,medium -tags cves" ;;
    CTF) TEMPL="" ;;
  esac

  nuclei -l "$HOSTS" $TEMPL \
    -o "$PROCESSED/nuclei.txt" 2>/dev/null || true
}

#################################
###  EJECUCIÓN PRINCIPAL      ###
#################################

log "=== INICIO ENUM COMPLETO ($MODE_NAME) ==="
enum_ports
enum_web
enum_nuclei

log "=== ENUM FINALIZADO ==="
tree "$OUTDIR" || ls -R "$OUTDIR"
log "Resultados: $OUTDIR"
