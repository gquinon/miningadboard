// Firebase Ultra Simple - Solución que FUNCIONA
console.log('🚀 Firebase Ultra Simple iniciando...');

// Función que se ejecuta automáticamente
(async function() {
    console.log('🚀 Auto-cargando datos de Firebase...');
    
    try {
        // Cargar datos directamente
        const response = await fetch('https://dashboard-minero-eecol-default-rtdb.firebaseio.com/proyectos.json', {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🚀 Datos obtenidos:', data ? 'OK' : 'NULL');
        
        if (data && data.data && data.data.length > 0) {
            console.log(`🚀 ✅ ${data.data.length} proyectos encontrados`);
            
            // Procesar y asignar directamente
            window.projects = data.data.map(p => ({
                name: p.Nombre_del_proyecto || p['Nombre del proyecto'] || 'Sin nombre',
                sector: p.Sector || 'Sin sector',
                area: p.Área || p.Area || 'Sin área',
                país: p.País || p.Pais || 'Sin país',
                etapa: p.Etapa || 'Sin etapa',
                companias: (p.Compañías_relacionadas || p['Compañías relacionadas'] || '').split(',').slice(0, 3),
                capex: parseFloat(p.Capex_US_mn || p['Capex (US$ mn)'] || 0) || 0,
                tipo: p.Tipo_de_proyecto || p['Tipo de proyecto'] || 'Sin tipo',
                productos: p.Productos_y_Servicios || p['Productos y Servicios'] || 'Sin productos',
                estado: p.Estado || 'Sin estado',
                coordinates: [parseFloat(p.Latitud || 0) || 0, parseFloat(p.Longitud || 0) || 0],
                descripcion: p.Descripcion || p.Descripción || ''
            }));
            
            console.log(`🚀 ✅ ${window.projects.length} proyectos procesados`);
            
            // Actualizar interfaz completa
            setTimeout(() => {
                try {
                    console.log('🚀 Iniciando actualización completa de interfaz...');
                    
                    // Sincronizar con variable global del dashboard
                    if (typeof window.projects !== 'undefined') {
                        window.projects = window.projects; // Ya está asignado arriba
                    }
                    
                    // Actualizar KPIs directamente
                    const totalEl = document.getElementById('total-projects');
                    const capexEl = document.getElementById('total-capex');
                    const activeEl = document.getElementById('active-projects');
                    
                    if (totalEl) totalEl.textContent = window.projects.length;
                    if (capexEl) capexEl.textContent = Math.round(window.projects.reduce((sum, p) => sum + p.capex, 0));
                    if (activeEl) activeEl.textContent = window.projects.filter(p => p.estado === 'Activo').length;
                    
                    console.log('🚀 ✅ KPIs actualizados');
                    
                    // Usar función de sincronización si está disponible
                    if (typeof window.syncFirebaseData === 'function') {
                        console.log('🚀 Usando syncFirebaseData...');
                        window.syncFirebaseData();
                    } else if (typeof window.updateAllInterface === 'function') {
                        console.log('🚀 Usando updateAllInterface...');
                        window.updateAllInterface();
                    } else {
                        // Actualizar funciones individuales
                        console.log('🚀 Actualizando funciones individuales...');
                        
                        if (typeof window.updateFilters === 'function') {
                            console.log('🚀 → Filtros...');
                            window.updateFilters();
                        }
                        if (typeof window.updateCharts === 'function') {
                            console.log('🚀 → Gráficos...');
                            window.updateCharts();
                        }
                        if (typeof window.updateMap === 'function') {
                            console.log('🚀 → Mapa...');
                            window.updateMap();
                        }
                        if (typeof window.renderProjectsList === 'function') {
                            console.log('🚀 → Lista de proyectos...');
                            window.renderProjectsList();
                        }
                        if (typeof window.updateRanking === 'function') {
                            console.log('🚀 → Ranking...');
                            window.updateRanking();
                        }
                    }
                    
                    // Mostrar notificación de éxito
                    const notification = document.getElementById('notification');
                    const message = document.getElementById('notification-message');
                    if (notification && message) {
                        message.textContent = `🎉 ${window.projects.length} proyectos cargados - Dashboard completo`;
                        notification.classList.add('show');
                        setTimeout(() => notification.classList.remove('show'), 4000);
                    }
                    
                    console.log('🚀 ✅ Actualización completa terminada');
                    
                    // Disparar evento personalizado para notificar que los datos están listos
                    window.dispatchEvent(new CustomEvent('firebaseDataReady', {
                        detail: { 
                            projectCount: window.projects.length,
                            source: 'firebase-ultra-simple'
                        }
                    }));
                    
                } catch (error) {
                    console.error('🚀 ❌ Error actualizando interfaz:', error);
                }
            }, 1500);
            
        } else {
            console.log('🚀 ❌ No hay datos en Firebase');
        }
        
    } catch (error) {
        console.error('🚀 ❌ Error:', error);
    }
})();

// Función manual para recargar
window.recargarFirebaseUltraSimple = async function() {
    console.log('🚀 Recarga manual iniciada...');
    location.reload(); // Simplemente recargar la página
};

console.log('🚀 Firebase Ultra Simple listo');