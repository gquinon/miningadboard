// Firebase Manager Universal - Funciona en todas las páginas
console.log('🔥 Firebase Manager Universal iniciando...');

// Configuración de Firebase - Usar config.js si está disponible, sino usar config local
const firebaseConfig = (window.DashboardConfig && window.DashboardConfig.firebaseConfig) ? 
    window.DashboardConfig.firebaseConfig : 
    {
        apiKey: "AIzaSyCQ-tC69mIahz20GvSLaakldEFriKj8mVo",
        authDomain: "dashboard-minero-eecol.firebaseapp.com",
        databaseURL: "https://dashboard-minero-eecol-default-rtdb.firebaseio.com",
        projectId: "dashboard-minero-eecol",
        storageBucket: "dashboard-minero-eecol.firebasestorage.app",
        messagingSenderId: "397086762057",
        appId: "1:397086762057:web:b0cf20b5ad771bc05bcb98"
    };

// Hacer firebaseConfig disponible globalmente
window.firebaseConfig = firebaseConfig;
console.log('🔥 Firebase Config:', firebaseConfig.projectId);

// Clase Firebase Manager Universal
class FirebaseManager {
    constructor() {
        this.config = firebaseConfig;
        this.baseURL = firebaseConfig.databaseURL;
        console.log('🔥 FirebaseManager inicializado');
    }
    
    // Limpiar nombres de campos para Firebase
    cleanFieldName(fieldName) {
        if (!fieldName) return 'campo_sin_nombre';
        return fieldName
            .replace(/\s+/g, '_')
            .replace(/[.$#\[\]\/]/g, '_')
            .replace(/[()]/g, '')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
    }
    
    // Limpiar datos de una fila
    cleanRowData(row) {
        const cleanRow = {};
        for (const [key, value] of Object.entries(row)) {
            const cleanKey = this.cleanFieldName(key);
            cleanRow[cleanKey] = value;
        }
        return cleanRow;
    }

    // Guardar datos en Firebase
    async saveData(data) {
        try {
            console.log('🔥 Guardando datos en Firebase...', data);
            
            // Limpiar nombres de campos para Firebase
            const cleanData = {
                columns: data.columns ? data.columns.map(col => this.cleanFieldName(col)) : [],
                data: data.data ? data.data.map(row => this.cleanRowData(row)) : [],
                metadata: {
                    ...data.metadata,
                    lastUpdate: new Date().toISOString(),
                    source: 'firebase',
                    originalColumns: data.columns,
                    totalRecords: data.data ? data.data.length : 0,
                    version: '2.2.0'
                }
            };
            
            console.log('🔥 Datos limpiados para Firebase:', {
                columns: cleanData.columns.length,
                records: cleanData.data.length,
                metadata: cleanData.metadata
            });
            
            // Usar fetch para guardar
            const response = await fetch(`${this.baseURL}/proyectos.json`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cleanData)
            });
            
            if (response.ok) {
                console.log('🔥 ✅ Datos guardados exitosamente en Firebase');
                return true;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
        } catch (error) {
            console.error('🔥 ❌ Error guardando en Firebase:', error);
            return false;
        }
    }
    
    // Obtener todos los datos de Firebase
    async getAllData() {
        try {
            console.log('🔥 Obteniendo datos de Firebase...');
            
            const response = await fetch(`${this.baseURL}/proyectos.json`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('🔥 ✅ Datos obtenidos de Firebase:', data ? 'OK' : 'NULL');
                
                if (data && data.data) {
                    console.log(`🔥 📊 ${data.data.length} proyectos en Firebase`);
                }
                
                return data;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
        } catch (error) {
            console.error('🔥 ❌ Error obteniendo datos de Firebase:', error);
            return null;
        }
    }
    
    // Crear backup antes de operaciones críticas
    async createBackup(type = 'auto') {
        try {
            const data = await this.getAllData();
            if (data) {
                const backup = {
                    timestamp: new Date().toISOString(),
                    type: type,
                    data: data
                };
                
                const backupKey = `firebase_backup_${Date.now()}_${type}`;
                localStorage.setItem(backupKey, JSON.stringify(backup));
                console.log('🔥 💾 Backup creado:', backupKey);
                return backupKey;
            }
        } catch (error) {
            console.error('🔥 ❌ Error creando backup:', error);
        }
        return null;
    }
    
    // Borrar todos los datos (con backup automático)
    async deleteAllData() {
        try {
            // Crear backup antes de borrar
            await this.createBackup('before_delete');
            
            const response = await fetch(`${this.baseURL}/proyectos.json`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                console.log('🔥 ✅ Todos los datos borrados de Firebase');
                return true;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
        } catch (error) {
            console.error('🔥 ❌ Error borrando datos:', error);
            return false;
        }
    }
    
    // Verificar conexión con Firebase
    async testConnection() {
        try {
            const response = await fetch(`${this.baseURL}/.json`);
            return response.ok;
        } catch (error) {
            console.error('🔥 ❌ Error de conexión:', error);
            return false;
        }
    }
}

// Inicializar Firebase Manager Universal
(async function initFirebaseManagerUniversal() {
    try {
        // Verificar si Firebase ya está inicializado
        if (window.firebaseManager) {
            console.log('🔥 Firebase Manager ya existe, usando el existente');
            return;
        }

        // Crear instancia del manager
        window.firebaseManager = new FirebaseManager();
        
        console.log('🔥 ✅ Firebase Manager Universal inicializado');
        
        // Probar conexión
        const connected = await window.firebaseManager.testConnection();
        console.log('🔥 🌐 Conexión Firebase:', connected ? 'OK' : 'ERROR');
        
    } catch (error) {
        console.error('🔥 ❌ Error inicializando Firebase Manager Universal:', error);
        window.firebaseManager = null;
    }
})();

console.log('🔥 Firebase Manager Universal listo');
