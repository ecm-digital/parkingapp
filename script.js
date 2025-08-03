// Application State
let appState = {
    currentStep: 1,
    selectedLot: null,
    selectedVehicle: 'small-bus',
    startDate: null,
    endDate: null,
    selectedSpot: null,
    contactInfo: {},
    reservationId: null
};

// Parking lots data
const parkingLots = {
    centrum: {
        name: 'Centrum Handlowe',
        address: 'ul. Główna 15',
        features: ['Monitoring', '24/7'],
        icon: 'fas fa-building',
        spots: [
            { id: 'A1', features: 'Blisko wejścia' },
            { id: 'A2', features: 'Miejsce standardowe' },
            { id: 'A3', features: 'Miejsce standardowe' },
            { id: 'B1', features: 'Pod zadaszeniem' },
            { id: 'B2', features: 'Miejsce standardowe' },
            { id: 'B3', features: 'Blisko wyjścia' }
        ]
    },
    dworzec: {
        name: 'Dworzec Główny',
        address: 'ul. Kolejowa 8',
        features: ['Monitoring', 'WiFi'],
        icon: 'fas fa-train',
        spots: [
            { id: 'C1', features: 'Blisko peronu' },
            { id: 'C2', features: 'Miejsce standardowe' },
            { id: 'C3', features: 'Pod zadaszeniem' },
            { id: 'D1', features: 'Miejsce standardowe' },
            { id: 'D2', features: 'Blisko wejścia' },
            { id: 'D3', features: 'Miejsce standardowe' }
        ]
    },
    lotnisko: {
        name: 'Lotnisko',
        address: 'ul. Lotnicza 1',
        features: ['Monitoring', 'Transfer'],
        icon: 'fas fa-plane',
        spots: [
            { id: 'E1', features: 'Premium - blisko terminalu' },
            { id: 'E2', features: 'Miejsce standardowe' },
            { id: 'E3', features: 'Miejsce standardowe' },
            { id: 'F1', features: 'Pod zadaszeniem' },
            { id: 'F2', features: 'Miejsce standardowe' },
            { id: 'F3', features: 'Blisko shuttle' }
        ]
    }
};

// DOM Elements
const steps = document.querySelectorAll('.step');
const progressSteps = document.querySelectorAll('.progress-step');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setMinDate();
    setupTouchOptimizations();
});

function initializeApp() {
    showStep(1);
    updateProgressIndicator();
    updateSelectionSummary();
}

function setupEventListeners() {
    // Step 1: Parking lot selection
    document.querySelectorAll('.parking-lot-card').forEach(card => {
        card.addEventListener('click', function() {
            selectParkingLot(this.dataset.lot);
        });
    });

    // Vehicle type selection
    document.querySelectorAll('.vehicle-type-card').forEach(card => {
        card.addEventListener('click', function() {
            // Remove selected class from all cards
            document.querySelectorAll('.vehicle-type-card').forEach(c => c.classList.remove('selected'));
            // Add selected class to clicked card
            this.classList.add('selected');
            // Update app state
            appState.selectedVehicle = this.dataset.type;
            updateSelectionSummary();
        });
    });

    // Continue to dates button
    document.getElementById('continue-to-dates').addEventListener('click', function() {
        if (appState.selectedLot) {
            showStep(2);
            displaySelectedLotInfo();
        }
    });

    // Step 2: Date selection
    document.getElementById('start-date').addEventListener('change', handleDateChange);
    document.getElementById('end-date').addEventListener('change', handleDateChange);
    
    document.getElementById('check-availability').addEventListener('click', function() {
        if (appState.startDate && appState.endDate) {
            showStep(3);
            displayAvailableSpots();
        }
    });

    // Step 3: Spot selection
    document.getElementById('continue-to-contact').addEventListener('click', function() {
        if (appState.selectedSpot) {
            showStep(4);
            displayReservationSummary();
        }
    });

    // Step 4: Contact form
    const contactInputs = ['first-name', 'last-name', 'email', 'phone', 'license-plate'];
    contactInputs.forEach(inputId => {
        document.getElementById(inputId).addEventListener('input', validateContactForm);
    });

    document.getElementById('confirm-reservation').addEventListener('click', function() {
        if (validateContactForm()) {
            saveContactInfo();
            showStep(5);
            displayConfirmation();
        }
    });

    // Step 5: Confirmation actions
    document.getElementById('download-confirmation').addEventListener('click', downloadConfirmation);
    document.getElementById('new-reservation').addEventListener('click', startNewReservation);

    // Back buttons
    document.getElementById('back-to-step-1').addEventListener('click', function() {
        showStep(1);
    });

    document.getElementById('back-to-step-2').addEventListener('click', function() {
        showStep(2);
    });

    document.getElementById('back-to-step-3').addEventListener('click', function() {
        showStep(3);
    });

    // Progress steps navigation
    progressSteps.forEach((step, index) => {
        step.addEventListener('click', function() {
            const targetStep = index + 1;
            if (canNavigateToStep(targetStep)) {
                showStep(targetStep);
                if (targetStep === 2) displaySelectedLotInfo();
                if (targetStep === 3) displayAvailableSpots();
                if (targetStep === 4) displayReservationSummary();
                if (targetStep === 5) displayConfirmation();
            }
        });
    });

    // Setup sticky action button
    setupStickyActionButton();
}

