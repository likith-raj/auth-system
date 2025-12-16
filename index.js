// Base URL for API - FIXED: Works both locally and on live server
const API_URL = window.location.origin + '/api';

// DOM Elements
const loginToggle = document.getElementById('login-toggle');
const registerToggle = document.getElementById('register-toggle');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const newRegisterLink = document.getElementById('new-register-link');
const existingLoginLink = document.getElementById('existing-login-link');

// Registration elements
const registerName = document.getElementById('register-name');
const registerEmail = document.getElementById('register-email');
const registerPassword = document.getElementById('register-password');
const registerConfirm = document.getElementById('register-confirm');
const registerBtn = document.getElementById('register-btn');
const loginBtn = document.getElementById('login-btn');

// Password strength elements
const passwordStrength = document.getElementById('password-strength');
const strengthBar = document.getElementById('strength-bar');
const strengthText = document.getElementById('strength-text');
const passwordRequirements = document.getElementById('password-requirements');

// Form toggling
loginToggle.addEventListener('click', () => {
    loginToggle.classList.add('active');
    registerToggle.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    clearAllErrors();
});

registerToggle.addEventListener('click', () => {
    registerToggle.classList.add('active');
    loginToggle.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    clearAllErrors();
});

newRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerToggle.click();
});

existingLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginToggle.click();
});

// Clear all error messages
function clearAllErrors() {
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(error => error.style.display = 'none');
    
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => input.style.borderColor = '#333');
}

// Show error for specific field
function showError(field, message) {
    // Map field names to actual error element IDs in HTML
    const errorIdMap = {
        'register-name': 'name-error',
        'register-email': 'email-error', 
        'register-password': 'password-error',
        'register-confirm': 'confirm-error',
        'login-email': 'login-error',
        'login-password': 'login-password-error'
    };
    
    const errorId = errorIdMap[field] || field;
    const errorElement = document.getElementById(errorId);
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// Hide error for specific field
function hideError(field) {
    const errorElement = document.getElementById(field + '-error');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

// Validate name
function validateName() {
    const name = registerName.value.trim();
    const nameRegex = /^[A-Za-z\s]{3,30}$/;
    
    if (!name) {
        showError('register-name', 'Name is required');
        return false;
    }
    
    if (!nameRegex.test(name)) {
        showError('register-name', 'Name must be 3-30 letters only');
        return false;
    }
    
    hideError('register-name');
    return true;
}

// Validate email
function validateEmail() {
    const email = registerEmail.value.trim();
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    
    if (!email) {
        showError('register-email', 'Email is required');
        return false;
    }
    
    if (!emailRegex.test(email)) {
        showError('register-email', 'Enter a valid email address');
        return false;
    }
    
    hideError('register-email');
    return true;
}

// Check password requirements
function checkPasswordRequirements(password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    
    const reqIds = ['length', 'uppercase', 'lowercase', 'number', 'special'];
    reqIds.forEach(reqId => {
        const element = document.getElementById('req-' + reqId);
        if (element) {
            element.classList.toggle('valid', requirements[reqId]);
        }
    });
    
    return requirements;
}

// Calculate password strength
function calculatePasswordStrength(password) {
    let strength = 0;
    const requirements = checkPasswordRequirements(password);
    
    Object.values(requirements).forEach(req => {
        if (req) strength++;
    });
    
    if (password.length === 0) {
        strengthBar.className = 'strength-bar';
        strengthBar.style.width = '0%';
        strengthText.textContent = '';
        passwordStrength.style.display = 'none';
        strengthText.style.display = 'none';
        passwordRequirements.style.display = 'none';
        return 0;
    }
    
    passwordStrength.style.display = 'block';
    passwordRequirements.style.display = 'block';
    strengthText.style.display = 'block';
    
    if (strength <= 2) {
        strengthBar.className = 'strength-bar strength-weak';
        strengthText.textContent = 'WEAK';
        strengthText.style.color = '#ff4444';
        return 1;
    } else if (strength <= 4) {
        strengthBar.className = 'strength-bar strength-medium';
        strengthText.textContent = 'MEDIUM';
        strengthText.style.color = '#ffaa00';
        return 2;
    } else {
        strengthBar.className = 'strength-bar strength-strong';
        strengthText.textContent = 'STRONG';
        strengthText.style.color = '#00cc44';
        return 3;
    }
}

// Validate password
function validatePassword() {
    const password = registerPassword.value;
    const strength = calculatePasswordStrength(password);
    
    if (!password) {
        showError('register-password', 'Password is required');
        return false;
    }
    
    if (password.length < 8) {
        showError('register-password', 'Password must be at least 8 characters');
        return false;
    }
    
    if (strength < 2) {
        showError('register-password', 'Password is too weak. Please make it stronger');
        return false;
    }
    
    hideError('register-password');
    return true;
}

// Validate password confirmation
function validateConfirmPassword() {
    const password = registerPassword.value;
    const confirm = registerConfirm.value;
    
    if (!confirm) {
        showError('register-confirm', 'Please confirm your password');
        return false;
    }
    
    if (password !== confirm) {
        showError('register-confirm', 'Passwords do not match');
        return false;
    }
    
    hideError('register-confirm');
    return true;
}

// Validate login form
function validateLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    let isValid = true;
    
    if (!email) {
        showError('login-email', 'Email is required');
        isValid = false;
    } else {
        hideError('login-email');
    }
    
    if (!password) {
        showError('login-password', 'Password is required');
        isValid = false;
    } else {
        hideError('login-password');
    }
    
    return isValid;
}

// Update register button state
function updateRegisterButton() {
    const nameValid = validateName();
    const emailValid = validateEmail();
    const passwordValid = validatePassword();
    const confirmValid = validateConfirmPassword();
    
    if (nameValid && emailValid && passwordValid && confirmValid) {
        registerBtn.disabled = false;
    } else {
        registerBtn.disabled = true;
    }
}

// Event listeners for registration form
registerName.addEventListener('input', updateRegisterButton);
registerEmail.addEventListener('input', updateRegisterButton);
registerPassword.addEventListener('input', function() {
    calculatePasswordStrength(this.value);
    updateRegisterButton();
});
registerConfirm.addEventListener('input', updateRegisterButton);

// API call helper
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Something went wrong');
        }
        
        return result;
    } catch (error) {
        throw error;
    }
}

