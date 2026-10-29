/**
 * js/app.js
 * Main Application Orchestrator & Event Controller
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Dashboard on startup
  if (window.DashboardModule) {
    window.DashboardModule.renderDashboard();
  }

  // 2. Navigation Tab Click Listeners
  const navDashboard = document.getElementById('nav-dashboard');
  const navSchedules = document.getElementById('nav-schedules');
  const navEmployees = document.getElementById('nav-employees');
  const navLibrary = document.getElementById('nav-library');
  const viewTitle = document.getElementById('view-title');

  function setActiveTab(activeElement) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    if (activeElement) activeElement.classList.add('active');
  }

  navDashboard?.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveTab(navDashboard);
    if (viewTitle) viewTitle.textContent = 'ໜ້າພາບລວມລະບົບ (System Dashboard)';
    window.DashboardModule?.renderDashboard();
  });

  navSchedules?.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveTab(navSchedules);
    if (viewTitle) viewTitle.textContent = 'ຕາຕະລາງເວນປະຈຳການ (Schedules & Shifts)';
    window.DashboardModule?.renderDashboard();
  });

  navEmployees?.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveTab(navEmployees);
    if (viewTitle) viewTitle.textContent = 'ຈັດການພະນັກງານ Call Center (Employees)';
    const container = document.getElementById('dynamic-content');
    if (container) {
      container.innerHTML = `
        <div style="background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 24px; text-align: center; color: #64748b;">
          👥 ໂມດູນຈັດການພະນັກງານ (ກຳລັງປະຈຳການ 18 ຄົນ, ລໍຖ້າເຂົ້າເວນ 9 ຄົນ)
        </div>
      `;
    }
  });

  navLibrary?.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveTab(navLibrary);
    if (viewTitle) viewTitle.textContent = 'ຄັງເອກະສານລະບຽບການ ແລະ SOP (Library)';
    window.LibraryModule?.renderLibrary();
  });

  // 3. Language Switcher (Lao / EN)
  const langLoBtn = document.getElementById('lang-lo');
  const langEnBtn = document.getElementById('lang-en');

  langLoBtn?.addEventListener('click', () => {
    langLoBtn.classList.add('active');
    langEnBtn?.classList.remove('active');
    document.documentElement.lang = 'lo';
  });

  langEnBtn?.addEventListener('click', () => {
    langEnBtn.classList.add('active');
    langLoBtn?.classList.remove('active');
    document.documentElement.lang = 'en';
  });

  // 4. Logout Handler
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    window.AuthService?.logout();
  });
});
