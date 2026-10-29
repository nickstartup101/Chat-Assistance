/**
 * js/auth.js
 * Bank Authentication & Role-Based Access Control (RBAC) Module
 */
const AuthService = (() => {
  const STORAGE_KEY = 'bank_cs_session';

  // ຜູ້ໃຊ້ງານຈຳລອງມາດຕະຖານທະນາຄານ
  const DEFAULT_USER = {
    id: 'emp_00892',
    name: 'ສົມສັກ ພອນສະຫວັນ',
    role: 'admin', // 'admin' | 'supervisor' | 'agent'
    roleTitle: 'Senior CS Lead / Compliance',
    avatar: 'ສພ',
    branch: 'Head Office - Vientiane',
    permissions: ['kb:read', 'kb:write', 'kb:approve', 'kb:publish', 'cs:chat']
  };

  let currentUser = null;

  function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        currentUser = JSON.parse(saved);
      } catch {
        currentUser = DEFAULT_USER;
      }
    } else {
      currentUser = DEFAULT_USER;
      saveSession(currentUser);
    }
    updateUI();
  }

  function saveSession(user) {
    currentUser = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  function getUser() {
    return currentUser || DEFAULT_USER;
  }

  function hasPermission(permission) {
    if (!currentUser || !currentUser.permissions) return false;
    return currentUser.permissions.includes(permission);
  }

  function isAdmin() {
    return currentUser?.role === 'admin';
  }

  function updateUI() {
    const user = getUser();
    const nameEl = document.getElementById('user-display-name');
    const roleEl = document.getElementById('user-role');
    const avatarEl = document.getElementById('user-avatar');

    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.roleTitle;
    if (avatarEl) avatarEl.textContent = user.avatar;
  }

  function logout() {
    if (confirm('ທ່ານຕ້ອງການອອກຈາກລະບົບແທ້ບໍ່?')) {
      localStorage.removeItem(STORAGE_KEY);
      alert('ອອກຈາກລະບົບສຳເລັດແລ້ວ');
      location.reload();
    }
  }

  return {
    init,
    getUser,
    hasPermission,
    isAdmin,
    logout
  };
})();

window.AuthService = AuthService;
document.addEventListener('DOMContentLoaded', AuthService.init);