function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];
    
    // Set minimum dates
    document.getElementById('start-date').min = today;
    document.getElementById('end-date').min = tomorrowString; // End date must be at least tomorrow
    
    // Show initial hint
    showDateHint('Wybierz daty najmu miejsca parkingowego');
}

function selectParkingLot(lotId) {
    // Remove previous selection
    document.querySelectorAll('.parking-lot-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selection to clicked card
    document.querySelector(`[data-lot="${lotId}"]`).classList.add('selected');
    
    appState.selectedLot = lotId;
    updateSelectionSummary();
    
    const continueButton = document.getElementById('continue-to-dates');
    continueButton.disabled = false;
    
    // Auto-scroll to make the button visible
    setTimeout(() => {
        continueButton.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }, 300);
}

function updateSelectionSummary() {
    const summaryElement = document.getElementById('selection-summary');
    const vehicleText = document.getElementById('selected-vehicle-text');
    const locationText = document.getElementById('selected-location-text');
    const helpText = document.querySelector('.help-text');
    
    // Update vehicle text
    const vehicleTypes = {
        'car': 'Samochód osobowy',
        'small-bus': 'Mały bus (do 3.5t)',
        'large-bus': 'Duży bus (powyżej 3.5t)'
    };
    vehicleText.textContent = vehicleTypes[appState.selectedVehicle];
    
    // Update location text
    if (appState.selectedLot) {
        const lot = parkingLots[appState.selectedLot];
        locationText.textContent = lot.name;
        summaryElement.style.display = 'flex';
        helpText.style.display = 'none';
    } else {
        summaryElement.style.display = 'none';
        helpText.style.display = 'block';
    }
}

function displaySelectedLotInfo() {
    const lot = parkingLots[appState.selectedLot];
    const infoElement = document.getElementById('selected-lot-info');
    
    infoElement.innerHTML = `
        <h3>${lot.name}</h3>
        <p>${lot.address}</p>
        <div class="lot-features">
            ${lot.features.map(feature => `<span class="feature"><i class="fas fa-check"></i> ${feature}</span>`).join('')}
        </div>
    `;
}

function handleDateChange() {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const checkButton = document.getElementById('check-availability');
    
    // Clear previous error states
    clearDateErrors();
    
    // Validate start date
    if (startDate) {
        const today = new Date().toISOString().split('T')[0];
        if (startDate < today) {
            showDateError('start-date', 'Data rozpoczęcia nie może być w przeszłości');
            checkButton.disabled = true;
            return;
        }
        
        // Update minimum end date to be at least start date
        const nextDay = new Date(startDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayString = nextDay.toISOString().split('T')[0];
        endDateInput.min = nextDayString;
        
        // If end date is already set but is before start date, clear it
        if (endDate && endDate <= startDate) {
            endDateInput.value = '';
            showDateError('end-date', 'Data zakończenia musi być po dacie rozpoczęcia');
            checkButton.disabled = true;
            return;
        }
        
        appState.startDate = startDate;
    }
    
    // Validate end date
    if (endDate) {
        if (!startDate) {
            showDateError('end-date', 'Najpierw wybierz datę rozpoczęcia');
            checkButton.disabled = true;
            return;
        }
        
        if (endDate <= startDate) {
            showDateError('end-date', 'Data zakończenia musi być po dacie rozpoczęcia');
            checkButton.disabled = true;
            return;
        }
        
        // Check if rental period is not too long (max 30 days)
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 30) {
            showDateError('end-date', 'Maksymalny okres najmu to 30 dni');
            checkButton.disabled = true;
            return;
        }
        
        appState.endDate = endDate;
    }
    
    // Both dates are valid
    if (startDate && endDate) {
        calculateRentalSummary();
        checkButton.disabled = false;
        showDateSuccess();
    } else {
        checkButton.disabled = true;
        
        // Show helpful hints
        if (!startDate && !endDate) {
            showDateHint('Wybierz daty najmu miejsca parkingowego');
        } else if (!endDate) {
            showDateHint('Wybierz datę zakończenia najmu');
        }
    }
}

// Show helpful feedback messages for date selection
function showDateFeedback(type) {
    let feedbackElement = document.getElementById('date-feedback');
    if (!feedbackElement) {
        feedbackElement = document.createElement('div');
        feedbackElement.id = 'date-feedback';
        feedbackElement.className = 'date-feedback';
        document.querySelector('.date-selection').appendChild(feedbackElement);
    }
    
    const messages = {
        'start-selected': {
            icon: 'fas fa-check',
            text: 'Świetnie! Teraz wybierz datę zakończenia najmu.',
            class: 'info'
        },
        'need-end-date': {
            icon: 'fas fa-arrow-right',
            text: 'Wybierz datę zakończenia najmu.',
            class: 'info'
        },
        'need-start-date': {
            icon: 'fas fa-arrow-left',
            text: 'Najpierw wybierz datę rozpoczęcia najmu.',
            class: 'warning'
        },
        'need-both-dates': {
            icon: 'fas fa-calendar-alt',
            text: 'Wybierz daty rozpoczęcia i zakończenia najmu.',
            class: 'info'
        },
        'both-selected': {
            icon: 'fas fa-check-circle',
            text: 'Doskonale! Sprawdzimy dostępność miejsc.',
            class: 'success'
        },
        'auto-proceeding': {
            icon: 'fas fa-spinner fa-spin',
            text: 'Sprawdzam dostępność...',
            class: 'loading'
        }
    };
    
    const message = messages[type];
    if (message) {
        feedbackElement.innerHTML = `
            <i class="${message.icon}"></i>
            <span>${message.text}</span>
        `;
        feedbackElement.className = `date-feedback ${message.class}`;
        
        // Auto-hide after 4 seconds for success messages
        if (message.class === 'success' || message.class === 'loading') {
            setTimeout(() => {
                if (feedbackElement.classList.contains(message.class)) {
                    feedbackElement.style.opacity = '0';
                    setTimeout(() => {
                        if (feedbackElement.style.opacity === '0') {
                            feedbackElement.style.display = 'none';
                        }
                    }, 300);
                }
            }, message.class === 'loading' ? 1000 : 3000);
        } else {
            feedbackElement.style.opacity = '1';
            feedbackElement.style.display = 'block';
        }
    }
}

function clearDateErrors() {
    const startDateGroup = document.getElementById('start-date').closest('.date-input-group');
    const endDateGroup = document.getElementById('end-date').closest('.date-input-group');
    
    // Remove error classes and messages
    [startDateGroup, endDateGroup].forEach(group => {
        group.classList.remove('error', 'success');
        const errorMsg = group.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
    });
    
    // Clear any existing feedback
    const feedbackElement = document.querySelector('.date-feedback');
    if (feedbackElement) feedbackElement.remove();
}

function showDateError(inputId, message) {
    const input = document.getElementById(inputId);
    const group = input.closest('.date-input-group');
    
    group.classList.add('error');
    group.classList.remove('success');
    
    // Remove existing error message
    const existingError = group.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    group.appendChild(errorDiv);
}

function showDateSuccess() {
    const startDateGroup = document.getElementById('start-date').closest('.date-input-group');
    const endDateGroup = document.getElementById('end-date').closest('.date-input-group');
    
    [startDateGroup, endDateGroup].forEach(group => {
        group.classList.add('success');
        group.classList.remove('error');
    });
    
    // Show success feedback
    showDateFeedback('Daty zostały wybrane poprawnie', 'success');
}

function showDateHint(message) {
    showDateFeedback(message, 'info');
}

function showDateFeedback(message, type) {
    // Remove existing feedback
    const existingFeedback = document.querySelector('.date-feedback');
    if (existingFeedback) existingFeedback.remove();
    
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = `date-feedback ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 'info-circle';
    
    feedbackDiv.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
    
    // Insert after date inputs
    const dateSelection = document.querySelector('.date-selection');
    dateSelection.appendChild(feedbackDiv);
}

function calculateRentalSummary() {
    const start = new Date(appState.startDate);
    const end = new Date(appState.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end day
    
    appState.totalDays = diffDays;
    // No cost calculation needed - pricing removed
}

function displayAvailableSpots() {
    const lot = parkingLots[appState.selectedLot];
    const availabilityInfo = document.getElementById('availability-info');
    const spotsGrid = document.getElementById('spots-grid');
    
    // Simulate availability check
    const availableSpots = lot.spots.filter(() => Math.random() > 0.3); // 70% chance of availability
    
    if (availableSpots.length > 0) {
        availabilityInfo.innerHTML = `
            <i class="fas fa-check-circle"></i>
            Znaleziono ${availableSpots.length} dostępnych miejsc w wybranym terminie
        `;
        availabilityInfo.className = 'availability-info';
        
        spotsGrid.innerHTML = availableSpots.map(spot => `
            <div class="spot-card" data-spot="${spot.id}">
                <div class="spot-number">Miejsce ${spot.id}</div>
                <div class="spot-features">${spot.features}</div>
            </div>
        `).join('');
        
        // Add click listeners to spot cards
        document.querySelectorAll('.spot-card').forEach(card => {
            card.addEventListener('click', function() {
                selectSpot(this.dataset.spot);
            });
        });
    } else {
        availabilityInfo.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            Brak dostępnych miejsc w wybranym terminie. Spróbuj inne daty.
        `;
        availabilityInfo.className = 'availability-info no-spots';
        spotsGrid.innerHTML = '';
    }
}

