/**
 * MessMate Frontend API Connector
 * 
 * Reusable HTTP Client for Flask Backend at http://localhost:5000/api
 * Handles centralized GET, POST, PUT, DELETE requests with clean error handling,
 * user session management, and helpful network alerts.
 */

const API_BASE_URL = 'http://localhost:5000/api';

class MessAPI {
  // Current active logged in student ID (default to Aarav Sharma = 2 if not in sessionStorage)
  static getActiveUserId() {
    const stored = sessionStorage.getItem('messmate_active_user_id');
    return stored ? parseInt(stored, 10) : 2;
  }

  static setActiveUserId(id) {
    sessionStorage.setItem('messmate_active_user_id', id);
  }

  // Centralized HTTP Request Handler
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...(options.headers || {})
        }
      });

      const json = await response.json().catch(() => ({
        success: false,
        message: `Invalid server response (${response.status})`
      }));

      if (!response.ok) {
        throw new Error(json.message || `Request failed with status ${response.status}`);
      }
      return json;
    } catch (err) {
      console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, err.message);
      // Re-throw with user-friendly message for UI consumption
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error("Unable to connect to the MessMate server. Please ensure the Flask backend is running on port 5000.");
      }
      throw err;
    }
  }

  // ==========================================
  // 1. AUTHENTICATION API
  // ==========================================
  static async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  static async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  // ==========================================
  // 2. USER PROFILE API
  // ==========================================
  static async getUserProfile(userId = null) {
    const uid = userId || this.getActiveUserId();
    return this.request(`/users/${uid}`);
  }

  static async updateUserProfile(profileData, userId = null) {
    const uid = userId || this.getActiveUserId();
    return this.request(`/users/${uid}`, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // ==========================================
  // 3. DASHBOARD APIS
  // ==========================================
  static async getStudentDashboard(userId = null) {
    const uid = userId || this.getActiveUserId();
    return this.request(`/dashboard/student/${uid}`);
  }

  static async getAdminDashboard() {
    return this.request('/dashboard/admin');
  }

  // ==========================================
  // 4. MENU APIS
  // ==========================================
  static async getTodayMenu() {
    return this.request('/menu/today');
  }

  static async getWeeklyMenu() {
    return this.request('/menu/weekly');
  }

  static async getMealsByDate(dateStr) {
    return this.request(`/menu/date/${dateStr}`);
  }

  static async createMeal(mealData) {
    return this.request('/menu', {
      method: 'POST',
      body: JSON.stringify(mealData)
    });
  }

  static async updateMeal(mealId, mealData) {
    return this.request(`/menu/${mealId}`, {
      method: 'PUT',
      body: JSON.stringify(mealData)
    });
  }

  static async deleteMeal(mealId) {
    return this.request(`/menu/${mealId}`, {
      method: 'DELETE'
    });
  }

  // ==========================================
  // 5. RATINGS APIS
  // ==========================================
  static async submitRating(ratingPayload) {
    // ratingPayload: { user_id, meal_id, taste, quality, quantity, hygiene, comment }
    return this.request('/ratings', {
      method: 'POST',
      body: JSON.stringify(ratingPayload)
    });
  }

  static async getAllRatings() {
    return this.request('/ratings');
  }

  static async getMealRatings(mealId) {
    return this.request(`/ratings/meal/${mealId}`);
  }

  static async getMealAverage(mealId) {
    return this.request(`/ratings/average/${mealId}`);
  }

  // ==========================================
  // 6. COMPLAINTS APIS
  // ==========================================
  static async submitComplaint(complaintPayload) {
    // complaintPayload: { user_id, category, title, description, image_url }
    return this.request('/complaints', {
      method: 'POST',
      body: JSON.stringify(complaintPayload)
    });
  }

  static async getAllComplaints() {
    return this.request('/complaints');
  }

  static async getUserComplaints(userId = null) {
    const uid = userId || this.getActiveUserId();
    return this.request(`/complaints/user/${uid}`);
  }

  static async getSingleComplaint(complaintId) {
    return this.request(`/complaints/${complaintId}`);
  }

  static async updateComplaint(complaintId, updateData) {
    // updateData: { status, admin_response }
    return this.request(`/complaints/${complaintId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  // ==========================================
  // 7. ANNOUNCEMENTS APIS
  // ==========================================
  static async getAnnouncements() {
    return this.request('/announcements');
  }

  static async createAnnouncement(announcementData) {
    // announcementData: { title, description, category, priority }
    return this.request('/announcements', {
      method: 'POST',
      body: JSON.stringify(announcementData)
    });
  }

  static async updateAnnouncement(announcementId, updateData) {
    return this.request(`/announcements/${announcementId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  static async deleteAnnouncement(announcementId) {
    return this.request(`/announcements/${announcementId}`, {
      method: 'DELETE'
    });
  }

  // Helpers
  static getFormattedDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  }

  static getCurrentDayName() {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[new Date().getDay()];
  }
}
