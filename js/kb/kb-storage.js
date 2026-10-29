/**
 * js/kb/kb-storage.js
 * Storage & Sync Adapter for Knowledge Workspace
 */
const KBStorage = (() => {
  const CACHE_KEY = 'kb_published_faqs_cache';

  function saveLocalCache(faqs) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(faqs));
    } catch (e) {
      console.warn('Could not cache FAQs locally:', e);
    }
  }

  function getLocalCache() {
    try {
      const data = localStorage.getItem(CACHE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  return {
    saveLocalCache,
    getLocalCache
  };
})();

window.KBStorage = KBStorage;
