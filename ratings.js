/**
 * MessMate Meal Ratings Controller
 */

let currentRatingScores = {
  taste: 5,
  quality: 5,
  quantity: 5,
  hygiene: 5
};

let activeMealForRating = {
  mealName: "Standard North Indian Thali",
  mealType: "Lunch"
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadRecentMealsToRate();
  setupStarPickers();
  setupRatingModalForm();

  // Check URL query parameters for pre-selected meal
  const params = new URLSearchParams(window.location.search);
  const preMeal = params.get('meal');
  const preType = params.get('type');
  if (preMeal && preType) {
    openRateModal(preMeal, preType);
  }
});

async function loadRecentMealsToRate() {
  const container = document.getElementById('recent-meals-rating-list');
  if (!container) return;

  try {
    const ratings = await MessAPI.getRatings();

    container.innerHTML = ratings.map(item => `
      <div class="card meal-rating-card" style="margin-bottom: 20px;">
        <div class="card-body" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px;">
          <div style="flex: 1; min-width: 260px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span class="badge-status available">${item.mealType}</span>
              <span style="font-size: 0.8rem; color: var(--text-muted);">📅 ${item.date}</span>
            </div>
            <h3 style="font-size: 1.18rem; font-weight: 700; margin-bottom: 6px;">${item.mealName}</h3>
            
            <div style="display: flex; flex-wrap: wrap; gap: 14px; font-size: 0.85rem; color: var(--text-secondary); margin-top: 8px;">
              <span>Taste: <strong>${item.taste || 5}/5</strong></span>
              <span>Quality: <strong>${item.quality || 5}/5</strong></span>
              <span>Quantity: <strong>${item.quantity || 5}/5</strong></span>
              <span>Hygiene: <strong>${item.hygiene || 5}/5</strong></span>
            </div>

            ${item.feedback ? `
              <p style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 8px; background: var(--bg-subtle); padding: 8px 12px; border-radius: var(--radius-sm); border-left: 3px solid var(--primary);">
                "${item.feedback}"
              </p>
            ` : ''}
          </div>

          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 1.25rem; font-weight: 800; color: #b45309;">⭐ ${item.rating}</span>
              <span style="font-size: 0.8rem; color: var(--text-muted);">/ 5.0</span>
            </div>
            <button class="btn btn-outline btn-sm" onclick="openRateModal('${item.mealName.replace(/'/g, "\\'")}', '${item.mealType}')">
              ⭐ Rate this meal again
            </button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p style="color: var(--status-danger);">Failed to load meal ratings.</p>`;
  }
}

function openRateModal(mealName, mealType) {
  activeMealForRating = { mealName, mealType };
  
  const titleEl = document.getElementById('modal-rate-meal-title');
  if (titleEl) titleEl.textContent = `Rate ${mealName} (${mealType})`;

  // Reset star ratings to default 5
  ['taste', 'quality', 'quantity', 'hygiene'].forEach(criteria => {
    currentRatingScores[criteria] = 5;
    updateStarUI(criteria, 5);
  });

  const feedbackInput = document.getElementById('rating-feedback-text');
  if (feedbackInput) feedbackInput.value = '';

  UI.openModal('rate-meal-modal');
}

function setupStarPickers() {
  const criterias = ['taste', 'quality', 'quantity', 'hygiene'];

  criterias.forEach(criteria => {
    const starContainer = document.getElementById(`stars-${criteria}`);
    if (!starContainer) return;

    const stars = starContainer.querySelectorAll('.star-btn');
    stars.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.getAttribute('data-value'), 10);
        currentRatingScores[criteria] = val;
        updateStarUI(criteria, val);
      });
    });
  });
}

function updateStarUI(criteria, val) {
  const starContainer = document.getElementById(`stars-${criteria}`);
  if (!starContainer) return;

  const stars = starContainer.querySelectorAll('.star-btn');
  stars.forEach(btn => {
    const starVal = parseInt(btn.getAttribute('data-value'), 10);
    if (starVal <= val) {
      btn.classList.add('active');
      btn.textContent = '★';
    } else {
      btn.classList.remove('active');
      btn.textContent = '☆';
    }
  });

  const scoreDisplay = document.getElementById(`score-${criteria}`);
  if (scoreDisplay) scoreDisplay.textContent = `${val}/5`;
}

function setupRatingModalForm() {
  const form = document.getElementById('submit-rating-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Calculate average
    const avg = (
      currentRatingScores.taste +
      currentRatingScores.quality +
      currentRatingScores.quantity +
      currentRatingScores.hygiene
    ) / 4;

    const feedbackText = document.getElementById('rating-feedback-text')?.value || '';

    const payload = {
      mealName: activeMealForRating.mealName,
      mealType: activeMealForRating.mealType,
      rating: Number(avg.toFixed(1)),
      taste: currentRatingScores.taste,
      quality: currentRatingScores.quality,
      quantity: currentRatingScores.quantity,
      hygiene: currentRatingScores.hygiene,
      feedback: feedbackText
    };

    try {
      await MessAPI.submitRating(payload);
      UI.closeModal('rate-meal-modal');
      UI.toast("Thank you! Your meal rating has been submitted.", "success", "Rating Saved");
      await loadRecentMealsToRate();
    } catch (err) {
      UI.toast("Failed to submit rating. Please try again.", "error");
    }
  });
}
