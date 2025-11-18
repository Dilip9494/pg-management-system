// ============================================
// Room Status Module
// ============================================

let allGuests = [];

// Load room status for all buildings/grids
async function loadRoomStatus() {
    try {
        allGuests = await DB.getGuests();
        // Only consider guests not vacated
        const activeGuests = allGuests.filter(g => g.roomVacate !== 'Yes');
        renderBuilding('Building-1', 'building1Rooms', activeGuests);
        renderBuilding('Building-2', 'building2Rooms', activeGuests);
    } catch (error) {
        console.error('Error loading room status:', error);
    }
}

// Render each building's room grid as animated cards
function renderBuilding(building, containerId, activeGuests) {
    const container = document.getElementById(containerId);
    const rooms = generateRooms(building);

    let html = '';
    rooms.forEach(roomNo => {
        const roomGuests = activeGuests.filter(g => g.building === building && g.roomNo === roomNo);
        const totalSharing = roomGuests.reduce((sum, g) => sum + parseInt(g.sharingType), 0);
        const occupiedCount = roomGuests.length;

        // Determine room status
        let statusClass = 'vacant';
        let statusText = 'Vacant';
        if (occupiedCount > 0) {
            if (occupiedCount >= totalSharing && totalSharing > 0) {
                statusClass = 'occupied';
                statusText = 'Fully Occupied';
            } else {
                statusClass = 'partially-occupied';
                statusText = 'Partially Occupied';
            }
        }

        html += `
            <div class="room-card ${statusClass}" onclick="showRoomDetails('${building}', '${roomNo}')">
                <div class="room-number">
                    <i class="fas fa-door-${statusClass === 'vacant' ? 'open' : 'closed'}"></i>
                    <span>${roomNo}</span>
                </div>
                <div class="room-occupancy">
                    ${occupiedCount} / ${totalSharing || '0'} Occupied
                </div>
                <div class="status-text">
                    ${statusText}
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Show details of guests in specific room (in animated modal)
function showRoomDetails(building, roomNo) {
    const roomGuests = allGuests.filter(g =>
        g.building === building &&
        g.roomNo === roomNo &&
        g.roomVacate !== 'Yes'
    );

    const modal = document.getElementById('roomModal');
    const modalBody = document.getElementById('roomModalBody');

    if (roomGuests.length === 0) {
        modalBody.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <i class="fas fa-door-open" style="font-size: 48px; color: var(--text-secondary);"></i>
                <h3 style="margin-top: 15px;">Room ${roomNo} - ${building}</h3>
                <p style="color: var(--text-secondary);">This room is currently vacant</p>
            </div>
        `;
    } else {
        let html = `
            <h3 style="margin-bottom: 20px;">Room ${roomNo} - ${building}</h3>
            <div style="display: flex; flex-direction: column; gap: 15px;">
        `;
        roomGuests.forEach(guest => {
            const statusClass = guest.monthlyPaymentStatus === 'Paid' ? 'success' :
                               guest.monthlyPaymentStatus === 'Breached' ? 'danger' : 'warning';

            html += `
                <div style="border: 2px solid var(--border-color); border-radius: 10px; padding: 15px; background: var(--bg-color);">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <div>
                            <h4 style="margin: 0 0 5px 0;">${guest.name}</h4>
                            <p style="margin: 0; color: var(--text-secondary); font-size: 14px;">
                                <i class="fas fa-phone"></i> ${guest.mobile}
                            </p>
                        </div>
                        <span class="status-badge status-${statusClass}">
                            ${guest.monthlyPaymentStatus}
                        </span>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px;">
                        <div>
                            <strong>Sharing:</strong> ${guest.sharingType} Sharing
                        </div>
                        <div>
                            <strong>Rent:</strong> ₹${guest.paymentAmount}
                        </div>
                        <div>
                            <strong>Joined:</strong> ${new Date(guest.joiningDate).toLocaleDateString()}
                        </div>
                        <div>
                            <strong>Due Date:</strong> ${guest.upcomingPaymentDueDate ? new Date(guest.upcomingPaymentDueDate).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                    ${guest.remarks ? `<p style="margin: 10px 0 0 0; font-size: 12px; color: var(--text-secondary);"><strong>Note:</strong> ${guest.remarks}</p>` : ''}
                </div>
            `;
        });

        html += '</div>';
        modalBody.innerHTML = html;
    }

    modal.style.display = 'block';
}

// Close modal
function closeRoomModal() {
    document.getElementById('roomModal').style.display = 'none';
}

// Expose modal functions globally for HTML
window.showRoomDetails = showRoomDetails;
window.closeRoomModal = closeRoomModal;

// Modal: click outside to close
window.onclick = function(event) {
    const modal = document.getElementById('roomModal');
    if (event.target === modal) closeRoomModal();
};

// Initialize room status on page load (with animation delay)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(loadRoomStatus, 500);
});

// Auto-refresh room grid every 30s for real-time UI
setInterval(loadRoomStatus, 30000);
