/**
 * MessMate Shared UI Utilities & Navigation Helper
 */

const UI = {
  // Toast notifications
  toast(message, type = 'info', title = null) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-fade-in`;
    
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || 'ℹ'}</div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  },

  // Modal helpers
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  // Loading state helper for containers
  setLoading(containerId, text = "Loading data from MessMate server...") {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
          <div style="font-size: 1.8rem; margin-bottom: 8px;">⏳</div>
          <p style="font-size: 0.95rem; font-weight: 500;">${text}</p>
        </div>
      `;
    }
  },

  // Error state helper for containers
  setError(containerId, message = "Unable to connect to the MessMate server. Please try again.") {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 32px; background: #fee2e2; border: 1px solid #fecaca; border-radius: var(--radius-lg); color: #991b1b;">
          <div style="font-size: 1.8rem; margin-bottom: 6px;">⚠️</div>
          <p style="font-weight: 700; font-size: 0.95rem;">Connection Notice</p>
          <p style="font-size: 0.85rem; margin-top: 4px;">${message}</p>
        </div>
      `;
    }
  },

  // Setup navigation toggle and user identity
  initNav() {
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (mobileToggle && sidebar) {
      mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
      });
    }

    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', () => {
        if (sidebar) sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
      });
    }

    // Mark current active nav item based on pathname
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href === currentPath || (currentPath === '' && href === 'dashboard.html'))) {
        link.classList.add('active');
      }
    });

    // Populate user profile info in header from Flask backend
    MessAPI.getUserProfile().then(res => {
      if (res && res.success && res.data) {
        const user = res.data;
        const headerStudentNames = document.querySelectorAll('.user-profile-name');
        headerStudentNames.forEach(el => el.textContent = user.name);
        const headerStudentIds = document.querySelectorAll('.user-profile-id');
        headerStudentIds.forEach(el => el.textContent = (user.hostel || 'Hostel') + ' • ' + (user.room_number || 'Room'));
      }
    }).catch(() => {});
  },

  // Star Rating UI generator
  renderStarRating(score, max = 5) {
    let starsHtml = '';
    const rounded = Math.round(Number(score || 0) * 2) / 2;
    for (let i = 1; i <= max; i++) {
      if (i <= rounded) {
        starsHtml += '<span class="star filled">★</span>';
      } else if (i - 0.5 === rounded) {
        starsHtml += '<span class="star half">★</span>';
      } else {
        starsHtml += '<span class="star empty">☆</span>';
      }
    }
    return `<div class="star-rating-display" title="${score} / 5">${starsHtml} <span class="rating-num">${Number(score || 0).toFixed(1)}</span></div>`;
  },

  // Get current time greeting
  getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }
};

// Auto init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  UI.initNav();
  
  const greetingEl = document.getElementById('dashboard-greeting-time');
  if (greetingEl) {
    greetingEl.textContent = UI.getGreeting();
  }

  const dateEl = document.getElementById('current-date-badge');
  if (dateEl) {
    dateEl.textContent = MessAPI.getFormattedDate();
  }
});
