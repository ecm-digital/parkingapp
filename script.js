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
        price: 25,
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
        price: 20,
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
        price: 35,
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
});

function initializeApp() {
    showStep(1);
    updateProgressIndicator();
}

function setupEventListeners() {
    // Step 1: Parking lot selection
    document.querySelectorAll('.parking-lot-card').forEach(card => {
        card.addEventListener('click', function() {
            selectParkingLot(this.dataset.lot);
        });
    });

    // Vehicle type selection
    document.getElementById('vehicle-type').addEventListener('change', function() {
        appState.selectedVehicle = this.value;
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
    document.getElementById('back-to-step-1').addEventListener('click', () => showStep(1));
    document.getElementById('back-to-step-2').addEventListener('click', () => showStep(2));
    document.getElementById('back-to-step-3').addEventListener('click', () => showStep(3));
}

function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('start-date').min = today;
    document.getElementById('end-date').min = today;
}

function selectParkingLot(lotId) {
    // Remove previous selection
    document.querySelectorAll('.parking-lot-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selection to clicked card
    document.querySelector(`[data-lot="${lotId}"]`).classList.add('selected');
    
    appState.selectedLot = lotId;
    document.getElementById('continue-to-dates').disabled = false;
}

function displaySelectedLotInfo() {
    const lot = parkingLots[appState.selectedLot];
    const infoElement = document.getElementById('selected-lot-info');
    
    infoElement.innerHTML = `
        <h3>${lot.name}</h3>
        <p>${lot.address} • ${lot.price} zł/dzień</p>
    `;
}

function handleDateChange() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    if (startDate) {
        document.getElementById('end-date').min = startDate;
        appState.startDate = startDate;
    }
    
    if (endDate) {
        appState.endDate = endDate;
    }
    
    if (startDate && endDate) {
        calculateRentalSummary();
        document.getElementById('check-availability').disabled = false;
    } else {
        document.getElementById('rental-summary').style.display = 'none';
        document.getElementById('check-availability').disabled = true;
    }
}

function calculateRentalSummary() {
    const start = new Date(appState.startDate);
    const end = new Date(appState.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end day
    
    const lot = parkingLots[appState.selectedLot];
    const totalCost = diffDays * lot.price;
    
    document.getElementById('days-count').textContent = diffDays;
    document.getElementById('total-cost').textContent = `${totalCost} zł`;
    document.getElementById('rental-summary').style.display = 'block';
    
    appState.totalDays = diffDays;
    appState.totalCost = totalCost;
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
            <div class="summary-card">
                <h4>Koszt całkowity</h4>
                <p>${appState.totalCost} zł</p>
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
    document.getElementById('vehicle-type').value = 'small-bus';
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
