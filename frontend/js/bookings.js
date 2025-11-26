// Sistema de Reservas de Citas
class BookingSystem {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.bookingData = {
            service: null,
            date: null,
            time: null,
            pet: null,
            observations: '',
            addons: []
        };
        this.services = [];
        this.availableSlots = [];
        this.userPets = [];
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.init();
    }

    init() {
        this.loadServices();
        this.loadUserPets();
        this.setupEventListeners();
        this.generateCalendar();
        this.setupPetModal();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Navegación del calendario
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.previousMonth();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.nextMonth();
        });

        // Servicios adicionales
        document.querySelectorAll('.addon-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleAddon(e.target.closest('.addon-btn').dataset.addon);
            });
        });

        // Formulario de reserva
        document.getElementById('bookingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.confirmBooking();
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

    checkAuthStatus() {
        const userData = localStorage.getItem('huellitas_user') || sessionStorage.getItem('huellitas_user');
        if (!userData) {
            this.showNotification('Debes iniciar sesión para reservar una cita', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }
        this.currentUser = JSON.parse(userData);
    }

    loadServices() {
        // Servicios disponibles
        this.services = [
            {
                id: 1,
                name: 'Baño Premium',
                description: 'Baño relajante con productos naturales y secado profesional',
                price: 25000,
                duration: 60,
                icon: 'shower',
                features: [
                    'Shampoo natural',
                    'Secado suave',
                    'Perfume hipoalergénico',
                    'Cepillado profesional'
                ]
            },
            {
                id: 2,
                name: 'Corte de Pelo',
                description: 'Corte de pelo profesional según raza y estilo preferido',
                price: 30000,
                duration: 90,
                icon: 'cut',
                features: [
                    'Estilo personalizado',
                    'Técnicas profesionales',
                    'Acabado perfecto',
                    'Limpieza facial'
                ]
            },
            {
                id: 3,
                name: 'Limpieza de Oídos',
                description: 'Limpieza profunda y cuidados especializados para orejas',
                price: 15000,
                duration: 30,
                icon: 'ear-deaf',
                features: [
                    'Limpieza profunda',
                    'Productos especializados',
                    'Revisión médica',
                    'Prevención de infecciones'
                ]
            },
            {
                id: 4,
                name: 'Consulta Veterinaria',
                description: 'Consulta veterinaria y cuidados médicos especializados',
                price: 35000,
                duration: 45,
                icon: 'stethoscope',
                features: [
                    'Consulta especializada',
                    'Revisión completa',
                    'Diagnóstico profesional',
                    'Recomendaciones de cuidado'
                ]
            },
            {
                id: 5,
                name: 'Spa Completo',
                description: 'Experiencia completa de spa para tu mascota',
                price: 50000,
                duration: 120,
                icon: 'spa',
                features: [
                    'Baño premium',
                    'Corte de pelo',
                    'Limpieza dental',
                    'Masaje relajante',
                    'Pedicure'
                ]
            },
            {
                id: 6,
                name: 'Guardería Diurna',
                description: 'Cuidado y entretenimiento para tu mascota durante el día',
                price: 20000,
                duration: 480, // 8 horas
                icon: 'home',
                features: [
                    'Supervisión constante',
                    'Área de juego',
                    'Alimentación incluida',
                    'Paseos programados'
                ]
            }
        ];

        this.renderServices();
    }

    renderServices() {
        const grid = document.getElementById('servicesGrid');
        grid.innerHTML = this.services.map(service => `
            <div class="service-card" data-service-id="${service.id}">
                <div class="service-icon">
                    <i class="fas fa-${service.icon}"></i>
                </div>
                <h3>${service.name}</h3>
                <p>${service.description}</p>
                
                <div class="service-features">
                    ${service.features.map(feature => `
                        <span><i class="fas fa-check"></i> ${feature}</span>
                    `).join('')}
                </div>
                
                <div class="service-price">$${service.price.toLocaleString()}</div>
                <div class="service-duration">Duración: ${this.formatDuration(service.duration)}</div>
                
                <button type="button" class="btn btn-outline service-select-btn" onclick="bookingSystem.selectService(${service.id})">
                    Seleccionar
                </button>
            </div>
        `).join('');
    }

    selectService(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (!service) return;

        // Remover selección anterior
        document.querySelectorAll('.service-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Agregar selección actual
        const selectedCard = document.querySelector(`[data-service-id="${serviceId}"]`);
        selectedCard.classList.add('selected');

        this.bookingData.service = service;
        
        // Actualizar botón
        const button = selectedCard.querySelector('.service-select-btn');
        button.textContent = 'Seleccionado ✓';
        button.classList.remove('btn-outline');
        button.classList.add('btn-primary');

        this.showNotification(`Servicio seleccionado: ${service.name}`, 'success');
    }

    formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours > 0) {
            return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
        }
        return `${mins}min`;
    }

    // Navegación entre pasos
    nextStep() {
        if (this.validateStep(this.currentStep)) {
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.showStep(this.currentStep);
                this.updateProgress();
            }
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
            this.updateProgress();
        }
    }

    showStep(stepNumber) {
        // Ocultar todos los steps
        document.querySelectorAll('.booking-step').forEach(step => {
            step.classList.remove('active');
        });

        // Mostrar step actual
        const currentStep = document.querySelector(`.booking-step[data-step="${stepNumber}"]`);
        if (currentStep) {
            currentStep.classList.add('active');
        }

        // Actualizar steps visuales
        document.querySelectorAll('.step').forEach((stepEl, index) => {
            const step = index + 1;
            stepEl.classList.remove('active', 'completed');
            
            if (step === stepNumber) {
                stepEl.classList.add('active');
            } else if (step < stepNumber) {
                stepEl.classList.add('completed');
            }
        });

        // Acciones específicas por step
        if (stepNumber === 2 && this.bookingData.service) {
            this.generateAvailableSlots();
        } else if (stepNumber === 4) {
            this.updateConfirmationDetails();
        }
    }

    updateProgress() {
        const progress = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
        document.getElementById('bookingProgressFill').style.width = `${progress}%`;
    }

    validateStep(step) {
        switch (step) {
            case 1:
                return this.validateServiceSelection();
            case 2:
                return this.validateDateTimeSelection();
            case 3:
                return this.validatePetSelection();
            default:
                return true;
        }
    }

    validateServiceSelection() {
        if (!this.bookingData.service) {
            this.showNotification('Por favor selecciona un servicio', 'error');
            return false;
        }
        return true;
    }

    validateDateTimeSelection() {
        if (!this.bookingData.date || !this.bookingData.time) {
            this.showNotification('Por favor selecciona una fecha y hora', 'error');
            return false;
        }
        return true;
    }

    validatePetSelection() {
        if (!this.bookingData.pet) {
            this.showNotification('Por favor selecciona una mascota', 'error');
            return false;
        }
        return true;
    }

    // Sistema de Calendario
    previousMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.generateCalendar();
    }

    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.generateCalendar();
    }

    generateCalendar() {
        const calendar = document.getElementById('calendar');
        const monthYear = document.getElementById('currentMonth');
        
        // Actualizar título
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        monthYear.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;

        // Generar días del mes
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const today = new Date();

        let calendarHTML = '';

        // Encabezados de días
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        dayNames.forEach(day => {
            calendarHTML += `<div class="calendar-header">${day}</div>`;
        });

        // Días vacíos al inicio
        for (let i = 0; i < firstDay.getDay(); i++) {
            calendarHTML += '<div class="calendar-day other-month"></div>';
        }

        // Días del mes
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const currentDate = new Date(this.currentYear, this.currentMonth, day);
            const isToday = this.isSameDay(currentDate, today);
            const isPast = currentDate < today && !this.isSameDay(currentDate, today);
            const isSelected = this.bookingData.date && this.isSameDay(currentDate, this.bookingData.date);
            const isAvailable = this.isDateAvailable(currentDate);

            let className = 'calendar-day';
            if (isToday) className += ' today';
            if (isPast) className += ' disabled';
            if (isSelected) className += ' selected';
            if (!isAvailable) className += ' disabled';

            calendarHTML += `
                <div class="${className}" 
                     data-date="${currentDate.toISOString().split('T')[0]}"
                     onclick="bookingSystem.selectDate('${currentDate.toISOString().split('T')[0]}')">
                    ${day}
                </div>
            `;
        }

        calendar.innerHTML = calendarHTML;
    }

    isSameDay(date1, date2) {
        return date1.toDateString() === date2.toDateString();
    }

    isDateAvailable(date) {
        // Simular disponibilidad (en una app real, esto vendría del backend)
        const day = date.getDay();
        // No disponibles: domingos (0) y días pasados
        return day !== 0 && date >= new Date();
    }

    selectDate(dateString) {
        const selectedDate = new Date(dateString);
        const today = new Date();

        if (selectedDate < today && !this.isSameDay(selectedDate, today)) {
            this.showNotification('No puedes seleccionar una fecha pasada', 'error');
            return;
        }

        if (!this.isDateAvailable(selectedDate)) {
            this.showNotification('Esta fecha no está disponible', 'error');
            return;
        }

        this.bookingData.date = selectedDate;
        this.generateAvailableSlots();
        
        // Actualizar UI
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        document.querySelector(`[data-date="${dateString}"]`).classList.add('selected');

        this.showNotification(`Fecha seleccionada: ${this.formatDate(selectedDate)}`, 'success');
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

    generateAvailableSlots() {
        if (!this.bookingData.date) return;

        const timeSlots = document.getElementById('timeSlots');
        const slots = this.getAvailableTimeSlots();

        if (slots.length === 0) {
            timeSlots.innerHTML = `
                <div class="time-empty">
                    <i class="fas fa-calendar-times"></i>
                    <p>No hay horarios disponibles para esta fecha</p>
                </div>
            `;
            return;
        }

        timeSlots.innerHTML = slots.map(slot => `
            <div class="time-slot ${slot.available ? '' : 'disabled'} ${this.bookingData.time === slot.time ? 'selected' : ''}" 
                 onclick="bookingSystem.selectTime('${slot.time}')">
                ${slot.time}
            </div>
        `).join('');
    }

    getAvailableTimeSlots() {
        // Generar horarios disponibles (en una app real, esto vendría del backend)
        const slots = [];
        const startHour = 8; // 8:00 AM
        const endHour = 17; // 5:00 PM
        
        for (let hour = startHour; hour <= endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                
                // Simular disponibilidad (algunos horarios ocupados)
                const isAvailable = Math.random() > 0.3; // 70% de disponibilidad
                
                slots.push({
                    time: timeString,
                    available: isAvailable
                });
            }
        }
        
        return slots;
    }

    selectTime(time) {
        const slot = document.querySelector(`.time-slot:contains("${time}")`);
        if (!slot || slot.classList.contains('disabled')) {
            this.showNotification('Este horario no está disponible', 'error');
            return;
        }

        this.bookingData.time = time;
        
        // Actualizar UI
        document.querySelectorAll('.time-slot').forEach(s => {
            s.classList.remove('selected');
        });
        slot.classList.add('selected');

        this.showNotification(`Hora seleccionada: ${time}`, 'success');
    }

    // Gestión de Mascotas
    loadUserPets() {
        const userData = localStorage.getItem('huellitas_user') || sessionStorage.getItem('huellitas_user');
        if (userData) {
            const user = JSON.parse(userData);
            this.userPets = user.mascotas || [];
            this.renderPetsList();
        }
    }

    renderPetsList() {
        const petsList = document.getElementById('bookingPetsList');
        
        if (this.userPets.length === 0) {
            petsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-paw"></i>
                    <p>No tienes mascotas registradas</p>
                    <p>Agrega una mascota para continuar</p>
                </div>
            `;
            return;
        }

        petsList.innerHTML = this.userPets.map((pet, index) => `
            <div class="pet-card ${this.bookingData.pet === pet ? 'selected' : ''}" 
                 onclick="bookingSystem.selectPet(${index})">
                <div class="pet-info">
                    <h4>${pet.name}</h4>
                    <div class="pet-details">
                        <span>${this.capitalizeFirstLetter(pet.species)}</span>
                        ${pet.breed ? `<span>Raza: ${pet.breed}</span>` : ''}
                        ${pet.age ? `<span>Edad: ${pet.age} años</span>` : ''}
                    </div>
                </div>
                <div class="pet-actions">
                    <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); bookingSystem.editPet(${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    selectPet(petIndex) {
        this.bookingData.pet = this.userPets[petIndex];
        
        // Actualizar UI
        document.querySelectorAll('.pet-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelectorAll('.pet-card')[petIndex].classList.add('selected');

        this.showNotification(`Mascota seleccionada: ${this.bookingData.pet.name}`, 'success');
    }

    editPet(petIndex) {
        this.openPetModal(petIndex);
    }

    // Modal de Mascotas
    setupPetModal() {
        document.getElementById('petForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePet();
        });
    }

    openPetModal(petIndex = null) {
        this.editingPetIndex = petIndex;
        const modal = document.getElementById('petModal');
        const title = document.getElementById('petModalTitle');
        
        if (petIndex !== null) {
            title.textContent = 'Editar Mascota';
            const pet = this.userPets[petIndex];
            document.getElementById('petIndex').value = petIndex;
            document.getElementById('petName').value = pet.name || '';
            document.getElementById('petSpecies').value = pet.species || '';
            document.getElementById('petBreed').value = pet.breed || '';
            document.getElementById('petAge').value = pet.age || '';
            document.getElementById('petWeight').value = pet.weight || '';
            document.getElementById('petObservations').value = pet.observations || '';
        } else {
            title.textContent = 'Agregar Mascota';
            document.getElementById('petForm').reset();
            document.getElementById('petIndex').value = '';
        }
        
        modal.style.display = 'block';
    }

    closePetModal() {
        const modal = document.getElementById('petModal');
        modal.style.display = 'none';
        this.editingPetIndex = null;
    }

    savePet() {
        const petData = {
            name: document.getElementById('petName').value,
            species: document.getElementById('petSpecies').value,
            breed: document.getElementById('petBreed').value,
            age: document.getElementById('petAge').value,
            weight: document.getElementById('petWeight').value,
            observations: document.getElementById('petObservations').value
        };

        if (!petData.name || !petData.species) {
            this.showNotification('Nombre y especie son campos requeridos', 'error');
            return;
        }

        if (this.editingPetIndex !== null) {
            this.userPets[this.editingPetIndex] = petData;
        } else {
            this.userPets.push(petData);
        }

        // Actualizar datos del usuario
        this.updateUserPets();
        this.renderPetsList();
        this.closePetModal();
        
        this.showNotification(
            this.editingPetIndex !== null ? 'Mascota actualizada' : 'Mascota agregada', 
            'success'
        );
    }

    updateUserPets() {
        const userData = localStorage.getItem('huellitas_user') || sessionStorage.getItem('huellitas_user');
        if (userData) {
            const user = JSON.parse(userData);
            user.mascotas = this.userPets;
            localStorage.setItem('huellitas_user', JSON.stringify(user));
            sessionStorage.setItem('huellitas_user', JSON.stringify(user));
        }
    }

    // Servicios Adicionales
    toggleAddon(addonId) {
        const button = document.querySelector(`[data-addon="${addonId}"]`);
        const addonIndex = this.bookingData.addons.indexOf(addonId);
        
        if (addonIndex === -1) {
            this.bookingData.addons.push(addonId);
            button.classList.add('added');
            button.textContent = 'Agregado ✓';
            this.showNotification('Servicio adicional agregado', 'success');
        } else {
            this.bookingData.addons.splice(addonIndex, 1);
            button.classList.remove('added');
            button.textContent = 'Agregar';
            this.showNotification('Servicio adicional removido', 'info');
        }
    }

    getAddonPrice(addonId) {
        const prices = {
            'limpieza-dental': 15000,
            'masaje': 20000,
            'pedicure': 10000
        };
        return prices[addonId] || 0;
    }

    // Confirmación
    updateConfirmationDetails() {
        if (!this.bookingData.service) return;

        // Servicio
        document.getElementById('confirmService').textContent = this.bookingData.service.name;
        document.getElementById('confirmDuration').textContent = this.formatDuration(this.bookingData.service.duration);
        document.getElementById('confirmPrice').textContent = `$${this.bookingData.service.price.toLocaleString()}`;

        // Fecha y hora
        document.getElementById('confirmDate').textContent = this.formatDate(this.bookingData.date);
        document.getElementById('confirmTime').textContent = this.bookingData.time;

        // Mascota
        if (this.bookingData.pet) {
            document.getElementById('confirmPet').textContent = this.bookingData.pet.name;
            document.getElementById('confirmSpecies').textContent = this.capitalizeFirstLetter(this.bookingData.pet.species);
        }

        // Observaciones
        const observations = document.getElementById('observations').value;
        this.bookingData.observations = observations;
        document.getElementById('confirmObservations').textContent = observations || 'Ninguna';

        // Totales
        let subtotal = this.bookingData.service.price;
        
        // Agregar servicios adicionales
        this.bookingData.addons.forEach(addonId => {
            subtotal += this.getAddonPrice(addonId);
        });

        document.getElementById('confirmSubtotal').textContent = `$${subtotal.toLocaleString()}`;
        document.getElementById('confirmTotal').textContent = `$${subtotal.toLocaleString()}`;
    }

    async confirmBooking() {
        if (!this.validateStep(4)) return;

        try {
            // Simular envío a backend
            await this.saveBooking();
            
            this.showSuccessModal();
            this.showNotification('¡Cita agendada exitosamente!', 'success');

        } catch (error) {
            this.showNotification('Error al agendar la cita: ' + error.message, 'error');
        }
    }

    async saveBooking() {
        // Simular guardado en base de datos
        await new Promise(resolve => setTimeout(resolve, 2000));

        const booking = {
            id: 'HB-' + Date.now(),
            ...this.bookingData,
            userId: this.currentUser.id,
            status: 'confirmada',
            createdAt: new Date().toISOString()
        };

        // Guardar en localStorage (simulación)
        const existingBookings = JSON.parse(localStorage.getItem('huellitas_bookings') || '[]');
        existingBookings.push(booking);
        localStorage.setItem('huellitas_bookings', JSON.stringify(existingBookings));

        return booking;
    }

    showSuccessModal() {
        const modal = document.getElementById('successModal');
        const booking = JSON.parse(localStorage.getItem('huellitas_bookings')).pop();

        document.getElementById('successBookingId').textContent = booking.id;
        document.getElementById('successDate').textContent = this.formatDate(this.bookingData.date);
        document.getElementById('successTime').textContent = this.bookingData.time;

        modal.style.display = 'block';
    }

    closeSuccessModal() {
        const modal = document.getElementById('successModal');
        modal.style.display = 'none';
        
        // Reiniciar el proceso
        this.resetBooking();
    }

    resetBooking() {
        this.currentStep = 1;
        this.bookingData = {
            service: null,
            date: null,
            time: null,
            pet: null,
            observations: '',
            addons: []
        };

        this.showStep(1);
        this.updateProgress();
        this.renderServices();
        this.generateCalendar();
        this.renderPetsList();
        
        // Limpiar selecciones de servicios adicionales
        document.querySelectorAll('.addon-btn').forEach(btn => {
            btn.classList.remove('added');
            btn.textContent = 'Agregar';
        });
    }

    // Utilidades
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

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

// Inicializar el sistema de reservas
document.addEventListener('DOMContentLoaded', () => {
    window.bookingSystem = new BookingSystem();
});