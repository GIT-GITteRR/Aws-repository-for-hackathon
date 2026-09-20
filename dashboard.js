/**
 * MessMate Student Dashboard Controller
 * Connects directly to GET /api/dashboard/student/<user_id>
 */

document.addEventListener('DOMContentLoaded', async () => {
  await loadStudentDashboardData();
});

async function loadStudentDashboardData() {
  UI.setLoading('today-meals-container', 'Fetching today\'s meals from backend...');
  UI.setLoading('recent-announcements-container', 'Loading recent announcements...');

  try {
    const res = await MessAPI.getStudentDashboard();
    if (!res || !res.success || !res.data) {
      throw new Error(res?.message || "Failed to load dashboard data");
    }

    const data = res.data;

    // 1. Update Student Profile elements in greeting
    const studentNameEls = document.querySelectorAll('.user-profile-name');
    studentNameEls.forEach(el => el.textContent = data.student.name);

    const studentInfoEls = document.querySelectorAll('.user-profile-id');
    studentInfoEls.forEach(el => el.textContent = `${data.student.hostel} • ${data.student.room_number}`);

    // 2. Render Quick Stats
    renderDashboardStats(data);

    // 3. Render Today's Meals Cards
    renderTodayMeals(data.today_meals || []);

    // 4. Render Today's Special Card
    renderTodaySpecial(data.today_meals || []);

    // 5. Render Recent Announcements
    renderRecentAnnouncements(data.announcements || []);

  } catch (err) {
    console.error("Dashboard error:", err);
    UI.setError('today-meals-container', err.message);
    UI.setError('recent-announcements-container', err.message);
    UI.toast(err.message, "error", "Connection Error");
  }
}

function renderDashboardStats(data) {
  // Stat 1: Today's meals count
  const totalMealsEl = document.getElementById('stat-today-meals-count');
  if (totalMealsEl) {
    totalMealsEl.textContent = `${(data.today_meals || []).length} Meals`;
  }

  // Stat 2: Avg Rating
  const avgRatingEl = document.getElementById('stat-avg-rating');
  if (avgRatingEl) {
    avgRatingEl.textContent = `${data.average_mess_rating || 4.6} / 5`;
  }

  // Stat 3: Open Complaints
  const openComplaintsEl = document.getElementById('stat-open-complaints');
  const openComplaintsSubEl = document.getElementById('stat-open-complaints-sub');
  if (openComplaintsEl) {
    const openCount = (data.my_complaints || []).filter(c => c.status !== 'resolved').length;
    openComplaintsEl.textContent = openCount;
    if (openComplaintsSubEl) {
      openComplaintsSubEl.textContent = openCount === 0 ? "All resolved!" : "Requires review";
    }
  }

  // Stat 4: Upcoming meal
  const upcomingEl = document.getElementById('stat-upcoming-meal');
  if (upcomingEl) {
    const upcoming = (data.upcoming_meals || [])[0];
    if (upcoming) {
      upcomingEl.textContent = `${upcoming.meal_type.toUpperCase()} (${upcoming.status})`;
    } else {
      upcomingEl.textContent = "Dinner";
    }
  }
}

function renderTodayMeals(meals) {
  const container = document.getElementById('today-meals-container');
  if (!container) return;

  if (!meals.length) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border-color); grid-column: 1 / -1;">
        <p style="color: var(--text-muted);">No meals scheduled for today.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = meals.map(meal => {
    const statusClass = meal.status.toLowerCase().replace(/\s+/g, '-');
    const isVeg = !meal.food_items.some(f => !f.vegetarian);

    return `
      <div class="meal-card ${statusClass === 'serving-now' ? 'serving-now' : ''}">
        <div class="meal-card-top">
          <div>
            <span class="meal-type-tag">${meal.meal_type}</span>
            <h3 style="font-size: 1.15rem; font-weight: 700; margin-top: 2px;">${meal.name}</h3>
            <div class="meal-time-info">
              <span>🕒 ${meal.time}</span>
            </div>
          </div>
          <span class="badge-status ${statusClass}">${meal.status}</span>
        </div>

        <div class="meal-items-list">
          ${meal.food_items.map(item => `
            <div class="food-item-row">
              <span class="diet-badge ${item.vegetarian ? 'veg' : 'non-veg'}"></span>
              <span>${item.name}</span>
            </div>
          `).join('')}
        </div>

        <div class="meal-card-footer">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${UI.renderStarRating(meal.average_rating || 4.5)}
            <span style="font-size: 0.75rem; color: var(--text-muted);">(${meal.total_ratings || 0})</span>
          </div>
          <a href="ratings.html?meal_id=${meal.id}&meal=${encodeURIComponent(meal.name)}&type=${meal.meal_type}" class="btn btn-outline btn-sm">
            Rate
          </a>
        </div>
      </div>
    `;
  }).join('');
}

function renderTodaySpecial(meals) {
  const container = document.getElementById('today-special-container');
  if (!container) return;

  // Pick the special or dinner meal
  const dinner = meals.find(m => m.meal_type.toLowerCase() === 'dinner') || meals[0];
  if (!dinner) return;

  container.innerHTML = `
    <div class="special-card">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <span class="special-card-badge">✨ Chef's Recommendation</span>
        <span style="font-size: 0.85rem; font-weight: 700; color: #b45309;">⭐ ${dinner.average_rating || 4.8} / 5</span>
      </div>
      <h3>${dinner.name}</h3>
      <p>${dinner.description || 'Prepared fresh with rich authentic spices and served with hot accompaniments.'}</p>
      <div class="special-meta-row">
        <span>🍽️ ${dinner.meal_type.toUpperCase()} Special</span>
        <span>⏰ Served at: ${dinner.time}</span>
        <span>🌱 Multi-Counter Spread</span>
      </div>
    </div>
  `;
}

function renderRecentAnnouncements(announcements) {
  const container = document.getElementById('recent-announcements-container');
  if (!container) return;

  if (!announcements.length) {
    container.innerHTML = `<p style="color: var(--text-muted);">No announcements at this time.</p>`;
    return;
  }

  container.innerHTML = announcements.slice(0, 3).map(ann => `
    <div class="announcement-card ${ann.priority === 'Important' ? 'priority-important' : ''}">
      <div class="announcement-top">
        <span class="announcement-cat-badge ${ann.category.toLowerCase()}">${ann.category}</span>
        <span class="announcement-date">📅 ${ann.created_at || 'Recent'}</span>
      </div>
      <h4 class="announcement-title">${ann.title}</h4>
      <p class="announcement-desc">${ann.description}</p>
    </div>
  `).join('');
}
