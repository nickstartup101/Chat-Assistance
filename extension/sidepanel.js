// extension/sidepanel.js
const PROJECT_ID = "chat-assistance-8cf77";
const API_KEY = "AIzaSyDfPWpTCTuaUVwl_TNWAbNDToqIgLWC4Bs";
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/faqs?key=${API_KEY}`;

let publishedFaqs = [];
let currentDraftAnswer = "";

const queryInput = document.getElementById('customer-query');
const btnAnalyze = document.getElementById('btn-analyze');
const btnSync = document.getElementById('btn-sync');
const btnInsert = document.getElementById('btn-insert-draft');
const matchCard = document.getElementById('match-card');
const statusMsg = document.getElementById('status-msg');

async function syncFaqsFromFirebase() {
  statusMsg.style.display = 'block';
  statusMsg.innerText = 'ກຳລັງ Sync ຄັງຄຳຕອບຈາກ Firebase...';

  try {
    const res = await fetch(FIRESTORE_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    publishedFaqs = (data.documents || []).map(doc => {
      const f = doc.fields || {};
      return {
        id: doc.name.split('/').pop(),
        approval_status: f.approval_status?.stringValue,
        intent_id: f.intent_id?.stringValue,
        risk_level: f.risk_level?.stringValue || 'low',
        canonical_question: {
          lo: f.canonical_question?.mapValue?.fields?.lo?.stringValue || '',
          en: f.canonical_question?.mapValue?.fields?.en?.stringValue || ''
        },
        answer_lo: f.answer_lo?.stringValue || '',
        source_reference: f.source_reference?.stringValue || ''
      };
    }).filter(item => item.approval_status === 'published');

    statusMsg.innerText = `Sync ສຳເລັດ: ພ້ອມໃຊ້ງານ ${publishedFaqs.length} FAQ`;
    setTimeout(() => { statusMsg.style.display = 'none'; }, 2000);
  } catch (err) {
    statusMsg.innerText = '⚠️ ບໍ່ສາມາດ Sync ຂໍ້ມູນ: ' + err.message;
  }
}

// Multilingual Matching Engine (Lao / EN)
function matchAnswer(text) {
  if (!text || publishedFaqs.length === 0) return null;
  const q = text.toLowerCase().trim();

  let bestMatch = null;
  let highestScore = 0;

  for (const faq of publishedFaqs) {
    let score = 0;
    const canLo = (faq.canonical_question.lo || '').toLowerCase();
    const canEn = (faq.canonical_question.en || '').toLowerCase();

    // Exact or substring inclusion
    if (canLo.includes(q) || q.includes(canLo)) score += 0.8;
    if (canEn.includes(q) || q.includes(canEn)) score += 0.7;

    // Word token overlap
    const tokens = q.split(/\s+/);
    for (const t of tokens) {
      if (t.length > 2 && canLo.includes(t)) score += 0.25;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = faq;
    }
  }

  return { faq: bestMatch, score: Math.min(0.99, highestScore) };
}

btnAnalyze.onclick = () => {
  const query = queryInput.value.trim();
  if (!query) {
    alert('ກະລຸນາພິມຂໍ້ຄວາມລູກຄ້າກ່ອນ');
    return;
  }

  const result = matchAnswer(query);

  if (!result || !result.faq || result.score < 0.2) {
    matchCard.style.display = 'none';
    statusMsg.style.display = 'block';
    statusMsg.innerText = '❌ ບໍ່ພົບຄຳຕອບທີ່ຖືກອະນຸມັດກົງກັບຄຳຖາມນີ້.';
    return;
  }

  const faq = result.faq;
  currentDraftAnswer = faq.answer_lo;

  document.getElementById('res-intent').innerText = `Intent: ${faq.intent_id}`;
  document.getElementById('res-answer').innerText = faq.answer_lo;
  document.getElementById('res-confidence').innerText = `Confidence: ${(result.score * 100).toFixed(0)}%`;
  document.getElementById('res-sop').innerText = `SOP: ${faq.source_reference || 'N/A'}`;

  // Risk Badge Styling
  const badge = document.getElementById('res-risk-badge');
  badge.className = `badge-risk ${faq.risk_level}`;
  badge.innerText = `${faq.risk_level.toUpperCase()} RISK`;

  const warningBox = document.getElementById('risk-warning-box');
  if (faq.risk_level === 'high') {
    warningBox.style.display = 'block';
    document.getElementById('risk-warning-text').innerText = 'ກໍລະນີສຸກເສີນ: ຫ້າມຖາມ OTP/Password ແລະ ໃຫ້ແນະນຳລູກຄ້າອາຍັດບັນຊີທັນທີ.';
  } else {
    warningBox.style.display = 'none';
  }

  matchCard.style.display = 'block';
};

// Insert Draft into Active Web Chat Composer
btnInsert.onclick = async () => {
  if (!currentDraftAnswer) return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    navigator.clipboard.writeText(currentDraftAnswer);
    alert('📋 ໄດ້ກັອບປີ້ຄຳຕອບຮ່າງລົງ Clipboard ແລ້ວ!');
    return;
  }

  chrome.tabs.sendMessage(tab.id, {
    action: "INSERT_DRAFT",
    text: currentDraftAnswer
  }, (response) => {
    if (chrome.runtime.lastError || !response?.success) {
      navigator.clipboard.writeText(currentDraftAnswer);
      alert('📋 ໄດ້ກັອບປີ້ຄຳຕອບຮ່າງແລ້ວ! (ກົດ Ctrl+V ວາງໃສ່ຊ່ອງແຊັດໄດ້ເລີຍ)');
    } else {
      statusMsg.style.display = 'block';
      statusMsg.innerText = '✅ ໄດ້ແຊກຄຳຕອບຮ່າງລົງຊ່ອງແຊັດສຳເລັດແລ້ວ!';
      setTimeout(() => { statusMsg.style.display = 'none'; }, 2000);
    }
  });
};

btnSync.onclick = syncFaqsFromFirebase;

// Auto-sync when side panel opens
syncFaqsFromFirebase();