function selectSpot(spotId) {
    // Remove previous selection
    document.querySelectorAll('.spot-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selection to clicked card
    document.querySelector(`[data-spot="${spotId}"]`).classList.add('selected');
    
    appState.selectedSpot = spotId;
    document.getElementById('continue-to-contact').disabled = false;
}

function displayReservationSummary() {
    const lot = parkingLots[appState.selectedLot];
    const summaryElement = document.getElementById('reservation-summary');
    
    const startDateFormatted = new Date(appState.startDate).toLocaleDateString('pl-PL');
    const endDateFormatted = new Date(appState.endDate).toLocaleDateString('pl-PL');
    
    summaryElement.innerHTML = `
        <h3>Podsumowanie rezerwacji</h3>
        <div class="summary-grid">
            <div class="summary-card">
                <h4>Plac parkingowy</h4>
                <p>${lot.name}</p>
            </div>
            <div class="summary-card">
                <h4>Miejsce</h4>
                <p>${appState.selectedSpot}</p>
            </div>
            <div class="summary-card">
                <h4>Okres najmu</h4>
                <p>${startDateFormatted} - ${endDateFormatted}</p>
            </div>
        </div>
    `;
}

function validateContactForm() {
    const requiredFields = ['first-name', 'last-name', 'email', 'phone', 'license-plate'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            isValid = false;
        }
    });
    
    // Email validation
    const email = document.getElementById('email').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
        isValid = false;
    }
    
    document.getElementById('confirm-reservation').disabled = !isValid;
    return isValid;
}

