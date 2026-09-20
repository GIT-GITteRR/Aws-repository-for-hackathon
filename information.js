/**
 * MessMate Mess Information & FAQ Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  await loadMessInformation();
});

async function loadMessInformation() {
  try {
    const info = await MessAPI.getInfo();

    // General Details
    const nameEl = document.getElementById('info-mess-name');
    if (nameEl) nameEl.textContent = info.name;

    const locEl = document.getElementById('info-mess-location');
    if (locEl) locEl.textContent = info.location;

    const mgrEl = document.getElementById('info-mess-manager');
    if (mgrEl) mgrEl.textContent = info.manager;

    const phoneEl = document.getElementById('info-phone');
    if (phoneEl) phoneEl.textContent = info.contact.phone;

    const emailEl = document.getElementById('info-email');
    if (emailEl) emailEl.textContent = info.contact.email;

    const wardenEl = document.getElementById('info-warden');
    if (wardenEl) wardenEl.textContent = info.contact.warden;

    const emergencyEl = document.getElementById('info-emergency');
    if (emergencyEl) emergencyEl.textContent = info.contact.emergency;

    // Timings Table
    const timingsBody = document.getElementById('info-timings-tbody');
    if (timingsBody) {
      timingsBody.innerHTML = info.timings.map(t => `
        <tr>
          <td><strong>${t.meal}</strong></td>
          <td>${t.weekday}</td>
          <td>${t.weekend}</td>
        </tr>
      `).join('');
    }

    // Rules List
    const rulesList = document.getElementById('info-rules-list');
    if (rulesList) {
      rulesList.innerHTML = info.rules.map((rule, idx) => `
        <li style="display: flex; gap: 12px; margin-bottom: 12px; font-size: 0.95rem; color: var(--text-secondary);">
          <span style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: var(--primary-light); color: var(--primary-dark); font-weight: 700; font-size: 0.8rem; flex-shrink: 0;">${idx + 1}</span>
          <span>${rule}</span>
        </li>
      `).join('');
    }

    // FAQs Accordion
    const faqsContainer = document.getElementById('info-faqs-container');
    if (faqsContainer) {
      faqsContainer.innerHTML = info.faqs.map((faq, idx) => `
        <div class="card faq-item" style="margin-bottom: 12px; cursor: pointer;" onclick="toggleFaq(${idx})">
          <div class="card-header" style="padding: 16px 20px;">
            <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-primary); display: flex; justify-content: space-between; align-items: center; width: 100%;">
              <span>❓ ${faq.q}</span>
              <span id="faq-arrow-${idx}" style="font-size: 1.2rem; transition: transform 0.2s;">▼</span>
            </h4>
          </div>
          <div id="faq-answer-${idx}" class="card-body" style="padding: 16px 20px; display: ${idx === 0 ? 'block' : 'none'}; border-top: 1px solid var(--border-light); background: var(--bg-subtle);">
            <p style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.6;">${faq.a}</p>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error("Failed to load mess info:", err);
  }
}

function toggleFaq(idx) {
  const ans = document.getElementById(`faq-answer-${idx}`);
  const arrow = document.getElementById(`faq-arrow-${idx}`);
  if (ans) {
    if (ans.style.display === 'none') {
      ans.style.display = 'block';
      if (arrow) arrow.style.transform = 'rotate(180deg)';
    } else {
      ans.style.display = 'none';
      if (arrow) arrow.style.transform = 'rotate(0deg)';
    }
  }
}
