// Sistema de autenticación profesional para Dashboard Minero EECOL
class AuthSystemPro {
    constructor() {
        this.SESSION_KEY = 'eecol_auth_session_v2';
        this.REFRESH_KEY = 'eecol_refresh_token';
        this.SECURITY_KEY = 'eecol_security_hash';
        this.MAX_LOGIN_ATTEMPTS = 10; // Más intentos para desarrollo
        this.LOCKOUT_TIME = 1 * 60 * 1000; // Solo 1 minuto de bloqueo
        this.SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 horas
        this.REFRESH_TIMEOUT = 7 * 24 * 60 * 60 * 1000; // 7 días
        
        // Base de datos de usuarios (en producción esto estaría en servidor)
        this.users = {
            'root': {
                password: 'propuestaadmin', // Contraseña en texto plano para desarrollo
                salt: 'eecol_salt_root_2024',
                role: 'root',
                displayName: 'Administrador Root',
                permissions: ['admin', 'analyst', 'dashboard', 'reports', 'users', 'system'],
                email: 'admin@eecol.com',
                lastLogin: null,
                loginAttempts: 0,
                lockedUntil: null,
                created: '2024-01-01T00:00:00Z',
                active: true
            },
            'admin': {
                password: 'propuestaadmin', // Contraseña en texto plano para desarrollo
                salt: 'eecol_salt_admin_2024',
                role: 'admin',
                displayName: 'Administrador',
                permissions: ['admin', 'analyst', 'dashboard', 'reports'],
                email: 'admin@eecol.com',
                lastLogin: null,
                loginAttempts: 0,
                lockedUntil: null,
                created: '2024-01-01T00:00:00Z',
                active: true
            },
            'analyst': {
                password: 'analyst123', // Contraseña en texto plano para desarrollo
                salt: 'eecol_salt_analyst_2024',
                role: 'analyst',
                displayName: 'Analista de Proyectos',
                permissions: ['analyst', 'dashboard', 'reports'],
                email: 'analyst@eecol.com',
                lastLogin: null,
                loginAttempts: 0,
                lockedUntil: null,
                created: '2024-01-01T00:00:00Z',
                active: true
            },
            'viewer': {
                password: 'viewer123', // Contraseña en texto plano para desarrollo
                salt: 'eecol_salt_viewer_2024',
                role: 'viewer',
                displayName: 'Visualizador',
                permissions: ['dashboard'],
                email: 'viewer@eecol.com',
                lastLogin: null,
                loginAttempts: 0,
                lockedUntil: null,
                created: '2024-01-01T00:00:00Z',
                active: true
            }
        };
        
        this.currentUser = null;
        this.isLoggedIn = false;
        this.sessionTimer = null;
        this.refreshTimer = null;
        
        // Inicializar sistema
        this.init();
    }
    
    // Inicializar sistema de autenticación
    init() {
        this.loadSession();
        this.setupSessionMonitoring();
        this.setupSecurityChecks();
        console.log('🔐 Sistema de autenticación profesional iniciado');
    }
    
    // Hash simple para passwords (en producción usar bcrypt o similar)
    hashPassword(password, salt = 'eecol_default_salt') {
        // Para desarrollo, usar contraseñas en texto plano
        return password;
    }
    
    // Generar token seguro
    generateToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    // Verificar si usuario está bloqueado
    isUserLocked(username) {
        const user = this.users[username];
        if (!user || !user.lockedUntil) return false;
        
        const now = Date.now();
        if (now < user.lockedUntil) {
            return true;
        } else {
            // Desbloquear usuario
            user.lockedUntil = null;
            user.loginAttempts = 0;
            return false;
        }
    }
    
    // Bloquear usuario por intentos fallidos
    lockUser(username) {
        const user = this.users[username];
        if (user) {
            user.loginAttempts++;
            if (user.loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
                user.lockedUntil = Date.now() + this.LOCKOUT_TIME;
                console.warn(`🔒 Usuario ${username} bloqueado por ${this.LOCKOUT_TIME / 60000} minutos`);
            }
        }
    }
    
