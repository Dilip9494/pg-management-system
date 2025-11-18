// ============================================
// Reports Module
// ============================================

let allGuests = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set default month to current month
    const now = new Date();
    const monthInput = document.getElementById('reportMonth') || document.getElementById('month');
    if (monthInput) {
        monthInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        monthInput.addEventListener('change', generateReport);
    }

    const buildingSelect = document.getElementById('reportBuilding') || document.getElementById('building');
    if (buildingSelect) {
        buildingSelect.addEventListener('change', generateReport);
    }

    const exportBtn = document.getElementById('exportPdf');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportReport);
    }

    setTimeout(() => {
        loadGuestsAndGenerate();
    }, 500);
});

// Load guests and generate initial report
async function loadGuestsAndGenerate() {
    try {
        allGuests = await DB.getGuests();
        fillBuildingDropdown();
        generateReport();
    } catch (error) {
        console.error('Error loading guests:', error);
        const guestListReport = document.getElementById('guestListReport');
        if (guestListReport) guestListReport.innerHTML = '<p class="text-danger">Error loading data</p>';
    }
}

// Populate building dropdown dynamically
function fillBuildingDropdown() {
    const buildingSelect = document.getElementById('reportBuilding') || document.getElementById('building');
    if (!buildingSelect) return;

    const buildings = [...new Set(allGuests.map(g => g.building))].sort();
    buildingSelect.options.length = 1; // Keep the "All Buildings" option

    buildings.forEach(bldg => {
        const opt = document.createElement('option');
        opt.value = bldg;
        opt.textContent = bldg;
        buildingSelect.appendChild(opt);
    });
}

// Generate report summary and details
function generateReport() {
    const monthInput = document.getElementById('reportMonth') || document.getElementById('month');
    const buildingSelect = document.getElementById('reportBuilding') || document.getElementById('building');

    if (!monthInput || !monthInput.value) {
        alert('Please select a month');
        return;
    }

    const selectedMonth = monthInput.value;
    const selectedBuilding = buildingSelect ? buildingSelect.value : '';

    const [year, month] = selectedMonth.split('-').map(Number);

    // Filter guests joined up to selected month and building filter
    const filteredGuests = allGuests.filter(guest => {
        const joinDate = new Date(guest.joiningDate);
        // Joined before (year, month + 1) - to include all joined within selected month
        const beforeFilterMonth = (joinDate.getFullYear() < year) || (joinDate.getFullYear() === year && joinDate.getMonth() + 1 <= month);
        const buildingMatches = !selectedBuilding || guest.building === selectedBuilding;
        return beforeFilterMonth && buildingMatches;
    });

    // Prepare summary
    const totalGuests = filteredGuests.length;
    const totalPaid = filteredGuests.filter(g => g.monthlyPaymentStatus === 'Paid').length;
    const totalPending = filteredGuests.filter(g => ['Pending', 'Partial Paid'].includes(g.monthlyPaymentStatus)).length;
    const totalBreached = filteredGuests.filter(g => g.monthlyPaymentStatus === 'Breached').length;

    const totalRevenue = filteredGuests.reduce((sum, g) => sum + (g.paymentAmount || 0), 0);
    const collectedRevenue = filteredGuests.filter(g => g.monthlyPaymentStatus === 'Paid').reduce((sum, g) => sum + (g.paymentAmount || 0), 0);
    const vacatedRooms = filteredGuests.filter(g => g.roomVacate === 'Yes').length;

    renderSummary({
        totalGuests,
        totalPaid,
        totalPending,
        totalBreached,
        totalRevenue,
        collectedRevenue,
        vacatedRooms,
    }, selectedMonth);

    renderDetails(filteredGuests);
}

