// Setup Authentication Forms
function setupAuthForms() {
    // Tab switching
    document.getElementById('login-tab').addEventListener('click', () => {
        switchAuthTab('login');
    });
    
    document.getElementById('signup-tab').addEventListener('click', () => {
        switchAuthTab('signup');
    });
    
    document.getElementById('show-signup').addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthTab('signup');
    });
    
    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthTab('login');
    });
    
    document.getElementById('forgot-password').addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthTab('forgot-password');
    });
    
    document.getElementById('back-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthTab('login');
    });
    
    // Form submissions
    document.getElementById('login-form-element').addEventListener('submit', loginUser);
    document.getElementById('signup-form-element').addEventListener('submit', signupUser);
    document.getElementById('forgot-password-form-element').addEventListener('submit', resetPassword);
    
    // Google login
    document.getElementById('google-login').addEventListener('click', googleLogin);
}

// Switch between auth tabs
function switchAuthTab(tab) {
    // Update tabs
    document.getElementById('login-tab').classList.toggle('active', tab === 'login');
    document.getElementById('signup-tab').classList.toggle('active', tab === 'signup');
    
    // Show/hide forms
    document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
    document.getElementById('signup-form').classList.toggle('hidden', tab !== 'signup');
    document.getElementById('forgot-password-form').classList.toggle('hidden', tab !== 'forgot-password');
}

// Login User
function loginUser(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const form = e.target;
    
    // Clear previous errors
    clearAuthErrors(form);
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Success - redirect or do something
            const redirect = localStorage.getItem('redirectAfterAuth');
            if (redirect) {
                localStorage.removeItem('redirectAfterAuth');
                window.location.href = redirect + '.html';
            } else {
                window.location.href = 'index.html';
            }
        })
        .catch((error) => {
            showAuthError(form, error.message);
        });
}

// Sign Up User
function signupUser(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const form = e.target;
    
    // Clear previous errors
    clearAuthErrors(form);
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showAuthError(form, 'Passwords do not match');
        return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Update user profile with name
            return userCredential.user.updateProfile({
                displayName: name
            });
        })
        .then(() => {
            // Create user document in Firestore
            return db.collection('users').doc(auth.currentUser.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                role: 'customer'
            });
        })
        .then(() => {
            // Success - redirect or do something
            const redirect = localStorage.getItem('redirectAfterAuth');
            if (redirect) {
                localStorage.removeItem('redirectAfterAuth');
                window.location.href = redirect + '.html';
            } else {
                window.location.href = 'index.html';
            }
        })
        .catch((error) => {
            showAuthError(form, error.message);
        });
}

// Reset Password
function resetPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('reset-email').value;
    const form = e.target;
    
    // Clear previous errors
    clearAuthErrors(form);
    
    auth.sendPasswordResetEmail(email)
        .then(() => {
            showAuthSuccess(form, 'Password reset email sent. Please check your inbox.');
        })
        .catch((error) => {
            showAuthError(form, error.message);
        });
}

// Google Login
function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    auth.signInWithPopup(provider)
        .then((result) => {
            // Check if user is new
            if (result.additionalUserInfo.isNewUser) {
                // Create user document in Firestore
                return db.collection('users').doc(result.user.uid).set({
                    name: result.user.displayName,
                    email: result.user.email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    role: 'customer'
                });
            }
        })
        .then(() => {
            // Success - redirect or do something
            const redirect = localStorage.getItem('redirectAfterAuth');
            if (redirect) {
                localStorage.removeItem('redirectAfterAuth');
                window.location.href = redirect + '.html';
            } else {
                window.location.href = 'index.html';
            }
        })
        .catch((error) => {
            console.error('Google login error:', error);
            alert(error.message);
        });
}

// Show error message in auth form
function showAuthError(form, message) {
    // Remove any existing error messages
    clearAuthErrors(form);
    
    const errorElement = document.createElement('p');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    form.appendChild(errorElement);
}

// Show success message in auth form
function showAuthSuccess(form, message) {
    // Remove any existing messages
    clearAuthErrors(form);
    
    const successElement = document.createElement('p');
    successElement.className = 'success-message';
    successElement.textContent = message;
    
    form.appendChild(successElement);
}

// Clear error/success messages from auth form
function clearAuthErrors(form) {
    const messages = form.querySelectorAll('.error-message, .success-message');
    messages.forEach(msg => msg.remove());
}