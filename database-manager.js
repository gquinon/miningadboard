// Sistema de gestión de base de datos persistente para Dashboard Minero
class DatabaseManager {
    constructor() {
        this.DB_KEY = 'minero_database';
        this.BACKUP_KEY = 'minero_database_backup';
        this.CONFIG_KEY = 'minero_database_config';
        this.data = {
            columns: [],
            data: [],
            metadata: {
                lastUpdate: null,
                totalRecords: 0,
                version: '1.0.0',
                source: 'manual'
            }
        };
        
        // Cargar datos al inicializar
        this.loadDatabase();
    }
    
    // Cargar base de datos (Firebase primero, localStorage como fallback)
    async loadDatabase() {
        try {
            // Intentar cargar desde Firebase primero
            if (window.firebaseManager) {
                try {
                    const firebaseData = await window.firebaseManager.getAllData();
                    if (firebaseData && firebaseData.data && firebaseData.data.length > 0) {
                        this.data = {
                            ...this.data,
                            ...firebaseData
                        };
                        console.log('🔥 Base de datos cargada desde Firebase:', this.data.metadata);
                        
                        // Sincronizar con localStorage
                        localStorage.setItem(this.DB_KEY, JSON.stringify(this.data));
                        return true;
                    }
                } catch (error) {
                    console.warn('⚠️ Error cargando desde Firebase, intentando localStorage:', error.message);
                }
            }
            
            // Fallback a localStorage
            const stored = localStorage.getItem(this.DB_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.data = {
                    ...this.data,
                    ...parsed
                };
                console.log('💾 Base de datos cargada desde localStorage:', this.data.metadata);
                return true;
            } else {
                console.log('📝 No hay datos locales - base de datos vacía');
                this.data = {
                    columns: [],
                    data: [],
                    metadata: {
                        lastUpdate: null,
                        totalRecords: 0,
                        version: '1.0.0',
                        source: 'empty'
                    }
                };
                return false;
            }
        } catch (error) {
            console.error('❌ Error cargando base de datos:', error);
            this.loadBackup();
            return false;
        }
    }
    
    // Guardar base de datos (Firebase + localStorage como backup)
    async saveDatabase() {
        try {
            // Crear backup antes de guardar
            this.createBackup();
            
            // Actualizar metadata
            this.data.metadata.lastUpdate = new Date().toISOString();
            this.data.metadata.totalRecords = this.data.data.length;
            
            // Guardar en Firebase primero
            if (window.firebaseManager) {
                try {
                    const firebaseSuccess = await window.firebaseManager.saveData(this.data);
                    if (firebaseSuccess) {
                        console.log('🔥 Datos guardados en Firebase');
                        this.data.metadata.source = 'firebase';
                    } else {
                        console.warn('⚠️ Error guardando en Firebase, usando localStorage');
                        this.data.metadata.source = 'localStorage_fallback';
                    }
                } catch (error) {
                    console.warn('⚠️ Firebase no disponible, usando localStorage:', error.message);
                    this.data.metadata.source = 'localStorage_only';
                }
            } else {
                this.data.metadata.source = 'localStorage_only';
            }
            
            // Guardar en localStorage como backup
            const serialized = JSON.stringify(this.data);
            localStorage.setItem(this.DB_KEY, serialized);
            
            console.log('✅ Base de datos guardada:', this.data.metadata);
            
            // Notificar a otras pestañas
            this.broadcastUpdate();
            
            return true;
        } catch (error) {
            console.error('❌ Error guardando base de datos:', error);
            return false;
        }
    }
    
