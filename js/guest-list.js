// ============================================
// Guest List Module
// ============================================

let allGuests = [];
let filteredGuests = [];

// Load all guests
async function loadGuests() {
    try {
        allGuests = await DB.getGuests();
        filteredGuests = [...allGuests];
        renderGuestTable();
    } catch (error) {
        console.error('Error loading guests:', error);
        document.getElementById('guestTableBody').innerHTML = `
            <tr><td colspan="16" class="text-center" style="color: var(--danger-color);">
                Error loading guests!
            </td></tr>
        `;
    }
}

// Format date to DD/MM/YYYY
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
}

// Calculate days left
function calculateDaysLeft(upcomingDueDate) {
    if (!upcomingDueDate) return 'N/A';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(upcomingDueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
        return `<span style="color: var(--danger-color);">${Math.abs(diffDays)} overdue</span>`;
    } else if (diffDays === 0) {
        return '<span style="color: var(--warning-color);">Due today</span>';
    } else {
        return `${diffDays} days`;
    }
}

// Render guest table tabular view
function renderGuestTable() {
    const tbody = document.getElementById('guestTableBody');
    if (!filteredGuests.length) {
        tbody.innerHTML = `<tr><td colspan="16" class="text-center">No guests found</td></tr>`;
        return;
    }
    let html = '';
    filteredGuests.forEach((guest, index) => {
        const statusClass =
            guest.monthlyPaymentStatus === 'Paid' ? 'paid' :
            guest.monthlyPaymentStatus === 'Breached' ? 'breached' : 'pending';

        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${formatDate(guest.joiningDate)}</td>
                <td>${guest.building}</td>
                <td>${guest.roomNo}</td>
                <td>${guest.sharingType} Sharing</td>
                <td>${guest.name}</td>
                <td>${guest.mobile}</td>
                <td>₹${guest.advancePayment}</td>
                <td>₹${guest.paymentAmount}</td>
                <td>
                  <span class="status-badge status-${statusClass}">
                    ${guest.monthlyPaymentStatus}
                  </span>
                </td>
                <td>${guest.monthlyPaymentDate ? formatDate(guest.monthlyPaymentDate) : ''}</td>
                <td>${guest.upcomingPaymentDueDate ? formatDate(guest.upcomingPaymentDueDate) : ''}</td>
                <td>${calculateDaysLeft(guest.upcomingPaymentDueDate)}</td>
                <td>${guest.roomVacate}</td>
                <td>${guest.remarks || '-'}</td>
                <td>
                  <button class="btn-edit" onclick="editGuest('${guest.id}')">
                    <i class="fas fa-edit"></i> Edit
                  </button>
                  <button class="btn-delete" onclick="deleteGuest('${guest.id}', '${guest.name}')">
                    <i class="fas fa-trash"></i> Delete
                  </button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

// Filter guests by building or search term
function filterGuests() {
    const buildingFilterElem = document.getElementById('buildingFilter');
    const buildingFilter = buildingFilterElem ? buildingFilterElem.value : '';
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    filteredGuests = allGuests.filter(guest => {
        const matchesBuilding = !buildingFilter || guest.building === buildingFilter;
        const matchesSearch = !searchTerm ||
            guest.name.toLowerCase().includes(searchTerm) ||
            guest.mobile.includes(searchTerm) ||
            guest.roomNo.toLowerCase().includes(searchTerm);
        return matchesBuilding && matchesSearch;
    });

    renderGuestTable();
}

// Edit guest action (redirect to guest-form.html)
function editGuest(guestId) {
    window.location.href = `guest-form.html?id=${guestId}`;
}

// Delete guest with confirmation
async function deleteGuest(guestId, guestName) {
    const confirmed = confirm(`Are you sure you want to delete ${guestName}?`);
    if (!confirmed) return;
    try {
        const result = await DB.deleteGuest(guestId);
        if (result.success) {
            alert('Guest deleted successfully!');
            loadGuests();
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('An error occurred while deleting the guest!');
    }
}

// Make filter/search global for HTML onchange/oninput binding
window.filterGuests = filterGuests;
window.editGuest = editGuest;
window.deleteGuest = deleteGuest;

// Bind events and load
document.addEventListener('DOMContentLoaded', () => {
    // Bind filter and search events
    const filterElem = document.getElementById('buildingFilter');
    if (filterElem) filterElem.onchange = filterGuests;
    const searchElem = document.getElementById('searchInput');
    if (searchElem) searchElem.oninput = filterGuests;

    setTimeout(loadGuests, 500);
});

// Auto-refresh every 30 seconds
setInterval(loadGuests, 30000);
