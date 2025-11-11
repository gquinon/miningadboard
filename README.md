# Dashboard Ejecutivo - Proyectos Mineros

## Descripción

Sistema completo de gestión y visualización de proyectos mineros desarrollado para EECOL División Propuestas. Incluye dashboard ejecutivo, panel de administración y generador de reportes.

## Características Principales

### 🎯 Dashboard Ejecutivo
- **KPIs en tiempo real**: Total de proyectos, inversión total, proyectos activos
- **Mapa interactivo**: Visualización geográfica con marcadores y heatmap
- **Gráficos dinámicos**: Pie charts, barras, gráficos apilados
- **Sistema de filtros avanzados**: Por país, sector, etapa, estado, rango CAPEX
- **Rankings**: Empresas por proyectos, inversión y diversidad
- **Búsqueda inteligente**: Búsqueda en múltiples campos con debounce
- **Exportación**: Excel, PDF con estadísticas completas

### 🔧 Panel de Administración
- **Gestión de datos**: Carga, edición y eliminación de proyectos
- **Importación**: Soporte para Excel (.xlsx, .xls) y JSON
- **Edición en línea**: Tabla editable con modal de edición detallada
- **Exportación**: Excel y JSON con metadatos
- **Filtros y búsqueda**: Sistema completo de filtrado
- **Validación**: Validación automática de datos

### 📊 Generador de Reportes
- **Tipos de reportes**: Comparativo, CAPEX por sector, proyectos por país, inversión por empresa
- **Filtros personalizables**: Múltiples criterios de filtrado
- **Selección de gráficos**: Personalización de visualizaciones
- **Exportación múltiple**: PDF, Excel, Word
- **Gráficos nativos**: Generación sin dependencias CDN

## Estructura de Archivos

```
├── login-profesional.html                         # Sistema de autenticación
├── Dashboard Ejecutivo - Proyectos Mineros.html   # Dashboard principal
├── Panel-Admin-Nuevo.html                         # Panel de administración
├── proyectos.json                                 # Base de datos de proyectos
├── auth-system-pro.js                             # Sistema de autenticación profesional
├── database-manager.js                            # Base de datos persistente
├── config.js                                      # Configuración global
├── footer-universal.js                            # Footer corporativo
├── cache-buster.js                                # Sistema anti-cache
├── force-refresh.js                               # Forzar actualización
├── route-guard.js                                 # Protección de rutas
└── Dashboard Ejecutivo - Proyectos Mineros_files/ # Assets del dashboard
```

## Instalación y Uso

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Servidor web local (opcional, para desarrollo)

### Instalación
1. Descargar todos los archivos del proyecto
2. Mantener la estructura de carpetas
3. Abrir `login-profesional.html` en el navegador para comenzar

### Uso Básico

#### Dashboard
1. Abrir el dashboard principal
2. Los datos se cargan automáticamente desde `proyectos.json` o localStorage
3. Usar filtros para refinar la visualización
4. Hacer clic en proyectos para ver detalles
5. Exportar datos usando los botones de exportación

#### Administración
1. Acceder desde el botón de administración (🔒) en el dashboard
2. Credenciales: usuario `root`, contraseña `propuestaadmin`
3. Cargar archivos Excel o editar datos existentes
4. Guardar cambios en el navegador
5. Los cambios se reflejan automáticamente en el dashboard

#### Reportes
1. Acceder desde el enlace en el dashboard o directamente
2. Seleccionar tipo de reporte y filtros
3. Elegir proyectos específicos
4. Personalizar gráficos incluidos
5. Generar y descargar en el formato deseado

## Configuración

### Archivo config.js
Contiene toda la configuración del sistema:

```javascript
window.DashboardConfig = {
    data: {
        localStorageKey: 'proyectosData',
        jsonFile: 'proyectos.json',
        autoSave: true
    },
    colors: {
        primary: '#0055A6',
        secondary: '#E60028'
    },
    // ... más configuraciones
};
```

