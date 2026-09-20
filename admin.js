/**
 * MessMate Admin Dashboard & Management Controller
 * Includes Chart.js analytics, Menu CRUD, Complaint Resolution & Announcement Publishing.
 */

let activeEditMeal = { day: null, key: null };
let activeComplaintForReply = null;

document.addEventListener('DOMContentLoaded', async () => {
  const path = window.location.pathname;

  if (path.includes('admin/dashboard.html') || path.endsWith('/admin/') || path.endsWith('/admin/index.html')) {
    await initAdminDashboard();
  } else if (path.includes('admin/menu.html')) {
    await initAdminMenuManagement();
  } else if (path.includes('admin/complaints.html')) {
    await initAdminComplaints();
  } else if (path.includes('admin/announcements.html')) {
    await initAdminAnnouncements();
  }
});

/* ==========================================================================
   Admin Dashboard & Charts
   ========================================================================== */
async function initAdminDashboard() {
  try {
    const weeklyMenu = await MessAPI.getWeeklyMenu();
    const complaints = await MessAPI.getComplaints();
    const ratings = await MessAPI.getRatings();
    const avgRating = await MessAPI.getAverageRating();

    const pending = complaints.filter(c => c.status === 'Pending').length;
    const underRev = complaints.filter(c => c.status === 'Under Review').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;

    // Metrics
    const totalStudentsEl = document.getElementById('admin-stat-students');
    if (totalStudentsEl) totalStudentsEl.textContent = "1,420";

    const avgRatingEl = document.getElementById('admin-stat-avg-rating');
    if (avgRatingEl) avgRatingEl.textContent = `${avgRating} / 5.0`;

    const pendingCmpEl = document.getElementById('admin-stat-pending');
    if (pendingCmpEl) pendingCmpEl.textContent = pending + underRev;

    const resolvedCmpEl = document.getElementById('admin-stat-resolved');
    if (resolvedCmpEl) resolvedCmpEl.textContent = resolved;

    // Recent activity list
    const recentTableBody = document.getElementById('admin-recent-complaints-tbody');
    if (recentTableBody) {
      recentTableBody.innerHTML = complaints.slice(0, 5).map(c => `
        <tr>
          <td><strong>${c.id}</strong></td>
          <td>${c.title}</td>
          <td><span class="announcement-cat-badge">${c.category}</span></td>
          <td>${c.date}</td>
          <td><span class="admin-badge-pill ${c.status.toLowerCase().replace(/\s+/g, '-')}">${c.status}</span></td>
          <td>
            <a href="complaints.html?id=${c.id}" class="btn btn-outline btn-sm">Manage</a>
          </td>
        </tr>
      `).join('');
    }

    // Initialize Charts if Chart.js is loaded
    if (window.Chart) {
      renderRatingsChart(ratings);
      renderComplaintStatsChart(complaints);
      renderPopularityChart();
    }
  } catch (err) {
    console.error("Admin dashboard init error:", err);
  }
}

function renderRatingsChart(ratings) {
  const ctx = document.getElementById('chart-meal-ratings');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Average Meal Rating',
        data: [4.4, 4.7, 4.6, 4.5, 4.7, 4.6, 4.9],
        backgroundColor: '#10b981',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { min: 3, max: 5 }
      }
    }
  });
}

function renderComplaintStatsChart(complaints) {
  const ctx = document.getElementById('chart-complaints-breakdown');
  if (!ctx) return;

  const categories = {};
  complaints.forEach(c => {
    categories[c.category] = (categories[c.category] || 0) + 1;
  });

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories),
        backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#64748b']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