    // Autenticar usuario con seguridad mejorada
    async authenticate(username, password, rememberMe = false) {
        try {
            console.log('🔐 Intentando autenticar:', username);
            
            // Verificar si el usuario existe
            const user = this.users[username];
            if (!user) {
                console.warn('❌ Usuario no encontrado:', username);
                return {
                    success: false,
                    error: 'Credenciales incorrectas',
                    code: 'INVALID_CREDENTIALS'
                };
            }
            
            // Verificar si el usuario está activo
            if (!user.active) {
                console.warn('❌ Usuario inactivo:', username);
                return {
                    success: false,
                    error: 'Cuenta desactivada',
                    code: 'ACCOUNT_DISABLED'
                };
            }
            
            // Verificar si el usuario está bloqueado
            if (this.isUserLocked(username)) {
                const remainingTime = Math.ceil((user.lockedUntil - Date.now()) / 60000);
                console.warn('🔒 Usuario bloqueado:', username);
                return {
                    success: false,
                    error: `Cuenta bloqueada. Intenta en ${remainingTime} minutos`,
                    code: 'ACCOUNT_LOCKED',
                    remainingTime: remainingTime
                };
            }
            
            // Verificar contraseña (comparación directa para desarrollo)
            if (password !== user.password) {
                console.warn('❌ Contraseña incorrecta para:', username);
                this.lockUser(username);
                return {
                    success: false,
                    error: 'Credenciales incorrectas',
                    code: 'INVALID_CREDENTIALS',
                    attemptsRemaining: this.MAX_LOGIN_ATTEMPTS - user.loginAttempts
                };
            }
            
            // Autenticación exitosa
            const sessionToken = this.generateToken();
            const refreshToken = this.generateToken();
            const loginTime = new Date().toISOString();
            
            this.currentUser = {
                username: username,
                role: user.role,
                displayName: user.displayName,
                permissions: user.permissions,
                email: user.email,
                loginTime: loginTime,
                sessionToken: sessionToken,
                refreshToken: refreshToken,
                rememberMe: rememberMe
            };
            
            this.isLoggedIn = true;
            
            // Resetear intentos de login
            user.loginAttempts = 0;
            user.lockedUntil = null;
            user.lastLogin = loginTime;
            
            // Guardar sesión
            this.saveSession();
            
            // Configurar timers
            this.setupSessionTimer();
            
            console.log('✅ Autenticación exitosa:', this.currentUser.displayName);
            
            return {
                success: true,
                user: {
                    username: this.currentUser.username,
                    displayName: this.currentUser.displayName,
                    role: this.currentUser.role,
                    permissions: this.currentUser.permissions,
                    email: this.currentUser.email,
                    loginTime: this.currentUser.loginTime
                }
            };
            
        } catch (error) {
            console.error('❌ Error en autenticación:', error);
            return {
                success: false,
                error: 'Error interno del sistema',
                code: 'SYSTEM_ERROR'
            };
        }
    }
    
    // Alias para compatibilidad
    login(username, password, rememberMe = false) {
        return this.authenticate(username, password, rememberMe);
    }
    
    // Cerrar sesión de forma segura
    logout(reason = 'manual') {
        console.log('🚪 Cerrando sesión:', this.currentUser?.username, 'Razón:', reason);
        
        // Limpiar timers
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }
        
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
        
        // Limpiar datos de usuario
        this.currentUser = null;
        this.isLoggedIn = false;
        
        // Limpiar almacenamiento
        this.clearSession();
        
        // Notificar a otras pestañas
        this.broadcastAuthChange('logout', { reason });
        
