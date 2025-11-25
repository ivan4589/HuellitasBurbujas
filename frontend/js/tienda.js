// Sistema de Tienda Virtual
class TiendaSystem {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.productsPerPage = 12;
        this.currentView = 'grid';
        this.filters = {
            category: 'all',
            species: 'all',
            age: 'all',
            price: 'all',
            brand: 'all',
            size: 'all',
            ingredient: 'all',
            stock: 'all',
            search: ''
        };
        this.sortBy = 'name-asc';
        this.init();
    }

    init() {
        this.loadProducts();
        this.setupEventListeners();
        this.setupCart();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Filtros
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.applyFilters();
        });

        document.getElementById('speciesFilter').addEventListener('change', (e) => {
            this.filters.species = e.target.value;
            this.applyFilters();
        });

        document.getElementById('ageFilter').addEventListener('change', (e) => {
            this.filters.age = e.target.value;
            this.applyFilters();
        });

        document.getElementById('priceFilter').addEventListener('change', (e) => {
            this.filters.price = e.target.value;
            this.applyFilters();
        });

        document.getElementById('brandFilter').addEventListener('change', (e) => {
            this.filters.brand = e.target.value;
            this.applyFilters();
        });

        document.getElementById('sizeFilter').addEventListener('change', (e) => {
            this.filters.size = e.target.value;
            this.applyFilters();
        });

        document.getElementById('ingredientFilter').addEventListener('change', (e) => {
            this.filters.ingredient = e.target.value;
            this.applyFilters();
        });

        document.getElementById('stockFilter').addEventListener('change', (e) => {
            this.filters.stock = e.target.value;
            this.applyFilters();
        });

        // Búsqueda
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.applyFilters();
        });

        document.getElementById('searchBtn').addEventListener('click', () => {
            this.applyFilters();
        });

        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.applyFilters();
            }
        });

        // Botones de filtros
        document.getElementById('applyFilters').addEventListener('click', () => {
            this.applyFilters();
        });

        document.getElementById('resetFilters').addEventListener('click', () => {
            this.resetFilters();
        });

        document.getElementById('resetSearch').addEventListener('click', () => {
            this.resetFilters();
        });

        // Ordenamiento
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.applyFilters();
        });

        // Vista (grid/list)
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setView(e.target.closest('.view-btn').dataset.view);
            });
        });

        // Filtros avanzados
        document.getElementById('advancedToggle').addEventListener('click', () => {
            this.toggleAdvancedFilters();
        });

        // Categorías destacadas
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                const species = e.currentTarget.dataset.species;
                this.filterByCategory(category, species);
            });
        });

        // Enlaces de categorías en footer
        document.querySelectorAll('[data-filter]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.currentTarget.dataset.filter;
                this.filterByCategory(category);
            });
        });

        // Paginación
        document.getElementById('prevPage').addEventListener('click', () => {
            this.previousPage();
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            this.nextPage();
        });

        // Carrito
        document.getElementById('cartLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showCartModal();
        });

        // Cerrar modales
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }

    setupCart() {
        // Inicializar carrito desde localStorage
        this.cart = JSON.parse(localStorage.getItem('huellitas_cart')) || [];
        this.updateCartCount();
    }

    checkAuthStatus() {
        // Verificar si el usuario está logueado para mostrar opciones personalizadas
        const user = JSON.parse(localStorage.getItem('huellitas_user') || sessionStorage.getItem('huellitas_user') || 'null');
        if (user) {
            this.currentUser = user;
        }
    }

    async loadProducts() {
        try {
            // Mostrar loading
            this.showLoadingState();

            // Simular carga de productos desde API
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Datos de ejemplo de productos
            this.products = this.generateSampleProducts();
            this.applyFilters();

        } catch (error) {
            console.error('Error cargando productos:', error);
            this.showNotification('Error al cargar los productos', 'error');
        }
    }

    generateSampleProducts() {
        return [
            // ALIMENTOS PARA PERROS
            {
                id: 1,
                name: 'Alimento Premium para Cachorros',
                category: 'alimentos',
                species: 'perro',
                age: 'cachorro',
                brand: 'royal-canin',
                size: 'pequeno',
                ingredients: 'natural',
                description: 'Alimento balanceado para cachorros de razas pequeñas',
                price: 45000,
                originalPrice: 50000,
                image: 'alimento-perro-cachorro',
                stock: 15,
                rating: 4.8,
                reviews: 124,
                features: ['Proteína de alta calidad', 'DHA para desarrollo cerebral', 'Antioxidantes naturales'],
                badge: 'new'
            },
            {
                id: 2,
                name: 'Alimento para Perros Adultos',
                category: 'alimentos',
                species: 'perro',
                age: 'adulto',
                brand: 'hills',
                size: 'mediano',
                ingredients: 'grain-free',
                description: 'Nutrición completa para perros adultos de razas medianas',
                price: 52000,
                originalPrice: null,
                image: 'alimento-perro-adulto',
                stock: 8,
                rating: 4.6,
                reviews: 89,
                features: ['Sin granos', 'Piel y pelaje saludable', 'Digestión sensible'],
                badge: null
            },
            {
                id: 3,
                name: 'Alimento Senior para Perros',
                category: 'alimentos',
                species: 'perro',
                age: 'senior',
                brand: 'purina',
                size: 'grande',
                ingredients: 'natural',
                description: 'Fórmula especial para perros senior de razas grandes',
                price: 58000,
                originalPrice: 65000,
                image: 'alimento-perro-senior',
                stock: 5,
                rating: 4.7,
                reviews: 67,
                features: ['Articulaciones saludables', 'Función cognitiva', 'Peso controlado'],
                badge: 'sale'
            },

            // ALIMENTOS PARA GATOS
            {
                id: 4,
                name: 'Alimento para Gatitos',
                category: 'alimentos',
                species: 'gato',
                age: 'cachorro',
                brand: 'royal-canin',
                size: 'pequeno',
                ingredients: 'hypoallergenic',
                description: 'Nutrición especializada para gatitos en crecimiento',
                price: 38000,
                originalPrice: null,
                image: 'alimento-gato-cachorro',
                stock: 12,
                rating: 4.9,
                reviews: 156,
                features: ['Sistema inmune fuerte', 'Ojos saludables', 'Crecimiento óptimo'],
                badge: 'hot'
            },
            {
                id: 5,
                name: 'Alimento para Gatos Adultos',
                category: 'alimentos',
                species: 'gato',
                age: 'adulto',
                brand: 'hills',
                size: 'mediano',
                ingredients: 'grain-free',
                description: 'Alimento balanceado para gatos adultos indoor',
                price: 42000,
                originalPrice: 48000,
                image: 'alimento-gato-adulto',
                stock: 10,
                rating: 4.5,
                reviews: 92,
                features: ['Control de bolas de pelo', 'Salud urinaria', 'Peso ideal'],
                badge: 'sale'
            },

            // JUGUETES
            {
                id: 6,
                name: 'Pelota Interactiva para Perros',
                category: 'juguetes',
                species: 'perro',
                age: 'all',
                brand: 'nutre',
                size: 'mediano',
                ingredients: 'all',
                description: 'Pelota durable con sonido para horas de diversión',
                price: 25000,
                originalPrice: null,
                image: 'juguete-pelota',
                stock: 20,
                rating: 4.4,
                reviews: 78,
                features: ['Material resistente', 'Sonido atractivo', 'Fácil de limpiar'],
                badge: null
            },
            {
                id: 7,
                name: 'Rascador para Gatos',
                category: 'juguetes',
                species: 'gato',
                age: 'all',
                brand: 'eukanuba',
                size: 'pequeno',
                ingredients: 'all',
                description: 'Rascador de sisal con plataforma de descanso',
                price: 35000,
                originalPrice: 42000,
                image: 'juguete-rascador',
                stock: 8,
                rating: 4.7,
                reviews: 45,
                features: ['Sisal natural', 'Estructura estable', 'Múltiples niveles'],
                badge: 'sale'
            },
            {
                id: 8,
                name: 'Juguete Dental para Perros',
                category: 'juguetes',
                species: 'perro',
                age: 'adulto',
                brand: 'purina',
                size: 'all',
                ingredients: 'natural',
                description: 'Juguete que ayuda a la limpieza dental de tu perro',
                price: 18000,
                originalPrice: null,
                image: 'juguete-dental',
                stock: 15,
                rating: 4.6,
                reviews: 63,
                features: ['Limpieza dental', 'Encías saludables', 'Material seguro'],
                badge: 'new'
            },

            // ACCESORIOS
            {
                id: 9,
                name: 'Cama Ortopédica para Perros',
                category: 'accesorios',
                species: 'perro',
                age: 'senior',
                brand: 'royal-canin',
                size: 'grande',
                ingredients: 'all',
                description: 'Cama con memory foam para perros con problemas articulares',
                price: 120000,
                originalPrice: 150000,
                image: 'accesorio-cama',
                stock: 5,
                rating: 4.9,
                reviews: 34,
                features: ['Memory foam', 'Fácil de lavar', 'Base antideslizante'],
                badge: 'sale'
            },
            {
                id: 10,
                name: 'Transportadora para Gatos',
                category: 'accesorios',
                species: 'gato',
                age: 'all',
                brand: 'hills',
                size: 'mediano',
                ingredients: 'all',
                description: 'Transportadora segura y cómoda para viajes',
                price: 75000,
                originalPrice: null,
                image: 'accesorio-transportadora',
                stock: 7,
                rating: 4.3,
                reviews: 28,
                features: ['Ventilación superior', 'Fácil de limpiar', 'Segura'],
                badge: null
            },

            // MEDICAMENTOS
            {
                id: 11,
                name: 'Antiparasitario para Perros',
                category: 'medicamentos',
                species: 'perro',
                age: 'adulto',
                brand: 'purina',
                size: 'mediano',
                ingredients: 'all',
                description: 'Tabletas para control de parásitos internos y externos',
                price: 35000,
                originalPrice: 42000,
                image: 'medicamento-antiparasitario',
                stock: 12,
                rating: 4.8,
                reviews: 156,
                features: ['Protección completa', 'Fácil administración', 'Efectivo'],
                badge: 'sale'
            },
            {
                id: 12,
                name: 'Vitaminas para Gatos',
                category: 'medicamentos',
                species: 'gato',
                age: 'all',
                brand: 'nutre',
                size: 'all',
                ingredients: 'natural',
                description: 'Suplemento vitamínico para gatos de todas las edades',
                price: 28000,
                originalPrice: null,
                image: 'medicamento-vitaminas',
                stock: 18,
                rating: 4.5,
                reviews: 89,
                features: ['Multivitamínico', 'Sabor atractivo', 'Fácil de administrar'],
                badge: 'new'
            },

            // CUIDADO E HIGIENE
            {
                id: 13,
                name: 'Shampoo Hipoalergénico',
                category: 'cuidado',
                species: 'all',
                age: 'all',
                brand: 'eukanuba',
                size: 'all',
                ingredients: 'hypoallergenic',
                description: 'Shampoo suave para mascotas con piel sensible',
                price: 22000,
                originalPrice: 28000,
                image: 'cuidado-shampoo',
                stock: 25,
                rating: 4.7,
                reviews: 134,
                features: ['pH balanceado', 'Sin fragancias', 'Hipoalergénico'],
                badge: 'sale'
            },
            {
                id: 14,
                name: 'Cepillo para Pelaje Largo',
                category: 'cuidado',
                species: 'all',
                age: 'all',
                brand: 'royal-canin',
                size: 'all',
                ingredients: 'all',
                description: 'Cepillo profesional para mascotas de pelaje largo',
                price: 15000,
                originalPrice: null,
                image: 'cuidado-cepillo',
                stock: 30,
                rating: 4.4,
                reviews: 67,
                features: ['Púas redondeadas', 'Ergonómico', 'Fácil limpieza'],
                badge: null
            }
        ];
    }

    applyFilters() {
        this.currentPage = 1;
        
        // Filtrar productos
        this.filteredProducts = this.products.filter(product => {
            // Filtro por categoría
            if (this.filters.category !== 'all' && product.category !== this.filters.category) {
                return false;
            }

            // Filtro por especie
            if (this.filters.species !== 'all' && product.species !== this.filters.species) {
                return false;
            }

            // Filtro por edad
            if (this.filters.age !== 'all' && product.age !== this.filters.age && product.age !== 'all') {
                return false;
            }

            // Filtro por precio
            if (this.filters.price !== 'all') {
                const priceRange = this.filters.price;
                if (priceRange === '0-25000' && product.price > 25000) return false;
                if (priceRange === '25000-50000' && (product.price < 25000 || product.price > 50000)) return false;
                if (priceRange === '50000-100000' && (product.price < 50000 || product.price > 100000)) return false;
                if (priceRange === '100000+' && product.price < 100000) return false;
            }

            // Filtro por marca
            if (this.filters.brand !== 'all' && product.brand !== this.filters.brand) {
                return false;
            }

            // Filtro por tamaño
            if (this.filters.size !== 'all' && product.size !== this.filters.size && product.size !== 'all') {
                return false;
            }

            // Filtro por ingredientes
            if (this.filters.ingredient !== 'all' && product.ingredients !== this.filters.ingredient) {
                return false;
            }

            // Filtro por stock
            if (this.filters.stock !== 'all') {
                if (this.filters.stock === 'in-stock' && product.stock === 0) return false;
                if (this.filters.stock === 'low-stock' && product.stock > 5) return false;
            }

            // Filtro por búsqueda
            if (this.filters.search) {
                const searchTerm = this.filters.search.toLowerCase();
                const searchableText = `${product.name} ${product.description} ${product.category} ${product.species}`.toLowerCase();
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }

            return true;
        });

        // Ordenar productos
        this.sortProducts();

        // Renderizar resultados
        this.renderProducts();
        this.updateResultsInfo();
        this.setupPagination();
    }

    sortProducts() {
        this.filteredProducts.sort((a, b) => {
            switch (this.sortBy) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'popularity':
                    return b.rating - a.rating;
                case 'newest':
                    return b.id - a.id;
                default:
                    return 0;
            }
        });
    }

    renderProducts() {
        const grid = document.getElementById('productsGrid');
        const loading = document.getElementById('loadingState');
        const empty = document.getElementById('emptyState');

        // Ocultar loading
        loading.style.display = 'none';

        if (this.filteredProducts.length === 0) {
            // Mostrar estado vacío
            grid.style.display = 'none';
            empty.style.display = 'block';
            return;
        }

        // Mostrar grid
        grid.style.display = 'grid';
        empty.style.display = 'none';

        // Calcular productos para la página actual
        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        const productsToShow = this.filteredProducts.slice(startIndex, endIndex);

        // Renderizar productos
        grid.innerHTML = productsToShow.map(product => this.renderProductCard(product)).join('');

        // Aplicar clase de vista
        grid.className = `products-grid ${this.currentView}-view`;
    }

    renderProductCard(product) {
        const discount = product.originalPrice ? 
            Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

        return `
            <div class="product-card" data-product-id="${product.id}">
                ${product.badge ? `<span class="product-badge ${product.badge}">${this.getBadgeText(product.badge)}</span>` : ''}
                
                <div class="product-image">
                    <i class="fas fa-${this.getProductIcon(product.category)}"></i>
                </div>

                <div class="product-info">
                    <span class="product-category">${this.getCategoryName(product.category)} • ${this.getSpeciesName(product.species)}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>

                    <div class="product-specs">
                        <span class="product-spec">${this.getAgeName(product.age)}</span>
                        <span class="product-spec">${this.getSizeName(product.size)}</span>
                        ${product.ingredients !== 'all' ? `<span class="product-spec">${this.getIngredientName(product.ingredients)}</span>` : ''}
                    </div>

                    <div class="product-price">
                        <span class="current-price">$${product.price.toLocaleString()}</span>
                        ${product.originalPrice ? `
                            <span class="original-price">$${product.originalPrice.toLocaleString()}</span>
                            <span class="discount">-${discount}%</span>
                        ` : ''}
                    </div>

                    <div class="product-stock ${product.stock > 10 ? 'stock-in' : product.stock > 0 ? 'stock-low' : 'stock-out'}">
                        <i class="fas ${product.stock > 10 ? 'fa-check' : product.stock > 0 ? 'fa-exclamation-triangle' : 'fa-times'}"></i>
                        ${product.stock > 10 ? 'En stock' : product.stock > 0 ? 'Pocas unidades' : 'Agotado'}
                    </div>

                    <div class="product-actions">
                        <div class="btn-quantity">
                            <button class="quantity-btn" onclick="tiendaSystem.decreaseQuantity(${product.id})">-</button>
                            <span class="quantity-value" id="quantity-${product.id}">1</span>
                            <button class="quantity-btn" onclick="tiendaSystem.increaseQuantity(${product.id})">+</button>
                        </div>
                        <button class="btn btn-primary" onclick="tiendaSystem.addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus"></i>
                            Agregar
                        </button>
                        <button class="btn btn-outline" onclick="tiendaSystem.viewProduct(${product.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ... (continuará con más métodos en la siguiente parte)
        // Métodos de utilidad para obtener nombres y iconos
    getCategoryName(category) {
        const categories = {
            'alimentos': 'Alimentos',
            'juguetes': 'Juguetes',
            'medicamentos': 'Medicamentos',
            'accesorios': 'Accesorios',
            'cuidado': 'Cuidado e Higiene'
        };
        return categories[category] || category;
    }

    getSpeciesName(species) {
        const speciesNames = {
            'perro': 'Perro',
            'gato': 'Gato',
            'ave': 'Ave',
            'roedor': 'Roedor',
            'otro': 'Otro',
            'all': 'Todas'
        };
        return speciesNames[species] || species;
    }

    getAgeName(age) {
        const ages = {
            'cachorro': 'Cachorro',
            'adulto': 'Adulto',
            'senior': 'Senior',
            'all': 'Todas las edades'
        };
        return ages[age] || age;
    }

    getSizeName(size) {
        const sizes = {
            'pequeno': 'Pequeño',
            'mediano': 'Mediano',
            'grande': 'Grande',
            'gigante': 'Gigante',
            'all': 'Todos'
        };
        return sizes[size] || size;
    }

    getIngredientName(ingredient) {
        const ingredients = {
            'grain-free': 'Sin Granos',
            'hypoallergenic': 'Hipoalergénico',
            'natural': 'Natural',
            'organic': 'Orgánico',
            'all': 'Todos'
        };
        return ingredients[ingredient] || ingredient;
    }

    getBadgeText(badge) {
        const badges = {
            'new': 'Nuevo',
            'sale': 'Oferta',
            'hot': 'Popular'
        };
        return badges[badge] || badge;
    }

    getProductIcon(category) {
        const icons = {
            'alimentos': 'utensils',
            'juguetes': 'baseball-ball',
            'medicamentos': 'pills',
            'accesorios': 'collar',
            'cuidado': 'spa'
        };
        return icons[category] || 'paw';
    }

    // Métodos de vista y filtros
    setView(view) {
        this.currentView = view;
        const grid = document.getElementById('productsGrid');
        grid.className = `products-grid ${view}-view`;
        
        // Actualizar botones activos
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
    }

    toggleAdvancedFilters() {
        const content = document.getElementById('advancedContent');
        const toggle = document.getElementById('advancedToggle');
        content.classList.toggle('active');
        
        const icon = toggle.querySelector('.fa-chevron-down');
        icon.classList.toggle('fa-chevron-up');
    }

    filterByCategory(category, species = 'all') {
        this.filters.category = category;
        this.filters.species = species;
        
        // Actualizar selects
        document.getElementById('categoryFilter').value = category;
        document.getElementById('speciesFilter').value = species;
        
        this.applyFilters();
        
        // Scroll a productos
        document.querySelector('.products-section').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    resetFilters() {
        // Resetear todos los filtros
        this.filters = {
            category: 'all',
            species: 'all',
            age: 'all',
            price: 'all',
            brand: 'all',
            size: 'all',
            ingredient: 'all',
            stock: 'all',
            search: ''
        };

        // Resetear controles de UI
        document.getElementById('categoryFilter').value = 'all';
        document.getElementById('speciesFilter').value = 'all';
        document.getElementById('ageFilter').value = 'all';
        document.getElementById('priceFilter').value = 'all';
        document.getElementById('brandFilter').value = 'all';
        document.getElementById('sizeFilter').value = 'all';
        document.getElementById('ingredientFilter').value = 'all';
        document.getElementById('stockFilter').value = 'all';
        document.getElementById('searchInput').value = '';

        this.applyFilters();
    }

    // Métodos de paginación
    setupPagination() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        const pagination = document.getElementById('pagination');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        const numbers = document.getElementById('paginationNumbers');

        if (totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        }

        pagination.style.display = 'flex';

        // Configurar botones anterior/siguiente
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages;

        // Generar números de página
        numbers.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-number ${i === this.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => this.goToPage(i));
            numbers.appendChild(pageBtn);
        }
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderProducts();
        this.setupPagination();
        
        // Scroll suave al top de productos
        document.querySelector('.products-section').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    nextPage() {
        if (this.currentPage < Math.ceil(this.filteredProducts.length / this.productsPerPage)) {
            this.goToPage(this.currentPage + 1);
        }
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.goToPage(this.currentPage - 1);
        }
    }

    // Métodos de información y UI
    updateResultsInfo() {
        const total = this.filteredProducts.length;
        const start = Math.min((this.currentPage - 1) * this.productsPerPage + 1, total);
        const end = Math.min(this.currentPage * this.productsPerPage, total);
        const countElement = document.getElementById('resultsCount');

        if (total === 0) {
            countElement.textContent = 'No se encontraron productos';
        } else if (total <= this.productsPerPage) {
            countElement.textContent = `${total} producto${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`;
        } else {
            countElement.textContent = `Mostrando ${start}-${end} de ${total} productos`;
        }

        // Actualizar título
        const title = document.getElementById('productsTitle');
        if (this.filters.category !== 'all') {
            title.textContent = this.getCategoryName(this.filters.category);
        } else if (this.filters.search) {
            title.textContent = `Resultados para "${this.filters.search}"`;
        } else {
            title.textContent = 'Todos los Productos';
        }
    }

    showLoadingState() {
        document.getElementById('productsGrid').style.display = 'none';
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('loadingState').style.display = 'block';
        document.getElementById('pagination').style.display = 'none';
    }

    // Métodos de productos y carrito
    increaseQuantity(productId) {
        const quantityElement = document.getElementById(`quantity-${productId}`);
        let quantity = parseInt(quantityElement.textContent) || 1;
        const product = this.products.find(p => p.id === productId);
        
        if (product && quantity < product.stock) {
            quantity++;
            quantityElement.textContent = quantity;
        }
    }

    decreaseQuantity(productId) {
        const quantityElement = document.getElementById(`quantity-${productId}`);
        let quantity = parseInt(quantityElement.textContent) || 1;
        
        if (quantity > 1) {
            quantity--;
            quantityElement.textContent = quantity;
        }
    }

    getQuantity(productId) {
        const quantityElement = document.getElementById(`quantity-${productId}`);
        return parseInt(quantityElement?.textContent) || 1;
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const quantity = this.getQuantity(productId);

        if (product.stock < quantity) {
            this.showNotification('No hay suficiente stock disponible', 'error');
            return;
        }

        // Verificar si el usuario está logueado
        if (!this.currentUser) {
            this.showNotification('Debes iniciar sesión para agregar productos al carrito', 'warning');
            // Podrías redirigir al login aquí
            return;
        }

        // Buscar producto en el carrito
        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            // Actualizar cantidad si ya existe
            if (existingItem.quantity + quantity > product.stock) {
                this.showNotification('No hay suficiente stock disponible', 'error');
                return;
            }
            existingItem.quantity += quantity;
        } else {
            // Agregar nuevo item al carrito
            this.cart.push({
                ...product,
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }

        // Actualizar stock (en una app real, esto se haría en el backend)
        product.stock -= quantity;

        // Guardar en localStorage
        this.saveCart();

        // Actualizar UI
        this.updateCartCount();
        this.renderProducts(); // Re-renderizar para actualizar stock
        this.showNotification('Producto agregado al carrito', 'success');
    }

    saveCart() {
        localStorage.setItem('huellitas_cart', JSON.stringify(this.cart));
    }

    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        document.getElementById('cartCount').textContent = count;
        
        // Mostrar/ocultar badge
        const cartCount = document.getElementById('cartCount');
        cartCount.style.display = count > 0 ? 'flex' : 'none';
    }

    viewProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const modal = document.getElementById('productModal');
        const title = document.getElementById('productModalTitle');
        const body = document.getElementById('productModalBody');

        title.textContent = product.name;
        body.innerHTML = this.renderProductModal(product);

        modal.style.display = 'block';
    }

    renderProductModal(product) {
        const discount = product.originalPrice ? 
            Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

        return `
            <div class="product-modal">
                <div class="product-modal-grid">
                    <div class="product-modal-image">
                        <div class="product-image-large">
                            <i class="fas fa-${this.getProductIcon(product.category)}"></i>
                        </div>
                    </div>
                    
                    <div class="product-modal-details">
                        <div class="product-header">
                            <span class="product-category">${this.getCategoryName(product.category)} • ${this.getSpeciesName(product.species)}</span>
                            <h2>${product.name}</h2>
                            <div class="product-rating">
                                <div class="stars">
                                    ${this.renderStars(product.rating)}
                                </div>
                                <span class="rating-text">${product.rating} (${product.reviews} reseñas)</span>
                            </div>
                        </div>

                        <p class="product-description">${product.description}</p>

                        <div class="product-specs-detailed">
                            <div class="spec-item">
                                <strong>Especie:</strong>
                                <span>${this.getSpeciesName(product.species)}</span>
                            </div>
                            <div class="spec-item">
                                <strong>Edad:</strong>
                                <span>${this.getAgeName(product.age)}</span>
                            </div>
                            <div class="spec-item">
                                <strong>Tamaño:</strong>
                                <span>${this.getSizeName(product.size)}</span>
                            </div>
                            ${product.ingredients !== 'all' ? `
                            <div class="spec-item">
                                <strong>Ingredientes:</strong>
                                <span>${this.getIngredientName(product.ingredients)}</span>
                            </div>
                            ` : ''}
                            <div class="spec-item">
                                <strong>Marca:</strong>
                                <span>${this.getBrandName(product.brand)}</span>
                            </div>
                        </div>

                        <div class="product-features">
                            <h4>Características:</h4>
                            <ul>
                                ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                            </ul>
                        </div>

                        <div class="product-purchase">
                            <div class="price-section">
                                <span class="current-price">$${product.price.toLocaleString()}</span>
                                ${product.originalPrice ? `
                                    <span class="original-price">$${product.originalPrice.toLocaleString()}</span>
                                    <span class="discount">-${discount}%</span>
                                ` : ''}
                            </div>

                            <div class="stock-info ${product.stock > 10 ? 'stock-in' : product.stock > 0 ? 'stock-low' : 'stock-out'}">
                                <i class="fas ${product.stock > 10 ? 'fa-check' : product.stock > 0 ? 'fa-exclamation-triangle' : 'fa-times'}"></i>
                                ${product.stock > 10 ? 'En stock' : product.stock > 0 ? `Solo ${product.stock} disponibles` : 'Agotado'}
                            </div>

                            <div class="purchase-actions">
                                <div class="quantity-controls">
                                    <label>Cantidad:</label>
                                    <div class="btn-quantity">
                                        <button class="quantity-btn" onclick="tiendaSystem.decreaseQuantity(${product.id})">-</button>
                                        <span class="quantity-value" id="modal-quantity-${product.id}">1</span>
                                        <button class="quantity-btn" onclick="tiendaSystem.increaseQuantity(${product.id})">+</button>
                                    </div>
                                </div>
                                
                                <button class="btn btn-primary btn-large" onclick="tiendaSystem.addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                                    <i class="fas fa-cart-plus"></i>
                                    Agregar al Carrito
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getBrandName(brand) {
        const brands = {
            'royal-canin': 'Royal Canin',
            'purina': 'Purina',
            'hills': 'Hill\'s Science Diet',
            'eukanuba': 'Eukanuba',
            'nutre': 'Nutre'
        };
        return brands[brand] || brand;
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        let stars = '';
        
        // Estrellas llenas
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        // Media estrella
        if (halfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Estrellas vacías
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }

    showCartModal() {
        const modal = document.getElementById('cartModal');
        const body = document.getElementById('cartModalBody');

        body.innerHTML = this.renderCartModal();

        modal.style.display = 'block';
    }

    renderCartModal() {
        if (this.cart.length === 0) {
            return `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Tu carrito está vacío</h3>
                    <p>Agrega algunos productos para continuar</p>
                    <button class="btn btn-primary" onclick="tiendaSystem.hideModal(document.getElementById('cartModal'))">
                        <i class="fas fa-store"></i>
                        Seguir Comprando
                    </button>
                </div>
            `;
        }

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        return `
            <div class="cart-content">
                <div class="cart-items">
                    ${this.cart.map(item => `
                        <div class="cart-item">
                            <div class="item-image">
                                <i class="fas fa-${this.getProductIcon(item.category)}"></i>
                            </div>
                            <div class="item-info">
                                <h4>${item.name}</h4>
                                <p class="item-category">${this.getCategoryName(item.category)}</p>
                                <div class="item-price">$${item.price.toLocaleString()}</div>
                            </div>
                            <div class="item-quantity">
                                <button class="quantity-btn" onclick="tiendaSystem.updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                                <span>${item.quantity}</span>
                                <button class="quantity-btn" onclick="tiendaSystem.updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                            </div>
                            <div class="item-total">
                                $${(item.price * item.quantity).toLocaleString()}
                            </div>
                            <button class="item-remove" onclick="tiendaSystem.removeFromCart(${item.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>

                <div class="cart-summary">
                    <div class="cart-total">
                        <span>Total:</span>
                        <span class="total-amount">$${total.toLocaleString()}</span>
                    </div>
                    
                    <div class="cart-actions">
                        <button class="btn btn-outline" onclick="tiendaSystem.hideModal(document.getElementById('cartModal'))">
                            Seguir Comprando
                        </button>
                        <button class="btn btn-primary" onclick="tiendaSystem.checkout()">
                            <i class="fas fa-credit-card"></i>
                            Proceder al Pago
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    updateCartQuantity(productId, newQuantity) {
        if (newQuantity < 1) {
            this.removeFromCart(productId);
            return;
        }

        const item = this.cart.find(item => item.id === productId);
        const product = this.products.find(p => p.id === productId);

        if (item && product) {
            // Verificar stock disponible
            const originalStock = product.stock + item.quantity;
            if (newQuantity > originalStock) {
                this.showNotification('No hay suficiente stock disponible', 'error');
                return;
            }

            // Actualizar stock
            product.stock = originalStock - newQuantity;
            item.quantity = newQuantity;

            this.saveCart();
            this.updateCartCount();
            this.renderProducts(); // Actualizar vista de productos
            this.showCartModal(); // Actualizar modal del carrito
        }
    }

    removeFromCart(productId) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        if (itemIndex !== -1) {
            const item = this.cart[itemIndex];
            const product = this.products.find(p => p.id === productId);
            
            // Restaurar stock
            if (product) {
                product.stock += item.quantity;
            }

            this.cart.splice(itemIndex, 1);
            this.saveCart();
            this.updateCartCount();
            this.renderProducts(); // Actualizar vista de productos
            this.showCartModal(); // Actualizar modal del carrito
            this.showNotification('Producto removido del carrito', 'info');
        }
    }

    checkout() {
        if (this.cart.length === 0) {
            this.showNotification('El carrito está vacío', 'warning');
            return;
        }

        // Simular proceso de checkout
        this.showNotification('Procesando tu pedido...', 'info');

        // En una aplicación real, aquí iría la integración con la pasarela de pago
        setTimeout(() => {
            // Limpiar carrito después del checkout
            this.cart = [];
            this.saveCart();
            this.updateCartCount();
            this.hideModal(document.getElementById('cartModal'));
            this.showNotification('¡Pedido realizado exitosamente!', 'success');
        }, 2000);
    }

    // Métodos de utilidad para modales y notificaciones
    hideModal(modal) {
        modal.style.display = 'none';
    }

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            this.hideModal(modal);
        });
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

// Inicializar la tienda cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.tiendaSystem = new TiendaSystem();
});

// También manejar cuando la página ya está cargada
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTienda);
} else {
    initTienda();
}

function initTienda() {
    window.tiendaSystem = new TiendaSystem();
}