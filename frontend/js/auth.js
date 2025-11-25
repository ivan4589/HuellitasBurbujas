class Auth {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('user')) || null;
        this.init();
    }

    init() {
        this.updateUI();
    }

    async register(userData) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            this.token = data.token;
            this.user = data.user;
            
            localStorage.setItem('authToken', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));
            
            this.updateUI();
            return data;
        } catch (error) {
            throw error;
        }
    }

    async login(credentials) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            this.token = data.token;
            this.user = data.user;
            
            localStorage.setItem('authToken', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));
            
            this.updateUI();
            return data;
        } catch (error) {
            throw error;
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        this.updateUI();
    }

    updateUI() {
        const authButtons = document.querySelector('.nav-auth');
        const userMenu = document.getElementById('userMenu');
        
        if (this.user) {
            authButtons.innerHTML = `
                <div class="user-dropdown">
                    <button class="user-btn">
                        <i class="fas fa-user"></i>
                        ${this.user.nombre}
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="dropdown-menu">
                        <a href="/perfil" class="dropdown-item">
                            <i class="fas fa-user-edit"></i> Mi Perfil
                        </a>
                        <a href="/citas" class="dropdown-item">
                            <i class="fas fa-calendar-alt"></i> Mis Citas
                        </a>
                        <a href="/pedidos" class="dropdown-item">
                            <i class="fas fa-shopping-bag"></i> Mis Pedidos
                        </a>
                        ${this.user.rol === 'admin' ? `
                        <a href="/admin" class="dropdown-item">
                            <i class="fas fa-cog"></i> Administración
                        </a>
                        ` : ''}
                        <hr>
                        <button class="dropdown-item text-danger" onclick="auth.logout()">
                            <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                        </button>
                    </div>
                </div>
            `;
        } else {
            authButtons.innerHTML = `
                <button class="btn btn-outline" id="loginBtn">Iniciar Sesión</button>
                <button class="btn btn-primary" id="registerBtn">Registrarse</button>
            `;
        }
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }
}

const auth = new Auth();

// Modal de Login
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Iniciar Sesión</h2>
                <button class="close-modal">&times;</button>
            </div>
            <form id="loginForm">
                <div class="form-group">
                    <label for="loginEmail">Email</label>
                    <input type="email" id="loginEmail" required>
                </div>
                <div class="form-group">
                    <label for="loginPassword">Contraseña</label>
                    <input type="password" id="loginPassword" required>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Iniciar Sesión</button>
            </form>
            <div class="modal-footer">
                <p>¿No tienes cuenta? <a href="#" id="showRegister">Regístrate aquí</a></p>
            </div>
        </div>
    `;
    modal.style.display = 'block';

    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.querySelector('.close-modal').addEventListener('click', () => modal.style.display = 'none');
    document.getElementById('showRegister').addEventListener('click', showRegisterModal);
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        await auth.login({ email, password });
        document.getElementById('loginModal').style.display = 'none';
        showNotification('Login exitoso', 'success');
    } catch (error) {
        showNotification(error.message, 'error');
    }
}


// Funciones similares para registro...