### Personalización de Colores
Modificar `config.js` para cambiar la paleta de colores:
- `colors.primary`: Color principal (#0055A6)
- `colors.secondary`: Color secundario (#E60028)
- `colors.etapas`: Colores por etapa de proyecto

### Configuración de Mapas
- `maps.defaultCenter`: Centro inicial del mapa
- `maps.defaultZoom`: Zoom inicial
- `maps.tileLayer`: Proveedor de tiles del mapa

## Estructura de Datos

### Formato de Proyecto
```json
{
  "Nombre del proyecto": "string",
  "Sector": "string",
  "Área": "string", 
  "País": "string",
  "Etapa": "string",
  "Compañías relacionadas": "string",
  "Capex (US$ mn)": number,
  "Tipo de proyecto": "string",
  "Productos y Servicios": "string",
  "Estado": "string",
  "Latitud": number,
  "Longitud": number,
  "Descripcion": "string"
}
```

### Campos Obligatorios
- Nombre del proyecto
- Sector
- País
- Etapa
- Capex (US$ mn)

## Funcionalidades Avanzadas

### Filtros Inteligentes
- **Países múltiples**: Busca en países separados por coma
- **Sectores múltiples**: Busca en sectores combinados
- **Rangos CAPEX**: Filtrado por rangos de inversión
- **Combinación**: Todos los filtros se pueden combinar

### Búsqueda Global
- Busca en múltiples campos simultáneamente
- Normalización de texto (sin tildes, case-insensitive)
- Debounce para mejor rendimiento
- Búsqueda en compañías y productos

### Exportación Avanzada
- **Excel**: Múltiples hojas con datos básicos, detallados y estadísticas
- **PDF**: Formato profesional con tablas y metadatos
- **JSON**: Formato completo para intercambio de datos

### Mapas Interactivos
- **Marcadores**: Coloreados por etapa del proyecto
- **Heatmap**: Intensidad basada en CAPEX
- **Popups**: Información detallada y enlace a detalles
- **Controles**: Alternar entre marcadores y heatmap

## Desarrollo y Personalización

### Agregar Nuevos Campos
1. Modificar `FIELD_SYNONYMS` en el dashboard
2. Actualizar `sanitizeProject` en utils.js
3. Ajustar las funciones de renderizado según necesidad

### Nuevos Tipos de Gráficos
1. Agregar configuración en `config.js`
2. Crear función de actualización en el dashboard
3. Integrar en el sistema de filtros

### Personalizar Exportación
1. Modificar funciones `exportToExcel` y `exportToPDF`
2. Ajustar `generateStatistics` para nuevas métricas
3. Personalizar formatos y estilos

## Solución de Problemas

### Datos No Se Cargan
1. Verificar que `proyectos.json` esté en la raíz
2. Comprobar formato JSON válido
3. Revisar consola del navegador para errores

### Mapas No Aparecen
1. Verificar conexión a internet (tiles de OpenStreetMap)
2. Comprobar coordenadas válidas en los datos
3. Revisar errores de JavaScript en consola

### Exportación Falla
1. Verificar que las librerías XLSX y jsPDF estén cargadas
2. Comprobar que hay datos para exportar
3. Revisar permisos de descarga del navegador

### Filtros No Funcionan
1. Verificar que los datos tienen los campos esperados
2. Comprobar que los valores coinciden exactamente
3. Revisar normalización de texto en búsquedas

## Soporte Técnico

### Logs y Debugging
- Activar `development.enableDebug` en config.js
- Revisar consola del navegador para mensajes detallados
- Usar herramientas de desarrollo del navegador

### Performance
- Configurar `performance.chunkSize` para datasets grandes
- Activar `performance.enableVirtualScrolling` si es necesario
- Monitorear uso de memoria en datasets muy grandes

### Compatibilidad
- **Navegadores soportados**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Resoluciones**: Responsive design desde 320px hasta 4K
- **Dispositivos**: Desktop, tablet, móvil (con limitaciones en mapas)

## Licencia

Desarrollado para EECOL División Propuestas. Todos los derechos reservados.

## Changelog

### v2.0.0 (Actual)
- ✅ Conversión de maqueta a software funcional
- ✅ Sistema de configuración modular
- ✅ Utilidades compartidas
- ✅ Carga de datos robusta
- ✅ Filtros inteligentes mejorados
- ✅ Exportación avanzada
- ✅ Validación de datos
- ✅ Manejo de errores mejorado
- ✅ Performance optimizada
- ✅ Documentación completa

### v1.0.0 (Maqueta Original)
- Dashboard básico con datos estáticos
- Funcionalidades de demostración
- Diseño visual completo