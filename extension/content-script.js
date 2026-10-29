// extension/content-script.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "INSERT_DRAFT") {
    // ຊອກຫາກ່ອງພິມຂໍ້ຄວາມ (textarea, contenteditable div, text input)
    const composer = document.querySelector('textarea, div[contenteditable="true"], input[type="text"]');
    
    if (composer) {
      if (composer.tagName === 'TEXTAREA' || composer.tagName === 'INPUT') {
        composer.value = request.text;
      } else {
        composer.innerText = request.text;
      }
      composer.dispatchEvent(new Event('input', { bubbles: true }));
      composer.focus();
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, reason: "Composer not found" });
    }
  }
  return true;
});
