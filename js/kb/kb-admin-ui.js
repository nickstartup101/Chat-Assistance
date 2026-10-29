// js/kb/kb-admin-ui.js
import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp 
} from './firebase-config.js';

let allFaqs = [];
let currentEditingId = null;

const faqListEl = document.getElementById('faq-list');
const searchInput = document.getElementById('search-input');
const filterCategory = document.getElementById('filter-category');
const filterStatus = document.getElementById('filter-status');

const metricTotal = document.getElementById('metric-total');
const metricPublished = document.getElementById('metric-published');
const metricPending = document.getElementById('metric-pending');
const metricHighRisk = document.getElementById('metric-high-risk');
const countDisplay = document.getElementById('count-display');

// Simulator Elements
const simIntent = document.getElementById('sim-intent');
const simRiskBadge = document.getElementById('sim-risk-badge');
const simAnswer = document.getElementById('sim-answer');
const simSop = document.getElementById('sim-sop');

// Form Elements
const editorForm = document.getElementById('editor-form');
const formDocId = document.getElementById('form-doc-id');
const formIntent = document.getElementById('form-intent');
const formCategory = document.getElementById('form-category');
const formRisk = document.getElementById('form-risk');
const formCanonicalLo = document.getElementById('form-canonical-lo');
const formCanonicalEn = document.getElementById('form-canonical-en');
const formExamples = document.getElementById('form-examples');
const formAnswerLo = document.getElementById('form-answer-lo');
const formSource = document.getElementById('form-source');

// 1. Initialize Real-time Listener from Firestore
function initRealtimeSync() {
  const colRef = collection(db, 'faqs');
  onSnapshot(colRef, (snapshot) => {
    allFaqs = [];
    snapshot.forEach(docSnap => {
      allFaqs.push({ id: docSnap.id, ...docSnap.data() });
    });
    updateMetrics();
    renderFaqList();
  }, (err) => {
    console.error("Firestore Listen Error:", err);
    faqListEl.innerHTML = `<div class="p-4 text-xs text-rose-600 bg-rose-50 rounded-xl">⚠️ ບໍ່ສາມາດເຊື່ອມຕໍ່ Firebase: ${err.message}</div>`;
  });
}

// 2. Metrics Calculation
function updateMetrics() {
  metricTotal.innerText = allFaqs.length;
  metricPublished.innerText = allFaqs.filter(f => f.approval_status === 'published').length;
  metricPending.innerText = allFaqs.filter(f => f.approval_status === 'pending_review').length;
  metricHighRisk.innerText = allFaqs.filter(f => f.risk_level === 'high').length;
}

