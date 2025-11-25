// Aplicación principal
class HuellitasApp {
    constructor() {
        this.currentUser = null;
        this.cart = [];
        this.init();
    }

    init() {
        this.loadUser();
        this.setupEventListeners();
        this.loadFeaturedProducts();
        this.setupScrollEffects();
        this.setupMobileMenu();
    }

    loadUser() {
        const userData = localStorage.getItem('huellitas_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.updateAuthUI();
        }
    }

    setupEventListeners() {
        // Navegación
        document.getElementById('bookServiceBtn')?.addEventListener('click', () => {
            this.showBookingModal();
        });

        document.getElementById('viewShopBtn')?.addEventListener('click', () => {
            window.location.href = '#tienda';
        });

        document.getElementById('viewAllProducts')?.addEventListener('click', () => {
            // Navegar a la página de tienda completa
            console.log('Navegar a tienda completa');
        });

        // Reservas de servicios
        document.querySelectorAll('.service-book-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const serviceCard = e.target.closest('.service-card');
                const serviceName = serviceCard.querySelector('h3').textContent;
                const servicePrice = serviceCard.querySelector('.service-price').textContent;
                this.showBookingModal(serviceName, servicePrice);
            });
        });

        // Cerrar modales al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target);
            }
        });

        // Cerrar modales con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal').forEach(modal => {
                    this.hideModal(modal);
                });
            }
        });
    }

    setupMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            // Cerrar menú al hacer clic en un enlace
            document.querySelectorAll('.nav-menu a').forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }
    }

    setupScrollEffects() {
        // Header con efecto de scroll
        let lastScrollY = window.scrollY;
        const header = document.querySelector('.header');

        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
                header.style.boxShadow = 'var(--shadow-lg)';
            } else {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.boxShadow = 'var(--shadow)';
            }

            // Ocultar/mostrar header al hacer scroll
            if (window.scrollY > lastScrollY && window.scrollY > 100) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            lastScrollY = window.scrollY;
        });

        // Animación de aparición al hacer scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observar elementos para animación
        document.querySelectorAll('.service-card, .product-card, .testimonial-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    async loadFeaturedProducts() {
        try {
            // Simular carga de productos desde API
            const products = [
                {
                    id: 1,
                    name: 'Comida Premium para Perros',
                    category: 'Alimentos',
                    description: 'Alimento balanceado con ingredientes naturales',
                    price: '45.000',
                    image: 'dog-food',
                    stock: 'in'
                },
                {
                    id: 2,
                    name: 'Juguete Interactivo',
                    category: 'Juguetes',
                    description: 'Juguete durable para horas de diversión',
                    price: '25.000',
                    image: 'toy',
                    stock: 'in'
                },
                {
                    id: 3,
                    name: 'Shampoo Hipoalergénico',
                    category: 'Cuidado',
                    description: 'Suave con la piel, ideal para mascotas sensibles',
                    price: '35.000',
                    image: 'shampoo',
                    stock: 'low'
                },
                {
                    id: 4,
                    name: 'Cama Ortopédica',
                    category: 'Accesorios',
                    description: 'Cómoda cama para descanso perfecto',
                    price: '120.000',
                    image: 'bed',
                    stock: 'in'
                }
            ];

            this.renderProducts(products);
        } catch (error) {
            console.error('Error cargando productos:', error);
            this.showNotification('Error al cargar los productos', 'error');
        }
    }

    renderProducts(products) {
        const container = document.getElementById('featuredProducts');
        if (!container) return;

        container.innerHTML = products.map(product => `
            <div class="product-card">
                ${product.stock === 'low' ? '<span class="product-badge">Últimas unidades</span>' : ''}
                <div class="product-image">
                    <i class="fas fa-${this.getProductIcon(product.category)}"></i>
                </div>
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">$${product.price}</div>
                    <div class="product-stock ${product.stock === 'in' ? 'stock-in' : product.stock === 'low' ? 'stock-low' : 'stock-out'}">
                        <i class="fas ${product.stock === 'in' ? 'fa-check' : product.stock === 'low' ? 'fa-exclamation-triangle' : 'fa-times'}"></i>
                        ${product.stock === 'in' ? 'En stock' : product.stock === 'low' ? 'Pocas unidades' : 'Agotado'}
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-outline" onclick="app.addToCart(${product.id})" ${product.stock === 'out' ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus"></i>
                            Agregar
                        </button>
                        <button class="btn btn-primary" onclick="app.viewProduct(${product.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getProductIcon(category) {
        const icons = {
            'Alimentos': 'utensils',
            'Juguetes': 'baseball-ball',
            'Cuidado': 'spa',
            'Accesorios': 'collar'
        };
        return icons[category] || 'paw';
    }

    showBookingModal(serviceName = '', servicePrice = '') {
        // Implementar modal de reserva
        console.log('Mostrar modal de reserva para:', serviceName, servicePrice);
        this.showNotification('Funcionalidad de reserva en desarrollo', 'info');
    }

    addToCart(productId) {
        // Implementar lógica del carrito
        this.showNotification('Producto agregado al carrito', 'success');
    }

    viewProduct(productId) {
        // Implementar vista de producto
        console.log('Ver producto:', productId);
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${this.getNotificationIcon(type)}"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
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

    updateAuthUI() {
        const navAuth = document.getElementById('navAuth');
        if (!navAuth) return;

        if (this.currentUser) {
            navAuth.innerHTML = `
                <div class="user-dropdown">
                    <button class="user-btn">
                        <i class="fas fa-user"></i>
                        ${this.currentUser.nombre}
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
                        ${this.currentUser.rol === 'admin' ? `
                        <a href="/admin" class="dropdown-item">
                            <i class="fas fa-cog"></i> Administración
                        </a>
                        ` : ''}
                        <hr>
                        <button class="dropdown-item text-danger" onclick="app.logout()">
                            <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                        </button>
                    </div>
                </div>
            `;
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('huellitas_user');
        localStorage.removeItem('authToken');
        this.updateAuthUI();
        this.showNotification('Sesión cerrada correctamente', 'success');
    }

    // En la clase HuellitasApp, agrega este método:
setupTiendaNavigation() {
    // Navegación desde el index a la tienda
    const viewShopBtn = document.getElementById('viewShopBtn');
    if (viewShopBtn) {
        viewShopBtn.addEventListener('click', () => {
            window.location.href = 'tienda.html';
        });
    }

    // Navegación desde servicios a la tienda
    const serviceBookBtns = document.querySelectorAll('.service-book-btn');
    serviceBookBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            window.location.href = 'tienda.html';
        });
    });
}

// Y en el método init(), agrega:
init() {
    this.loadUser();
    this.checkAuthStatus();
    this.setupEventListeners();
    this.setupTiendaNavigation(); // ← Agregar esta línea
    this.loadFeaturedProducts();
    this.setupScrollEffects();
    this.setupMobileMenu();
}
}

// Inicializar la aplicación
const app = new HuellitasApp();

// Exportar para uso global
window.app = app;