function saveContactInfo() {
    appState.contactInfo = {
        firstName: document.getElementById('first-name').value,
        lastName: document.getElementById('last-name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        licensePlate: document.getElementById('license-plate').value
    };
    
    // Generate reservation ID
    appState.reservationId = 'PK' + Date.now().toString().slice(-8);
}

function displayConfirmation() {
    const lot = parkingLots[appState.selectedLot];
    const confirmationDetails = document.getElementById('confirmation-details');
    
    const startDateFormatted = new Date(appState.startDate).toLocaleDateString('pl-PL');
    const endDateFormatted = new Date(appState.endDate).toLocaleDateString('pl-PL');
    
    confirmationDetails.innerHTML = `
        <div class="summary-grid">
            <div class="summary-card">
                <h4>Numer rezerwacji</h4>
                <p>${appState.reservationId}</p>
            </div>
            <div class="summary-card">
                <h4>Plac parkingowy</h4>
                <p>${lot.name}<br><small>${lot.address}</small></p>
            </div>
            <div class="summary-card">
                <h4>Miejsce</h4>
                <p>${appState.selectedSpot}</p>
            </div>
            <div class="summary-card">
                <h4>Okres najmu</h4>
                <p>${startDateFormatted} - ${endDateFormatted}</p>
            </div>
            <div class="summary-card">
                <h4>Pojazd</h4>
                <p>${appState.contactInfo.licensePlate}</p>
            </div>
            <div class="summary-card">
                <h4>Koszt całkowity</h4>
                <p>${appState.totalCost} zł</p>
            </div>
        </div>
        <div style="margin-top: 2rem; padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 12px; text-align: center;">
            <p><strong>Ważne:</strong> Potwierdzenie zostało wysłane na adres ${appState.contactInfo.email}</p>
            <p>W razie pytań zadzwoń: <strong>+48 123 456 789</strong></p>
        </div>
    `;
}

function downloadConfirmation() {
    const lot = parkingLots[appState.selectedLot];
    const startDateFormatted = new Date(appState.startDate).toLocaleDateString('pl-PL');
    const endDateFormatted = new Date(appState.endDate).toLocaleDateString('pl-PL');
    
    const confirmationText = `
POTWIERDZENIE REZERWACJI PARKINGU
==================================

Numer rezerwacji: ${appState.reservationId}
Data wystawienia: ${new Date().toLocaleDateString('pl-PL')}

DANE REZERWACJI:
- Plac parkingowy: ${lot.name}
- Adres: ${lot.address}
- Miejsce: ${appState.selectedSpot}
- Okres najmu: ${startDateFormatted} - ${endDateFormatted}
- Liczba dni: ${appState.totalDays}
- Koszt całkowity: ${appState.totalCost} zł

DANE KLIENTA:
- Imię i nazwisko: ${appState.contactInfo.firstName} ${appState.contactInfo.lastName}
- Email: ${appState.contactInfo.email}
- Telefon: ${appState.contactInfo.phone}
- Numer rejestracyjny: ${appState.contactInfo.licensePlate}

KONTAKT:
Telefon: +48 123 456 789
Email: info@parkingspot.pl

Dziękujemy za wybór naszych usług!
    `;
    
    const blob = new Blob([confirmationText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `potwierdzenie-${appState.reservationId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function startNewReservation() {
    // Reset app state
    appState = {
        currentStep: 1,
        selectedLot: null,
        selectedVehicle: 'small-bus',
        startDate: null,
        endDate: null,
        selectedSpot: null,
        contactInfo: {},
        reservationId: null
    };
    
    // Reset form elements
    document.querySelectorAll('.vehicle-type-card').forEach(c => c.classList.remove('selected'));
    document.querySelector('.vehicle-type-card[data-type="small-bus"]').classList.add('selected');
    document.getElementById('start-date').value = '';
    document.getElementById('end-date').value = '';
    document.getElementById('first-name').value = '';
    document.getElementById('last-name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('license-plate').value = '';
    
    // Remove selections
    document.querySelectorAll('.parking-lot-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Reset buttons
    document.getElementById('continue-to-dates').disabled = true;
    document.getElementById('check-availability').disabled = true;
    document.getElementById('continue-to-contact').disabled = true;
    document.getElementById('confirm-reservation').disabled = true;
    
    // Show first step
    showStep(1);
}

function showStep(stepNumber) {
    // Hide all steps
    steps.forEach(step => step.classList.remove('active'));
    
    // Show current step
    document.getElementById(`step-${stepNumber}`).classList.add('active');
    
    appState.currentStep = stepNumber;
    updateProgressIndicator();
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function updateProgressIndicator() {
    progressSteps.forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNumber < appState.currentStep) {
            step.classList.add('completed');
        } else if (stepNumber === appState.currentStep) {
            step.classList.add('active');
        }
    });
    
    // Update sticky action button
    updateStickyActionButton();
}

// Check if user can navigate to a specific step
function canNavigateToStep(stepNumber) {
    switch (stepNumber) {
        case 1:
            return true;
        case 2:
            return appState.selectedLot !== null;
        case 3:
            return appState.selectedLot !== null && appState.startDate && appState.endDate;
        case 4:
            return appState.selectedLot !== null && appState.startDate && appState.endDate && appState.selectedSpot;
        case 5:
            return appState.selectedLot !== null && appState.startDate && appState.endDate && 
                   appState.selectedSpot && Object.keys(appState.contactInfo).length > 0;
        default:
            return false;
    }
}

// Setup sticky action button functionality
function setupStickyActionButton() {
    // Create sticky button if it doesn't exist
    let stickyButton = document.getElementById('sticky-action-button');
    if (!stickyButton) {
        stickyButton = document.createElement('button');
        stickyButton.id = 'sticky-action-button';
        stickyButton.className = 'sticky-action-button';
        document.body.appendChild(stickyButton);
    }
    
    // Add click event listener
    stickyButton.addEventListener('click', function() {
        const currentStepElement = document.querySelector(`#step-${appState.currentStep}`);
        const regularButton = currentStepElement.querySelector('.btn-primary:not(.sticky-action-button)');
        if (regularButton && !regularButton.disabled) {
            regularButton.click();
        }
    });
}

// Update sticky action button based on current step
function updateStickyActionButton() {
    const stickyButton = document.getElementById('sticky-action-button');
    if (!stickyButton) return;
    
    const currentStepElement = document.querySelector(`#step-${appState.currentStep}`);
    const regularButton = currentStepElement.querySelector('.btn-primary:not(.sticky-action-button)');
    
    if (regularButton) {
        // Copy button text and state
        stickyButton.innerHTML = regularButton.innerHTML;
        stickyButton.disabled = regularButton.disabled;
        
        // Show/hide based on screen size and step
        if (window.innerWidth <= 768 && appState.currentStep < 5) {
            stickyButton.style.display = 'flex';
        } else {
            stickyButton.style.display = 'none';
        }
    } else {
        stickyButton.style.display = 'none';
    }
}

// Add smooth animations and transitions
document.addEventListener('DOMContentLoaded', function() {
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Handle window resize for sticky button
window.addEventListener('resize', function() {
    updateStickyActionButton();
});

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const activeStep = appState.currentStep;
        const continueButton = document.querySelector(`#step-${activeStep} .btn-primary:not(:disabled)`);
        if (continueButton) {
            continueButton.click();
        }
    }
});

