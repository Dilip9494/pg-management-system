// ============================================
// Guest Form Module
// ============================================

let isEditMode = false;
let currentGuestId = null;

// Initialize form
document.addEventListener('DOMContentLoaded', () => {
    // Check for edit mode
    const urlParams = new URLSearchParams(window.location.search);
    const guestId = urlParams.get('id');

    if (guestId) {
        isEditMode = true;
        currentGuestId = guestId;
        document.getElementById('formTitle').textContent = 'Edit Guest';
        loadGuestData(guestId);
    }

    // Set up form listeners
    setupFormListeners();

    // Set default joining date to today
    if (!isEditMode) {
        document.getElementById('joiningDate').valueAsDate = new Date();
        document.getElementById('monthlyPaymentDate').valueAsDate = new Date();
    }
});

// Setup form listeners
function setupFormListeners() {
    // Building selection - load rooms
    document.getElementById('building').addEventListener('change', function() {
        loadRooms(this.value);
    });

    // Joining date change - calculate due date
    document.getElementById('joiningDate').addEventListener('change', calculateDueDate);
    document.getElementById('monthlyPaymentDate').addEventListener('change', calculateDueDate);

    // Form submission
    document.getElementById('guestForm').addEventListener('submit', handleFormSubmit);
}

// Load rooms based on building
function loadRooms(building) {
    const roomSelect = document.getElementById('roomNo');
    roomSelect.innerHTML = '<option value="">Select Room</option>';

    if (!building) return;

    const rooms = generateRooms(building);
    rooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room;
        option.textContent = room;
        roomSelect.appendChild(option);
    });
}

// Calculate due date
function calculateDueDate() {
    const joiningDate = document.getElementById('joiningDate').value;
    const paymentDate = document.getElementById('monthlyPaymentDate').value;

    if (!joiningDate) return;

    const baseDate = paymentDate || joiningDate;
    const base = new Date(baseDate);
    const joiningDay = new Date(joiningDate).getDate();

    // Calculate next due date
    const nextMonth = new Date(base);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(joiningDay);

    // Set upcoming due date
    document.getElementById('upcomingPaymentDueDate').value = nextMonth.toISOString().split('T')[0];

    // Calculate days left
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    nextMonth.setHours(0, 0, 0, 0);

    const diffTime = nextMonth - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        document.getElementById('daysLeft').value = `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
        document.getElementById('daysLeft').value = 'Due today';
    } else {
        document.getElementById('daysLeft').value = `${diffDays} days`;
    }
}

// Load guest data for editing
async function loadGuestData(guestId) {
    try {
        const guest = await DB.getGuestById(guestId);

        if (guest) {
            document.getElementById('guestId').value = guest.id;
            document.getElementById('joiningDate').value = guest.joiningDate;
            document.getElementById('building').value = guest.building;

            // Load rooms for the building
            loadRooms(guest.building);

            setTimeout(() => {
                document.getElementById('roomNo').value = guest.roomNo;
            }, 100);

            document.getElementById('sharingType').value = guest.sharingType;
            document.getElementById('name').value = guest.name;
            document.getElementById('mobile').value = guest.mobile;
            document.getElementById('advancePayment').value = guest.advancePayment;
            document.getElementById('paymentAmount').value = guest.paymentAmount;
            document.getElementById('monthlyPaymentStatus').value = guest.monthlyPaymentStatus;
            document.getElementById('monthlyPaymentDate').value = guest.monthlyPaymentDate || '';
            document.getElementById('upcomingPaymentDueDate').value = guest.upcomingPaymentDueDate || '';
            document.getElementById('daysLeft').value = guest.daysLeft || '';
            document.getElementById('roomVacate').value = guest.roomVacate;
            document.getElementById('remarks').value = guest.remarks || '';

            calculateDueDate();
        }
    } catch (error) {
        console.error('Error loading guest data:', error);
        alert('Error loading guest data!');
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = {
        joiningDate: document.getElementById('joiningDate').value,
        building: document.getElementById('building').value,
        roomNo: document.getElementById('roomNo').value,
        sharingType: document.getElementById('sharingType').value,
        name: document.getElementById('name').value,
        mobile: document.getElementById('mobile').value,
        advancePayment: parseFloat(document.getElementById('advancePayment').value),
        paymentAmount: parseFloat(document.getElementById('paymentAmount').value),
        monthlyPaymentStatus: document.getElementById('monthlyPaymentStatus').value,
        monthlyPaymentDate: document.getElementById('monthlyPaymentDate').value || null,
        upcomingPaymentDueDate: document.getElementById('upcomingPaymentDueDate').value || null,
        daysLeft: document.getElementById('daysLeft').value || null,
        roomVacate: document.getElementById('roomVacate').value,
        remarks: document.getElementById('remarks').value || null
    };

    try {
        let result;

        if (isEditMode) {
            result = await DB.updateGuest(currentGuestId, formData);
        } else {
            result = await DB.addGuest(formData);
        }

        if (result.success) {
            alert(isEditMode ? 'Guest updated successfully!' : 'Guest added successfully!');
            window.location.href = 'guest-list.html';
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Form submission error:', error);
        alert('An error occurred while saving guest data!');
    }
}

// Auto-save functionality (every 30 seconds)
let autoSaveInterval;

function startAutoSave() {
    autoSaveInterval = setInterval(() => {
        const formData = new FormData(document.getElementById('guestForm'));
        const data = Object.fromEntries(formData);
        localStorage.setItem('guestFormAutoSave', JSON.stringify(data));
        console.log('Form auto-saved');
    }, 30000);
}

function stopAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
    }
}

// Load auto-saved data if exists
function loadAutoSave() {
    const saved = localStorage.getItem('guestFormAutoSave');
    if (saved && !isEditMode) {
        const shouldRestore = confirm('Found auto-saved form data. Would you like to restore it?');
        if (shouldRestore) {
            const data = JSON.parse(saved);
            Object.keys(data).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    element.value = data[key];
                }
            });
        }
        localStorage.removeItem('guestFormAutoSave');
    }
}

// Initialize auto-save
if (!isEditMode) {
    setTimeout(() => {
        loadAutoSave();
        startAutoSave();
    }, 1000);
}

// Clear auto-save on successful submit
document.getElementById('guestForm').addEventListener('submit', () => {
    stopAutoSave();
    localStorage.removeItem('guestFormAutoSave');
});
