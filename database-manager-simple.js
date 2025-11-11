// Database Manager Simplificado - Solo Firebase + proyectos.json
// Sin localStorage para evitar problemas de sincronización

class DatabaseManager {
    constructor() {
        this.data = {
            columns: [],
            data: [],
            metadata: {
                lastUpdate: null,
                totalRecords: 0,
                version: '2.0.0',
                source: 'none'
            }
        };
        
        console.log('🗄️ Database Manager Simple iniciando...');
        this.loadDatabase();
    }
    
    // Cargar base de datos (Firebase primero, luego proyectos.json)
    async loadDatabase() {
        try {
            console.log('📊 Cargando base de datos...');
            
            // 1. Intentar cargar desde Firebase
            if (window.firebaseManager) {
                try {
                    const firebaseData = await window.firebaseManager.getAllData();
                    if (firebaseData && firebaseData.data && firebaseData.data.length > 0) {
                        this.data = {
                            columns: firebaseData.columns || [],
                            data: firebaseData.data || [],
                            metadata: {
                                ...firebaseData.metadata,
                                source: 'firebase',
                                lastUpdate: new Date().toISOString()
                            }
                        };
                        console.log(`🔥 ✅ Datos cargados desde Firebase: ${this.data.data.length} proyectos`);
                        return true;
                    }
                } catch (error) {
                    console.warn('⚠️ Error cargando desde Firebase:', error.message);
                }
            }
            
            // 2. Fallback a proyectos.json
            console.log('📄 Cargando desde proyectos.json...');
            const response = await fetch('proyectos.json');
            if (response.ok) {
                const jsonData = await response.json();
                if (jsonData && jsonData.data && jsonData.data.length > 0) {
                    this.data = {
                        columns: jsonData.columns || [],
                        data: jsonData.data || [],
                        metadata: {
                            source: 'proyectos.json',
                            lastUpdate: new Date().toISOString(),
                            totalRecords: jsonData.data.length,
                            version: '2.0.0'
                        }
                    };
                    console.log(`📄 ✅ Datos cargados desde proyectos.json: ${this.data.data.length} proyectos`);
                    return true;
                }
            }
            
            // 3. Si todo falla, datos vacíos
            console.warn('⚠️ No se pudieron cargar datos, usando estructura vacía');
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
                data: [],
                metadata: {
                    source: 'empty',
                    lastUpdate: new Date().toISOString(),
                    totalRecords: 0,
                    version: '2.0.0'
                }
            };
            return false;
            
        } catch (error) {
            console.error('❌ Error cargando base de datos:', error);
            return false;
        }
    }
    
    // Guardar base de datos (solo Firebase)
    async saveDatabase() {
        try {
            // Actualizar metadata
            this.data.metadata.lastUpdate = new Date().toISOString();
            this.data.metadata.totalRecords = this.data.data.length;
            
            // Guardar en Firebase
            if (window.firebaseManager) {
                const success = await window.firebaseManager.saveData(this.data);
                if (success) {
                    console.log('🔥 ✅ Datos guardados en Firebase');
                    this.data.metadata.source = 'firebase';
                    return true;
                } else {
                    console.error('❌ Error guardando en Firebase');
                    return false;
                }
            } else {
                console.warn('⚠️ Firebase Manager no disponible');
                return false;
            }
            
        } catch (error) {
            console.error('❌ Error guardando base de datos:', error);
            return false;
        }
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
    async addRecord(record) {
        this.data.data.push(record);
        await this.saveDatabase();
        return this.data.data.length - 1;
    }
    
    // Actualizar registro
    async updateRecord(index, record) {
        if (index >= 0 && index < this.data.data.length) {
            this.data.data[index] = record;
            await this.saveDatabase();
            return true;
        }
        return false;
    }
    
    // Eliminar registro
    async deleteRecord(index) {
        if (index >= 0 && index < this.data.data.length) {
            this.data.data.splice(index, 1);
            await this.saveDatabase();
            return true;
        }
        return false;
    }
    
    // Limpiar toda la base de datos
    async clearDatabase() {
        this.data.data = [];
        this.data.metadata.source = 'manual';
        await this.saveDatabase();
    }
    
    // Cargar datos desde archivo Excel
    async loadFromExcel(file) {
        return new Promise((resolve, reject) => {
            if (typeof XLSX === 'undefined') {
                reject(new Error('Librería XLSX no está cargada'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = async (e) => {
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
                    const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== ''));
                    
                    // Convertir filas a objetos
                    const dataObjects = rows.map(row => {
                        const obj = {};
                        columns.forEach((col, index) => {
                            obj[col] = row[index] !== undefined ? row[index] : '';
                        });
                        return obj;
                    });
                    
                    // Actualizar base de datos
                    this.data.columns = columns;
                    this.data.data = dataObjects;
                    this.data.metadata.source = 'excel';
                    this.data.metadata.filename = file.name;
                    
                    // Guardar automáticamente
                    await this.saveDatabase();
                    
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
            
            reader.onerror = () => reject(new Error('Error leyendo el archivo'));
            reader.readAsArrayBuffer(file);
        });
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
            // CAPEX total - soportar múltiples formatos
            let capex = 0;
            const capexFormats = [
                'Capex (US$ mn)',
                'Capex_US_mn',
                'Capex_US$_mn',
                'CapexUSmn',
                'CAPEX',
                'Capex'
            ];
            
            for (const format of capexFormats) {
                if (project[format] !== undefined && project[format] !== null && project[format] !== '') {
                    const value = parseFloat(project[format]);
                    if (!isNaN(value) && value > 0) {
                        capex = value;
                        break;
                    }
                }
            }
            
            stats.totalCapex += capex;
            
            // Sectores
            const sector = project.Sector || project.Sector || 'Sin definir';
            stats.sectors[sector] = (stats.sectors[sector] || 0) + 1;
            
            // Países
            const country = project.País || project.Pais || 'Sin definir';
            stats.countries[country] = (stats.countries[country] || 0) + 1;
            
            // Etapas
            const stage = project.Etapa || project.Etapa || 'Sin definir';
            stats.stages[stage] = (stats.stages[stage] || 0) + 1;
        });
        
        return stats;
    }
    
    // Exportar a JSON
    exportToJSON() {
        return JSON.stringify(this.data, null, 2);
    }
    
    // Importar desde JSON
    async importFromJSON(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.data = {
                columns: imported.columns || this.data.columns,
                data: imported.data || [],
                metadata: {
                    ...this.data.metadata,
                    ...imported.metadata,
                    lastUpdate: new Date().toISOString()
                }
            };
            await this.saveDatabase();
            return true;
        } catch (error) {
            console.error('❌ Error importando JSON:', error);
            return false;
        }
    }
    
    // Recargar datos desde la fuente
    async reload() {
        console.log('🔄 Recargando datos...');
        return await this.loadDatabase();
    }
}

// Crear instancia global
window.dbManager = new DatabaseManager();

console.log('🗄️ Database Manager Simple cargado');
