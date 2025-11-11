#!/bin/bash

# Script de deployment para Dashboard Minero EECOL
echo "🚀 Iniciando deployment del Dashboard Minero EECOL..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "inicio-rapido.html" ]; then
    log_error "No se encontró inicio-rapido.html. Asegúrate de estar en el directorio del proyecto."
    exit 1
fi

log_success "Directorio del proyecto verificado"

# Verificar archivos principales
log_info "Verificando archivos principales..."

required_files=(
    "inicio-rapido.html"
    "login-profesional.html"
    "Dashboard Ejecutivo - Proyectos Mineros.html"
    "Panel-Admin-Nuevo.html"
    "auth-system-pro.js"
    "database-manager.js"
    "config.js"
    "proyectos.json"
    "netlify.toml"
    "index.html"
)

missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    log_error "Archivos faltantes:"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
    exit 1
fi

log_success "Todos los archivos principales encontrados"

# Verificar si Netlify CLI está instalado
if ! command -v netlify &> /dev/null; then
    log_warning "Netlify CLI no está instalado"
    log_info "Instalando Netlify CLI..."
    
    if command -v npm &> /dev/null; then
        npm install -g netlify-cli
        log_success "Netlify CLI instalado"
    else
        log_error "npm no está disponible. Instala Node.js y npm primero."
        log_info "O usa el método drag & drop en https://app.netlify.com/drop"
        exit 1
    fi
fi

# Verificar login en Netlify
log_info "Verificando autenticación en Netlify..."
if ! netlify status &> /dev/null; then
    log_warning "No estás autenticado en Netlify"
    log_info "Iniciando proceso de login..."
    netlify login
fi

log_success "Autenticación verificada"

# Crear archivo de información del build
cat > build-info.json << EOF
{
    "buildTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "version": "2.0.0",
    "project": "Dashboard Minero EECOL",
    "files": $(find . -name "*.html" -o -name "*.js" -o -name "*.json" -o -name "*.css" | wc -l),
    "deployment": "netlify"
}
EOF

log_success "Información del build creada"

# Deployment
log_info "Iniciando deployment en Netlify..."

if netlify deploy --prod --dir . --message "Dashboard Minero EECOL v2.0.0 - $(date)"; then
    log_success "¡Deployment exitoso!"
    
    # Obtener URL del sitio
    SITE_URL=$(netlify status --json | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
    
    if [ ! -z "$SITE_URL" ]; then
        log_success "Sitio disponible en: $SITE_URL"
        log_info "URLs principales:"
        echo "  🏠 Inicio: $SITE_URL/"
        echo "  📊 Dashboard: $SITE_URL/dashboard"
        echo "  ⚙️  Admin: $SITE_URL/admin"
        echo "  🔐 Login: $SITE_URL/login"
        echo "  🔧 Diagnóstico: $SITE_URL/diagnostico"
    fi
    
    # Mostrar credenciales
    log_info "Credenciales de acceso:"
    echo "  👑 Root: root / propuestaadmin"
    echo "  👤 Admin: admin / propuestaadmin"
    echo "  📊 Analyst: analyst / analyst123"
    
else
    log_error "Error en el deployment"
    exit 1
fi

# Limpiar archivos temporales
rm -f build-info.json

log_success "¡Dashboard Minero EECOL desplegado exitosamente!"
echo ""
echo "🎉 ¡Tu aplicación está live y lista para usar!"