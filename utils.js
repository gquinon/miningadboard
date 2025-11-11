// Utilidades compartidas para Dashboard Minero EECOL
(function() {
    'use strict';
    
    // Función para sanitizar proyectos
    function sanitizeProject(project) {
        if (!project || typeof project !== 'object') {
            return null;
        }
        
        // Campos requeridos
        const requiredFields = [
            'Nombre del proyecto',
            'Sector', 
            'País',
            'Etapa',
            'Capex (US$ mn)'
        ];
        
        // Verificar campos requeridos
        for (const field of requiredFields) {
            if (!project[field] || project[field] === '') {
                console.warn('Proyecto sin campo requerido:', field, project);
                return null;
            }
        }
        
        // Sanitizar y normalizar datos
        const sanitized = {
            'Nombre del proyecto': String(project['Nombre del proyecto']).trim(),
            'Sector': String(project['Sector']).trim(),
            'Área': String(project['Área'] || '').trim(),
            'País': String(project['País']).trim(),
            'Etapa': String(project['Etapa']).trim(),
            'Compañías relacionadas': String(project['Compañías relacionadas'] || '').trim(),
            'Capex (US$ mn)': parseFloat(project['Capex (US$ mn)']) || 0,
            'Tipo de proyecto': String(project['Tipo de proyecto'] || '').trim(),
            'Productos y Servicios': String(project['Productos y Servicios'] || '').trim(),
            'Estado': String(project['Estado'] || 'Activo').trim(),
            'Latitud': parseFloat(project['Latitud']) || 0,
            'Longitud': parseFloat(project['Longitud']) || 0,
            'Descripcion': String(project['Descripcion'] || project['Descripción'] || '').trim()
        };
        
        // Validar coordenadas
        if (sanitized['Latitud'] === 0 && sanitized['Longitud'] === 0) {
            // Asignar coordenadas por defecto según país
            const defaultCoords = getDefaultCoordinates(sanitized['País']);
            sanitized['Latitud'] = defaultCoords.lat;
            sanitized['Longitud'] = defaultCoords.lng;
        }
        
        return sanitized;
    }
    
    // Función para obtener coordenadas por defecto según país
    function getDefaultCoordinates(country) {
        const countryCoords = {
            'Chile': { lat: -33.4489, lng: -70.6693 },
            'Perú': { lat: -12.0464, lng: -77.0428 },
            'Argentina': { lat: -34.6118, lng: -58.3960 },
            'Brasil': { lat: -15.8267, lng: -47.9218 },
            'Colombia': { lat: 4.7110, lng: -74.0721 },
            'México': { lat: 19.4326, lng: -99.1332 },
            'Ecuador': { lat: -0.1807, lng: -78.4678 },
            'Bolivia': { lat: -16.2902, lng: -63.5887 },
            'Venezuela': { lat: 10.4806, lng: -66.9036 },
            'Uruguay': { lat: -34.9011, lng: -56.1645 },
            'Paraguay': { lat: -25.2637, lng: -57.5759 }
        };
        
        return countryCoords[country] || { lat: -15.0, lng: -60.0 }; // Centro de Sudamérica por defecto
    }
    
    // Función para normalizar texto (sin tildes, minúsculas)
    function normalizeText(text) {
        if (!text) return '';
        
        return String(text)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remover tildes
            .replace(/[^\w\s]/g, ' ') // Reemplazar caracteres especiales con espacios
            .replace(/\s+/g, ' ') // Múltiples espacios a uno solo
            .trim();
    }
    
    // Función para formatear números
    function formatNumber(num, decimals = 0) {
        if (isNaN(num)) return '0';
        return parseFloat(num).toLocaleString('es-ES', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }
    
    // Función para formatear moneda
    function formatCurrency(amount, currency = 'USD') {
        return `${formatNumber(amount, 2)} MM ${currency}`;
    }
    
    // Función para generar ID único
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    
    // Función para validar coordenadas
    function isValidCoordinate(lat, lng) {
        return !isNaN(lat) && !isNaN(lng) && 
               lat >= -90 && lat <= 90 && 
               lng >= -180 && lng <= 180;
    }
    
    // Función para obtener fecha formateada
    function getFormattedDate(date = new Date()) {
        return date.toLocaleDateString('es-CL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
    
    // Función para obtener timestamp para archivos
    function getFileTimestamp() {
        const now = new Date();
        return now.toISOString().split('T')[0] + '_' + 
               now.toTimeString().split(' ')[0].replace(/:/g, '-');
    }
    
    // Función para mostrar notificaciones
    function showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-family: 'Segoe UI', sans-serif;
            font-weight: 600;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        
        // Colores según tipo
        const colors = {
            success: 'linear-gradient(45deg, #2ecc71, #27ae60)',
            error: 'linear-gradient(45deg, #e74c3c, #c0392b)',
            warning: 'linear-gradient(45deg, #f1c40f, #f39c12)',
            info: 'linear-gradient(45deg, #3498db, #2980b9)'
        };
        
        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;
        
        // Agregar animación CSS si no existe
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto-remover
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, duration);
    }
    
    // Función para debounce
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Exponer utilidades globalmente
    window.Utils = {
        sanitizeProject,
        getDefaultCoordinates,
        normalizeText,
        formatNumber,
        formatCurrency,
        generateId,
        isValidCoordinate,
        getFormattedDate,
        getFileTimestamp,
        showNotification,
        debounce
    };
    
    console.log('✅ Utilidades cargadas correctamente');
    
})();