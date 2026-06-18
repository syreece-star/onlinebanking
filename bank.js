// ===== AUTH UTILITIES =====
const AUTH_KEY = 'vb_auth_session';
const USERS_KEY = 'vb_users';
const TRANSACTIONS_KEY = 'vb_transactions';

// Get all users from localStorage
function getUsers() {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : {};
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Get current session
function getSession() {
    const session = localStorage.getItem(AUTH_KEY);
    return session ? JSON.parse(session) : null;
}

// Set session
function setSession(user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify({
        email: user.email,
        fullName: user.fullName,
        loggedInAt: new Date().toISOString()
    }));
}

// Clear session (logout)
function clearSession() {
    localStorage.removeItem(AUTH_KEY);
}

// Check if user is logged in
function isLoggedIn() {
    return getSession() !== null;
}

// Redirect if not logged in (for protected pages)
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return null;
    }
    return getSession();
}

// Get current user's full data
function getCurrentUser() {
    const session = getSession();
    if (!session) return null;
    const users = getUsers();
    return users[session.email] || null;
}

// Show toast notification
function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Format currency
function formatCurrency(amount) {
    return '$' + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get transactions for current user
function getUserTransactions() {
    const session = getSession();
    if (!session) return [];
    const allTransactions = localStorage.getItem(TRANSACTIONS_KEY);
    const transactions = allTransactions ? JSON.parse(allTransactions) : {};
    return transactions[session.email] || [];
}

// Add transaction for current user
function addTransaction(transaction) {
    const session = getSession();
    if (!session) return;
    const allTransactions = localStorage.getItem(TRANSACTIONS_KEY);
    const transactions = allTransactions ? JSON.parse(allTransactions) : {};
    if (!transactions[session.email]) {
        transactions[session.email] = [];
    }
    transactions[session.email].unshift({
        ...transaction,
        id: 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        date: new Date().toISOString()
    });
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

// Update user balance
function updateBalance(amount, type = 'debit') {
    const session = getSession();
    if (!session) return false;
    const users = getUsers();
    const user = users[session.email];
    if (!user) return false;
    
    const numAmount = parseFloat(amount);
    if (type === 'debit') {
        if (user.balance < numAmount) return false;
        user.balance -= numAmount;
    } else {
        user.balance += numAmount;
    }
    saveUsers(users);
    return true;
}

// Logout function
function logout() {
    clearSession();
    window.location.href = 'index.html';
}