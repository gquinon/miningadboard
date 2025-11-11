// Sistema de Cache Busting para Dashboard Minero EECOL
(function() {
    'use strict';
    
    // Generar timestamp único para cache busting
    const cacheVersion = Date.now();
    const buildVersion = '2.0.0';
    
    console.log('🔄 Iniciando sistema de cache busting v' + buildVersion);
    
    // Lista de archivos críticos que necesitan cache busting
    const criticalFiles = [
        'config.js',
        'database-manager.js',
        'auth-system-pro.js',
        'route-guard.js',
        'footer-universal.js',
        'Panel-Admin-Nuevo.html',
        'Dashboard Ejecutivo - Proyectos Mineros.html',
        'login-profesional.html'
    ];
    
    // Función para agregar parámetros de cache busting
    function addCacheBuster(url) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}v=${buildVersion}&t=${cacheVersion}`;
    }
    
    // Función para forzar recarga de scripts
    function reloadScript(src) {
        return new Promise((resolve, reject) => {
            // Remover script existente si existe
            const existingScript = document.querySelector(`script[src*="${src}"]`);
            if (existingScript) {
                existingScript.remove();
            }
            
            // Crear nuevo script con cache buster
            const script = document.createElement('script');
            script.src = addCacheBuster(src);
            script.onload = resolve;
            script.onerror = reject;
            
            document.head.appendChild(script);
        });
    }
    
    // Función para forzar recarga de CSS
    function reloadCSS(href) {
        const existingLink = document.querySelector(`link[href*="${href}"]`);
        if (existingLink) {
            const newLink = existingLink.cloneNode();
            newLink.href = addCacheBuster(href);
            existingLink.parentNode.insertBefore(newLink, existingLink.nextSibling);
            existingLink.remove();
        }
    }
    
    // Función para limpiar cache del navegador
    function clearBrowserCache() {
        try {
            // Limpiar localStorage de versiones anteriores
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.includes('cache') || key.includes('version') || key.includes('timestamp'))) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
            
            // Guardar nueva versión
            localStorage.setItem('eecol_cache_version', buildVersion);
            localStorage.setItem('eecol_cache_timestamp', cacheVersion.toString());
            
            console.log('🧹 Cache del navegador limpiado');
            
        } catch (error) {
            console.warn('⚠️ No se pudo limpiar el cache:', error);
        }
    }
    
    // Función para verificar si necesita actualización
    function needsUpdate() {
        try {
            const storedVersion = localStorage.getItem('eecol_cache_version');
            const storedTimestamp = localStorage.getItem('eecol_cache_timestamp');
            
            // Si no hay versión almacenada o es diferente, necesita actualización
            if (!storedVersion || storedVersion !== buildVersion) {
                return true;
            }
            
            // Si el timestamp es muy antiguo (más de 1 hora), forzar actualización
            const oneHour = 60 * 60 * 1000;
            const now = Date.now();
            const stored = parseInt(storedTimestamp) || 0;
            
            if (now - stored > oneHour) {
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.warn('⚠️ Error verificando versión:', error);
            return true; // En caso de error, forzar actualización
        }
    }
    
    // Función para mostrar notificación de actualización
    function showUpdateNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #0055A6, #003d7a);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: 'Segoe UI', sans-serif;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <i class="fas fa-sync-alt" style="animation: spin 1s linear infinite;"></i>
                <strong>Sistema Actualizado</strong>
            </div>
            <div style="font-size: 0.9rem; opacity: 0.9;">
                Dashboard v${buildVersion} cargado correctamente
            </div>
        `;
        
        // Agregar animación CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Función para forzar recarga completa si es necesario
    function forceReload() {
        if (confirm('Se ha detectado una nueva versión del sistema. ¿Deseas recargar la página para obtener las últimas mejoras?')) {
            // Limpiar cache y recargar
            clearBrowserCache();
            window.location.reload(true);
        }
    }
    
    // Función principal de inicialización
    function initCacheBuster() {
        console.log('🔍 Verificando versión del sistema...');
        
        if (needsUpdate()) {
            console.log('🔄 Nueva versión detectada, limpiando cache...');
            clearBrowserCache();
            showUpdateNotification();
        } else {
            console.log('✅ Sistema actualizado, versión ' + buildVersion);
        }
        
        // Agregar parámetros de cache busting a todos los enlaces
        const links = document.querySelectorAll('a[href$=".html"]');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.includes('http') && !href.includes('?')) {
                link.href = addCacheBuster(href);
            }
        });
        
        // Interceptar navegación para agregar cache busting
        window.addEventListener('beforeunload', () => {
            // Actualizar timestamp al salir
            localStorage.setItem('eecol_cache_timestamp', Date.now().toString());
        });
    }
    
    // Función para verificar actualizaciones periódicamente
    function setupPeriodicCheck() {
        // Verificar cada 30 minutos si hay actualizaciones
        setInterval(() => {
            fetch(window.location.href, { 
                method: 'HEAD',
                cache: 'no-cache'
            }).then(response => {
                const lastModified = response.headers.get('Last-Modified');
                const storedLastModified = localStorage.getItem('eecol_last_modified');
                
                if (lastModified && storedLastModified && lastModified !== storedLastModified) {
                    console.log('🔄 Actualización detectada en el servidor');
                    localStorage.setItem('eecol_last_modified', lastModified);
                    
                    // Mostrar notificación de actualización disponible
                    const updateBanner = document.createElement('div');
                    updateBanner.style.cssText = `
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        background: #E60028;
                        color: white;
                        padding: 10px;
                        text-align: center;
                        z-index: 10001;
                        font-weight: 600;
                        cursor: pointer;
                    `;
                    updateBanner.innerHTML = `
                        <i class="fas fa-exclamation-triangle"></i>
                        Nueva versión disponible - Haz clic para actualizar
                    `;
                    updateBanner.onclick = forceReload;
                    
                    document.body.appendChild(updateBanner);
                }
            }).catch(error => {
                console.warn('⚠️ Error verificando actualizaciones:', error);
            });
        }, 30 * 60 * 1000); // 30 minutos
    }
    
    // Exponer funciones globalmente
    window.CacheBuster = {
        version: buildVersion,
        timestamp: cacheVersion,
        addCacheBuster: addCacheBuster,
        forceReload: forceReload,
        clearCache: clearBrowserCache
    };
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCacheBuster);
    } else {
        initCacheBuster();
    }
    
    // Configurar verificación periódica
    setupPeriodicCheck();
    
    console.log('✅ Sistema de cache busting inicializado');
    
})();