// Add form validation feedback
function addValidationFeedback() {
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.style.borderColor = '#e74c3c';
            } else {
                this.style.borderColor = '#ecf0f1';
            }
        });
        
        input.addEventListener('focus', function() {
            this.style.borderColor = '#3498db';
        });
    });
}

// Initialize validation feedback
document.addEventListener('DOMContentLoaded', addValidationFeedback);

// Touch Optimizations
function setupTouchOptimizations() {
    setupSwipeNavigation();
    setupPullToRefresh();
    setupHapticFeedback();
    setupTouchFeedback();
}

// Swipe Navigation
function setupSwipeNavigation() {
    let startX = 0;
    let startY = 0;
    let isSwipeActive = false;
    
    const mainContent = document.querySelector('.main-content');
    
    mainContent.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isSwipeActive = true;
    }, { passive: true });
    
    mainContent.addEventListener('touchmove', function(e) {
        if (!isSwipeActive) return;
        
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = startX - currentX;
        const diffY = startY - currentY;
        
        // Prevent vertical scrolling during horizontal swipe
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            e.preventDefault();
        }
    }, { passive: false });
    
    mainContent.addEventListener('touchend', function(e) {
        if (!isSwipeActive) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // Check if it's a horizontal swipe (not vertical scroll)
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 100) {
            if (diffX > 0) {
                // Swipe left - next step
                handleSwipeNext();
            } else {
                // Swipe right - previous step
                handleSwipePrevious();
            }
        }
        
        isSwipeActive = false;
    }, { passive: true });
}

