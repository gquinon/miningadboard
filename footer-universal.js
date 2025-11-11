// Footer universal para todo el sistema Dashboard Minero EECOL
(function() {
    'use strict';
    
    // Configuración del footer
    const footerConfig = {
        company: 'EECOL División Propuestas',
        version: 'Dashboard v2.0.0',
        description: 'Desarrollado para la gestión integral de proyectos mineros',
        year: new Date().getFullYear(),
        links: [
            { text: 'Login', url: 'login-profesional.html', icon: 'fas fa-sign-in-alt' },
            { text: 'Dashboard', url: 'Dashboard Ejecutivo - Proyectos Mineros.html', icon: 'fas fa-chart-line' },
            { text: 'Administración', url: 'Panel-Admin-Nuevo.html', icon: 'fas fa-cogs' }
        ]
    };
    
    // Estilos CSS para el footer
    const footerStyles = `
        .eecol-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, rgba(12, 26, 58, 0.95), rgba(22, 43, 80, 0.95));
            backdrop-filter: blur(10px);
            color: white;
            padding: 15px 20px 10px;
            border-top: 2px solid #0055A6;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            z-index: 1000;
            box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.3);
        }
        
        .eecol-footer-content {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 20px;
            align-items: center;
        }
        
        .eecol-footer-info {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .eecol-footer-brand {
            font-size: 1rem;
            font-weight: 700;
            color: #58b5ff;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .eecol-footer-version {
            font-size: 0.8rem;
            color: #E60028;
            font-weight: 600;
        }
        
        .eecol-footer-description {
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 3px;
        }
        
        .eecol-footer-copyright {
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.6);
        }
        
        .eecol-footer-links {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .eecol-footer-link {
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            font-size: 0.8rem;
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 6px 10px;
            border-radius: 4px;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .eecol-footer-link:hover {
            color: white;
            background: rgba(0, 85, 166, 0.3);
            border-color: rgba(0, 85, 166, 0.5);
            transform: translateY(-2px);
        }
        
        .eecol-footer-link i {
            font-size: 0.8rem;
        }
        
        @media (max-width: 768px) {
            .eecol-footer-content {
                grid-template-columns: 1fr;
                text-align: center;
                gap: 20px;
            }
            
            .eecol-footer-links {
                justify-content: center;
            }
        }
        
        @media (max-width: 480px) {
            .eecol-footer-links {
                flex-direction: column;
                align-items: center;
            }
            
            .eecol-footer-link {
                width: 200px;
                justify-content: center;
            }
        }
    `;
    
    // Función para crear el footer
    function createFooter() {
        // Crear elemento de estilos
        const styleElement = document.createElement('style');
        styleElement.textContent = footerStyles;
        document.head.appendChild(styleElement);
        
        // Agregar padding al body para el footer flotante
        document.body.style.paddingBottom = '80px';
        
        // Crear footer HTML
        const footerHTML = `
            <footer class="eecol-footer">
                <div class="eecol-footer-content">
                    <div class="eecol-footer-info">
                        <div class="eecol-footer-brand">
                            <i class="fas fa-gem"></i>
                            ${footerConfig.company}
                        </div>
                        <div class="eecol-footer-version">
                            ${footerConfig.version}
                        </div>
                        <div class="eecol-footer-description">
                            ${footerConfig.description}
                        </div>
                        <div class="eecol-footer-copyright">
                            © ${footerConfig.year} EECOL. Todos los derechos reservados.
                        </div>
                    </div>
                    
                    <div class="eecol-footer-links">
                        ${footerConfig.links.map(link => `
                            <a href="${link.url}" class="eecol-footer-link">
                                <i class="${link.icon}"></i>
                                ${link.text}
                            </a>
                        `).join('')}
                        
                        <button onclick="window.CacheBuster && window.CacheBuster.forceReload()" class="eecol-footer-link" style="background: none; border: 1px solid rgba(255, 255, 255, 0.1); cursor: pointer;" title="Forzar actualización del sistema">
                            <i class="fas fa-sync-alt"></i>
                            Actualizar
                        </button>
                    </div>
                </div>
            </footer>
        `;
        
        // Agregar footer al final del body
        document.body.insertAdjacentHTML('beforeend', footerHTML);
        
        console.log('✅ Footer universal EECOL agregado');
    }
    
    // Función para actualizar información del usuario en el footer
    function updateFooterUserInfo() {
        const footer = document.querySelector('.eecol-footer');
        if (!footer) return;
        
        // Verificar si hay usuario autenticado
        if (window.checkAuth && window.checkAuth()) {
            const user = window.getCurrentAuthUser();
            if (user) {
                // Agregar información del usuario si no existe
                let userInfo = footer.querySelector('.eecol-footer-user');
                if (!userInfo) {
                    userInfo = document.createElement('div');
                    userInfo.className = 'eecol-footer-user';
                    userInfo.style.cssText = `
                        position: absolute;
                        top: 10px;
                        right: 20px;
                        font-size: 0.8rem;
                        color: rgba(255, 255, 255, 0.7);
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    `;
                    footer.style.position = 'relative';
                    footer.appendChild(userInfo);
                }
                
                userInfo.innerHTML = `
                    <i class="fas fa-user-circle"></i>
                    Sesión activa: ${user.displayName} (${user.role})
                `;
            }
        }
    }
    
    // Función para agregar información de versión detallada
    function addVersionInfo() {
        const footer = document.querySelector('.eecol-footer');
        if (!footer) return;
        
        // Agregar información técnica
        const versionInfo = document.createElement('div');
        versionInfo.style.cssText = `
            position: absolute;
            bottom: 5px;
            left: 20px;
            font-size: 0.7rem;
            color: rgba(255, 255, 255, 0.4);
        `;
        
        const buildDate = new Date().toLocaleDateString('es-CL');
        const userAgent = navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                         navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                         navigator.userAgent.includes('Safari') ? 'Safari' : 'Otro';
        
        versionInfo.innerHTML = `
            Build: ${buildDate} | Navegador: ${userAgent} | Sistema: ${navigator.platform}
        `;
        
        footer.style.position = 'relative';
        footer.appendChild(versionInfo);
    }
    
    // Función para verificar si debe mostrar el footer en esta página
    function shouldShowFooter() {
        // Verificar si hay un atributo manual en el body
        const bodyFooter = document.body.getAttribute('data-footer');
        if (bodyFooter === 'false' || bodyFooter === 'no') {
            return false;
        }
        if (bodyFooter === 'true' || bodyFooter === 'yes') {
            return true;
        }
        
        const currentPage = window.location.pathname.split('/').pop();
        
        // Lista de páginas donde NO queremos el footer
        const excludePages = [
            'login-profesional.html'  // No mostrar footer en login
        ];
        
        // Lista de páginas donde SÍ queremos el footer
        const includePages = [
            'Dashboard Ejecutivo - Proyectos Mineros.html',
            'Panel-Admin-Nuevo.html'
        ];
        
        // Si está en la lista de exclusión, no mostrar
        if (excludePages.includes(currentPage)) {
            return false;
        }
        
        // Si está en la lista de inclusión, mostrar
        if (includePages.includes(currentPage)) {
            return true;
        }
        
        // Por defecto, no mostrar en páginas desconocidas
        return false;
    }
    
    // Inicializar footer cuando el DOM esté listo
    function initFooter() {
        // Solo crear footer si debe mostrarse en esta página
        if (!shouldShowFooter()) {
            console.log('🚫 Footer no se muestra en esta página');
            return;
        }
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                createFooter();
                setTimeout(() => {
                    updateFooterUserInfo();
                    addVersionInfo();
                }, 1000);
            });
        } else {
            createFooter();
            setTimeout(() => {
                updateFooterUserInfo();
                addVersionInfo();
            }, 1000);
        }
        
        // Escuchar cambios de autenticación para actualizar info del usuario
        window.addEventListener('authChange', () => {
            setTimeout(updateFooterUserInfo, 500);
        });
        
        window.addEventListener('authSystemReady', () => {
            setTimeout(updateFooterUserInfo, 500);
        });
    }
    
    // Función para ocultar el footer
    function hideFooter() {
        const footer = document.querySelector('.eecol-footer');
        if (footer) {
            footer.style.display = 'none';
            document.body.style.paddingBottom = '0';
            console.log('🚫 Footer ocultado');
        }
    }
    
    // Función para mostrar el footer
    function showFooter() {
        const footer = document.querySelector('.eecol-footer');
        if (footer) {
            footer.style.display = 'block';
            document.body.style.paddingBottom = '80px';
            console.log('✅ Footer mostrado');
        } else {
            // Si no existe, crearlo
            createFooter();
        }
    }
    
    // Función para alternar visibilidad del footer
    function toggleFooter() {
        const footer = document.querySelector('.eecol-footer');
        if (footer && footer.style.display !== 'none') {
            hideFooter();
        } else {
            showFooter();
        }
    }
    
    // Exponer funciones globalmente
    window.EECOLFooter = {
        init: initFooter,
        create: createFooter,
        update: updateFooterUserInfo,
        addVersion: addVersionInfo,
        hide: hideFooter,
        show: showFooter,
        toggle: toggleFooter,
        config: footerConfig,
        shouldShow: shouldShowFooter
    };
    
    // Inicializar automáticamente
    initFooter();
    
})();