    // Crear backup de seguridad
    createBackup() {
        try {
            const backup = {
                data: this.data,
                timestamp: new Date().toISOString(),
                version: this.data.metadata.version
            };
            localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backup));
            console.log('💾 Backup creado');
        } catch (error) {
            console.error('❌ Error creando backup:', error);
        }
    }
    
    // Cargar backup
    loadBackup() {
        try {
            const backup = localStorage.getItem(this.BACKUP_KEY);
            if (backup) {
                const parsed = JSON.parse(backup);
                this.data = parsed.data;
                console.log('🔄 Backup restaurado');
                return true;
            }
        } catch (error) {
            console.error('❌ Error cargando backup:', error);
        }
        return false;
    }
    
    // Inicializar con datos por defecto
    initializeWithDefaults() {
        this.data = {
            columns: [
                "Nombre del proyecto",
                "Sector", 
                "Área",
                "País",
                "Etapa",
                "Compañías relacionadas",
                "Capex (US$ mn)",
                "Tipo de proyecto",
                "Productos y Servicios",
                "Estado",
                "Latitud",
                "Longitud",
                "Descripcion"
            ],
            data: [
                {
                    "Nombre del proyecto": "Mina Los Andes",
                    "Sector": "Cobre",
                    "Área": "Región de Antofagasta",
                    "País": "Chile",
                    "Etapa": "Producción",
                    "Compañías relacionadas": "CODELCO, BHP Billiton",
                    "Capex (US$ mn)": 2500,
                    "Tipo de proyecto": "Expansión",
                    "Productos y Servicios": "Extracción de cobre, Procesamiento de minerales",
                    "Estado": "Activo",
                    "Latitud": -24.5,
                    "Longitud": -69.25,
                    "Descripcion": "Proyecto de expansión de mina de cobre con tecnología de punta"
                },
                {
                    "Nombre del proyecto": "Complejo Litio Atacama",
                    "Sector": "Litio",
                    "Área": "Salar de Atacama",
                    "País": "Chile",
                    "Etapa": "Producción",
                    "Compañías relacionadas": "SQM, Albemarle",
                    "Capex (US$ mn)": 3200,
                    "Tipo de proyecto": "Expansión de capacidad",
                    "Productos y Servicios": "Extracción de litio, Procesamiento de salmueras",
                    "Estado": "Activo",
                    "Latitud": -23.8,
                    "Longitud": -68.2,
                    "Descripcion": "Expansión del complejo de extracción de litio más grande de Chile"
                }
            ],
            metadata: {
                lastUpdate: new Date().toISOString(),
                totalRecords: 2,
                version: '1.0.0',
                source: 'default'
            }
        };
        
        this.saveDatabase();
    }
    
    // Cargar datos desde archivo Excel
    async loadFromExcel(file) {
        return new Promise((resolve, reject) => {
            // Verificar que XLSX esté disponible
            if (typeof XLSX === 'undefined') {
                reject(new Error('Librería XLSX no está cargada. Asegúrate de incluir xlsx.full.min.js'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    if (jsonData.length === 0) {
                        reject(new Error('El archivo Excel está vacío'));
                        return;
                    }
                    
                    // Primera fila son las columnas
                    const columns = jsonData[0];
                    const rows = jsonData.slice(1);
                    
                    // Convertir filas a objetos
                    const dataObjects = rows.map(row => {
                        const obj = {};
                        columns.forEach((col, index) => {
                            obj[col] = row[index] || '';
                        });
                        return obj;
                    });
                    
                    // Actualizar base de datos
                    this.data.columns = columns;
                    this.data.data = dataObjects;
                    this.data.metadata.source = 'excel';
                    this.data.metadata.filename = file.name;
                    
                    // Guardar automáticamente
                    this.saveDatabase();
                    
                    console.log(`✅ Excel cargado: ${dataObjects.length} registros`);
                    resolve({
                        columns: columns,
                        data: dataObjects,
                        count: dataObjects.length
                    });
                    
                } catch (error) {
                    console.error('❌ Error procesando Excel:', error);
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Error leyendo el archivo'));
            };
            
            reader.readAsArrayBuffer(file);
        });
    }
    
    // Obtener todos los datos
    getAllData() {
        return {
            columns: this.data.columns,
            data: this.data.data,
            metadata: this.data.metadata
        };
    }
    
    // Agregar nuevo registro
    addRecord(record) {
        this.data.data.push(record);
        this.saveDatabase();
        return this.data.data.length - 1;
    }
    
    // Actualizar registro
    updateRecord(index, record) {
        if (index >= 0 && index < this.data.data.length) {
            this.data.data[index] = record;
            this.saveDatabase();
            return true;
        }
        return false;
    }
    
    // Eliminar registro
    deleteRecord(index) {
        if (index >= 0 && index < this.data.data.length) {
            this.data.data.splice(index, 1);
            this.saveDatabase();
            return true;
        }
        return false;
    }
    
    // Limpiar toda la base de datos
    clearDatabase() {
        this.data.data = [];
        this.data.metadata.source = 'manual';
        this.saveDatabase();
    }
    
    // Exportar a JSON
    exportToJSON() {
        return JSON.stringify(this.data, null, 2);
    }
    
    // Importar desde JSON
    importFromJSON(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.data = {
                ...this.data,
                ...imported
            };
            this.saveDatabase();
            return true;
        } catch (error) {
            console.error('❌ Error importando JSON:', error);
            return false;
        }
    }
    
    // Obtener estadísticas
    getStats() {
        const data = this.data.data;
        const stats = {
            totalProjects: data.length,
            totalCapex: 0,
            sectors: {},
            countries: {},
            stages: {},
            lastUpdate: this.data.metadata.lastUpdate
        };
        
        data.forEach(project => {
            // CAPEX total - soportar ambos formatos de campo
            const capex = parseFloat(project['Capex (US$ mn)'] || project['Capex_US_mn'] || 0) || 0;
            stats.totalCapex += capex;
            
            // Sectores
            const sector = project.Sector || 'Sin definir';
            stats.sectors[sector] = (stats.sectors[sector] || 0) + 1;
            
            // Países
            const country = project.País || 'Sin definir';
            stats.countries[country] = (stats.countries[country] || 0) + 1;
            
            // Etapas
            const stage = project.Etapa || 'Sin definir';
            stats.stages[stage] = (stats.stages[stage] || 0) + 1;
        });
        
        return stats;
    }
    
    // Notificar cambios a otras pestañas
    broadcastUpdate() {
        const event = new CustomEvent('databaseUpdate', {
            detail: {
                timestamp: Date.now(),
                metadata: this.data.metadata
            }
        });
        window.dispatchEvent(event);
        
        // También usar localStorage para comunicación entre pestañas
        localStorage.setItem('db_broadcast', JSON.stringify({
            action: 'update',
            timestamp: Date.now(),
            metadata: this.data.metadata
        }));
    }
    
    // Escuchar cambios de otras pestañas
    setupUpdateListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'db_broadcast') {
                console.log('🔄 Cambio de base de datos detectado en otra pestaña');
                this.loadDatabase();
                
                // Disparar evento local
                const event = new CustomEvent('databaseUpdate', {
                    detail: JSON.parse(e.newValue)
                });
                window.dispatchEvent(event);
            }
        });
        
        console.log('👂 Listener de base de datos configurado');
    }
    
    // Alias para compatibilidad con diagnósticos
    saveData(data, columns = null) {
        if (data && Array.isArray(data)) {
            this.data.data = data;
            if (columns) {
                this.data.columns = columns;
            }
            this.saveDatabase();
            return true;
        }
        return false;
    }
    
    clearData() {
        return this.clearDatabase();
    }
}

// Crear instancia global
window.dbManager = new DatabaseManager();

// Configurar listener al cargar
document.addEventListener('DOMContentLoaded', () => {
    window.dbManager.setupUpdateListener();
});

console.log('🗄️ Database Manager cargado');