// Show success message (better notification system)
function showSuccess(message) {
    // Create notification if it doesn't exist
    let notification = document.getElementById('success-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'success-notification';
        notification.className = 'notification success';
        document.body.appendChild(notification);
    }
    
    notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Show error message
function showAlert(message) {
    // Create notification if it doesn't exist
    let notification = document.getElementById('error-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'error-notification';
        notification.className = 'notification error';
        document.body.appendChild(notification);
    }
    
    notification.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Form submission handling
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (validateLogin()) {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            // Show loading state
            const btnText = loginBtn.querySelector('.btn-text');
            const originalText = btnText.textContent;
            btnText.textContent = 'LOGGING IN...';
            loginBtn.classList.add('loading');
            
            const result = await apiCall('/login', 'POST', { email, password });
            
            // Save token to localStorage
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            
            showSuccess(`Welcome back, ${result.user.name}!`);
            
            // Clear form
            document.getElementById('login-form').reset();
            clearAllErrors();
            
            // Redirect to dashboard after 1 second (FIXED PATH)
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1000);
            
        } catch (error) {
            showError('login-email', error.message);
            showError('login-password', error.message);
            showAlert(error.message);
        } finally {
            // Reset button state
            const btnText = loginBtn.querySelector('.btn-text');
            btnText.textContent = 'LOGIN';
            loginBtn.classList.remove('loading');
        }
    }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!registerBtn.disabled) {
        const name = registerName.value.trim();
        const email = registerEmail.value.trim();
        const password = registerPassword.value;
        
        try {
            // Show loading state
            const btnText = registerBtn.querySelector('.btn-text');
            const originalText = btnText.textContent;
            btnText.textContent = 'CREATING ACCOUNT...';
            registerBtn.classList.add('loading');
            
            const result = await apiCall('/register', 'POST', { name, email, password });
            
            showSuccess(`Account created successfully! Welcome, ${name}!`);
            
            // Auto switch to login after successful registration
            setTimeout(() => {
                loginToggle.click();
                
                // Clear form
                document.getElementById('register-form').reset();
                clearAllErrors();
                passwordStrength.style.display = 'none';
                strengthText.style.display = 'none';
                passwordRequirements.style.display = 'none';
                
                registerBtn.disabled = true;
                const btnText = registerBtn.querySelector('.btn-text');
                btnText.textContent = 'CREATE ACCOUNT';
                registerBtn.classList.remove('loading');
            }, 1500);
            
        } catch (error) {
            showError('register-email', error.message);
            showAlert(error.message);
            registerBtn.disabled = false;
            const btnText = registerBtn.querySelector('.btn-text');
            btnText.textContent = 'CREATE ACCOUNT';
            registerBtn.classList.remove('loading');
        }
    }
});

// Password visibility toggle
function setupPasswordToggles() {
    const toggles = [
        ['login-password', 'toggle-login-password'],
        ['register-password', 'toggle-register-password'],
        ['register-confirm', 'toggle-register-confirm']
    ];
    
    toggles.forEach(([inputId, toggleId]) => {
        const toggle = document.getElementById(toggleId);
        const input = document.getElementById(inputId);
        
        if (toggle && input) {
            toggle.addEventListener('click', () => {
                const type = input.type === 'password' ? 'text' : 'password';
                input.type = type;
                const icon = toggle.querySelector('i');
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            });
        }
    });
}

// Initialize password toggles on page load
document.addEventListener('DOMContentLoaded', setupPasswordToggles);

// Initialize form validation
updateRegisterButton();

// Test backend connection on page load
window.addEventListener('load', async () => {
    try {
        const result = await apiCall('/test');
        console.log('✅ Backend connection successful:', result.message);
    } catch (error) {
        console.log('❌ Backend not connected. Make sure server is running.');
    }
});

// ==================== MOBILE TOUCH OPTIMIZATIONS ====================
// Mobile touch improvements
document.addEventListener('DOMContentLoaded', function() {
    // Make buttons more touch-friendly
    document.querySelectorAll('button, .submit-btn, .toggle-btn').forEach(btn => {
        btn.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
            this.style.transition = 'transform 0.1s';
        });
        
        btn.addEventListener('touchend', function() {
            this.style.transform = '';
        });
    });
    
    // Prevent zoom on input focus in iOS
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('touchstart', function(e) {
            if (window.innerWidth <= 768) {
                this.style.fontSize = '16px'; // Prevents iOS zoom
            }
        });
        
        input.addEventListener('blur', function() {
            this.style.fontSize = '';
        });
        
        // Better focus for mobile
        input.addEventListener('focus', function() {
            if (window.innerWidth <= 768) {
                this.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });
    
    // Handle viewport height changes on mobile
    function setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
});