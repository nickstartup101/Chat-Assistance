/**
 * js/kb/kb-matcher.js
 * Multilingual Bank Matching Engine (Lao & English)
 * 
 * Layer 1: Normalization & Exact Token Matching
 * Layer 2: Intent & Question Phrasing Similarity
 * Layer 3: Risk Classification & Confidence Validation
 */
const KBMatcher = (() => {

  function normalizeLaoText(text) {
    if (!text) return '';
    return text
      .normalize('NFC')
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function calculateSimilarity(strA, strB) {
    const normA = normalizeLaoText(strA);
    const normB = normalizeLaoText(strB);

    if (normA === normB) return 1.0;
    if (!normA || !normB) return 0.0;

    // Substring direct hit bonus
    if (normA.includes(normB) || normB.includes(normA)) {
      return 0.85;
    }

    // Token-level Jaccard Overlap
    const setA = new Set(normA.split(' '));
    const setB = new Set(normB.split(' '));
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);

    const overlapScore = intersection.size / union.size;
    return Math.min(1.0, overlapScore + 0.15);
  }

  function findMatches(userQuery, publishedFaqs = [], threshold = 0.35) {
    const cleanQuery = normalizeLaoText(userQuery);
    if (!cleanQuery || !publishedFaqs.length) {
      return { status: 'EMPTY', matches: [] };
    }

    const scored = publishedFaqs.map(faq => {
      let maxScore = 0;

      // 1. ກວດສອບ Canonical Questions (Lao & English)
      const scoreLo = calculateSimilarity(cleanQuery, faq.canonical_question?.lo);
      const scoreEn = calculateSimilarity(cleanQuery, faq.canonical_question?.en);
      maxScore = Math.max(maxScore, scoreLo, scoreEn);

      // 2. ກວດສອບ Example Phrasings
      if (Array.isArray(faq.example_questions)) {
        for (const ex of faq.example_questions) {
          const exScore = calculateSimilarity(cleanQuery, ex.text);
          if (exScore > maxScore) maxScore = exScore;
        }
      }

      // 3. Keyword Inclusions
      const keywords = [...(faq.keywords || []), ...(faq.tags || [])];
      for (const kw of keywords) {
        if (cleanQuery.includes(normalizeLaoText(kw))) {
          maxScore = Math.max(maxScore, 0.75);
        }
      }

      return {
        faq,
        score: parseFloat(maxScore.toFixed(2))
      };
    });

    // ຮຽງລຳດັບຄະແນນຈາກສູງໄປຕ່ຳ
    scored.sort((a, b) => b.score - a.score);

    const filtered = scored.filter(s => s.score >= threshold);

    if (!filtered.length) {
      return {
        status: 'NO_MATCH',
        message: 'ບໍ່ພົບຄຳຕອບທີ່ຖືກອະນຸມັດພຽງພໍ ສຳລັບຄຳຖາມນີ້.',
        matches: []
      };
    }

    const primary = filtered[0];
    const isAmbiguous = filtered.length > 1 && (filtered[0].score - filtered[1].score < 0.08);

    return {
      status: isAmbiguous ? 'AMBIGUOUS' : 'MATCHED',
      primary: primary.faq,
      confidence: primary.score,
      riskLevel: primary.faq.risk_level || 'low',
      alternatives: filtered.slice(1, 3).map(f => f.faq)
    };
  }

  return {
    normalizeLaoText,
    calculateSimilarity,
    findMatches
  };
})();

window.KBMatcher = KBMatcher;