// 3. Render FAQ Cards
function renderFaqList() {
  const query = (searchInput.value || '').toLowerCase().trim();
  const cat = filterCategory.value;
  const stat = filterStatus.value;

  const filtered = allFaqs.filter(f => {
    if (cat !== 'all' && f.category !== cat) return false;
    if (stat !== 'all' && f.approval_status !== stat) return false;
    if (query) {
      const matchLo = (f.canonical_question?.lo || '').toLowerCase().includes(query);
      const matchEn = (f.canonical_question?.en || '').toLowerCase().includes(query);
      const matchIntent = (f.intent_id || '').toLowerCase().includes(query);
      if (!matchLo && !matchEn && !matchIntent) return false;
    }
    return true;
  });

  countDisplay.innerText = `${filtered.length} ລາຍການ`;

  if (filtered.length === 0) {
    faqListEl.innerHTML = `<div class="text-center py-12 text-slate-400 text-xs">ບໍ່ພົບ FAQ ທີ່ກົງກັບເງື່ອນໄຂ</div>`;
    return;
  }

  faqListEl.innerHTML = filtered.map(faq => {
    const isSelected = currentEditingId === faq.id;
    const borderClass = isSelected ? 'border-2 border-rose-500 bg-rose-50/20' : 'border border-slate-200 bg-white hover:border-rose-300';
    
    // Risk Badge Color Token
    let riskBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">LOW RISK</span>`;
    if (faq.risk_level === 'medium') riskBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">MEDIUM RISK</span>`;
    if (faq.risk_level === 'high') riskBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">HIGH RISK</span>`;

    // Status Badge
    let statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold font-code bg-slate-100 text-slate-600">${faq.approval_status}</span>`;
    if (faq.approval_status === 'published') {
      statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold font-code bg-emerald-50 text-emerald-700 border border-emerald-200">PUBLISHED</span>`;
    } else if (faq.approval_status === 'pending_review') {
      statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold font-code bg-amber-50 text-amber-700 border border-amber-200">PENDING</span>`;
    }

    return `
      <div class="relative clean-card rounded-2xl p-4 transition-all cursor-pointer ${borderClass}" onclick="window.selectFaq('${faq.id}')">
        <div class="flex flex-col gap-2.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="font-code text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">${faq.intent_id || 'FAQ'}</span>
              <span class="text-[11px] text-slate-600 font-medium">${faq.category || ''}</span>
            </div>
            <div class="flex items-center gap-2">
              ${statusBadge}
              ${riskBadge}
            </div>
          </div>

          <h4 class="text-sm font-bold text-slate-900 leading-snug">${faq.canonical_question?.lo || ''}</h4>
          <p class="text-xs text-slate-500 font-normal line-clamp-2">${faq.answer_lo || ''}</p>

          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>SOP: ${faq.source_reference || 'N/A'}</span>
            <span class="text-rose-600 font-semibold">ກົດເພື່ອແກ້ໄຂ / Simulator ➔</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// 4. Select FAQ to Populate Form & Simulator
window.selectFaq = function(id) {
  const faq = allFaqs.find(f => f.id === id);
  if (!faq) return;

  currentEditingId = id;
  formDocId.value = faq.id;
  formIntent.value = faq.intent_id || '';
  formCategory.value = faq.category || 'Account Services';
  formRisk.value = faq.risk_level || 'low';
  formCanonicalLo.value = faq.canonical_question?.lo || '';
  formCanonicalEn.value = faq.canonical_question?.en || '';
  formExamples.value = (faq.example_questions || []).map(e => e.text).join(', ');
  formAnswerLo.value = faq.answer_lo || '';
  formSource.value = faq.source_reference || '';

  document.getElementById('editor-tag-id').innerText = faq.intent_id || faq.id;
  document.getElementById('editor-tag-status').innerText = faq.approval_status?.toUpperCase();
  document.getElementById('editor-heading').innerText = `ແກ້ໄຂ FAQ: ${faq.intent_id}`;

  // Update Side Panel Simulator Live View
  simIntent.innerText = `Intent: ${faq.intent_id}`;
  simAnswer.innerText = faq.answer_lo;
  simSop.innerText = `SOP: ${faq.source_reference || 'Standard SOP'}`;
  simRiskBadge.className = `px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
    faq.risk_level === 'high' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
    faq.risk_level === 'medium' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
    'bg-emerald-50 text-emerald-700 border border-emerald-200'
  }`;
  simRiskBadge.innerText = `${(faq.risk_level || 'low').toUpperCase()} RISK`;

  renderFaqList();
};

// 5. New FAQ Button
document.getElementById('btn-new-faq').onclick = () => {
  currentEditingId = null;
  editorForm.reset();
  formDocId.value = '';
  document.getElementById('editor-tag-id').innerText = 'FAQ-NEW';
  document.getElementById('editor-tag-status').innerText = 'DRAFT MODE';
  document.getElementById('editor-heading').innerText = 'ສ້າງ FAQ ໃໝ່';
  
  simIntent.innerText = 'Intent: -';
  simAnswer.innerText = 'ກະລຸນາພິມຄຳຕອບເພື່ອສະແດງຕົວຢ່າງ...';
  simSop.innerText = 'SOP: -';
  renderFaqList();
};

// 6. Save Draft
editorForm.onsubmit = async (e) => {
  e.preventDefault();
  await saveFaqData('draft');
};

// 7. Submit for Review
document.getElementById('btn-submit-review').onclick = async () => {
  await saveFaqData('pending_review');
};

// 8. Publish Direct
document.getElementById('btn-publish-direct').onclick = async () => {
  await saveFaqData('published');
};

async function saveFaqData(targetStatus) {
  const id = formDocId.value;
  const rawExamples = formExamples.value;
  const exampleQuestions = rawExamples.split(',').map(s => ({ lang: 'lo', text: s.trim() })).filter(s => s.text);

  const payload = {
    intent_id: formIntent.value.trim(),
    category: formCategory.value,
    risk_level: formRisk.value,
    canonical_question: {
      lo: formCanonicalLo.value.trim(),
      en: formCanonicalEn.value.trim()
    },
    example_questions: exampleQuestions,
    answer_lo: formAnswerLo.value.trim(),
    source_reference: formSource.value.trim(),
    approval_status: targetStatus,
    updated_at: serverTimestamp()
  };

  try {
    if (id) {
      await updateDoc(doc(db, 'faqs', id), payload);
    } else {
      payload.created_at = serverTimestamp();
      const newDoc = doc(collection(db, 'faqs'));
      await setDoc(newDoc, payload);
    }
    alert(`ບັນທຶກສະຖານະ [${targetStatus.toUpperCase()}] ສຳເລັດແລ້ວ!`);
  } catch (err) {
    alert('ເກີດຂໍ້ຜິດພາດ: ' + err.message);
  }
}

// 9. Seed Sample Bank Data
document.getElementById('btn-seed')?.addEventListener('click', async () => {
  if (!confirm('ຕ້ອງການໂຫຼດຂໍ້ມູນ FAQ ທະນາຄານຕົວຢ່າງ (Statement, Fraud, Hours) ເຂົ້າ Firebase ບໍ່?')) return;

  const sampleFaqs = [
    {
      intent_id: "ACC_STATEMENT",
      category: "Account Services",
      risk_level: "medium",
      canonical_question: {
        lo: "ຂ້ອຍສາມາດຂໍໃບລາຍງານການເຄື່ອນໄຫວບັນຊີ (Statement) ໄດ້ແນວໃດ?",
        en: "How can I request a bank statement?"
      },
      example_questions: [
        { lang: "lo", text: "ຂໍສະເຕດເມັນຍ້ອນຫຼັງແນວໃດ" },
        { lang: "lo", text: "ຢາກໄດ້ໃບເຄື່ອນໄຫວບັນຊີ 6 ເດືອນ" }
      ],
      answer_lo: "ທ່ານສາມາດດາວໂຫຼດໃບລາຍງານບັນຊີ (Statement) ດ້ວຍຕົນເອງໄດ້ທັນທີຜ່ານແອັບ Mobile Banking: ເຂົ້າເມນູ 'ບັນຊີ' > ເລືອກບັນຊີ > ກົດ 'ຂໍ Statement' ໂດຍບໍ່ເສຍຄ່າທຳນຽມ. ຫາກຕ້ອງການສະບັບປະທັບຕາທາງການ ກະລຸນາຕິດຕໍ່ສາຂາພ້ອມບັດປະຈຳຕົວ.",
      source_reference: "Retail SOP Sec 4.2",
      approval_status: "published",
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    },
    {
      intent_id: "FRAUD_ACC_LOCK",
      category: "Security & Fraud",
      risk_level: "high",
      canonical_question: {
        lo: "ບັນຊີຖືກດູດເງິນ ຫຼື ສົງໄສຖືກຫຼອກລວງ ຕ້ອງເຮັດແນວໃດດ່ວນ?",
        en: "Suspected unauthorized transaction or fraud, what should I do?"
      },
      example_questions: [
        { lang: "lo", text: "ເງິນຫາຍອອກຈາກບັນຊີເອງ" },
        { lang: "lo", text: "ຖືກຫຼອກໂອນເງິນ ຊ່ວຍອາຍັດດ່ວນ" }
      ],
      answer_lo: "ທະນາຄານໄດ້ຮັບເລື່ອງແລ້ວ. ເພື່ອຄວາມປອດໄພສູງສຸດ ທ່ານສາມາດກົດ 'ລັອກບັນຊີສຸກເສີນ' ໄດ້ທັນທີໃນແອັບ Mobile Banking ຫຼື ໃຫ້ເຈົ້າໜ້າທີ່ດຳເນີນການອາຍັດບັນຊີ ແລະ ບັດຊົ່ວຄາວດຽວນີ້. (ແຈ້ງເຕືອນ: ຫ້າມຖາມລະຫັດ PIN/OTP ຂອງລູກຄ້າເດັດຂາດ).",
      source_reference: "Incident SOP Sec 9.1",
      approval_status: "published",
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    },
    {
      intent_id: "BRANCH_HOURS",
      category: "General Information",
      risk_level: "low",
      canonical_question: {
        lo: "ເວລາເປີດ-ປິດ ຂອງສາຂາທະນາຄານແມ່ນຈັກໂມງ?",
        en: "What are the branch operating hours?"
      },
      example_questions: [
        { lang: "lo", text: "ສາຂາໃຫຍ່ປິດຈັກໂມງ" },
        { lang: "lo", text: "ທະນາຄານເປີດວັນເສົາບໍ່" }
      ],
      answer_lo: "ສາຂາທົ່ວໄປເປີດໃຫ້ບໍລິການ ວັນຈັນ - ວັນສຸກ ເວລາ 8:30 - 15:30. ສຳລັບສາຂາໃນສູນການຄ້າ ເປີດທຸກມື້ ເວລາ 10:00 - 19:00.",
      source_reference: "Customer Service Guide",
      approval_status: "published",
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    }
  ];

  try {
    for (const item of sampleFaqs) {
      await setDoc(doc(collection(db, 'faqs')), item);
    }
    alert('ໂຫຼດຂໍ້ມູນ FAQ ຕົວຢ່າງເຂົ້າ Firebase ສຳເລັດແລ້ວ!');
  } catch (err) {
    alert('Seed Data Error: ' + err.message);
  }
});

// Event Listeners for Filters
searchInput.oninput = renderFaqList;
filterCategory.onchange = renderFaqList;
filterStatus.onchange = renderFaqList;

// Start Firestore Sync
initRealtimeSync();