function handleSwipeNext() {
    const currentStep = appState.currentStep;
    let nextStep = currentStep + 1;
    
    // Check if we can navigate to next step
    if (nextStep <= 5 && canNavigateToStep(nextStep)) {
        triggerHapticFeedback('light');
        showSwipeIndicator('next');
        
        setTimeout(() => {
            showStep(nextStep);
            if (nextStep === 2) displaySelectedLotInfo();
            if (nextStep === 3) displayAvailableSpots();
            if (nextStep === 4) displayReservationSummary();
            if (nextStep === 5) displayConfirmation();
        }, 150);
    } else {
        triggerHapticFeedback('error');
        showSwipeIndicator('blocked');
    }
}

function handleSwipePrevious() {
    const currentStep = appState.currentStep;
    let prevStep = currentStep - 1;
    
    if (prevStep >= 1) {
        triggerHapticFeedback('light');
        showSwipeIndicator('previous');
        
        setTimeout(() => {
            showStep(prevStep);
            if (prevStep === 2) displaySelectedLotInfo();
            if (prevStep === 3) displayAvailableSpots();
            if (prevStep === 4) displayReservationSummary();
        }, 150);
    } else {
        triggerHapticFeedback('error');
        showSwipeIndicator('blocked');
    }
}

function showSwipeIndicator(type) {
    let indicator = document.getElementById('swipe-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'swipe-indicator';
        indicator.className = 'swipe-indicator';
        document.body.appendChild(indicator);
    }
    
    const icons = {
        'next': '<i class="fas fa-chevron-right"></i>',
        'previous': '<i class="fas fa-chevron-left"></i>',
        'blocked': '<i class="fas fa-times"></i>'
    };
    
    indicator.innerHTML = icons[type];
    indicator.className = `swipe-indicator ${type}`;
    indicator.style.display = 'flex';
    
    setTimeout(() => {
        indicator.style.display = 'none';
    }, 800);
}

