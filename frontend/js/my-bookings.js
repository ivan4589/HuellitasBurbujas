// Sistema de Gestión de Mis Citas
class MyBookings {
    constructor() {
        this.bookings = [];
        this.filteredBookings = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.checkAuth();
        this.loadBookings();
        this.setupEventListeners();
    }

    checkAuth() {
        const userData = localStorage.getItem('huellitas_user') || sessionStorage.getItem('huellitas_user');
        if (!userData) {
            this.showNotification('Debes iniciar sesión para ver tus citas', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }
        this.currentUser = JSON.parse(userData);
    }

    setupEventListeners() {
        // Filtro por estado
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.applyFilter();
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

    loadBookings() {
        try {
            // Mostrar loading
            this.showLoadingState();

            // Simular carga de datos
            setTimeout(() => {
                this.bookings = this.getUserBookings();
                this.applyFilter();
                this.updateEmptyState();
            }, 1000);

        } catch (error) {
            console.error('Error cargando citas:', error);
            this.showNotification('Error al cargar las citas', 'error');
        }
    }

    getUserBookings() {
        // Obtener citas del localStorage (simulación)
        const allBookings = JSON.parse(localStorage.getItem('huellitas_bookings') || '[]');
        
        // Filtrar por usuario actual
        const userBookings = allBookings.filter(booking => 
            booking.userId === this.currentUser.id
        );

        // Si no hay citas, generar algunas de ejemplo
        if (userBookings.length === 0) {
            return this.generateSampleBookings();
        }

        return userBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    generateSampleBookings() {
        const sampleBookings = [
            {
                id: 'HB-' + Date.now(),
                service: {
                    id: 1,
                    name: 'Baño Premium',
                    price: 25000,
                    duration: 60
                },
                date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 días en el futuro
                time: '10:00',
                pet: {
                    name: 'Max',
                    species: 'perro',
                    breed: 'Labrador',
                    age: 3
                },
                observations: 'Max es un poco nervioso con el agua',
                status: 'confirmada',
                userId: this.currentUser.id,
                createdAt: new Date().toISOString()
            },
            {
                id: 'HB-' + (Date.now() + 1),
                service: {
                    id: 2,
                    name: 'Corte de Pelo',
                    price: 30000,
                    duration: 90
                },
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 días en el pasado
                time: '14:30',
                pet: {
                    name: 'Luna',
                    species: 'gato',
                    breed: 'Siamés',
                    age: 2
                },
                observations: '',
                status: 'completada',
                userId: this.currentUser.id,
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'HB-' + (Date.now() + 2),
                service: {
                    id: 3,
                    name: 'Limpieza de Oídos',
                    price: 15000,
                    duration: 30
                },
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días en el futuro
                time: '11:15',
                pet: {
                    name: 'Max',
                    species: 'perro',
                    breed: 'Labrador',
                    age: 3
                },
                observations: 'Revisión rutinaria',
                status: 'pendiente',
                userId: this.currentUser.id,
                createdAt: new Date().toISOString()
            }
        ];

        // Guardar en localStorage para futuras visitas
        localStorage.setItem('huellitas_bookings', JSON.stringify(sampleBookings));
        
        return sampleBookings;
    }

    applyFilter() {
        if (this.currentFilter === 'all') {
            this.filteredBookings = this.bookings;
        } else {
            this.filteredBookings = this.bookings.filter(booking => 
                booking.status === this.currentFilter
            );
        }

        this.renderBookings();
        this.updateEmptyState();
    }

    renderBookings() {
        const bookingsList = document.getElementById('bookingsList');
        
        if (this.filteredBookings.length === 0) {
            bookingsList.innerHTML = '';
            return;
        }

        bookingsList.innerHTML = this.filteredBookings.map(booking => `
            <div class="booking-card ${booking.status} ${this.getPriorityClass(booking)}">
                ${this.renderBookingBadge(booking)}
                
                <div class="booking-header">
                    <div class="booking-info">
                        <h3>${booking.service.name}</h3>
                        <span class="booking-id">${booking.id}</span>
                    </div>
                    <div class="booking-status status-${booking.status}">
                        ${this.getStatusText(booking.status)}
                    </div>
                </div>

                <div class="booking-details">
                    <div class="detail-group">
                        <h4>Fecha y Hora</h4>
                        <div class="detail-item">
                            <i class="fas fa-calendar"></i>
                            <span>${this.formatDate(new Date(booking.date))}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-clock"></i>
                            <span>${booking.time}</span>
                        </div>
                    </div>

                    <div class="detail-group">
                        <h4>Servicio</h4>
                        <div class="detail-item">
                            <i class="fas fa-spa"></i>
                            <span>${this.formatDuration(booking.service.duration)}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-dollar-sign"></i>
                            <span>$${booking.service.price.toLocaleString()}</span>
                        </div>
                    </div>

                    <div class="detail-group">
                        <h4>Estado</h4>
                        <div class="detail-item">
                            <i class="fas fa-info-circle"></i>
                            <span>${this.getStatusDescription(booking.status)}</span>
                        </div>
                        ${booking.observations ? `
                        <div class="detail-item">
                            <i class="fas fa-sticky-note"></i>
                            <span>Con observaciones</span>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <div class="booking-pet">
                    <div class="pet-info">
                        <div class="pet-avatar">
                            <i class="fas fa-${this.getPetIcon(booking.pet.species)}"></i>
                        </div>
                        <div class="pet-details">
                            <h4>${booking.pet.name}</h4>
                            <p>${this.capitalizeFirstLetter(booking.pet.species)} • ${booking.pet.breed} • ${booking.pet.age} años</p>
                        </div>
                    </div>
                </div>

                ${this.renderBookingActions(booking)}
            </div>
        `).join('');

        // Agregar event listeners a los botones
        this.setupBookingActions();
    }

    renderBookingBadge(booking) {
        const bookingDate = new Date(booking.date);
        const today = new Date();
        const timeDiff = bookingDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (booking.status === 'confirmada' && daysDiff === 0) {
            return '<span class="booking-badge badge-today">¡Hoy!</span>';
        } else if (booking.status === 'confirmada' && daysDiff === 1) {
            return '<span class="booking-badge badge-urgent">Mañana</span>';
        } else if (booking.status === 'confirmada' && daysDiff <= 3) {
            return `<span class="booking-badge badge-urgent">En ${daysDiff} días</span>`;
        }

        return '';
    }

    getPriorityClass(booking) {
        if (booking.status !== 'confirmada') return '';

        const bookingDate = new Date(booking.date);
        const today = new Date();
        const timeDiff = bookingDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (daysDiff <= 1) return 'urgent';
        if (daysDiff <= 3) return 'priority';
        
        return '';
    }

    renderBookingActions(booking) {
        if (booking.status === 'cancelada' || booking.status === 'completada') {
            return '';
        }

        return `
            <div class="booking-actions">
                ${booking.status === 'confirmada' ? `
                    <button class="btn btn-outline" onclick="myBookings.rescheduleBooking('${booking.id}')">
                        <i class="fas fa-calendar-alt"></i>
                        Reprogramar
                    </button>
                ` : ''}
                
                <button class="btn btn-cancel" onclick="myBookings.showCancelModal('${booking.id}')">
                    <i class="fas fa-times"></i>
                    Cancelar Cita
                </button>

                ${this.renderAdditionalActions(booking)}
            </div>
        `;
    }

    renderAdditionalActions(booking) {
        const bookingDate = new Date(booking.date);
        const today = new Date();
        
        if (booking.status === 'confirmada' && bookingDate > today) {
            return `
                <button class="btn btn-primary" onclick="myBookings.viewBookingDetails('${booking.id}')">
                    <i class="fas fa-eye"></i>
                    Ver Detalles
                </button>
            `;
        }

        return '';
    }

    setupBookingActions() {
        // Los event listeners se agregan directamente en el HTML con onclick
    }

    getStatusText(status) {
        const statusTexts = {
            'pendiente': 'Pendiente',
            'confirmada': 'Confirmada',
            'completada': 'Completada',
            'cancelada': 'Cancelada'
        };
        return statusTexts[status] || status;
    }

    getStatusDescription(status) {
        const descriptions = {
            'pendiente': 'Esperando confirmación',
            'confirmada': 'Cita confirmada',
            'completada': 'Servicio realizado',
            'cancelada': 'Cita cancelada'
        };
        return descriptions[status] || '';
    }

    getPetIcon(species) {
        const icons = {
            'perro': 'dog',
            'gato': 'cat',
            'ave': 'crow',
            'roedor': 'otter',
            'otro': 'paw'
        };
        return icons[species] || 'paw';
    }

    formatDate(date) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('es-ES', options);
    }

    formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours > 0) {
            return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
        }
        return `${mins}min`;
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Acciones de Citas
    rescheduleBooking(bookingId) {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (!booking) return;

        this.showNotification('Redirigiendo al sistema de reservas...', 'info');
        
        // Guardar datos para reprogramación
        sessionStorage.setItem('reschedule_booking', JSON.stringify(booking));
        
        setTimeout(() => {
            window.location.href = 'citas.html';
        }, 1500);
    }

    showCancelModal(bookingId) {
        this.cancellingBookingId = bookingId;
        const modal = this.createCancelModal();
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    createCancelModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content cancel-modal">
                <div class="modal-header">
                    <h2>Cancelar Cita</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>¿Estás seguro de que quieres cancelar esta cita? Por favor selecciona el motivo:</p>
                    
                    <div class="cancel-reasons">
                        <label class="reason-option">
                            <input type="radio" name="cancelReason" value="schedule">
                            <div class="reason-text">
                                <strong>Problema de horario</strong>
                                <span>No puedo asistir en el horario programado</span>
                            </div>
                        </label>
                        
                        <label class="reason-option">
                            <input type="radio" name="cancelReason" value="emergency">
                            <div class="reason-text">
                                <strong>Emergencia</strong>
                                <span>Mi mascota no se encuentra bien</span>
                            </div>
                        </label>
                        
                        <label class="reason-option">
                            <input type="radio" name="cancelReason" value="other">
                            <div class="reason-text">
                                <strong>Otro motivo</strong>
                                <span>Otra razón no listada aquí</span>
                            </div>
                        </label>
                    </div>

                    <div class="form-group">
                        <label for="cancelComments">Comentarios adicionales (opcional)</label>
                        <textarea id="cancelComments" rows="3" placeholder="Cuéntanos más sobre tu situación..."></textarea>
                    </div>

                    <div class="modal-actions">
                        <button class="btn btn-outline" onclick="myBookings.hideCancelModal()">
                            Mantener Cita
                        </button>
                        <button class="btn btn-danger" onclick="myBookings.confirmCancel()">
                            <i class="fas fa-times"></i>
                            Confirmar Cancelación
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Agregar event listeners a las opciones
        modal.querySelectorAll('.reason-option').forEach(option => {
            option.addEventListener('click', () => {
                modal.querySelectorAll('.reason-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                option.querySelector('input').checked = true;
            });
        });

        return modal;
    }

    hideCancelModal() {
        const modal = document.querySelector('.modal.cancel-modal');
        if (modal) {
            modal.remove();
        }
        this.cancellingBookingId = null;
    }

    confirmCancel() {
        const modal = document.querySelector('.modal.cancel-modal');
        const selectedReason = modal?.querySelector('input[name="cancelReason"]:checked');
        
        if (!selectedReason) {
            this.showNotification('Por favor selecciona un motivo de cancelación', 'error');
            return;
        }

        const comments = document.getElementById('cancelComments')?.value || '';
        
        this.cancelBooking(this.cancellingBookingId, selectedReason.value, comments);
        this.hideCancelModal();
    }

    cancelBooking(bookingId, reason, comments) {
        const bookingIndex = this.bookings.findIndex(b => b.id === bookingId);
        if (bookingIndex === -1) return;

        // Actualizar estado
        this.bookings[bookingIndex].status = 'cancelada';
        this.bookings[bookingIndex].cancellationReason = reason;
        this.bookings[bookingIndex].cancellationComments = comments;
        this.bookings[bookingIndex].cancelledAt = new Date().toISOString();

        // Guardar en localStorage
        this.saveBookings();

        // Actualizar UI
        this.applyFilter();
        
        this.showNotification('Cita cancelada exitosamente', 'success');
    }

    viewBookingDetails(bookingId) {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (!booking) return;

        // En una implementación real, esto abriría un modal con detalles completos
        this.showNotification(`Mostrando detalles de la cita ${bookingId}`, 'info');
        
        // Por ahora, simplemente mostramos un alert con la información
        const details = `
Cita: ${booking.service.name}
Fecha: ${this.formatDate(new Date(booking.date))}
Hora: ${booking.time}
Mascota: ${booking.pet.name}
Estado: ${this.getStatusText(booking.status)}
${booking.observations ? `Observaciones: ${booking.observations}` : ''}
        `.trim();

        alert(details);
    }

    saveBookings() {
        const allBookings = JSON.parse(localStorage.getItem('huellitas_bookings') || '[]');
        
        // Actualizar las citas modificadas
        this.bookings.forEach(updatedBooking => {
            const index = allBookings.findIndex(b => b.id === updatedBooking.id);
            if (index !== -1) {
                allBookings[index] = updatedBooking;
            }
        });

        localStorage.setItem('huellitas_bookings', JSON.stringify(allBookings));
    }

    updateEmptyState() {
        const emptyState = document.getElementById('emptyBookings');
        const bookingsList = document.getElementById('bookingsList');
        
        if (this.filteredBookings.length === 0) {
            emptyState.style.display = 'block';
            bookingsList.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            bookingsList.style.display = 'block';
        }
    }

    showLoadingState() {
        const bookingsList = document.getElementById('bookingsList');
        const emptyState = document.getElementById('emptyBookings');
        
        emptyState.style.display = 'none';
        bookingsList.innerHTML = `
            <div class="bookings-loading">
                <div class="spinner"></div>
                <p>Cargando tus citas...</p>
            </div>
        `;
    }

    // Utilidades
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

// Inicializar el sistema de mis citas
document.addEventListener('DOMContentLoaded', () => {
    window.myBookings = new MyBookings();
});