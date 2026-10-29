/**
 * js/library.js
 * Bank SOP Manuals & Policy Documents Registry
 */
const LibraryModule = (() => {
  const documents = [
    {
      code: 'SOP-RET-4.2',
      title: 'ຄູ່ມືການບໍລິການລາຍຍ່ອຍ: ການຂໍ Statement ແລະ ໃບຢັ້ງຢືນການເງິນ',
      category: 'Retail Banking',
      version: 'v2.4',
      effectiveDate: '2026-01-01',
      fileType: 'PDF'
    },
    {
      code: 'SOP-FRAUD-9.1',
      title: 'ຂັ້ນຕອນການຮັບມືເຫດສຸກເສີນ: ການອາຍັດບັນຊີ ແລະ ໂອນເງິນຜິດ',
      category: 'Security & Fraud',
      version: 'v3.0',
      effectiveDate: '2026-02-15',
      fileType: 'PDF'
    },
    {
      code: 'SOP-DIGI-1.8',
      title: 'ລະບຽບການຈັດການລະຫັດຜ່ານ PIN ແລະ Biometric ໃນ Mobile App',
      category: 'Digital Banking',
      version: 'v1.8',
      effectiveDate: '2025-11-20',
      fileType: 'PDF'
    }
  ];

  function getDocuments() {
    return documents;
  }

  function renderLibrary(containerId = 'dynamic-content') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div style="background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: #0f172a;">📚 ຄັງເອກະສານ SOP & ລະບຽບການທະນາຄານ</h3>
            <p style="font-size: 12.5px; color: #64748b; margin-top: 2px;">ເອກະສານອ້າງອີງທີ່ຖືກຕ້ອງຕາມມາດຕະຖານທະນາຄານແຫ່ງ ສປປ ລາວ</p>
          </div>
          <button style="background: #ca2851; color: white; border: none; padding: 8px 14px; border-radius: 8px; font-size: 12.5px; font-weight: 600; cursor: pointer;">
            + ເພີ່ມ SOP ໃໝ່
          </button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${documents.map(d => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #0284c7; background: #e0f2fe; padding: 2px 6px; border-radius: 4px;">${d.code}</span>
                  <span style="font-size: 13.5px; font-weight: 600; color: #0f172a;">${d.title}</span>
                </div>
                <div style="font-size: 11.5px; color: #64748b; margin-top: 4px;">ໝວດໝູ່: ${d.category} • ເວີຊັນ: ${d.version} • ວັນທີບັງຄັບໃຊ້: ${d.effectiveDate}</div>
              </div>
              <button style="background: white; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 500;">
                ເປີດອ່ານ 📄
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  return { getDocuments, renderLibrary };
})();

window.LibraryModule = LibraryModule;
