// Dashboard JavaScript
const API_URL = window.location.origin + '/api';

// DOM Elements
const logoutBtn = document.getElementById('logout-btn');
const logoutModal = document.getElementById('logout-modal');
const cancelLogout = document.getElementById('cancel-logout');
const confirmLogout = document.getElementById('confirm-logout');
const notification = document.getElementById('dashboard-notification');
const userNameElement = document.getElementById('user-name');
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const welcomeSubtitle = document.getElementById('welcome-subtitle');
const loginCount = document.getElementById('login-count');
const sessionTime = document.getElementById('session-time');
const memberSince = document.getElementById('member-since');
const lastUpdate = document.getElementById('last-update');
const apiStatus = document.getElementById('api-status');
const dbStatus = document.getElementById('db-status');
const envStatus = document.getElementById('env-status');
const uptime = document.getElementById('uptime');

// Buttons
const viewDataBtn = document.getElementById('view-data-btn');
const apiTestBtn = document.getElementById('api-test-btn');
const refreshBtn = document.getElementById('refresh-btn');
const editProfileBtn = document.getElementById('edit-profile-btn');
const securityBtn = document.getElementById('security-btn');

// Session tracking
let sessionStartTime = Date.now();
let loginCountValue = 1;

// Initialize dashboard
function initDashboard() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        showNotification('Please login first', 'error');
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
        return;
    }
    
    try {
        const userData = JSON.parse(user);
        updateUserInfo(userData);
        startSessionTimer();
        checkAPIStatus();
        updateSystemInfo();
        setInterval(updateSystemInfo, 30000); // Update every 30 seconds
    } catch (error) {
        console.error('Error loading user data:', error);
        showNotification('Error loading user data', 'error');
    }
}

// Update user information
function updateUserInfo(user) {
    userNameElement.textContent = user.name.toUpperCase();
    profileName.textContent = user.name.toUpperCase();
    profileEmail.textContent = user.email;
    
    // Set member since date
    const now = new Date();
    memberSince.textContent = now.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
    }).toUpperCase();
    
    // Set welcome message
    const hour = now.getHours();
    let timeOfDay = 'DAY';
    if (hour < 12) timeOfDay = 'MORNING';
    else if (hour < 18) timeOfDay = 'AFTERNOON';
    else timeOfDay = 'EVENING';
    
    welcomeSubtitle.textContent = `GOOD ${timeOfDay}, ${user.name.toUpperCase()}`;
}

// Session timer
function startSessionTimer() {
    setInterval(() => {
        const elapsed = Date.now() - sessionStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        sessionTime.textContent = `${minutes}m ${seconds}s`;
    }, 1000);
}

// Check API status
async function checkAPIStatus() {
    try {
        const response = await fetch(`${API_URL}/test`);
        if (response.ok) {
            apiStatus.textContent = 'ONLINE';
            apiStatus.className = 'sys-value status-online';
            return true;
        } else {
            apiStatus.textContent = 'OFFLINE';
            apiStatus.className = 'sys-value';
            return false;
        }
    } catch (error) {
        apiStatus.textContent = 'OFFLINE';
        apiStatus.className = 'sys-value';
        return false;
    }
}

// Update system information
function updateSystemInfo() {
    // Update uptime
    const elapsed = Date.now() - sessionStartTime;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    uptime.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update last update time
    const now = new Date();
    lastUpdate.textContent = `UPDATED: ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Update environment status
    const env = window.location.hostname.includes('localhost') ? 'DEVELOPMENT' : 'PRODUCTION';
    envStatus.textContent = env;
}

// Show notification
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Event Listeners
logoutBtn.addEventListener('click', () => {
    logoutModal.classList.add('show');
});

cancelLogout.addEventListener('click', () => {
    logoutModal.classList.remove('show');
});

confirmLogout.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showNotification('Successfully logged out', 'success');
    setTimeout(() => {
        window.location.href = '/';
    }, 1500);
});

viewDataBtn.addEventListener('click', () => {
    window.location.href = '/view-data';
});

apiTestBtn.addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_URL}/test`);
        const data = await response.json();
        showNotification(`API Test: ${data.message}`, 'success');
    } catch (error) {
        showNotification('API Test Failed', 'error');
    }
});

refreshBtn.addEventListener('click', () => {
    loginCountValue++;
    loginCount.textContent = loginCountValue;
    checkAPIStatus();
    showNotification('Dashboard refreshed', 'success');
});

editProfileBtn.addEventListener('click', () => {
    showNotification('Profile editing feature coming soon', 'success');
});

securityBtn.addEventListener('click', () => {
    showNotification('Security settings feature coming soon', 'success');
});

// Close modal on outside click
window.addEventListener('click', (event) => {
    if (event.target === logoutModal) {
        logoutModal.classList.remove('show');
    }
});

// Mobile touch optimizations
document.addEventListener('DOMContentLoaded', () => {
    // Make buttons touch-friendly
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        btn.addEventListener('touchend', function() {
            this.style.transform = '';
        });
    });
    
    // Handle viewport height on mobile
    function setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
});

// Initialize dashboard when page loads
window.addEventListener('load', initDashboard);