// ====================================================
// VAULTBANK – CORE LOGIC (all using account number)
// ====================================================

const USERS_KEY = 'vb_users';
const TRANSACTIONS_KEY = 'vb_transactions';
const SESSION_KEY = 'vb_session';

// ---------- Users ----------
function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
}
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ---------- Session (stores account number) ----------
function getSession() {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
}
function setSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
        accountNumber: user.accountNumber,
        fullName: user.fullName,
        email: user.email
    }));
}
function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}
function isLoggedIn() {
    return getSession() !== null;
}
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return null;
    }
    return getSession();
}

// ---------- Current user ----------
function getCurrentUser() {
    const session = getSession();
    if (!session) return null;
    const users = getUsers();
    return users[session.accountNumber] || null;
}

// ---------- Transactions ----------
function getUserTransactions() {
    const session = getSession();
    if (!session) return [];
    const all = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '{}');
    return all[session.accountNumber] || [];
}

function addTransaction(txn) {
    const session = getSession();
    if (!session) return;
    const all = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '{}');
    const key = session.accountNumber;
    if (!all[key]) all[key] = [];
    all[key].unshift({
        ...txn,
        id: 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        date: new Date().toISOString()
    });
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(all));
}

function updateBalance(amount, type = 'debit') {
    const session = getSession();
    if (!session) return false;
    const users = getUsers();
    const user = users[session.accountNumber];
    if (!user) return false;
    const num = parseFloat(amount);
    if (type === 'debit') {
        if (user.balance < num) return false;
        user.balance -= num;
    } else {
        user.balance += num;
    }
    saveUsers(users);
    return true;
}

// ---------- Helpers ----------
function formatCurrency(amount) {
    // Changed to Nigerian Naira (₦)
    return '₦' + Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function showToast(msg, type = 'info') {
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const div = document.createElement('div');
    div.className = `toast toast-${type}`;
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => { div.style.opacity = '0'; setTimeout(() => div.remove(), 300); }, 3000);
}
function logout() {
    clearSession();
    window.location.href = 'index.html';
}