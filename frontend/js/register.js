// Sistema de Registro - CORREGIDO
class RegisterSystem {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.userData = {
            personal: {},
            pets: []
        };
        this.editingPetIndex = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showStep(1);
        this.updateProgress();
        this.setupPasswordStrength();
        this.renderPetsList(); // Inicializar lista de mascotas
    }

    setupEventListeners() {
        // Navegación entre steps
        document.getElementById('nextBtn').addEventListener('click', () => {
            this.nextStep();
        });

        document.getElementById('prevBtn').addEventListener('click', () => {
            this.prevStep();
        });

        // Formulario de registro
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegistration();
        });

        // Toggles de contraseña
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const targetId = e.target.closest('.password-toggle').getAttribute('data-target');
                this.togglePasswordVisibility(targetId);
            });
        });

        // Agregar mascota
        document.getElementById('addPetBtn').addEventListener('click', () => {
            this.openPetModal();
        });

        // Ir al login desde confirmación
        document.getElementById('goToLoginBtn')?.addEventListener('click', () => {
            window.location.href = 'login.html';
        });

        // Validación en tiempo real
        this.setupRealTimeValidation();

        // Cerrar modales
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closePetModal();
            }
        });

        // Formulario de mascota
        document.getElementById('petForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePet();
        });

        // Cerrar modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closePetModal();
            }
        });
    }

    setupRealTimeValidation() {
        // Validación de email
        const emailInput = document.getElementById('registerEmail');
        emailInput.addEventListener('blur', () => {
            this.validateEmail(emailInput.value);
        });

        // Validación de contraseña
        const passwordInput = document.getElementById('registerPassword');
        passwordInput.addEventListener('input', () => {
            this.validatePassword(passwordInput.value);
            this.checkPasswordMatch();
        });

        // Validación de confirmación de contraseña
        const confirmInput = document.getElementById('confirmPassword');
        confirmInput.addEventListener('input', () => {
            this.checkPasswordMatch();
        });

        // Validación de teléfono
        const phoneInput = document.getElementById('phone');
        phoneInput.addEventListener('blur', () => {
            this.validatePhone(phoneInput.value);
        });
    }

    setupPasswordStrength() {
        const passwordInput = document.getElementById('registerPassword');
        passwordInput.addEventListener('input', (e) => {
            this.updatePasswordStrength(e.target.value);
        });
    }

    updatePasswordStrength(password) {
        const strengthBar = document.getElementById('passwordStrength');
        const strengthText = document.getElementById('strengthText');
        
        let strength = 0;
        let text = 'Débil';
        let color = 'var(--error)';

        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        // Ajustar a escala de 0-3
        strength = Math.min(strength, 4);
        
        switch (strength) {
            case 0:
                text = 'Muy Débil';
                color = 'var(--error)';
                break;
            case 1:
                text = 'Débil';
                color = 'var(--error)';
                break;
            case 2:
                text = 'Regular';
                color = 'var(--warning)';
                break;
            case 3:
                text = 'Buena';
                color = 'var(--accent)';
                break;
            case 4:
                text = 'Excelente';
                color = 'var(--success)';
                break;
        }

        strengthBar.setAttribute('data-strength', strength);
        strengthBar.style.background = color;
        strengthText.textContent = `Seguridad: ${text}`;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const formGroup = document.getElementById('registerEmail').closest('.form-group');
        
        this.clearFieldStatus(formGroup);

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
        const formGroup = document.getElementById('registerPassword').closest('.form-group');
        
        this.clearFieldStatus(formGroup);

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

    checkPasswordMatch() {
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const formGroup = document.getElementById('confirmPassword').closest('.form-group');
        
        this.clearFieldStatus(formGroup);

        if (!confirmPassword) {
            return false;
        }

        if (password !== confirmPassword) {
            this.showFieldError(formGroup, 'Las contraseñas no coinciden');
            return false;
        }

        this.showFieldSuccess(formGroup, 'Las contraseñas coinciden');
        return true;
    }

    validatePhone(phone) {
        const formGroup = document.getElementById('phone').closest('.form-group');
        
        this.clearFieldStatus(formGroup);

        if (!phone) {
            this.showFieldError(formGroup, 'El teléfono es requerido');
            return false;
        }

        // Validación básica de teléfono
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(phone)) {
            this.showFieldError(formGroup, 'Por favor ingresa un número de teléfono válido');
            return false;
        }

        this.showFieldSuccess(formGroup, 'Teléfono válido');
        return true;
    }

    clearFieldStatus(formGroup) {
        formGroup.classList.remove('success', 'error', 'warning');
        const existingMessage = formGroup.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
    }

    showFieldError(formGroup, message) {
        formGroup.classList.add('error');
        this.showFieldMessage(formGroup, message, 'error');
    }

    showFieldSuccess(formGroup, message) {
        formGroup.classList.add('success');
        this.showFieldMessage(formGroup, message, 'success');
    }

    showFieldWarning(formGroup, message) {
        formGroup.classList.add('warning');
        this.showFieldMessage(formGroup, message, 'warning');
    }

    showFieldMessage(formGroup, message, type) {
        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.innerHTML = `<i class="fas fa-${this.getMessageIcon(type)}"></i> ${message}`;
        formGroup.appendChild(messageElement);
    }

    getMessageIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle'
        };
        return icons[type] || 'info-circle';
    }

    nextStep() {
        if (this.validateStep(this.currentStep)) {
            this.saveStepData(this.currentStep);
            
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.showStep(this.currentStep);
                this.updateProgress();
                this.updateNavigation();
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
            this.updateProgress();
            this.updateNavigation();
        }
    }

    showStep(stepNumber) {
        // Ocultar todos los steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });

        // Mostrar step actual
        const currentStep = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
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
    }

    updateProgress() {
        const progress = (this.currentStep - 1) / (this.totalSteps - 1) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
    }

    updateNavigation() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        if (this.currentStep === 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'flex';
            submitBtn.style.display = 'none';
        } else if (this.currentStep === this.totalSteps) {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'flex';
        } else {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
            submitBtn.style.display = 'none';
        }
    }

    validateStep(step) {
        switch (step) {
            case 1:
                return this.validateStep1();
            case 2:
                return this.validateStep2();
            default:
                return true;
        }
    }

    validateStep1() {
        const requiredFields = [
            'fullName',
            'registerEmail', 
            'phone',
            'document',
            'registerPassword',
            'confirmPassword'
        ];

        let isValid = true;

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                this.showFieldError(field.closest('.form-group'), 'Este campo es requerido');
                isValid = false;
            }
        });

        // Validaciones específicas
        if (!this.validateEmail(document.getElementById('registerEmail').value)) {
            isValid = false;
        }

        if (!this.validatePassword(document.getElementById('registerPassword').value)) {
            isValid = false;
        }

        if (!this.checkPasswordMatch()) {
            isValid = false;
        }

        if (!this.validatePhone(document.getElementById('phone').value)) {
            isValid = false;
        }

        // Términos y condiciones
        const termsCheckbox = document.getElementById('acceptTerms');
        if (!termsCheckbox.checked) {
            this.showNotification('Debes aceptar los términos y condiciones para continuar', 'error');
            isValid = false;
        }

        return isValid;
    }

    validateStep2() {
        if (this.userData.pets.length === 0) {
            this.showNotification('Debes agregar al menos una mascota para continuar', 'error');
            return false;
        }
        return true;
    }

    saveStepData(step) {
        switch (step) {
            case 1:
                this.userData.personal = {
                    fullName: document.getElementById('fullName').value,
                    email: document.getElementById('registerEmail').value,
                    phone: document.getElementById('phone').value,
                    document: document.getElementById('document').value,
                    newsletter: document.getElementById('newsletter').checked
                };
                break;
            case 2:
                // Los datos de mascotas ya se guardan cuando se agregan
                break;
        }
    }

    openPetModal(petIndex = null) {
        this.editingPetIndex = petIndex;
        const modal = document.getElementById('petModal');
        const title = document.getElementById('petModalTitle');
        
        if (petIndex !== null) {
            // Editar mascota existente
            title.textContent = 'Editar Mascota';
            const pet = this.userData.pets[petIndex];
            document.getElementById('petIndex').value = petIndex;
            document.getElementById('petName').value = pet.name || '';
            document.getElementById('petSpecies').value = pet.species || '';
            document.getElementById('petBreed').value = pet.breed || '';
            document.getElementById('petAge').value = pet.age || '';
            document.getElementById('petWeight').value = pet.weight || '';
            document.getElementById('petObservations').value = pet.observations || '';
        } else {
            // Nueva mascota
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

        // Validación básica
        if (!petData.name || !petData.species) {
            this.showNotification('Nombre y especie son campos requeridos', 'error');
            return;
        }

        if (this.editingPetIndex !== null) {
            // Editar mascota existente
            this.userData.pets[this.editingPetIndex] = petData;
        } else {
            // Agregar nueva mascota
            this.userData.pets.push(petData);
        }

        this.renderPetsList();
        this.closePetModal();
        this.showNotification(
            this.editingPetIndex !== null ? 'Mascota actualizada' : 'Mascota agregada', 
            'success'
        );
    }

    renderPetsList() {
        const petsList = document.getElementById('petsList');
        
        if (this.userData.pets.length === 0) {
            petsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-paw"></i>
                    <p>No hay mascotas registradas</p>
                </div>
            `;
            return;
        }

        petsList.innerHTML = this.userData.pets.map((pet, index) => `
            <div class="pet-card">
                <div class="pet-info">
                    <h4>${pet.name}</h4>
                    <div class="pet-details">
                        <span>${this.capitalizeFirstLetter(pet.species)}</span>
                        ${pet.breed ? `<span>Raza: ${pet.breed}</span>` : ''}
                        ${pet.age ? `<span>Edad: ${pet.age} años</span>` : ''}
                        ${pet.weight ? `<span>Peso: ${pet.weight} kg</span>` : ''}
                    </div>
                    ${pet.observations ? `<p class="pet-observations">${pet.observations}</p>` : ''}
                </div>
                <div class="pet-actions">
                    <button class="pet-action-btn edit" onclick="registerSystem.openPetModal(${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="pet-action-btn delete" onclick="registerSystem.deletePet(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    deletePet(index) {
        if (confirm('¿Estás seguro de que quieres eliminar esta mascota?')) {
            this.userData.pets.splice(index, 1);
            this.renderPetsList();
            this.showNotification('Mascota eliminada', 'info');
        }
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    togglePasswordVisibility(fieldId) {
        const field = document.getElementById(fieldId);
        const toggleButton = document.querySelector(`[data-target="${fieldId}"]`);
        const icon = toggleButton.querySelector('i');

        if (field.type === 'password') {
            field.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            field.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    async handleRegistration() {
        // Validar step final
        if (!this.validateStep(this.totalSteps)) {
            return;
        }

        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;
        
        // Mostrar loading
        submitBtn.innerHTML = '<div class="spinner"></div> Procesando...';
        submitBtn.disabled = true;

        try {
            // Simular registro en API
            await this.registerUser();
            
            // Mostrar datos de confirmación
            this.showConfirmationData();
            
            this.showNotification('¡Registro completado exitosamente!', 'success');

        } catch (error) {
            this.showNotification(error.message, 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async registerUser() {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Crear datos de usuario
        const userData = {
            id: Date.now(),
            nombre: this.userData.personal.fullName,
            email: this.userData.personal.email,
            telefono: this.userData.personal.phone,
            documento: this.userData.personal.document,
            mascotas: this.userData.pets,
            rol: 'cliente',
            fechaRegistro: new Date().toISOString()
        };

        // Guardar en localStorage (simulación)
        localStorage.setItem('huellitas_user', JSON.stringify(userData));
        localStorage.setItem('authToken', 'demo-token-' + userData.id);
        localStorage.setItem('rememberMe', 'true');

        return userData;
    }

    showConfirmationData() {
        document.getElementById('confirmationName').textContent = this.userData.personal.fullName;
        document.getElementById('confirmationEmail').textContent = this.userData.personal.email;
        document.getElementById('confirmationPhone').textContent = this.userData.personal.phone;
        document.getElementById('confirmationPets').textContent = this.userData.pets.length;
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

// Inicializar el sistema de registro cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.registerSystem = new RegisterSystem();
});