// Render summary HTML
function renderSummary(summary, month) {
    const summaryDiv = document.getElementById('reportSummary') || document.getElementById('reportSummaryDiv');
    if (!summaryDiv) return;

    const formattedMonth = new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    summaryDiv.innerHTML = `
        <h2 style="margin-bottom: 20px;">
            <i class="fas fa-chart-bar"></i> Summary for ${formattedMonth}
        </h2>
        <div class="stats-grid">
            <div class="stat-card stat-primary">
                <div class="stat-icon"><i class="fas fa-users"></i></div>
                <div>
                    <h3>${summary.totalGuests}</h3>
                    <p>Total Guests</p>
                </div>
            </div>
            <div class="stat-card stat-success">
                <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                <div>
                    <h3>${summary.totalPaid}</h3>
                    <p>Paid</p>
                </div>
            </div>
            <div class="stat-card stat-warning">
                <div class="stat-icon"><i class="fas fa-clock"></i></div>
                <div>
                    <h3>${summary.totalPending}</h3>
                    <p>Pending</p>
                </div>
            </div>
            <div class="stat-card stat-danger">
                <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <div>
                    <h3>${summary.totalBreached}</h3>
                    <p>Breached</p>
                </div>
            </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px;">
            <div style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(240, 147, 251, 0.1)); padding: 15px; border-radius: 10px;">
                <strong>Total Revenue:</strong> ₹${summary.totalRevenue.toLocaleString()}
            </div>
            <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(67, 233, 123, 0.1)); padding: 15px; border-radius: 10px;">
                <strong>Collected:</strong> ₹${summary.collectedRevenue.toLocaleString()}
            </div>
            <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(250, 112, 154, 0.1)); padding: 15px; border-radius: 10px;">
                <strong>Pending:</strong> ₹${(summary.totalRevenue - summary.collectedRevenue).toLocaleString()}
            </div>
            <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(254, 225, 64, 0.1)); padding: 15px; border-radius: 10px;">
                <strong>Vacated Rooms:</strong> ${summary.vacatedRooms}
            </div>
        </div>
    `;
}

// Render guests table details
function renderDetails(guests) {
    const detailsDiv = document.getElementById('guestListReport') || document.getElementById('reportDetails');
    if (!detailsDiv) return;

    if (guests.length === 0) {
        detailsDiv.innerHTML = '<p class="text-center text-muted">No data for selected period</p>';
        return;
    }

    let html = `
        <h3 style="margin-bottom: 15px;"><i class="fas fa-list"></i> Detailed Guest List</h3>
        <div class="table-container">
        <table class="guest-table">
            <thead>
                <tr>
                    <th>#</th><th>Name</th><th>Building</th><th>Room</th><th>Mobile</th>
                    <th>Rent</th><th>Status</th><th>Payment Date</th><th>Due Date</th>
                </tr>
            </thead>
            <tbody>
    `;

    guests.forEach((guest, index) => {
        const statusClass = guest.monthlyPaymentStatus === 'Paid' ? 'paid' :
                           guest.monthlyPaymentStatus === 'Breached' ? 'breached' : 'pending';

        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(guest.name)}</td>
                <td>${escapeHtml(guest.building)}</td>
                <td>${escapeHtml(guest.roomNo)}</td>
                <td>${escapeHtml(guest.mobile)}</td>
                <td>₹${guest.paymentAmount}</td>
                <td><span class="status-badge status-${statusClass}">${guest.monthlyPaymentStatus}</span></td>
                <td>${guest.monthlyPaymentDate ? new Date(guest.monthlyPaymentDate).toLocaleDateString() : 'N/A'}</td>
                <td>${guest.upcomingPaymentDueDate ? new Date(guest.upcomingPaymentDueDate).toLocaleDateString() : 'N/A'}</td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    detailsDiv.innerHTML = html;
}

// Simple HTML escape function for safe rendering
function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, "&amp;")
               .replace(/</g, "&lt;")
               .replace(/>/g, "&gt;");
}

// Export as PDF stub
function exportReport() {
    alert('Export PDF function will be added soon. Use browser print as interim.');
    window.print();
}

// Make functions globally accessible
window.generateReport = generateReport;
window.exportReport = exportReport;
