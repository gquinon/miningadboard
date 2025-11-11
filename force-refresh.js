// Sistema de forzar actualización para evitar problemas de cache
(function() {
    'use strict';
    
    const FORCE_REFRESH_KEY = 'eecol_force_refresh';
    const VERSION_KEY = 'eecol_current_version';
    const CURRENT_VERSION = '2.1.0'; // Incrementar cuando haya cambios importantes
    
    console.log('🔄 Sistema de forzar actualización iniciado v' + CURRENT_VERSION);
    
    // Verificar si necesita forzar actualización
    function checkForceRefresh() {
        const storedVersion = localStorage.getItem(VERSION_KEY);
        const forceRefresh = localStorage.getItem(FORCE_REFRESH_KEY);
        
        // Si es una versión diferente o se marcó para forzar refresh
        if (storedVersion !== CURRENT_VERSION || forceRefresh === 'true') {
            console.log('🔄 Forzando actualización del sistema...');
            
            // Limpiar cache del navegador
            if ('caches' in window) {
                caches.keys().then(names => {
                    names.forEach(name => {
                        caches.delete(name);
                    });
                });
            }
            
            // Limpiar localStorage de cache
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.includes('cache') || key.includes('temp'))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            // Actualizar versión
            localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
            localStorage.removeItem(FORCE_REFRESH_KEY);
            
            // Mostrar notificación
            showForceRefreshNotification();
            
            return true;
        }
        
        return false;
    }
    
    // Mostrar notificación de actualización forzada
    function showForceRefreshNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #0055A6, #E60028);
            color: white;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            z-index: 10001;
            text-align: center;
            max-width: 400px;
            font-family: 'Segoe UI', sans-serif;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 15px;">
                <i class="fas fa-rocket"></i>
            </div>
            <h3 style="margin-bottom: 15px;">¡Sistema Actualizado!</h3>
            <p style="margin-bottom: 20px; opacity: 0.9;">
                Dashboard Minero EECOL v${CURRENT_VERSION}<br>
                Cache limpiado y sistema optimizado
            </p>
            <button onclick="this.parentNode.remove()" style="
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
            ">
                <i class="fas fa-check"></i> Continuar
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translate(-50%, -50%) scale(0.8)';
                notification.style.transition = 'all 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }
    
    // Función para marcar que necesita forzar refresh
    function markForRefresh() {
        localStorage.setItem(FORCE_REFRESH_KEY, 'true');
        console.log('🔄 Marcado para forzar actualización en próxima carga');
    }
    
    // Función para recargar página con cache busting
    function hardReload() {
        // Limpiar todo el cache
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            });
        }
        
        // Recargar con cache busting
        const url = new URL(window.location);
        url.searchParams.set('_refresh', Date.now());
        window.location.href = url.toString();
    }
    
    // Agregar botón de actualización forzada al DOM
    function addForceRefreshButton() {
        // Solo agregar en páginas principales
        const isMainPage = window.location.pathname.includes('Dashboard') || 
                          window.location.pathname.includes('Panel-Admin') ||
                          window.location.pathname.includes('Admin');
        
        if (!isMainPage) return;
        
        const button = document.createElement('button');
        button.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(230, 0, 40, 0.9);
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.8rem;
            z-index: 1001;
            opacity: 0.7;
            transition: opacity 0.3s ease;
        `;
        
        button.innerHTML = '<i class="fas fa-sync-alt"></i> Forzar Actualización';
        button.title = 'Forzar recarga completa del sistema';
        
        button.addEventListener('click', () => {
            if (confirm('¿Forzar actualización completa del sistema? Esto recargará la página.')) {
                hardReload();
            }
        });
        
        button.addEventListener('mouseenter', () => {
            button.style.opacity = '1';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.opacity = '0.7';
        });
        
        document.body.appendChild(button);
    }
    
    // Exponer funciones globalmente
    window.ForceRefresh = {
        version: CURRENT_VERSION,
        markForRefresh: markForRefresh,
        hardReload: hardReload,
        checkUpdate: checkForceRefresh
    };
    
    // Inicializar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            checkForceRefresh();
            addForceRefreshButton();
        });
    } else {
        checkForceRefresh();
        addForceRefreshButton();
    }
    
})();