        console.log('✅ Sesión cerrada correctamente');
    }
    
    // Refrescar token de sesión
    async refreshSession() {
        if (!this.currentUser || !this.currentUser.refreshToken) {
            console.warn('❌ No hay sesión para refrescar');
            return false;
        }
        
        try {
            // Generar nuevos tokens
            const newSessionToken = this.generateToken();
            const newRefreshToken = this.generateToken();
            
            this.currentUser.sessionToken = newSessionToken;
            this.currentUser.refreshToken = newRefreshToken;
            this.currentUser.lastRefresh = new Date().toISOString();
            
            // Guardar sesión actualizada
            this.saveSession();
            
            // Reconfigurar timer
            this.setupSessionTimer();
            
            console.log('🔄 Sesión refrescada correctamente');
            return true;
            
        } catch (error) {
            console.error('❌ Error refrescando sesión:', error);
            this.logout('refresh_error');
            return false;
        }
    }
    
    // Configurar timer de sesión
    setupSessionTimer() {
        // Limpiar timer anterior
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }
        
        // Configurar nuevo timer
        const timeout = this.currentUser?.rememberMe ? this.REFRESH_TIMEOUT : this.SESSION_TIMEOUT;
        
        this.sessionTimer = setTimeout(() => {
            console.warn('⏰ Sesión expirada por tiempo');
            this.logout('timeout');
        }, timeout);
        
        // Timer de advertencia (5 minutos antes)
        const warningTime = timeout - (5 * 60 * 1000);
        if (warningTime > 0) {
            setTimeout(() => {
                if (this.isLoggedIn) {
                    this.showSessionWarning();
                }
            }, warningTime);
        }
    }
    
    // Mostrar advertencia de expiración de sesión
    showSessionWarning() {
        const event = new CustomEvent('sessionWarning', {
            detail: {
                message: 'Tu sesión expirará en 5 minutos',
                timeRemaining: 5 * 60 * 1000
            }
        });
        window.dispatchEvent(event);
    }
    
    // Configurar monitoreo de sesión
    setupSessionMonitoring() {
        // Monitorear actividad del usuario
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                if (this.isLoggedIn) {
                    this.updateLastActivity();
                }
            }, true);
        });
        
        // Monitorear cambios de pestaña
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isLoggedIn) {
                this.validateSession();
            }
        });
    }
    
    // Actualizar última actividad
    updateLastActivity() {
        if (this.currentUser) {
            this.currentUser.lastActivity = new Date().toISOString();
        }
    }
    
    // Configurar verificaciones de seguridad
    setupSecurityChecks() {
        // Verificar integridad de la sesión cada 30 segundos
        setInterval(() => {
            if (this.isLoggedIn) {
                this.validateSession();
            }
        }, 30000);
        
        // Detectar múltiples pestañas
        window.addEventListener('storage', (e) => {
            if (e.key === this.SESSION_KEY && this.isLoggedIn) {
                // Otra pestaña modificó la sesión
                this.handleConcurrentSession(e);
            }
        });
    }
    
    // Manejar sesiones concurrentes
    handleConcurrentSession(event) {
        if (!event.newValue) {
            // Sesión eliminada en otra pestaña
            console.warn('🔄 Sesión cerrada en otra pestaña');
            this.logout('concurrent_logout');
        } else {
            // Sesión actualizada en otra pestaña
            try {
                const newSession = JSON.parse(event.newValue);
                if (newSession.user?.sessionToken !== this.currentUser?.sessionToken) {
                    console.warn('🔄 Nueva sesión detectada en otra pestaña');
                    this.loadSession();
                }
            } catch (error) {
                console.error('❌ Error procesando sesión concurrente:', error);
            }
        }
    }
    
    // Validar sesión actual
    validateSession() {
        if (!this.isLoggedIn || !this.currentUser) {
            return false;
        }
        
        try {
            const stored = localStorage.getItem(this.SESSION_KEY);
            if (!stored) {
                console.warn('❌ Sesión no encontrada en almacenamiento');
                this.logout('session_not_found');
                return false;
            }
            
            const session = JSON.parse(stored);
            const now = Date.now();
            
            // Verificar expiración
            if (session.expiresAt && now > session.expiresAt) {
                console.warn('⏰ Sesión expirada');
                this.logout('expired');
                return false;
            }
            
            // Verificar token
            if (session.user?.sessionToken !== this.currentUser.sessionToken) {
                console.warn('🔒 Token de sesión inválido');
                this.logout('invalid_token');
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Error validando sesión:', error);
            this.logout('validation_error');
            return false;
        }
    }
    
    // Guardar sesión en localStorage
    saveSession() {
        try {
            const timeout = this.currentUser?.rememberMe ? this.REFRESH_TIMEOUT : this.SESSION_TIMEOUT;
            
            const sessionData = {
                user: this.currentUser,
                isLoggedIn: this.isLoggedIn,
                expiresAt: Date.now() + timeout,
                createdAt: Date.now(),
                version: '2.0.0'
            };
            
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
            
            // Guardar hash de seguridad
            const securityHash = this.hashPassword(JSON.stringify(sessionData));
            localStorage.setItem(this.SECURITY_KEY, securityHash);
            
            console.log('💾 Sesión guardada correctamente');
            
            // Notificar cambio
            this.broadcastAuthChange('login');
            
        } catch (error) {
            console.error('❌ Error guardando sesión:', error);
        }
    }
    
    // Cargar sesión desde localStorage
    loadSession() {
        try {
            const sessionData = localStorage.getItem(this.SESSION_KEY);
            const securityHash = localStorage.getItem(this.SECURITY_KEY);
            
            if (!sessionData || !securityHash) {
                console.log('📝 No hay sesión guardada');
                return false;
            }
            
            const session = JSON.parse(sessionData);
            
            // Verificar integridad
            const expectedHash = this.hashPassword(sessionData);
            if (expectedHash !== securityHash) {
                console.warn('🔒 Sesión comprometida - hash inválido');
                this.clearSession();
                return false;
            }
            
            const now = Date.now();
            
            // Verificar expiración
            if (session.expiresAt && now > session.expiresAt) {
                console.warn('⏰ Sesión expirada al cargar');
                this.clearSession();
                return false;
            }
            
            // Verificar versión
            if (session.version !== '2.0.0') {
                console.warn('🔄 Versión de sesión obsoleta');
                this.clearSession();
                return false;
            }
            
            // Restaurar sesión
            this.currentUser = session.user;
            this.isLoggedIn = session.isLoggedIn;
            
            // Configurar timers
            this.setupSessionTimer();
            
            console.log('✅ Sesión restaurada:', this.currentUser.displayName);
            return true;
            
        } catch (error) {
            console.error('❌ Error cargando sesión:', error);
            this.clearSession();
            return false;
        }
    }
    
    // Limpiar sesión
    clearSession() {
        localStorage.removeItem(this.SESSION_KEY);
        localStorage.removeItem(this.REFRESH_KEY);
        localStorage.removeItem(this.SECURITY_KEY);
        console.log('🧹 Sesión limpiada');
    }
    
    // Verificar permisos
    hasPermission(permission) {
        if (!this.isLoggedIn || !this.currentUser) {
            return false;
        }
        return this.currentUser.permissions.includes(permission);
    }
    
    // Verificar rol
    hasRole(role) {
        if (!this.isLoggedIn || !this.currentUser) {
            return false;
        }
        return this.currentUser.role === role;
    }
    
    // Obtener información del usuario actual
    getCurrentUser() {
        if (!this.isLoggedIn) return null;
        
        return {
            username: this.currentUser.username,
            displayName: this.currentUser.displayName,
            role: this.currentUser.role,
            permissions: this.currentUser.permissions,
            email: this.currentUser.email,
            loginTime: this.currentUser.loginTime,
            lastActivity: this.currentUser.lastActivity
        };
    }
    
    // Verificar si está autenticado
    isAuthenticated() {
        return this.isLoggedIn && this.currentUser !== null && this.validateSession();
    }
    
    // Difundir cambios de autenticación
    broadcastAuthChange(action, data = {}) {
        const event = new CustomEvent('authChange', {
            detail: {
                action: action,
                user: this.getCurrentUser(),
                isLoggedIn: this.isLoggedIn,
                timestamp: Date.now(),
                ...data
            }
        });
        
        window.dispatchEvent(event);
        
        // También usar localStorage para comunicación entre pestañas
        localStorage.setItem('auth_broadcast', JSON.stringify({
            action: action,
            user: this.getCurrentUser(),
            isLoggedIn: this.isLoggedIn,
            timestamp: Date.now(),
            ...data
        }));
    }
    
    // Obtener estadísticas de seguridad
    getSecurityStats() {
        const stats = {
            totalUsers: Object.keys(this.users).length,
            activeUsers: Object.values(this.users).filter(u => u.active).length,
            lockedUsers: Object.values(this.users).filter(u => u.lockedUntil && u.lockedUntil > Date.now()).length,
            currentSession: this.getCurrentUser(),
            sessionTimeout: this.SESSION_TIMEOUT / 60000, // en minutos
            maxLoginAttempts: this.MAX_LOGIN_ATTEMPTS,
            lockoutTime: this.LOCKOUT_TIME / 60000 // en minutos
        };
        
        return stats;
    }
}

// Crear instancia global
window.authSystemPro = new AuthSystemPro();

// Inicializar el sistema
window.authSystemPro.init();

// Emitir evento de que el sistema está listo
window.dispatchEvent(new CustomEvent('authSystemReady', {
    detail: { system: 'AuthSystemPro', version: '2.0.0' }
}));

console.log('🔐 Sistema de autenticación profesional cargado e inicializado');