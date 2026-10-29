/**
 * js/dashboard.js
 * Bank Dashboard Metrics & Operational Monitoring
 */
const DashboardModule = (() => {
  const metrics = {
    activeAgents: 18,
    activeChats: 42,
    todayResolved: 156,
    avgResponseTime: '38s',
    matchAccuracy: '95.4%'
  };

  const shiftsData = [
    { shift: 'ເວນເຊົ້າ (08:00 - 16:00)', agents: 12, supervisor: 'ທ້າວ ບຸນມີ ໄຊຍະວົງ', status: 'Active' },
    { shift: 'ເວນແລງ (16:00 - 00:00)', agents: 6, supervisor: 'ນາງ ມາລີ ຈັນທະວົງ', status: 'Scheduled' },
    { shift: 'ເວນເດິກ (00:00 - 08:00)', agents: 3, supervisor: 'ທ້າວ ສົມພອນ ວິໄລສັກ', status: 'Scheduled' }
  ];

  function renderDashboard(containerId = 'dynamic-content') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px; margin-top: 10px;">
        
        <!-- Shifts Monitoring Table -->
        <div style="background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: 700; color: #0f172a;">📅 ຕາຕະລາງເວນປະຈຳການ (Active Shifts & Roster)</h3>
            <span style="font-size: 12px; color: #64748b; font-family: 'JetBrains Mono', monospace;">Live: ມື້ນີ້</span>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
            <thead>
              <tr style="border-bottom: 1px solid #e2e8f0; text-align: left; color: #64748b; font-size: 12px;">
                <th style="padding: 10px;">ກະການເຮັດວຽກ</th>
                <th style="padding: 10px;">ຈຳນວນພະນັກງານ</th>
                <th style="padding: 10px;">ຫົວໜ້າເວນ (Supervisor)</th>
                <th style="padding: 10px;">ສະຖານະ</th>
              </tr>
            </thead>
            <tbody>
              ${shiftsData.map(s => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 10px; font-weight: 600; color: #1e293b;">${s.shift}</td>
                  <td style="padding: 12px 10px; font-family: 'JetBrains Mono', monospace;">${s.agents} ຄົນ</td>
                  <td style="padding: 12px 10px; color: #475569;">${s.supervisor}</td>
                  <td style="padding: 12px 10px;">
                    <span style="font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 9999px; background: ${s.status === 'Active' ? '#f0fdf4' : '#f1f5f9'}; color: ${s.status === 'Active' ? '#15803d' : '#64748b'};">
                      ${s.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- AI Assistant Operational Feed -->
        <div style="background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">⚡ ປະສິດທິພາບຂອງ AI Reply Assistant ມື້ນີ້</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
            <div style="background: #f8fafc; padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0;">
              <span style="font-size: 11.5px; color: #64748b;">ເວລາຕອບສະເລ່ຍ</span>
              <h4 style="font-size: 20px; font-weight: 800; color: #0284c7; margin-top: 4px;">${metrics.avgResponseTime}</h4>
            </div>
            <div style="background: #f8fafc; padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0;">
              <span style="font-size: 11.5px; color: #64748b;">ຄວາມຖືກຕ້ອງຂອງຄຳຕອບ</span>
              <h4 style="font-size: 20px; font-weight: 800; color: #15803d; margin-top: 4px;">${metrics.matchAccuracy}</h4>
            </div>
            <div style="background: #f8fafc; padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0;">
              <span style="font-size: 11.5px; color: #64748b;">ແກ້ໄຂບັນຫາສຳເລັດມື້ນີ້</span>
              <h4 style="font-size: 20px; font-weight: 800; color: #ca2851; margin-top: 4px;">${metrics.todayResolved} ເລື່ອງ</h4>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  return { renderDashboard };
})();

window.DashboardModule = DashboardModule;
