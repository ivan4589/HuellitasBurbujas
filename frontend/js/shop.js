// Sistema de tienda y carrito
class ShopSystem {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('huellitas_cart')) || [];
        this.products = [];
        this.init();
    }

    init() {
        this.loadProducts();
        this.setupCartUI();
    }

    async loadProducts() {
        try {
            // Simular carga de productos
            this.products = [
                {
                    id: 1,
                    name: 'Comida Premium para Perros',
                    category: 'Alimentos',
                    description: 'Alimento balanceado con ingredientes naturales para una nutrición completa',
                    price: 45000,
                    originalPrice: 50000,
                    image: 'dog-food',
                    stock: 15,
                    features: ['Ingredientes naturales', 'Sin conservantes', 'Omega 3 y 6']
                },
                {
                    id: 2,
                    name: 'Juguete Interactivo',
                    category: 'Juguetes',
                    description: 'Juguete durable para horas de diversión y ejercicio mental',
                    price: 25000,
                    image: 'toy',
                    stock: 8,
                    features: ['Material resistente', 'Estimula inteligencia', 'Seguro para mascotas']
                },
                {
                    id: 3,
                    name: 'Shampoo Hipoalergénico',
                    category: 'Cuidado',
                    description: 'Suave con la piel, ideal para mascotas con piel sensible',
                    price: 35000,
                    image: 'shampoo',
                    stock: 3,
                    features: ['pH balanceado', 'Hipoalergénico', 'Aroma suave']
                },
                {
                    id: 4,
                    name: 'Cama Ortopédica',
                    category: 'Accesorios',
                    description: 'Cómoda cama con soporte ortopédico para descanso perfecto',
                    price: 120000,
                    originalPrice: 150000,
                    image: 'bed',
                    stock: 5,
                    features: ['Memory foam', 'Fácil de lavar', 'Antideslizante']
                }
            ];

        } catch (error) {
            console.error('Error cargando productos:', error);
        }
    }

    setupCartUI() {
        // Actualizar contador del carrito
        this.updateCartCount();
    }

    addToCart(productId, quantity = 1) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            this.showNotification('Producto no encontrado', 'error');
            return;
        }

        if (product.stock < quantity) {
            this.showNotification('Stock insuficiente', 'error');
            return;
        }

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            if (existingItem.quantity + quantity > product.stock) {
                this.showNotification('No hay suficiente stock', 'error');
                return;
            }
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                ...product,
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }

        this.saveCart();
        this.updateCartCount();
        this.showNotification('Producto agregado al carrito', 'success');
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
        this.showNotification('Producto removido del carrito', 'info');
    }

    updateQuantity(productId, newQuantity) {
        if (newQuantity < 1) {
            this.removeFromCart(productId);
            return;
        }

        const item = this.cart.find(item => item.id === productId);
        const product = this.products.find(p => p.id === productId);

        if (item && product) {
            if (newQuantity > product.stock) {
                this.showNotification('No hay suficiente stock', 'error');
                return;
            }
            item.quantity = newQuantity;
            this.saveCart();
            this.updateCartCount();
        }
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getCartItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    updateCartCount() {
        const cartCounters = document.querySelectorAll('.cart-count');
        const count = this.getCartItemCount();
        
        cartCounters.forEach(counter => {
            counter.textContent = count;
            counter.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    saveCart() {
        localStorage.setItem('huellitas_cart', JSON.stringify(this.cart));
    }

    showCartModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = this.getCartModalHTML();
        document.body.appendChild(modal);
        
        modal.style.display = 'block';
        this.setupCartModalEvents(modal);
    }

    getCartModalHTML() {
        return `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Tu Carrito de Compras</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="cart-content">
                    ${this.cart.length === 0 ? this.getEmptyCartHTML() : this.getCartItemsHTML()}
                </div>
                ${this.cart.length > 0 ? this.getCartFooterHTML() : ''}
            </div>
        `;
    }

    getEmptyCartHTML() {
        return `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Tu carrito está vacío</h3>
                <p>Agrega algunos productos para continuar</p>
                <button class="btn btn-primary" onclick="shopSystem.closeCartAndGoToShop()">
                    <i class="fas fa-store"></i>
                    Ir a la Tienda
                </button>
            </div>
        `;
    }

    getCartItemsHTML() {
        return `
            <div class="cart-items">
                ${this.cart.map(item => `
                    <div class="cart-item">
                        <div class="item-image">
                            <i class="fas fa-${this.getProductIcon(item.category)}"></i>
                        </div>
                        <div class="item-info">
                            <h4>${item.name}</h4>
                            <p class="item-category">${item.category}</p>
                            <div class="item-price">$${item.price.toLocaleString()}</div>
                        </div>
                        <div class="item-quantity">
                            <button class="quantity-btn" onclick="shopSystem.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" onclick="shopSystem.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        </div>
                        <div class="item-total">
                            $${(item.price * item.quantity).toLocaleString()}
                        </div>
                        <button class="item-remove" onclick="shopSystem.removeFromCart(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getCartFooterHTML() {
        const total = this.getCartTotal();
        return `
            <div class="cart-footer">
                <div class="cart-total">
                    <span>Total:</span>
                    <span class="total-amount">$${total.toLocaleString()}</span>
                </div>
                <div class="cart-actions">
                    <button class="btn btn-outline" onclick="shopSystem.closeCartModal()">
                        Seguir Comprando
                    </button>
                    <button class="btn btn-primary" onclick="shopSystem.checkout()">
                        <i class="fas fa-credit-card"></i>
                        Proceder al Pago
                    </button>
                </div>
            </div>
        `;
    }

    setupCartModalEvents(modal) {
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            this.closeCartModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeCartModal();
            }
        });
    }

    closeCartModal() {
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.style.display = 'none';
            setTimeout(() => modal.remove(), 300);
        }
    }

    closeCartAndGoToShop() {
        this.closeCartModal();
        // Scroll a la sección de tienda
        document.getElementById('tienda')?.scrollIntoView({ behavior: 'smooth' });
    }

    checkout() {
        if (!window.app || !window.app.currentUser) {
            this.showNotification('Debes iniciar sesión para continuar', 'warning');
            authSystem.showLoginModal();
            this.closeCartModal();
            return;
        }

        // Simular proceso de checkout
        this.showNotification('Procesando tu pedido...', 'info');
        
        setTimeout(() => {
            this.cart = [];
            this.saveCart();
            this.updateCartCount();
            this.closeCartModal();
            this.showNotification('¡Pedido realizado exitosamente!', 'success');
        }, 2000);
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

    showNotification(message, type = 'info') {
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, type);
        } else {
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Inicializar sistema de tienda
const shopSystem = new ShopSystem();

// Hacer disponible globalmente
window.shopSystem = shopSystem;

// Conectar con la aplicación principal
if (window.app) {
    // Sobrescribir métodos para usar el sistema de tienda completo
    window.app.addToCart = (productId) => shopSystem.addToCart(productId);
    window.app.viewProduct = (productId) => {
        // Implementar vista de producto detallada
        console.log('Ver producto detallado:', productId);
    };
}