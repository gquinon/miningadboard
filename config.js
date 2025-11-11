// Configuración global del sistema de Dashboard Minero
window.DashboardConfig = {
    // Configuración de datos
    data: {
        localStorageKey: 'proyectosData',
        jsonFile: 'proyectos.json',
        autoSave: true,
        autoSaveInterval: 300000 // 5 minutos
    },
    
    // Configuración de la aplicación
    app: {
        name: 'Dashboard Ejecutivo - Proyectos Mineros',
        version: '2.0.0',
        company: 'EECOL División Propuestas',
        maxProjectsDisplay: 50,
        debounceDelay: 300
    },
    
    // Configuración de mapas
    maps: {
        defaultCenter: [-38.4161, -63.6167],
        defaultZoom: 5,
        maxZoom: 18,
        minZoom: 3,
        tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    
    // Configuración de colores
    colors: {
        primary: '#0055A6',
        secondary: '#E60028',
        tertiary: '#003366',
        success: '#2ecc71',
        warning: '#f1c40f',
        error: '#e74c3c',
        info: '#1abc9c',
        etapas: {
            "Exploración": "#0055A6",
            "Desarrollo": "#E60028", 
            "Producción": "#2ecc71",
            "Construcción": "#9b59b6",
            "Factibilidad": "#1abc9c",
            "Prefactibilidad": "#f1c40f",
            "Evaluación": "#34495e",
            "Ingeniería de detalle": "#e67e22",
            "En construcción": "#9b59b6",
            "En espera de decisión de construcción": "#95a5a6",
            "Evaluación ambiental y social": "#27ae60",
            "Evaluación ambiental adicional": "#16a085",
            "Definición de alcance - Evaluación Económica Preliminar": "#8e44ad",
            "Exploración avanzada": "#2980b9",
            "Exploración inicial y descubrimiento": "#3498db",
            "Diseño básico e ingeniería": "#e74c3c",
            "Pre-construcción": "#d35400",
            "Licitación": "#c0392b",
            "Prospección y perforación": "#7f8c8d"
        }
    },
    
    // Configuración de filtros
    filters: {
        capexRanges: [
            { label: 'Menos de 100 MM', min: 0, max: 100 },
            { label: '100 - 500 MM', min: 100, max: 500 },
            { label: '500 - 1,000 MM', min: 500, max: 1000 },
            { label: '1,000 - 5,000 MM', min: 1000, max: 5000 },
            { label: 'Más de 5,000 MM', min: 5000, max: Infinity }
        ]
    },
    
    // Configuración de exportación
    export: {
        formats: ['excel', 'pdf', 'json'],
        includeCharts: true,
        includeStatistics: true,
        maxRowsPerSheet: 1000
    },
    
    // Configuración de notificaciones
    notifications: {
        duration: 3000,
        position: 'top-right',
        showProgress: true
    },
    
    // Configuración de autenticación
    auth: {
        adminUser: 'root',
        adminPassword: 'propuestaadmin',
        sessionTimeout: 3600000 // 1 hora
    },
    
    // Configuración de Firebase (Configuración real de producción)
    firebaseConfig: {
        apiKey: "AIzaSyC0sXqmd9YJQe9_IhUgO3SGLPnXk_U8RT4",
        authDomain: "miningadboard.firebaseapp.com",
        databaseURL: "https://miningadboard-default-rtdb.firebaseio.com",
        projectId: "miningadboard",
        storageBucket: "miningadboard.firebasestorage.app",
        messagingSenderId: "935000207773",
        appId: "1:935000207773:web:d62b439601d3482d443f74",
        measurementId: "G-JP9EJQ9KXD"
    },
    
    // URLs de los módulos
    urls: {
        dashboard: 'Dashboard Ejecutivo - Proyectos Mineros.html',
        admin: 'Panel-Admin-Nuevo.html',
        login: 'login-profesional.html'
    },
    
    // Configuración de rendimiento
    performance: {
        enableVirtualScrolling: true,
        chunkSize: 100,
        enableLazyLoading: true,
        cacheTimeout: 600000 // 10 minutos
    },
    
    // Configuración de desarrollo
    development: {
        enableDebug: false,
        enableConsoleLog: true,
        enablePerformanceMonitoring: false
    }
};

// Utilidades de configuración
window.DashboardConfig.utils = {
    // Obtener color por etapa
    getEtapaColor: function(etapa) {
        return this.colors.etapas[etapa] || this.colors.primary;
    },
    
    // Formatear números
    formatNumber: function(num, decimals = 0) {
        if (isNaN(num)) return '0';
        return parseFloat(num).toLocaleString('es-ES', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    },
    
    // Formatear moneda
    formatCurrency: function(amount, currency = 'USD') {
        return `${this.formatNumber(amount, 2)} MM ${currency}`;
    },
    
    // Generar ID único
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    },
    
    // Validar coordenadas
    isValidCoordinate: function(lat, lng) {
        return !isNaN(lat) && !isNaN(lng) && 
               lat >= -90 && lat <= 90 && 
               lng >= -180 && lng <= 180 &&
               lat !== 0 && lng !== 0;
    },
    
    // Obtener fecha formateada
    getFormattedDate: function(date = new Date()) {
        return date.toLocaleDateString('es-CL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },
    
    // Obtener timestamp para archivos
    getFileTimestamp: function() {
        const now = new Date();
        return now.toISOString().split('T')[0] + '_' + 
               now.toTimeString().split(' ')[0].replace(/:/g, '-');
    }
};

// Inicializar configuración
console.log('Dashboard Config loaded:', window.DashboardConfig.app.name, 'v' + window.DashboardConfig.app.version);