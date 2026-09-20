/**
 * MessMate Announcements & Feed Controller
 */

let currentAnnouncementFilter = "All";

document.addEventListener('DOMContentLoaded', async () => {
  await loadAnnouncements();
  setupFilterEvents();
});

async function loadAnnouncements() {
  const container = document.getElementById('announcements-board');
  if (!container) return;

  try {
    const list = await MessAPI.getAnnouncements();

    // Filter
    const filtered = list.filter(item => {
      if (currentAnnouncementFilter === "All") return true;
      if (currentAnnouncementFilter === "Important") return item.priority === "Important";
      return item.category.toLowerCase() === currentAnnouncementFilter.toLowerCase();
    });

    if (!filtered.length) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
          <p style="color: var(--text-muted);">No announcements found for filter: "${currentAnnouncementFilter}".</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(ann => `
      <div class="card announcement-card ${ann.priority === 'Important' ? 'priority-important' : ''}" style="margin-bottom: 18px;">
        <div class="card-body">
          <div class="announcement-top">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="announcement-cat-badge ${ann.category.toLowerCase()}">${ann.category}</span>
              ${ann.priority === 'Important' ? '<span style="font-size: 0.72rem; font-weight: 700; background: #fee2e2; color: #dc2626; padding: 3px 8px; border-radius: var(--radius-full);">🔥 Urgent</span>' : ''}
            </div>
            <span class="announcement-date">📅 ${ann.date}</span>
          </div>

          <h3 class="announcement-title" style="font-size: 1.2rem; margin-top: 4px;">${ann.title}</h3>
          <p class="announcement-desc" style="font-size: 0.95rem; margin-top: 8px;">${ann.description}</p>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; pt: 12px; border-top: 1px solid var(--border-light); font-size: 0.8rem; color: var(--text-muted);">
            <span>Posted by: <strong>${ann.author || 'Mess Office'}</strong></span>
            <span>ID: ${ann.id}</span>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p style="color: var(--status-danger);">Failed to load announcements.</p>`;
  }
}

function setupFilterEvents() {
  const filterBtns = document.querySelectorAll('.announcement-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentAnnouncementFilter = btn.getAttribute('data-filter');
      loadAnnouncements();
    });
  });
}
