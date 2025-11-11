// Sistema de Operaciones Masivas - Dashboard Minero EECOL
console.log('📊 Sistema de Operaciones Masivas iniciado');

// Variables globales
let uploadedData = null;
let backupList = [];

// ==================== FUNCIÓN PRINCIPAL DE CARGA MASIVA ====================

async function massLoadFromExcel(file) {
    console.log('📊 Iniciando carga masiva desde Excel...');
    
    try {
        // Leer archivo Excel
        const data = await readExcelFile(file);
        
        if (!data || !data.data || data.data.length === 0) {
            throw new Error('No se encontraron datos en el archivo');
        }
        
        console.log(`📊 Datos leídos: ${data.data.length} proyectos`);
        
        // Crear backup antes de cargar
        if (window.dbManager) {
            const currentData = window.dbManager.getAllData();
            if (currentData && currentData.data && currentData.data.length > 0) {
                const backupName = `backup_before_mass_load_${new Date().toISOString().split('T')[0]}`;
                localStorage.setItem(backupName, JSON.stringify(currentData));
                console.log('💾 Backup creado:', backupName);
            }
        }
        
        // Guardar en localStorage
        const dataToSave = {
            columns: data.columns,
            data: data.data,
            metadata: {
                source: 'excel_mass_load',
                lastUpdate: new Date().toISOString(),
                totalRecords: data.data.length,
                version: '2.2.0'
            }
        };
        
        localStorage.setItem('minero_database', JSON.stringify(dataToSave));
        
        // Actualizar dbManager si existe
        if (window.dbManager) {
            window.dbManager.data = dataToSave;
        }
        
        // Guardar en Firebase si está disponible
        if (window.firebaseManager) {
            try {
                await window.firebaseManager.saveData(dataToSave);
                console.log('🔥 Datos guardados en Firebase');
            } catch (error) {
                console.warn('⚠️ No se pudo guardar en Firebase:', error);
            }
        }
        
        console.log('✅ Carga masiva completada exitosamente');
        return { success: true, count: data.data.length };
        
    } catch (error) {
        console.error('❌ Error en carga masiva:', error);
        throw error;
    }
}

// Alias para compatibilidad
async function cargarDatosDesdeExcel(file) {
    return await massLoadFromExcel(file);
}

// ==================== CARGA MASIVA ====================

function openMassUploadModal() {
    console.log('📊 Abriendo modal de carga masiva...');
    document.getElementById('massUploadModal').style.display = 'flex';
    
    // Configurar listener para el archivo
    const fileInput = document.getElementById('massUploadFile');
    fileInput.addEventListener('change', handleFileUpload);
}

function closeMassUploadModal() {
    document.getElementById('massUploadModal').style.display = 'none';
    document.getElementById('uploadPreview').style.display = 'none';
    document.getElementById('massUploadFile').value = '';
    document.getElementById('confirmMassUpload').disabled = true;
    uploadedData = null;
}

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log('📁 Procesando archivo:', file.name);
    
    try {
        const data = await readExcelFile(file);
        uploadedData = data;
        showUploadPreview(data);
        document.getElementById('confirmMassUpload').disabled = false;
        
    } catch (error) {
        console.error('❌ Error procesando archivo:', error);
        showNotification('Error procesando archivo: ' + error.message, true);
    }
}

function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Tomar la primera hoja
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                
                // Convertir a JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                if (jsonData.length < 2) {
                    throw new Error('El archivo debe tener al menos una fila de encabezados y una fila de datos');
                }
                
                // Procesar datos
                const headers = jsonData[0];
                const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== ''));
                
                const processedData = {
                    columns: headers,
                    data: rows.map(row => {
                        const obj = {};
                        headers.forEach((header, index) => {
                            obj[header] = row[index] || '';
                        });
                        return obj;
                    })
                };
                
                console.log(`📊 Archivo procesado: ${processedData.data.length} filas`);
                resolve(processedData);
                
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => reject(new Error('Error leyendo el archivo'));
        reader.readAsArrayBuffer(file);
    });
}