function renderPopularityChart() {
  const ctx = document.getElementById('chart-meal-popularity');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Breakfast', 'Lunch', 'Evening Snacks', 'Dinner'],
      datasets: [{
        label: 'Daily Footfall / Meals Served',
        data: [1120, 1380, 890, 1340],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

/* ==========================================================================
   Admin Menu Management
   ========================================================================== */
async function initAdminMenuManagement() {
  const selectDay = document.getElementById('admin-menu-day-select');
  if (selectDay) {
    selectDay.addEventListener('change', () => loadAdminDayMenu(selectDay.value));
    loadAdminDayMenu(selectDay.value);
  }
  setupEditMealModal();
}

async function loadAdminDayMenu(day) {
  const container = document.getElementById('admin-menu-meals-list');
  if (!container) return;

  try {
    const weekly = await MessAPI.getWeeklyMenu();
    const meals = weekly[day] || {};
    const slots = ["Breakfast", "Lunch", "Snacks", "Dinner"];

    container.innerHTML = slots.map(slot => {
      const meal = meals[slot];
      if (!meal) {
        return `
          <div class="card" style="margin-bottom: 16px; padding: 20px; text-align: center;">
            <p style="color: var(--text-muted); margin-bottom: 10px;">No meal configured for ${slot}</p>
            <button class="btn btn-outline btn-sm" onclick="openAddMealModal('${day}', '${slot}')">+ Add ${slot}</button>
          </div>
        `;
      }

      return `
        <div class="card" style="margin-bottom: 20px;">
          <div class="card-header">
            <div>
              <span class="meal-type-tag">${slot}</span>
              <h3 style="font-size: 1.15rem; font-weight: 700;">${meal.name}</h3>
              <span style="font-size: 0.82rem; color: var(--text-secondary);">⏰ ${meal.time} • Status: <strong>${meal.status}</strong> • Cal: ${meal.calories || 'N/A'}</span>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-outline btn-sm" onclick="openEditMealModal('${day}', '${slot}')">✏️ Edit</button>
              <button class="btn btn-secondary btn-sm" style="color: var(--status-danger);" onclick="deleteAdminMeal('${day}', '${slot}')">🗑️ Delete</button>
            </div>
          </div>
          <div class="card-body">
            <h5 style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;">Food Items:</h5>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${meal.items.map(item => `
                <span style="padding: 4px 10px; background: var(--bg-subtle); border-radius: var(--radius-sm); font-size: 0.85rem;">
                  • ${item}
                </span>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error(err);
  }
}

async function openEditMealModal(day, slot) {
  activeEditMeal = { day, key: slot };
  try {
    const weekly = await MessAPI.getWeeklyMenu();
    const meal = weekly[day]?.[slot];
    if (!meal) return;

    document.getElementById('admin-meal-name-input').value = meal.name || '';
    document.getElementById('admin-meal-time-input').value = meal.time || '';
    document.getElementById('admin-meal-status-select').value = meal.status || 'Upcoming';
    document.getElementById('admin-meal-type-select').value = meal.type || 'veg';
    document.getElementById('admin-meal-items-input').value = (meal.items || []).join('\n');
    document.getElementById('admin-meal-cal-input').value = meal.calories || '';

    UI.openModal('admin-edit-meal-modal');
  } catch (err) {
    console.error(err);
  }
}

function openAddMealModal(day, slot) {
  activeEditMeal = { day, key: slot };
  document.getElementById('admin-meal-name-input').value = `${slot} Special`;
  document.getElementById('admin-meal-time-input').value = '12:30 PM - 02:30 PM';
  document.getElementById('admin-meal-status-select').value = 'Upcoming';
  document.getElementById('admin-meal-type-select').value = 'veg';
  document.getElementById('admin-meal-items-input').value = 'Dish 1\nDish 2\nRice\nBread';
  document.getElementById('admin-meal-cal-input').value = '650 kcal';
  UI.openModal('admin-edit-meal-modal');
}

function setupEditMealModal() {
  const form = document.getElementById('admin-edit-meal-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const itemsRaw = document.getElementById('admin-meal-items-input').value;
    const items = itemsRaw.split('\n').map(i => i.trim()).filter(i => i.length > 0);

    const mealData = {
      name: document.getElementById('admin-meal-name-input').value,
      time: document.getElementById('admin-meal-time-input').value,
      status: document.getElementById('admin-meal-status-select').value,
      type: document.getElementById('admin-meal-type-select').value,
      items: items,
      calories: document.getElementById('admin-meal-cal-input').value || '600 kcal',
      rating: 4.5,
      totalRatings: 100
    };

    try {
      await MessAPI.updateMeal(activeEditMeal.day, activeEditMeal.key, mealData);
      UI.closeModal('admin-edit-meal-modal');
      UI.toast("Meal updated successfully!", "success");
      const selectDay = document.getElementById('admin-menu-day-select');
      if (selectDay) loadAdminDayMenu(selectDay.value);
    } catch (err) {
      UI.toast("Failed to update meal.", "error");
    }
  });
}

async function deleteAdminMeal(day, slot) {
  if (confirm(`Are you sure you want to remove the ${slot} for ${day}?`)) {
    await MessAPI.deleteMeal(day, slot);
    UI.toast("Meal removed from schedule.", "info");
    const selectDay = document.getElementById('admin-menu-day-select');
    if (selectDay) loadAdminDayMenu(selectDay.value);
  }
}

/* ==========================================================================
   Admin Complaints Management
   ========================================================================== */
async function initAdminComplaints() {
  await loadAdminComplaintsTable();
  setupAdminComplaintReplyForm();

  // Check URL query param to open complaint modal directly
  const params = new URLSearchParams(window.location.search);
  const qId = params.get('id');
  if (qId) {
    openAdminComplaintModal(qId);
  }
}

async function loadAdminComplaintsTable() {
  const container = document.getElementById('admin-complaints-tbody');
  if (!container) return;

  try {
    const complaints = await MessAPI.getComplaints();

    container.innerHTML = complaints.map(c => `
      <tr>
        <td><strong>${c.id}</strong></td>
        <td>
          <div style="font-weight: 600;">${c.title}</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.description}</div>
        </td>
        <td><span class="announcement-cat-badge">${c.category}</span></td>
        <td>${c.date}</td>
        <td>
          <select class="status-select-sm" onchange="changeComplaintStatusInline('${c.id}', this.value)">
            <option value="Pending" ${c.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Under Review" ${c.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
            <option value="Resolved" ${c.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
          </select>
        </td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="openAdminComplaintModal('${c.id}')">Review & Reply</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

async function changeComplaintStatusInline(id, newStatus) {
  try {
    await MessAPI.updateComplaintStatus(id, newStatus);
    UI.toast(`Complaint ${id} status changed to ${newStatus}`, "success");
  } catch (err) {
    UI.toast("Failed to update status", "error");
  }
}

async function openAdminComplaintModal(id) {
  try {
    const complaints = await MessAPI.getComplaints();
    const c = complaints.find(item => item.id === id);
    if (!c) return;

    activeComplaintForReply = c;
    document.getElementById('admin-cmp-id-label').textContent = `${c.id} - ${c.title}`;
    document.getElementById('admin-cmp-desc').textContent = c.description;
    document.getElementById('admin-cmp-cat-badge').textContent = c.category;
    document.getElementById('admin-cmp-status-select').value = c.status;
    document.getElementById('admin-cmp-reply-input').value = c.adminReply || '';

    UI.openModal('admin-complaint-reply-modal');
  } catch (err) {
    console.error(err);
  }
}

function setupAdminComplaintReplyForm() {
  const form = document.getElementById('admin-complaint-reply-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activeComplaintForReply) return;

    const newStatus = document.getElementById('admin-cmp-status-select').value;
    const reply = document.getElementById('admin-cmp-reply-input').value;

    try {
      await MessAPI.updateComplaintStatus(activeComplaintForReply.id, newStatus, reply);
      UI.closeModal('admin-complaint-reply-modal');
      UI.toast("Complaint updated and student notified!", "success");
      await loadAdminComplaintsTable();
    } catch (err) {
      UI.toast("Failed to update complaint.", "error");
    }
  });
}

/* ==========================================================================
   Admin Announcement Management
   ========================================================================== */
async function initAdminAnnouncements() {
  await loadAdminAnnouncementsList();
  setupCreateAnnouncementForm();
}

async function loadAdminAnnouncementsList() {
  const container = document.getElementById('admin-announcements-list');
  if (!container) return;

  try {
    const list = await MessAPI.getAnnouncements();

    container.innerHTML = list.map(ann => `
      <div class="card" style="margin-bottom: 16px;">
        <div class="card-body">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span class="announcement-cat-badge ${ann.category.toLowerCase()}">${ann.category}</span>
                <span class="admin-badge-pill ${ann.priority === 'Important' ? 'pending' : 'resolved'}">${ann.priority}</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">📅 ${ann.date}</span>
              </div>
              <h4 style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary);">${ann.title}</h4>
              <p style="font-size: 0.92rem; color: var(--text-secondary); margin-top: 6px; line-height: 1.5;">${ann.description}</p>
            </div>
            <button class="btn btn-secondary btn-sm" style="color: var(--status-danger);" onclick="deleteAnnouncementAdmin('${ann.id}')">
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

function setupCreateAnnouncementForm() {
  const form = document.getElementById('admin-create-announcement-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('ann-title-input').value;
    const category = document.getElementById('ann-cat-select').value;
    const priority = document.getElementById('ann-priority-select').value;
    const description = document.getElementById('ann-desc-input').value;

    try {
      await MessAPI.createAnnouncement({ title, category, priority, description });
      form.reset();
      UI.toast("Announcement published successfully!", "success");
      await loadAdminAnnouncementsList();
    } catch (err) {
      UI.toast("Failed to publish announcement.", "error");
    }
  });
}

async function deleteAnnouncementAdmin(id) {
  if (confirm("Are you sure you want to remove this announcement?")) {
    await MessAPI.deleteAnnouncement(id);
    UI.toast("Announcement deleted.", "info");
    await loadAdminAnnouncementsList();
  }
}
