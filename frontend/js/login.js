// Sistema de Login Específico para la página de login
class LoginSystem {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkRememberedUser();
        this.setupFormValidation();
    }

    setupEventListeners() {
        // Formulario de login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Toggle de visibilidad de contraseña
        const passwordToggle = document.getElementById('passwordToggle');
        if (passwordToggle) {
            passwordToggle.addEventListener('click', () => {
                this.togglePasswordVisibility();
            });
        }

        // Modal de recuperación de contraseña
        const forgotPasswordLink = document.querySelector('.forgot-password');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showForgotPasswordModal();
            });
        }

        // Formulario de recuperación de contraseña
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }

        // Cerrar modales
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target);
            }
        });

        // Cerrar modales con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });

        // Autenticación social (demo)
        const socialButtons = document.querySelectorAll('.btn-social');
        socialButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.handleSocialAuth(button.classList.contains('btn-google') ? 'google' : 'facebook');
            });
        });
    }

    setupFormValidation() {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                this.validateEmail(emailInput.value);
            });
        }

        if (passwordInput) {
            passwordInput.addEventListener('blur', () => {
                this.validatePassword(passwordInput.value);
            });
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const formGroup = document.getElementById('email').closest('.form-group');
        const existingMessage = formGroup.querySelector('.form-message');
        
        if (existingMessage) {
            existingMessage.remove();
        }

        if (!email) {
            this.showFieldError(formGroup, 'El correo electrónico es requerido');
            return false;
        }

        if (!emailRegex.test(email)) {
            this.showFieldError(formGroup, 'Por favor ingresa un correo electrónico válido');
            return false;
        }

        this.showFieldSuccess(formGroup, 'Correo electrónico válido');
        return true;
    }

    validatePassword(password) {
        const formGroup = document.getElementById('password').closest('.form-group');
        const existingMessage = formGroup.querySelector('.form-message');
        
        if (existingMessage) {
            existingMessage.remove();
        }

        if (!password) {
            this.showFieldError(formGroup, 'La contraseña es requerida');
            return false;
        }

        if (password.length < 6) {
            this.showFieldError(formGroup, 'La contraseña debe tener al menos 6 caracteres');
            return false;
        }

        this.showFieldSuccess(formGroup, 'Contraseña válida');
        return true;
    }

    showFieldError(formGroup, message) {
        formGroup.classList.remove('success');
        formGroup.classList.add('error');
        
        const messageElement = document.createElement('div');
        messageElement.className = 'form-message error';
        messageElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        formGroup.appendChild(messageElement);
    }

    showFieldSuccess(formGroup, message) {
        formGroup.classList.remove('error');
        formGroup.classList.add('success');
        
        const messageElement = document.createElement('div');
        messageElement.className = 'form-message success';
        messageElement.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        formGroup.appendChild(messageElement);
    }

    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        const loginButton = document.getElementById('loginButton');
        const btnText = loginButton.querySelector('.btn-text');
        const btnSpinner = loginButton.querySelector('.btn-spinner');

        // Validar campos
        const isEmailValid = this.validateEmail(email);
        const isPasswordValid = this.validatePassword(password);

        if (!isEmailValid || !isPasswordValid) {
            this.showNotification('Por favor corrige los errores en el formulario', 'error');
            return;
        }

        // Mostrar loading
        btnText.style.display = 'none';
        btnSpinner.style.display = 'block';
        loginButton.disabled = true;

        try {
            // Simular llamada a la API
            const userData = await this.authenticateUser(email, password);
            
            // Guardar datos del usuario
            this.saveUserData(userData, rememberMe);
            
            // Mostrar mensaje de éxito
            this.showNotification('¡Bienvenido de nuevo! Redirigiendo...', 'success');
            
            // Redirigir después de un breve delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } catch (error) {
            this.showNotification(error.message, 'error');
        } finally {
            // Restaurar botón
            btnText.style.display = 'block';
            btnSpinner.style.display = 'none';
            loginButton.disabled = false;
        }
    }

    async authenticateUser(email, password) {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Credenciales de demo
        const demoUsers = [
            {
                email: 'demo@huellitas.com',
                password: '123456',
                user: {
                    id: 1,
                    nombre: 'Juan Demo',
                    email: 'demo@huellitas.com',
                    telefono: '+57 300 123 4567',
                    rol: 'cliente',
                    mascotas: [
                        { id: 1, nombre: 'Max', especie: 'perro', raza: 'Labrador' },
                        { id: 2, nombre: 'Luna', especie: 'gato', raza: 'Siamés' }
                    ]
                }
            },
            {
                email: 'admin@huellitas.com',
                password: 'admin123',
                user: {
                    id: 2,
                    nombre: 'Administrador',
                    email: 'admin@huellitas.com',
                    telefono: '+57 301 234 5678',
                    rol: 'admin'
                }
            }
        ];

        const user = demoUsers.find(u => u.email === email && u.password === password);

        if (!user) {
            throw new Error('Credenciales incorrectas. Por favor verifica tu email y contraseña.');
        }

        return user.user;
    }

    saveUserData(userData, rememberMe) {
        // Guardar en sessionStorage para la sesión actual
        sessionStorage.setItem('huellitas_user', JSON.stringify(userData));
        sessionStorage.setItem('authToken', 'demo-token-' + userData.id);

        if (rememberMe) {
            // Guardar en localStorage para persistencia
            localStorage.setItem('huellitas_user', JSON.stringify(userData));
            localStorage.setItem('authToken', 'demo-token-' + userData.id);
            localStorage.setItem('rememberMe', 'true');
        } else {
            // Limpiar localStorage si no quiere recordar
            localStorage.removeItem('huellitas_user');
            localStorage.removeItem('authToken');
            localStorage.removeItem('rememberMe');
        }
    }

    checkRememberedUser() {
        const rememberMe = localStorage.getItem('rememberMe');
        const savedUser = localStorage.getItem('huellitas_user');

        if (rememberMe && savedUser) {
            const userData = JSON.parse(savedUser);
            document.getElementById('email').value = userData.email;
            document.getElementById('rememberMe').checked = true;
            
            // Mostrar mensaje informativo
            this.showNotification(`Hola ${userData.nombre}, ya tenemos tus datos guardados. Solo ingresa tu contraseña.`, 'info');
        }
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleButton = document.getElementById('passwordToggle');
        const icon = toggleButton.querySelector('i');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
            toggleButton.setAttribute('aria-label', 'Ocultar contraseña');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
            toggleButton.setAttribute('aria-label', 'Mostrar contraseña');
        }
    }

    showForgotPasswordModal() {
        const modal = document.getElementById('forgotPasswordModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    async handleForgotPassword() {
        const emailInput = document.getElementById('recoveryEmail');
        const email = emailInput.value;

        if (!email) {
            this.showNotification('Por favor ingresa tu correo electrónico', 'error');
            return;
        }

        // Simular envío de email
        this.showNotification('Enviando enlace de recuperación...', 'info');

        await new Promise(resolve => setTimeout(resolve, 2000));

        this.showNotification(`Se ha enviado un enlace de recuperación a ${email}`, 'success');
        this.hideModal(document.getElementById('forgotPasswordModal'));
    }

    async handleSocialAuth(provider) {
        this.showNotification(`Iniciando sesión con ${provider === 'google' ? 'Google' : 'Facebook'}...`, 'info');

        // Simular autenticación social
        await new Promise(resolve => setTimeout(resolve, 2000));

        const socialUser = {
            id: 100 + (provider === 'google' ? 1 : 2),
            nombre: `Usuario ${provider === 'google' ? 'Google' : 'Facebook'}`,
            email: `usuario.${provider}@example.com`,
            telefono: '+57 300 000 0000',
            rol: 'cliente',
            provider: provider
        };

        this.saveUserData(socialUser, true);
        this.showNotification(`¡Bienvenido con ${provider === 'google' ? 'Google' : 'Facebook'}!`, 'success');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    hideModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            this.hideModal(modal);
        });
    }

    showNotification(message, type = 'info') {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${this.getNotificationIcon(type)}"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        // Animación de entrada
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }
}

// Inicializar el sistema de login cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const loginSystem = new LoginSystem();
    window.loginSystem = loginSystem;
});

// También manejar cuando la página ya está cargada
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLogin);
} else {
    initLogin();
}

function initLogin() {
    window.loginSystem = new LoginSystem();
}