function showUploadPreview(data) {
    const previewDiv = document.getElementById('uploadPreview');
    const contentDiv = document.getElementById('previewContent');
    
    let html = `
        <div style="margin-bottom: 15px;">
            <strong>📊 Resumen:</strong> ${data.data.length} proyectos encontrados
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
            <thead>
                <tr style="background: var(--primary); color: white;">
    `;
    
    // Mostrar solo las primeras 5 columnas para el preview
    const previewColumns = data.columns.slice(0, 5);
    previewColumns.forEach(col => {
        html += `<th style="padding: 8px; border: 1px solid var(--line);">${col}</th>`;
    });
    
    if (data.columns.length > 5) {
        html += `<th style="padding: 8px; border: 1px solid var(--line);">... (+${data.columns.length - 5} más)</th>`;
    }
    
    html += `</tr></thead><tbody>`;
    
    // Mostrar solo las primeras 5 filas
    const previewRows = data.data.slice(0, 5);
    previewRows.forEach(row => {
        html += `<tr>`;
        previewColumns.forEach(col => {
            html += `<td style="padding: 8px; border: 1px solid var(--line);">${row[col] || ''}</td>`;
        });
        if (data.columns.length > 5) {
            html += `<td style="padding: 8px; border: 1px solid var(--line); color: var(--muted);">...</td>`;
        }
        html += `</tr>`;
    });
    
    if (data.data.length > 5) {
        html += `<tr><td colspan="${previewColumns.length + (data.columns.length > 5 ? 1 : 0)}" style="padding: 8px; text-align: center; color: var(--muted);">... y ${data.data.length - 5} filas más</td></tr>`;
    }
    
    html += `</tbody></table>`;
    
    contentDiv.innerHTML = html;
    previewDiv.style.display = 'block';
}

async function confirmMassUpload() {
    if (!uploadedData) {
        showNotification('No hay datos para cargar', true);
        return;
    }
    
    console.log('📊 Iniciando carga masiva...');
    
    try {
        // 1. Crear backup automático
        showNotification('Creando backup automático...', false);
        await createAutomaticBackup('antes-carga-masiva');
        
        // 2. Preparar datos para Firebase
        const firebaseData = prepareDataForFirebase(uploadedData);
        
        // 3. Subir a Firebase
        showNotification('Subiendo datos a Firebase...', false);
        const success = await uploadDataToFirebase(firebaseData);
        
        if (success) {
            showNotification(`✅ Carga masiva completada: ${uploadedData.data.length} proyectos`, false);
            closeMassUploadModal();
            
            // Recargar datos en el panel
            setTimeout(() => {
                if (typeof loadData === 'function') {
                    loadData();
                }
            }, 1000);
            
        } else {
            throw new Error('Error subiendo datos a Firebase');
        }
        
    } catch (error) {
        console.error('❌ Error en carga masiva:', error);
        showNotification('Error en carga masiva: ' + error.message, true);
    }
}