// Pull to Refresh
function setupPullToRefresh() {
    let startY = 0;
    let pullDistance = 0;
    let isPulling = false;
    let refreshThreshold = 80;
    
    const mainContent = document.querySelector('.main-content');
    let pullIndicator = null;
    
    mainContent.addEventListener('touchstart', function(e) {
        if (window.scrollY === 0) {
            startY = e.touches[0].clientY;
            isPulling = true;
        }
    }, { passive: true });
    
    mainContent.addEventListener('touchmove', function(e) {
        if (!isPulling || window.scrollY > 0) return;
        
        const currentY = e.touches[0].clientY;
        pullDistance = Math.max(0, currentY - startY);
        
        if (pullDistance > 10) {
            e.preventDefault();
            
            if (!pullIndicator) {
                pullIndicator = createPullIndicator();
            }
            
            updatePullIndicator(pullDistance, refreshThreshold);
        }
    }, { passive: false });
    
    mainContent.addEventListener('touchend', function(e) {
        if (!isPulling) return;
        
        if (pullDistance >= refreshThreshold) {
            triggerRefresh();
        } else {
            hidePullIndicator();
        }
        
        isPulling = false;
        pullDistance = 0;
    }, { passive: true });
}

function createPullIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'pull-indicator';
    indicator.className = 'pull-indicator';
    indicator.innerHTML = `
        <div class="pull-icon">
            <i class="fas fa-arrow-down"></i>
        </div>
        <div class="pull-text">Pociągnij, aby odświeżyć</div>
    `;
    document.body.appendChild(indicator);
    return indicator;
}

