/**
 * MessMate Today's Menu Controller
 * Connects directly to GET /api/menu/today
 */

document.addEventListener('DOMContentLoaded', async () => {
  await renderTodayMenuDetailed();
});

async function renderTodayMenuDetailed() {
  const container = document.getElementById('today-menu-cards');
  if (!container) return;

  UI.setLoading('today-menu-cards', 'Loading today\'s live dining menu from server...');

  try {
    const res = await MessAPI.getTodayMenu();
    if (!res || !res.success || !res.data) {
      throw new Error(res?.message || "Could not retrieve today's menu");
    }

    const meals = res.data;
    const currentDayTitle = document.getElementById('today-menu-day-name');
    if (currentDayTitle) {
      currentDayTitle.textContent = `Today's Complete Menu (${res.date || MessAPI.getFormattedDate()})`;
    }

    if (!meals.length) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
          <p style="color: var(--text-muted);">No meals found for today.</p>
        </div>
      `;
      return;
    }

    const slotIcons = {
      breakfast: "🍳",
      lunch: "🍛",
      snacks: "☕",
      dinner: "🍲"
    };

    container.innerHTML = meals.map(meal => {
      const statusClass = meal.status.toLowerCase().replace(/\s+/g, '-');
      const icon = slotIcons[meal.meal_type.toLowerCase()] || "🍽️";

      return `
        <div class="card meal-detail-card" style="margin-bottom: 24px;">
          <div class="card-header" style="background: var(--bg-subtle);">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 1.6rem;">${icon}</span>
              <div>
                <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 2px;">
                  ${meal.meal_type.toUpperCase()} : ${meal.name}
                </h3>
                <span style="font-size: 0.85rem; color: var(--text-secondary);">
                  ⏰ ${meal.time} • ${meal.description || 'Nutritious balanced meal'}
                </span>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="badge-status ${statusClass}">${meal.status}</span>
            </div>
          </div>

          <div class="card-body">
            <h4 style="font-size: 0.95rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-secondary); margin-bottom: 14px;">
              Included Food Items
            </h4>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; margin-bottom: 20px;">
              ${meal.food_items.map(item => `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: var(--bg-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-light);">
                  <span class="diet-badge ${item.vegetarian ? 'veg' : 'non-veg'}"></span>
                  <span style="font-weight: 600; font-size: 0.92rem;">${item.name}</span>
                </div>
              `).join('')}
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-light); padding-top: 16px; margin-top: 10px; flex-wrap: wrap; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 0.9rem; font-weight: 600;">Student Satisfaction:</span>
                ${UI.renderStarRating(meal.average_rating || 4.5)}
                <span style="font-size: 0.82rem; color: var(--text-muted);">(${meal.total_ratings || 0} ratings)</span>
              </div>
              <a href="ratings.html?meal_id=${meal.id}&meal=${encodeURIComponent(meal.name)}&type=${meal.meal_type}" class="btn btn-primary btn-sm">
                ⭐ Rate ${meal.meal_type}
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error("Menu error:", err);
    UI.setError('today-menu-cards', err.message);
  }
}
