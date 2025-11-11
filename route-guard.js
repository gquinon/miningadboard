// Sistema de protección de rutas para Dashboard Minero EECOL
class RouteGuard {
    constructor() {
        this.authSystem = null;
        this.currentPage = this.getCurrentPage();
        this.init();
    }
    
    init() {
        // Esperar a que el sistema de autenticación esté listo
        if (window.authSystemPro) {
            this.authSystem = window.authSystemPro;
            this.checkAccess();
        } else {
            // Esperar hasta que esté disponible
            const checkAuth = setInterval(() => {
                if (window.authSystemPro) {
                    this.authSystem = window.authSystemPro;
                    this.checkAccess();
                    clearInterval(checkAuth);
                }
            }, 100);
            
            // Timeout de seguridad - si no se carga en 5 segundos, redirigir
            setTimeout(() => {
                if (!this.authSystem) {
                    console.log('RouteGuard - Timeout, redirigiendo a login');
                    this.redirectToLogin();
                }
            }, 5000);
        }
    }
    
    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        return filename.toLowerCase();
    }
    
    checkAccess() {
        const isAuthenticated = this.authSystem.isAuthenticated();
        const user = this.authSystem.getCurrentUser();
        
        console.log('🛡️ RouteGuard - Página:', this.currentPage);
        console.log('🛡️ RouteGuard - Autenticado:', isAuthenticated);
        console.log('🛡️ RouteGuard - Usuario:', user);
        
        // Páginas públicas (no requieren autenticación)
        const publicPages = [
            'login-profesional.html'
        ];
        
        // Páginas que requieren autenticación
        const protectedPages = [
            'dashboard ejecutivo - proyectos mineros.html',
            'panel-admin-nuevo.html'
        ];
        
        // Páginas que requieren permisos de admin
        const adminPages = [
            'panel-admin-nuevo.html'
        ];
        
        const isPublicPage = publicPages.includes(this.currentPage);
        const isProtectedPage = protectedPages.includes(this.currentPage);
        const isAdminPage = adminPages.includes(this.currentPage);
        
        // Si es página pública, permitir acceso
        if (isPublicPage) {
            console.log('🛡️ RouteGuard - Página pública, acceso permitido');
            return;
        }
        
        // Si es página protegida y no está autenticado
        if (isProtectedPage && !isAuthenticated) {
            console.log('🛡️ RouteGuard - Redirigiendo a login (no autenticado)');
            this.redirectToLogin();
            return;
        }
        
        // Si es página de admin y no tiene permisos
        if (isAdminPage && isAuthenticated) {
            if (!user || (user.role !== 'admin' && user.role !== 'root')) {
                console.log('🛡️ RouteGuard - Acceso denegado (sin permisos de admin)');
                this.showAccessDenied();
                return;
            }
        }
        
        // Si llegamos aquí, el acceso está permitido
        console.log('🛡️ RouteGuard - Acceso permitido');
    }
    
    redirectToLogin() {
        // Guardar la página actual para redirigir después del login
        sessionStorage.setItem('redirectAfterLogin', window.location.href);
        
        // Mostrar mensaje antes de redirigir
        if (this.currentPage !== 'login-profesional.html') {
            this.showLoginRequired();
        }
    }
    
    showLoginRequired() {
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #0c1a3a, #162b50); font-family: Arial, sans-serif;">
                <div style="text-align: center; background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); max-width: 400px;">
                    <div style="font-size: 4rem; color: #0055A6; margin-bottom: 20px;">🔐</div>
                    <h1 style="color: #0055A6; margin-bottom: 10px;">Acceso Requerido</h1>
                    <p style="color: #666; margin-bottom: 20px;">Debes iniciar sesión para acceder al Dashboard Minero.</p>
                    <button onclick="window.location.href='login-profesional.html'" 
                            style="background: linear-gradient(90deg, #0055A6, #003366); color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                        <i class="fas fa-sign-in-alt" style="margin-right: 8px;"></i>
                        Iniciar Sesión
                    </button>
                </div>
            </div>
        `;
        
        // Redirigir automáticamente después de 3 segundos
        setTimeout(() => {
            window.location.href = 'login-profesional.html';
        }, 3000);
    }
    
    showAccessDenied() {
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #0c1a3a, #162b50); font-family: Arial, sans-serif;">
                <div style="text-align: center; background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); max-width: 400px;">
                    <div style="font-size: 4rem; color: #dc3545; margin-bottom: 20px;">🚫</div>
                    <h1 style="color: #dc3545; margin-bottom: 10px;">Acceso Denegado</h1>
                    <p style="color: #666; margin-bottom: 20px;">No tienes permisos para acceder a esta página.</p>
                    <button onclick="window.location.href='Dashboard Ejecutivo - Proyectos Mineros.html'" 
                            style="background: linear-gradient(90deg, #0055A6, #003366); color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem; margin-right: 10px;">
                        <i class="fas fa-tachometer-alt" style="margin-right: 8px;"></i>
                        Dashboard
                    </button>
                    <button onclick="window.location.href='login-profesional.html'" 
                            style="background: #6c757d; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                        <i class="fas fa-sign-out-alt" style="margin-right: 8px;"></i>
                        Cambiar Usuario
                    </button>
                </div>
            </div>
        `;
    }
}

// Inicializar el guard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new RouteGuard();
});

console.log('🛡️ Route Guard cargado');