function updatePullIndicator(distance, threshold) {
    const indicator = document.getElementById('pull-indicator');
    if (!indicator) return;
    
    const progress = Math.min(distance / threshold, 1);
    const icon = indicator.querySelector('.pull-icon i');
    const text = indicator.querySelector('.pull-text');
    
    indicator.style.transform = `translateY(${Math.min(distance, threshold)}px)`;
    indicator.style.opacity = progress;
    
    if (progress >= 1) {
        icon.className = 'fas fa-sync-alt fa-spin';
        text.textContent = 'Puść, aby odświeżyć';
        indicator.classList.add('ready');
    } else {
        icon.className = 'fas fa-arrow-down';
        text.textContent = 'Pociągnij, aby odświeżyć';
        indicator.classList.remove('ready');
    }
}

function triggerRefresh() {
    const indicator = document.getElementById('pull-indicator');
    if (indicator) {
        const icon = indicator.querySelector('.pull-icon i');
        const text = indicator.querySelector('.pull-text');
        
        icon.className = 'fas fa-sync-alt fa-spin';
        text.textContent = 'Odświeżanie...';
        indicator.classList.add('refreshing');
        
        triggerHapticFeedback('medium');
        
        // Simulate refresh - in real app this would reload data
        setTimeout(() => {
            if (appState.currentStep === 3) {
                displayAvailableSpots(); // Refresh available spots
            }
            hidePullIndicator();
            showRefreshSuccess();
        }, 1500);
    }
}

function hidePullIndicator() {
    const indicator = document.getElementById('pull-indicator');
    if (indicator) {
        indicator.style.transform = 'translateY(-100px)';
        indicator.style.opacity = '0';
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 300);
    }
}

function showRefreshSuccess() {
    let successMsg = document.getElementById('refresh-success');
    if (!successMsg) {
        successMsg = document.createElement('div');
        successMsg.id = 'refresh-success';
        successMsg.className = 'refresh-success';
        document.body.appendChild(successMsg);
    }
    
    successMsg.innerHTML = '<i class="fas fa-check"></i> Odświeżono';
    successMsg.style.display = 'flex';
    
    setTimeout(() => {
        successMsg.style.display = 'none';
    }, 2000);
}

// Haptic Feedback
function setupHapticFeedback() {
    // Add haptic feedback to existing buttons
    document.addEventListener('click', function(e) {
        if (e.target.matches('.btn-primary, .btn-secondary, .parking-lot-card, .spot-card, .progress-step')) {
            triggerHapticFeedback('light');
        }
    });
}

function triggerHapticFeedback(type = 'light') {
    if ('vibrate' in navigator) {
        const patterns = {
            'light': [10],
            'medium': [20],
            'heavy': [30],
            'error': [50, 50, 50],
            'success': [20, 20, 20]
        };
        
        navigator.vibrate(patterns[type] || patterns.light);
    }
}

// Touch Feedback (Visual)
function setupTouchFeedback() {
    document.addEventListener('touchstart', function(e) {
        const target = e.target.closest('.btn-primary, .btn-secondary, .parking-lot-card, .spot-card');
        if (target) {
            target.classList.add('touch-active');
        }
    });
    
    document.addEventListener('touchend', function(e) {
        const target = e.target.closest('.btn-primary, .btn-secondary, .parking-lot-card, .spot-card');
        if (target) {
            setTimeout(() => {
                target.classList.remove('touch-active');
            }, 150);
        }
    });
    
    // Ripple effect
    document.addEventListener('touchstart', function(e) {
        const target = e.target.closest('.btn-primary, .btn-secondary');
        if (target) {
            createRippleEffect(e, target);
        }
    });
}

function createRippleEffect(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.touches[0].clientX - rect.left - size / 2;
    const y = event.touches[0].clientY - rect.top - size / 2;
    
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
    }, 600);
}
