// Generar valores CAPEX realistas para proyectos mineros
console.log('💰 Generando valores CAPEX realistas...');

// Rangos de CAPEX por sector (en millones USD)
const capexPorSector = {
    'Minería y Metales': {
        'Cobre': { min: 500, max: 8000 },
        'Oro': { min: 200, max: 3000 },
        'Plata': { min: 100, max: 1500 },
        'Litio': { min: 300, max: 5000 },
        'Hierro': { min: 800, max: 12000 },
        'Zinc': { min: 300, max: 2000 },
        'Molibdeno': { min: 400, max: 2500 },
        'Carbón': { min: 200, max: 1800 },
        'Níquel': { min: 600, max: 4000 },
        'Plomo': { min: 150, max: 1200 },
        'default': { min: 100, max: 2000 }
    },
    'Energía Eléctrica': {
        'Fotovoltaico': { min: 50, max: 800 },
        'Eólico costa adentro': { min: 80, max: 1200 },
        'Hidroeléctrico': { min: 200, max: 3000 },
        'default': { min: 50, max: 1000 }
    }
};

// Multiplicadores por etapa
const multiplicadorPorEtapa = {
    'Exploración inicial y descubrimiento': 0.1,
    'Exploración avanzada': 0.3,
    'Prospección y perforación': 0.2,
    'Prefactibilidad': 0.6,
    'Factibilidad': 0.8,
    'Diseño básico e ingeniería': 0.9,
    'Pre-construcción': 0.95,
    'En espera de decisión de construcción': 0.85,
    'Construcción': 1.0,
    'Producción': 1.2,
    'Desarrollo': 0.7,
    'default': 0.5
};

function generarCapexRealista(proyecto) {
    const sector = proyecto.Sector || 'Minería y Metales';
    const tipoProyecto = proyecto.Tipo_de_proyecto || '';
    const etapa = proyecto.Etapa || 'default';
    
    // Determinar rango base
    let rangoBase = { min: 100, max: 2000 };
    
    if (capexPorSector[sector]) {
        // Buscar por tipo específico primero
        const tiposEnProyecto = tipoProyecto.split(',').map(t => t.trim());
        let rangoEncontrado = false;
        
        for (const tipo of tiposEnProyecto) {
            if (capexPorSector[sector][tipo]) {
                rangoBase = capexPorSector[sector][tipo];
                rangoEncontrado = true;
                break;
            }
        }
        
        // Si no encuentra tipo específico, usar default del sector
        if (!rangoEncontrado && capexPorSector[sector].default) {
            rangoBase = capexPorSector[sector].default;
        }
    }
    
    // Aplicar multiplicador por etapa
    const multiplicador = multiplicadorPorEtapa[etapa] || multiplicadorPorEtapa.default;
    
    const minAjustado = rangoBase.min * multiplicador;
    const maxAjustado = rangoBase.max * multiplicador;
    
    // Generar valor aleatorio en el rango
    const capex = Math.round(minAjustado + Math.random() * (maxAjustado - minAjustado));
    
    return Math.max(capex, 10); // Mínimo 10 millones
}

// Esta función se puede llamar desde el navegador
window.generarCapexParaTodos = async function() {
    try {
        console.log('🔥 Obteniendo datos actuales de Firebase...');
        
        const response = await fetch('https://dashboard-minero-eecol-default-rtdb.firebaseio.com/proyectos.json');
        const datosFirebase = await response.json();
        
        if (!datosFirebase || !datosFirebase.data) {
            throw new Error('No se pudieron obtener datos de Firebase');
        }
        
        console.log(`📊 Procesando ${datosFirebase.data.length} proyectos...`);
        
        // Generar CAPEX para proyectos que no lo tienen
        let proyectosActualizados = 0;
        const datosConCapex = datosFirebase.data.map(proyecto => {
            if (!proyecto.Capex_US_mn || proyecto.Capex_US_mn === '' || parseFloat(proyecto.Capex_US_mn) === 0) {
                proyecto.Capex_US_mn = generarCapexRealista(proyecto);
                proyectosActualizados++;
            }
            return proyecto;
        });
        
        console.log(`💰 Generados valores CAPEX para ${proyectosActualizados} proyectos`);
        
        // Preparar datos actualizados
        const datosActualizados = {
            ...datosFirebase,
            data: datosConCapex,
            metadata: {
                ...datosFirebase.metadata,
                lastUpdate: new Date().toISOString(),
                capexGenerado: true,
                proyectosConCapexGenerado: proyectosActualizados
            }
        };
        
        console.log('🔥 Subiendo datos actualizados a Firebase...');
        
        const updateResponse = await fetch('https://dashboard-minero-eecol-default-rtdb.firebaseio.com/proyectos.json', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosActualizados)
        });
        
        if (updateResponse.ok) {
            console.log('✅ Datos actualizados exitosamente en Firebase');
            
            // Calcular estadísticas
            const totalCapex = datosConCapex.reduce((sum, p) => sum + (parseFloat(p.Capex_US_mn) || 0), 0);
            const promedioCapex = totalCapex / datosConCapex.length;
            
            console.log(`📊 Estadísticas:
  - Total proyectos: ${datosConCapex.length}
  - Inversión total: $${Math.round(totalCapex).toLocaleString()} MM
  - Inversión promedio: $${Math.round(promedioCapex).toLocaleString()} MM`);
            
            // Mostrar notificación
            if (typeof showNotification === 'function') {
                showNotification(`✅ CAPEX generado: $${Math.round(totalCapex).toLocaleString()} MM en ${datosConCapex.length} proyectos`, false);
            }
            
            return true;
        } else {
            throw new Error(`Error HTTP: ${updateResponse.status}`);
        }
        
    } catch (error) {
        console.error('❌ Error generando CAPEX:', error);
        if (typeof showNotification === 'function') {
            showNotification('❌ Error generando valores CAPEX', true);
        }
        return false;
    }
};

console.log('💰 Generador de CAPEX listo. Ejecuta window.generarCapexParaTodos() para generar valores.');