function prepareDataForFirebase(data) {
    // Usar firebaseManager para limpiar campos si está disponible
    if (window.firebaseManager && typeof window.firebaseManager.cleanFieldName === 'function') {
        console.log('📊 Usando Firebase Manager para limpiar campos...');
        
        const cleanColumns = data.columns.map(col => window.firebaseManager.cleanFieldName(col));
        const cleanData = data.data.map(row => window.firebaseManager.cleanRowData(row));
        
        return {
            columns: cleanColumns,
            data: cleanData,
            metadata: {
                lastUpdate: new Date().toISOString(),
                source: 'carga-masiva',
                originalColumns: data.columns,
                totalRecords: cleanData.length,
                version: '2.1.0'
            }
        };
    } else {
        // Fallback: limpiar manualmente
        console.log('📊 Limpiando campos manualmente...');
        
        const cleanColumns = data.columns.map(col => 
            col.replace(/[.#$\/\[\]()]/g, '_')
               .replace(/\s+/g, '_')
               .replace(/_+/g, '_')
               .replace(/^_|_$/g, '')
        );
        
        const cleanData = data.data.map(row => {
            const cleanRow = {};
            data.columns.forEach((originalCol, index) => {
                const cleanCol = cleanColumns[index];
                cleanRow[cleanCol] = row[originalCol];
            });
            return cleanRow;
        });
        
        return {
            columns: cleanColumns,
            data: cleanData,
            metadata: {
                lastUpdate: new Date().toISOString(),
                source: 'carga-masiva',
                originalColumns: data.columns,
                totalRecords: cleanData.length,
                version: '2.0.0'
            }
        };
    }
}

async function uploadDataToFirebase(data) {
    try {
        // Usar firebaseManager universal si está disponible
        if (window.firebaseManager && typeof window.firebaseManager.saveData === 'function') {
            console.log('📊 Usando Firebase Manager Universal...');
            return await window.firebaseManager.saveData(data);
        } else {
            // Fallback: usar fetch directo
            console.log('📊 Usando fetch directo como fallback...');
            const response = await fetch('https://dashboard-minero-eecol-default-rtdb.firebaseio.com/proyectos.json', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            return response.ok;
        }
    } catch (error) {
        console.error('Error subiendo a Firebase:', error);
        return false;
    }
}

// ==================== BORRADO MASIVO ====================

function openMassDeleteModal() {
    console.log('🗑️ Abriendo modal de borrado masivo...');
    document.getElementById('massDeleteModal').style.display = 'flex';
    
    // Configurar listeners para validación
    const confirmText = document.getElementById('deleteConfirmText');
    const adminPassword = document.getElementById('adminPasswordDelete');
    const confirmButton = document.getElementById('confirmMassDelete');
    
    function validateDelete() {
        const textValid = confirmText.value.trim() === 'BORRAR TODO';
        const passwordValid = adminPassword.value.trim() !== '';
        confirmButton.disabled = !(textValid && passwordValid);
    }
    
    confirmText.addEventListener('input', validateDelete);
    adminPassword.addEventListener('input', validateDelete);
}

function closeMassDeleteModal() {
    document.getElementById('massDeleteModal').style.display = 'none';
    document.getElementById('deleteConfirmText').value = '';
    document.getElementById('adminPasswordDelete').value = '';
    document.getElementById('confirmMassDelete').disabled = true;
}

async function confirmMassDelete() {
    const confirmText = document.getElementById('deleteConfirmText').value.trim();
    const adminPassword = document.getElementById('adminPasswordDelete').value.trim();
    
    if (confirmText !== 'BORRAR TODO') {
        showNotification('Debe escribir exactamente "BORRAR TODO"', true);
        return;
    }
    
    // Validar contraseña de admin (usar las mismas credenciales del sistema)
    const validPasswords = ['propuestaadmin', 'admin123']; // Agregar más según necesidad
    if (!validPasswords.includes(adminPassword)) {
        showNotification('Contraseña de administrador incorrecta', true);
        return;
    }
    
    console.log('🗑️ Iniciando borrado masivo...');
    
    try {
        // 1. Crear backup automático
        showNotification('Creando backup de seguridad...', false);
        await createAutomaticBackup('antes-borrado-masivo');
        
        // 2. Borrar datos de Firebase
        showNotification('Borrando datos de Firebase...', false);
        const success = await deleteAllDataFromFirebase();
        
        if (success) {
            showNotification('✅ Borrado masivo completado. Backup creado automáticamente.', false);
            closeMassDeleteModal();
            
            // Recargar datos en el panel
            setTimeout(() => {
                if (typeof loadData === 'function') {
                    loadData();
                }
            }, 1000);
            
        } else {
            throw new Error('Error borrando datos de Firebase');
        }
        
    } catch (error) {
        console.error('❌ Error en borrado masivo:', error);
        showNotification('Error en borrado masivo: ' + error.message, true);
    }
}

async function deleteAllDataFromFirebase() {
    try {
        const response = await fetch('https://dashboard-minero-eecol-default-rtdb.firebaseio.com/proyectos.json', {
            method: 'DELETE'
        });
        
        return response.ok;
    } catch (error) {
        console.error('Error borrando de Firebase:', error);
        return false;
    }
}

// ==================== GESTIÓN DE BACKUPS ====================

function openBackupManager() {
    console.log('📂 Abriendo gestor de backups...');
    document.getElementById('backupManagerModal').style.display = 'flex';
    refreshBackupList();
}

function closeBackupManagerModal() {
    document.getElementById('backupManagerModal').style.display = 'none';
}

async function createBackup() {
    console.log('💾 Creando backup manual...');
    showNotification('Creando backup...', false);
    
    try {
        const success = await createManualBackup();
        if (success) {
            showNotification('✅ Backup creado exitosamente', false);
        } else {
            throw new Error('Error creando backup');
        }
    } catch (error) {
        console.error('❌ Error creando backup:', error);
        showNotification('Error creando backup: ' + error.message, true);
    }
}

async function createManualBackup() {
    return await createAutomaticBackup('manual');
}

async function createAutomaticBackup(type = 'automatico') {
    try {
        // Obtener datos actuales de Firebase
        const response = await fetch('https://dashboard-minero-eecol-default-rtdb.firebaseio.com/proyectos.json');
        const data = await response.json();
        
        if (!data) {
            console.log('No hay datos para respaldar');
            return true;
        }
        
        // Crear backup
        const backup = {
            timestamp: new Date().toISOString(),
            type: type,
            data: data,
            metadata: {
                createdAt: new Date().toISOString(),
                recordCount: data.data ? data.data.length : 0,
                version: data.metadata?.version || '1.0.0'
            }
        };
        
        // Guardar en localStorage
        const backupKey = `backup_${Date.now()}_${type}`;
        localStorage.setItem(backupKey, JSON.stringify(backup));
        
        // Actualizar lista de backups
        updateBackupsList();
        
        console.log(`💾 Backup creado: ${backupKey}`);
        return true;
        
    } catch (error) {
        console.error('Error creando backup:', error);
        return false;
    }
}

function updateBackupsList() {
    backupList = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('backup_')) {
            try {
                const backup = JSON.parse(localStorage.getItem(key));
                backupList.push({ key, ...backup });
            } catch (error) {
                console.error('Error leyendo backup:', key, error);
            }
        }
    }
    
    // Ordenar por fecha (más reciente primero)
    backupList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function refreshBackupList() {
    updateBackupsList();
    displayBackupList();
}

function displayBackupList() {
    const listDiv = document.getElementById('backupList');
    
    if (backupList.length === 0) {
        listDiv.innerHTML = `
            <p style="text-align: center; color: var(--muted); padding: 20px;">
                <i class="fas fa-inbox"></i> No hay backups disponibles
            </p>
        `;
        return;
    }
    
    let html = `
        <div style="margin-bottom: 15px;">
            <strong>📂 Backups disponibles (${backupList.length}):</strong>
        </div>
        <div style="max-height: 400px; overflow-y: auto;">
    `;
    
    backupList.forEach(backup => {
        const date = new Date(backup.timestamp).toLocaleString('es-ES');
        const size = backup.metadata?.recordCount || 0;
        
        html += `
            <div style="background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong style="color: var(--brand);">${backup.type.toUpperCase()}</strong>
                        <div style="color: var(--muted); font-size: 0.9rem; margin-top: 5px;">
                            📅 ${date} | 📊 ${size} proyectos
                        </div>
                    </div>
                    <div>
                        <button class="btn" onclick="restoreBackup('${backup.key}')" style="background: var(--success); color: white; margin-right: 5px;">
                            <i class="fas fa-undo"></i> Restaurar
                        </button>
                        <button class="btn" onclick="downloadBackup('${backup.key}')" style="background: var(--info); color: white; margin-right: 5px;">
                            <i class="fas fa-download"></i> Descargar
                        </button>
                        <button class="btn" onclick="deleteBackup('${backup.key}')" style="background: var(--danger); color: white;">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    listDiv.innerHTML = html;
}

async function restoreBackup(backupKey) {
    if (!confirm('¿Está seguro de restaurar este backup? Los datos actuales se perderán.')) {
        return;
    }
    
    console.log('🔄 Restaurando backup:', backupKey);
    showNotification('Restaurando backup...', false);
    
    try {
        const backup = JSON.parse(localStorage.getItem(backupKey));
        if (!backup || !backup.data) {
            throw new Error('Backup no válido');
        }
        
        // Crear backup de los datos actuales antes de restaurar
        await createAutomaticBackup('antes-restauracion');
        
        // Restaurar datos en Firebase
        const success = await uploadDataToFirebase(backup.data);
        
        if (success) {
            showNotification('✅ Backup restaurado exitosamente', false);
            closeBackupManagerModal();
            
            // Recargar datos
            setTimeout(() => {
                if (typeof loadData === 'function') {
                    loadData();
                }
            }, 1000);
            
        } else {
            throw new Error('Error subiendo datos restaurados');
        }
        
    } catch (error) {
        console.error('❌ Error restaurando backup:', error);
        showNotification('Error restaurando backup: ' + error.message, true);
    }
}

function downloadBackup(backupKey) {
    try {
        const backup = localStorage.getItem(backupKey);
        const blob = new Blob([backup], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${backupKey}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('✅ Backup descargado', false);
        
    } catch (error) {
        console.error('Error descargando backup:', error);
        showNotification('Error descargando backup', true);
    }
}

function deleteBackup(backupKey) {
    if (!confirm('¿Está seguro de eliminar este backup?')) {
        return;
    }
    
    try {
        localStorage.removeItem(backupKey);
        refreshBackupList();
        showNotification('✅ Backup eliminado', false);
        
    } catch (error) {
        console.error('Error eliminando backup:', error);
        showNotification('Error eliminando backup', true);
    }
}

// ==================== UTILIDADES ====================

function showNotification(message, isError = false) {
    // Usar la función de notificación existente si está disponible
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, isError);
        return;
    }
    
    // Fallback: mostrar en consola y alert
    console.log(isError ? '❌' : '✅', message);
    if (isError) {
        alert('Error: ' + message);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Sistema de Operaciones Masivas listo');
    
    // Crear backup inicial si no existe
    setTimeout(() => {
        updateBackupsList();
        if (backupList.length === 0) {
            createAutomaticBackup('inicial');
        }
    }, 2000);
});

console.log('📊 mass-operations.js cargado correctamente');