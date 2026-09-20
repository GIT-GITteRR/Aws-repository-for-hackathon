/**
 * MessMate Weekly Menu Planner Controller
 */

let currentSelectedDay = "Monday";
let currentDietFilter = "all"; // 'all', 'veg', 'non-veg'
let weeklyMenuData = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Default to today's day
  currentSelectedDay = MessAPI.getCurrentDayName();
  await loadWeeklyMenu();
  setupEventListeners();
});

async function loadWeeklyMenu() {
  try {
    weeklyMenuData = await MessAPI.getWeeklyMenu();
    renderDayTabs();
    renderDaySchedule(currentSelectedDay);
  } catch (err) {
    console.error("Failed to fetch weekly menu:", err);
  }
}

function renderDayTabs() {
  const container = document.getElementById('weekly-day-tabs');
  if (!container) return;

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  container.innerHTML = days.map(day => `
    <button class="day-tab-btn ${day === currentSelectedDay ? 'active' : ''}" data-day="${day}">
      <span class="day-name">${day}</span>
      <span class="day-sub">${day === MessAPI.getCurrentDayName() ? 'Today' : '4 Meals'}</span>
    </button>
  `).join('');

  // Add click events to tabs
  container.querySelectorAll('.day-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.day-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSelectedDay = btn.getAttribute('data-day');
      renderDaySchedule(currentSelectedDay);
    });
  });
}

function renderDaySchedule(day) {
  const container = document.getElementById('weekly-meals-schedule');
  const dayHeader = document.getElementById('selected-day-display-title');
  if (dayHeader) dayHeader.textContent = `${day}'s Dining Schedule`;

  if (!container || !weeklyMenuData || !weeklyMenuData[day]) return;

  const dayMeals = weeklyMenuData[day];
  const mealSlots = ["Breakfast", "Lunch", "Snacks", "Dinner"];
  let html = '';

  mealSlots.forEach(slot => {
    const meal = dayMeals[slot];
    if (!meal) return;

    // Filter check
    if (currentDietFilter === 'veg' && meal.type !== 'veg') return;
    if (currentDietFilter === 'non-veg' && meal.type === 'veg') return;

    const statusClass = meal.status.toLowerCase().replace(/\s+/g, '-');

    html += `
      <div class="card meal-planner-card" style="margin-bottom: 20px;">
        <div class="card-header" style="padding: 16px 20px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span class="diet-badge ${meal.type === 'veg' ? 'veg' : 'non-veg'}"></span>
            <div>
              <h4 style="font-size: 1.1rem; font-weight: 700;">${slot}: ${meal.name}</h4>
              <span style="font-size: 0.8rem; color: var(--text-secondary);">⏰ ${meal.time}</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span class="badge-status ${statusClass}">${meal.status}</span>
            <span style="font-weight: 700; font-size: 0.88rem; color: #b45309;">⭐ ${meal.rating}</span>
          </div>
        </div>
        <div class="card-body" style="padding: 18px 20px;">
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${meal.items.map(item => `
              <span style="padding: 6px 12px; background: var(--bg-subtle); border-radius: var(--radius-sm); font-size: 0.88rem; font-weight: 500; border: 1px solid var(--border-light);">
                • ${item}
              </span>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  });

  if (html === '') {
    container.innerHTML = `
      <div style="padding: 40px; text-align: center; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
        <p style="color: var(--text-muted); font-size: 1rem;">No meals match the selected dietary filter (${currentDietFilter}) for ${day}.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = html;
}

function setupEventListeners() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDietFilter = btn.getAttribute('data-filter');
      renderDaySchedule(currentSelectedDay);
    });
  });
}
