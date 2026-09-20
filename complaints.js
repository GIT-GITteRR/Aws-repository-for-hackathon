/**
 * MessMate Complaints Controller
 */

let uploadedImageDataUrl = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadMyComplaints();
  setupComplaintForm();
  setupImagePreview();
});

async function loadMyComplaints() {
  const container = document.getElementById('my-complaints-list');
  if (!container) return;

  try {
    const complaints = await MessAPI.getComplaints();

    if (!complaints.length) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
          <p style="color: var(--text-muted);">No complaints submitted yet.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = complaints.map(cmp => {
      let statusBadgeClass = 'pending';
      if (cmp.status === 'Under Review') statusBadgeClass = 'under-review';
      if (cmp.status === 'Resolved') statusBadgeClass = 'resolved';

      return `
        <div class="card complaint-item-card" style="margin-bottom: 16px;">
          <div class="card-body">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <div>
                <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">${cmp.id} • ${cmp.category}</span>
                <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-top: 2px;">${cmp.title}</h4>
              </div>
              <span class="admin-badge-pill ${statusBadgeClass}">${cmp.status}</span>
            </div>

            <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">
              ${cmp.description}
            </p>

            ${cmp.adminReply ? `
              <div style="background: var(--primary-light); border-left: 3px solid var(--primary); padding: 10px 14px; border-radius: var(--radius-sm); margin-bottom: 12px;">
                <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary-dark); margin-bottom: 2px;">👨‍💼 Admin Response:</div>
                <div style="font-size: 0.85rem; color: var(--text-primary);">${cmp.adminReply}</div>
              </div>
            ` : ''}

            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-light); padding-top: 12px; font-size: 0.8rem; color: var(--text-muted);">
              <span>Submitted on: <strong>${cmp.date}</strong></span>
              <button class="btn btn-outline btn-sm" onclick="viewComplaintDetails('${cmp.id}')">
                View Timeline & Details
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<p style="color: var(--status-danger);">Failed to load complaints.</p>`;
  }
}

function setupImagePreview() {
  const fileInput = document.getElementById('complaint-image-input');
  const previewContainer = document.getElementById('complaint-image-preview');

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          uploadedImageDataUrl = event.target.result;
          if (previewContainer) {
            previewContainer.innerHTML = `
              <div style="position: relative; display: inline-block; margin-top: 8px;">
                <img src="${uploadedImageDataUrl}" style="max-height: 100px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);" alt="Upload preview" />
                <button type="button" style="position: absolute; top: -6px; right: -6px; background: #ef4444; color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 11px;" onclick="removeComplaintImage()">×</button>
              </div>
            `;
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

function removeComplaintImage() {
  uploadedImageDataUrl = null;
  const fileInput = document.getElementById('complaint-image-input');
  if (fileInput) fileInput.value = '';
  const previewContainer = document.getElementById('complaint-image-preview');
  if (previewContainer) previewContainer.innerHTML = '';
}

function setupComplaintForm() {
  const form = document.getElementById('submit-complaint-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const category = document.getElementById('complaint-category')?.value;
    const title = document.getElementById('complaint-title')?.value;
    const description = document.getElementById('complaint-description')?.value;

    if (!category || !title || !description) {
      UI.toast("Please fill in all required fields.", "warning");
      return;
    }

    try {
      await MessAPI.submitComplaint({
        category,
        title,
        description,
        image: uploadedImageDataUrl
      });

      UI.toast("Complaint submitted successfully. The mess warden has been notified.", "success", "Complaint Registered");
      form.reset();
      removeComplaintImage();
      await loadMyComplaints();
    } catch (err) {
      UI.toast("Failed to submit complaint. Please try again.", "error");
    }
  });
}

async function viewComplaintDetails(id) {
  try {
    const complaints = await MessAPI.getComplaints();
    const cmp = complaints.find(c => c.id === id);
    if (!cmp) return;

    const modalBody = document.getElementById('complaint-detail-modal-body');
    if (modalBody) {
      modalBody.innerHTML = `
        <div style="margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-weight: 700; color: var(--text-muted); font-size: 0.85rem;">ID: ${cmp.id}</span>
            <span class="admin-badge-pill ${cmp.status.toLowerCase().replace(/\s+/g, '-')}">${cmp.status}</span>
          </div>
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 4px;">${cmp.title}</h3>
          <span style="font-size: 0.82rem; color: var(--text-secondary);">Category: <strong>${cmp.category}</strong> • Date: ${cmp.date}</span>
        </div>

        <div style="background: var(--bg-subtle); padding: 14px; border-radius: var(--radius-md); margin-bottom: 16px;">
          <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; font-weight: 700;">Issue Description</h4>
          <p style="font-size: 0.92rem; color: var(--text-primary); line-height: 1.5;">${cmp.description}</p>
        </div>

        ${cmp.adminReply ? `
          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 14px; border-radius: var(--radius-md); margin-bottom: 16px;">
            <h4 style="font-size: 0.85rem; color: #047857; font-weight: 700; margin-bottom: 4px;">Admin Resolution / Reply</h4>
            <p style="font-size: 0.9rem; color: #065f46;">${cmp.adminReply}</p>
          </div>
        ` : ''}

        <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 10px;">Status Timeline & Action History</h4>
        <div class="timeline-trail" style="border-left: 2px solid var(--border-color); padding-left: 16px; margin-left: 8px;">
          ${(cmp.statusHistory || []).map(hist => `
            <div style="position: relative; margin-bottom: 14px;">
              <span style="position: absolute; left: -21px; top: 3px; width: 10px; height: 10px; border-radius: 50%; background: var(--primary);"></span>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">${hist.status}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${hist.timestamp}</div>
              <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 2px;">${hist.note || ''}</div>
            </div>
          `).join('')}
        </div>
      `;
      UI.openModal('complaint-detail-modal');
    }
  } catch (err) {
    console.error(err);
  }
}
