/**
 * MessMate Student Profile Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  await loadProfile();
  setupProfileModalForm();
});

async function loadProfile() {
  try {
    const profile = await MessAPI.getProfile();

    // Fill UI fields
    const nameEls = document.querySelectorAll('.profile-name-val');
    nameEls.forEach(el => el.textContent = profile.name);

    const idEls = document.querySelectorAll('.profile-id-val');
    idEls.forEach(el => el.textContent = profile.studentId);

    const courseEl = document.getElementById('profile-course-val');
    if (courseEl) courseEl.textContent = profile.course;

    const yearEl = document.getElementById('profile-year-val');
    if (yearEl) yearEl.textContent = profile.year;

    const hostelEl = document.getElementById('profile-hostel-val');
    if (hostelEl) hostelEl.textContent = profile.hostel;

    const roomEl = document.getElementById('profile-room-val');
    if (roomEl) roomEl.textContent = profile.room;

    const emailEl = document.getElementById('profile-email-val');
    if (emailEl) emailEl.textContent = profile.email;

    const phoneEl = document.getElementById('profile-phone-val');
    if (phoneEl) phoneEl.textContent = profile.phone;

    const dietEl = document.getElementById('profile-diet-val');
    if (dietEl) dietEl.textContent = profile.dietaryPreference || 'Vegetarian';

    const messEl = document.getElementById('profile-mess-val');
    if (messEl) messEl.textContent = profile.messId || 'North Campus Central Mess';
  } catch (err) {
    console.error("Failed to load profile:", err);
  }
}

async function openEditProfileModal() {
  try {
    const profile = await MessAPI.getProfile();

    document.getElementById('edit-student-name').value = profile.name || '';
    document.getElementById('edit-student-id').value = profile.studentId || '';
    document.getElementById('edit-course').value = profile.course || '';
    document.getElementById('edit-year').value = profile.year || '';
    document.getElementById('edit-hostel').value = profile.hostel || '';
    document.getElementById('edit-room').value = profile.room || '';
    document.getElementById('edit-email').value = profile.email || '';
    document.getElementById('edit-phone').value = profile.phone || '';
    document.getElementById('edit-diet').value = profile.dietaryPreference || 'Vegetarian';

    UI.openModal('edit-profile-modal');
  } catch (err) {
    console.error(err);
  }
}

function setupProfileModalForm() {
  const form = document.getElementById('edit-profile-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const updated = {
      name: document.getElementById('edit-student-name').value,
      studentId: document.getElementById('edit-student-id').value,
      course: document.getElementById('edit-course').value,
      year: document.getElementById('edit-year').value,
      hostel: document.getElementById('edit-hostel').value,
      room: document.getElementById('edit-room').value,
      email: document.getElementById('edit-email').value,
      phone: document.getElementById('edit-phone').value,
      dietaryPreference: document.getElementById('edit-diet').value,
      messId: "North Campus Central Mess"
    };

    try {
      await MessAPI.updateProfile(updated);
      UI.closeModal('edit-profile-modal');
      UI.toast("Profile updated successfully!", "success");
      await loadProfile();
      UI.initNav(); // refresh header names
    } catch (err) {
      UI.toast("Failed to update profile.", "error");
    }
  });
}
