// Script para restaurar valores CAPEX en Firebase
console.log('🔧 Iniciando restauración de valores CAPEX...');

async function restaurarCapexFirebase() {
    try {
        console.log('📁 Cargando datos locales desde proyectos.json...');
        
        // Cargar datos locales
        const response = await fetch('./proyectos.json');
        const datosLocales = await response.json();
        
        console.log(`📊 Datos locales cargados: ${datosLocales.data.length} proyectos`);
        
        // Verificar que tienen CAPEX
        const proyectosConCapex = datosLocales.data.filter(p => p['Capex (US$ mn)'] && p['Capex (US$ mn)'] > 0);
        console.log(`💰 Proyectos con CAPEX: ${proyectosConCapex.length}`);
        
        // Preparar datos para Firebase con nombres de campos limpios
        const datosParaFirebase = {
            columns: datosLocales.columns.map(col => col.replace(/[.#$\/\[\]()]/g, '_').replace(/\s+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')),
            data: datosLocales.data.map(proyecto => {
                const proyectoLimpio = {};
                Object.keys(proyecto).forEach(key => {
                    const keyLimpia = key.replace(/[.#$\/\[\]()]/g, '_').replace(/\s+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
                    proyectoLimpio[keyLimpia] = proyecto[key];
                });
                return proyectoLimpio;
            }),
            metadata: {
                lastUpdate: new Date().toISOString(),
                source: 'proyectos.json-restaurado',
                originalColumns: datosLocales.columns,
                totalRecords: datosLocales.data.length,
                version: '1.1.0',
                capexRestaurado: true
            }
        };
        
        console.log('🔥 Subiendo datos restaurados a Firebase...');
        
        // Subir a Firebase
        const firebaseResponse = await fetch('https://dashboard-minero-eecol-default-rtdb.firebaseio.com/proyectos.json', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosParaFirebase)
        });
        
        if (firebaseResponse.ok) {
            console.log('✅ Datos restaurados exitosamente en Firebase');
            
            // Verificar que se subieron correctamente
            const verificacion = await fetch('https://dashboard-minero-eecol-default-rtdb.firebaseio.com/proyectos.json');
            const datosVerificacion = await verificacion.json();
            
            const proyectosConCapexFirebase = datosVerificacion.data.filter(p => p.Capex_US_mn && parseFloat(p.Capex_US_mn) > 0);
            console.log(`✅ Verificación: ${proyectosConCapexFirebase.length} proyectos con CAPEX en Firebase`);
            
            // Mostrar algunos ejemplos
            console.log('📊 Ejemplos de CAPEX restaurados:');
            proyectosConCapexFirebase.slice(0, 5).forEach(p => {
                console.log(`  - ${p.Nombre_del_proyecto}: $${p.Capex_US_mn} MM`);
            });
            
            return true;
        } else {
            throw new Error(`Error HTTP: ${firebaseResponse.status}`);
        }
        
    } catch (error) {
        console.error('❌ Error restaurando CAPEX:', error);
        return false;
    }
}

// Ejecutar restauración
restaurarCapexFirebase().then(exito => {
    if (exito) {
        console.log('🎉 ¡Restauración completada! Recarga el dashboard para ver los valores CAPEX.');
        
        // Mostrar notificación si estamos en el dashboard
        if (typeof showNotification === 'function') {
            showNotification('✅ Valores CAPEX restaurados desde archivo local', false);
        }
        
        // Recargar datos si estamos en el dashboard
        if (typeof window.recargarFirebaseUltraSimple === 'function') {
            setTimeout(() => {
                window.recargarFirebaseUltraSimple();
            }, 2000);
        }
    } else {
        console.log('❌ Error en la restauración. Revisa la consola para más detalles.');
    }
});