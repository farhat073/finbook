/**
 * VoiceBrainAI.js — Multilingual AI Brain for FinBook
 * 
 * Uses: @xenova/transformers (paraphrase-multilingual-MiniLM-L12-v2)
 * Size: ~45MB downloaded once, cached forever in browser/device
 * Works: English + Hindi + Hinglish + Urdu, 100% offline after first download
 * 
 * Pluggable interface: any replacement brain just needs to export
 *   loadBrain(), analyze(), brainReady()
 */

import { pipeline, env } from '@xenova/transformers';

// Cache model after first download — no re-download needed
env.allowLocalModels = false;
env.useBrowserCache = true;

// ─── EXAMPLE SENTENCES PER INTENT ───────────────────────
// The AI measures how semantically similar any input is to these.
// More examples = better understanding. These are the brain's "memory".

const EXAMPLES = {
    paid: [
        // English
        "I received money", "payment received", "money collected",
        "he paid me", "got money from him", "payment came",
        "received the amount", "cleared the payment", "he settled his dues",
        "money has been deposited", "collected cash", "payment done",
        "Adam paid 500", "Rahul gave me money", "got 1000 from him",
        "he transferred the money", "amount received", "cash received",
        "money came in", "he gave the payment", "funds received",
        "received full payment", "partial payment received",
        // Hinglish
        "Adam ko 500 mila", "Rahul ne paisa de diya", "amount mil gaya",
        "paisa aa gaya", "Adam ne diya", "payment mil gayi",
        "paise mil gaye", "rupaye aa gaye", "payment ho gaya",
        "Adam ne paise bheje", "Rahul se paisa mila",
        "uske paise aa gaye", "usne de diya", "paisa de diya hai",
        "Vijay ne 200 rupaye diye", "payment aa gayi hai",
        "hisaab ho gaya", "udhar wapas aa gaya", "amount settle ho gaya",
        "Vikram ne 500 diye", "Suresh ka payment aa gaya",
        // Hindi (Devanagari)
        "पैसे मिल गए", "रुपये आ गए", "भुगतान हो गया",
        "उसने पैसे दे दिए", "रकम मिल गई", "हिसाब चुकता हो गया",
        "पेमेंट आ गई", "पैसा दे दिया", "अमाउंट मिल गया",
        "आदम ने 500 दिए", "राहुल से पैसा मिला",
        "उधार वापस आ गया", "पैसे जमा हो गए", "रुपये दे दिए",
        // Urdu/Mixed
        "raqam mil gayi", "paisa wapas aaya", "hisaab chukaya",
        "adam ne raqam di", "payment kar diya",
    ],
    unpaid: [
        // English
        "he owes me money", "pending payment", "not paid yet",
        "still needs to pay", "amount is due", "money owed",
        "outstanding balance", "need to collect money", "hasn't paid",
        "unpaid amount", "balance pending", "he borrowed money",
        "Adam owes 500", "Rahul hasn't paid yet", "money is due from him",
        "payment is overdue", "remaining amount", "debit entry",
        "need to collect from him", "he took a loan",
        "partial payment pending", "balance still remaining",
        // Hinglish
        "Adam se lena hai", "baaki hai paisa", "abhi nahi diya",
        "udhaar dena hai", "lena baki hai", "Vikram se lena baki",
        "paise baaki hain", "udhar hai", "abhi tak nahi mila",
        "payment pending hai", "Rahul ne abhi tak nahi diye",
        "uska paisa ruk gaya", "hisaab baaki hai",
        "Adam ka udhar baaki hai", "usse paise lene hain",
        "baaki raqam", "abhi collection pending hai",
        "wo abhi bhi dena hai", "uska hisaab abhi nahi hua",
        // Hindi (Devanagari)
        "पैसे बाकी हैं", "उधार है", "अभी तक नहीं दिया",
        "बकाया राशि", "लेना बाकी है", "पेंडिंग है",
        "पैसे देने हैं", "हिसाब बाकी है", "उधार लिया है",
        "रुपये बाकी हैं", "बकाया है", "अभी नहीं मिला",
        "आदम से लेना है", "राहुल ने अभी तक नहीं दिया",
        // Urdu/Mixed
        "raqam bakaya", "udhar baqi hai", "abhi tak nahi chukaya",
        "paisa dena baaki", "hisaab abhi tak nahi hua",
    ],
    balance: [
        // English
        "check balance", "what does he owe", "how much is pending",
        "show account balance", "total amount", "what's the balance",
        "how much money", "show me the account", "account summary",
        "what is the total", "balance inquiry",
        // Hinglish
        "balance batao", "kitna baaki hai", "hisaab dikhao",
        "account check karo", "balance kya hai", "kitna lena hai",
        "kitna dena hai", "hisab batao", "total kitna hai",
        "uska khata dikhao", "paise kitne baki hain",
        // Hindi (Devanagari)
        "बैलेंस बताओ", "कितना बाकी है", "हिसाब दिखाओ",
        "खाता चेक करो", "कुल कितना है", "कितना लेना है",
        "कितना देना है", "रकम बताओ", "खाता दिखाओ",
        // Urdu/Mixed
        "kul hisaab", "raqam batao", "khata dikhao",
    ],
};

// ─── CACHED INSTANCE ────────────────────────────────────
let extractorInstance = null;
let exampleEmbeddings = {};
let isReady = false;

// ─── LOAD MODEL (call once at app start) ────────────────
export async function loadBrain(onProgress) {
    if (isReady) return true;

    try {
        extractorInstance = await pipeline(
            'feature-extraction',
            'Xenova/paraphrase-multilingual-MiniLM-L12-v2',
            {
                quantized: true,
                progress_callback: (p) => {
                    if (onProgress) {
                        if (p.status === 'downloading') {
                            onProgress({ stage: 'download', pct: Math.round(p.progress || 0) });
                        } else if (p.status === 'loading') {
                            onProgress({ stage: 'loading', pct: 90 });
                        }
                    }
                }
            }
        );

        // Pre-compute embeddings for all example sentences
        if (onProgress) onProgress({ stage: 'embedding', pct: 95 });

        for (const [intent, sentences] of Object.entries(EXAMPLES)) {
            exampleEmbeddings[intent] = [];
            for (const s of sentences) {
                const out = await extractorInstance(s, { pooling: 'mean', normalize: true });
                exampleEmbeddings[intent].push(Array.from(out.data));
            }
        }

        isReady = true;
        if (onProgress) onProgress({ stage: 'ready', pct: 100 });
        console.log('[VoiceBrain] ML model loaded and ready');
        return true;

    } catch (err) {
        console.error('[VoiceBrain] Model load failed:', err);
        return false;
    }
}

// ─── COSINE SIMILARITY ──────────────────────────────────
function cosine(a, b) {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// Average similarity to an intent's examples
function avgSimilarity(inputEmbed, intentEmbeds) {
    // Use top-3 highest scores (best matches matter most)
    const scores = intentEmbeds.map(e => cosine(inputEmbed, e));
    scores.sort((a, b) => b - a);
    const topN = scores.slice(0, Math.min(3, scores.length));
    return topN.reduce((s, v) => s + v, 0) / topN.length;
}

// ─── NUMBER EXTRACTION ──────────────────────────────────
const NUM_MAP = {
    // English
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
    'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90,
    'hundred': 100, 'thousand': 1000, 'lakh': 100000, 'million': 1000000,
    // Romanized Hindi
    'ek': 1, 'do': 2, 'teen': 3, 'tiin': 3, 'char': 4, 'paanch': 5, 'panch': 5,
    'chhe': 6, 'che': 6, 'saat': 7, 'sat': 7, 'aath': 8, 'aat': 8, 'nau': 9, 'das': 10,
    'gyarah': 11, 'barah': 12, 'terah': 13, 'chaudah': 14, 'pandrah': 15,
    'bees': 20, 'bis': 20, 'pacchis': 25, 'pachis': 25,
    'tees': 30, 'tis': 30, 'chalis': 40, 'chaalis': 40, 'pachas': 50, 'pachaas': 50,
    'saath': 60, 'sattar': 70, 'assi': 80, 'nabbe': 90,
    'so': 100, 'sau': 100, 'hazaar': 1000, 'hazar': 1000, 'hajar': 1000,
    // Devanagari Hindi
    'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पाँच': 5, 'पांच': 5,
    'छह': 6, 'छे': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
    'ग्यारह': 11, 'बारह': 12, 'तेरह': 13, 'चौदह': 14, 'पंद्रह': 15,
    'बीस': 20, 'पच्चीस': 25, 'तीस': 30, 'चालीस': 40, 'पचास': 50,
    'साठ': 60, 'सत्तर': 70, 'अस्सी': 80, 'नब्बे': 90,
    'सौ': 100, 'हजार': 1000, 'हज़ार': 1000, 'लाख': 100000,
};

export function extractAmount(text) {
    // First try plain digits (including with commas)
    const digitMatch = text.match(/\b(\d[\d,]*)\b/);
    if (digitMatch) {
        const num = parseInt(digitMatch[1].replace(/,/g, ''));
        if (!isNaN(num) && num > 0) return num;
    }

    // Word-form numbers
    const words = text.toLowerCase().split(/[\s,]+/);
    let total = 0, current = 0, foundNumber = false;

    for (const w of words) {
        const v = NUM_MAP[w];
        if (v === undefined) {
            if (current > 0) { total += current; current = 0; }
            continue;
        }
        foundNumber = true;
        if (v === 100) { current = (current || 1) * 100; }
        else if (v >= 1000) { total += (current || 1) * v; current = 0; }
        else { current += v; }
    }
    total += current;

    // Also try Devanagari words directly in the original text
    if (!foundNumber) {
        const origWords = text.split(/[\s,]+/);
        for (const w of origWords) {
            const v = NUM_MAP[w];
            if (v === undefined) {
                if (current > 0) { total += current; current = 0; }
                continue;
            }
            foundNumber = true;
            if (v === 100) { current = (current || 1) * 100; }
            else if (v >= 1000) { total += (current || 1) * v; current = 0; }
            else { current += v; }
        }
        total += current;
    }

    return foundNumber && total > 0 ? total : null;
}

// ─── FUZZY NAME MATCHER ─────────────────────────────────
function fuzzyMatch(a, b) {
    a = a.toLowerCase(); b = b.toLowerCase();
    if (a === b) return 1.0;
    if (b.includes(a) || a.includes(b)) return 0.9;
    // Prefix match (first 3+ chars)
    const shorter = a.length < b.length ? a : b;
    const longer = a.length < b.length ? b : a;
    if (longer.startsWith(shorter)) return 0.85;
    // Check if first 3 chars match (common for names)
    if (shorter.length >= 3 && longer.startsWith(shorter.slice(0, 3))) return 0.75;
    // Character overlap with position awareness
    let matchCount = 0, posBonus = 0;
    for (let i = 0; i < shorter.length; i++) {
        if (longer.includes(shorter[i])) matchCount++;
        // Bonus if same position
        if (i < longer.length && shorter[i] === longer[i]) posBonus += 0.5;
    }
    const charScore = matchCount / longer.length;
    const posScore = posBonus / Math.max(shorter.length, longer.length);
    return charScore * 0.7 + posScore * 0.3;
}

// ─── DEVANAGARI → LATIN TRANSLITERATION ─────────────────
const DEVANAGARI_MAP = {
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
    'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'f', 'ब': 'b', 'भ': 'bh', 'म': 'm',
    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
    'क़': 'q', 'ख़': 'kh', 'ग़': 'gh', 'ज़': 'z', 'फ़': 'f', 'ड़': 'r', 'ढ़': 'rh',
    'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
    'ं': 'n', 'ँ': 'n', 'ः': 'h', '्': '',
};

function transliterate(text) {
    if (!/[\u0900-\u097F]/.test(text)) return text;
    let result = '';
    const chars = [...text];
    for (let i = 0; i < chars.length; i++) {
        if (i < chars.length - 1) {
            const pair = chars[i] + chars[i + 1];
            if (DEVANAGARI_MAP[pair] !== undefined) {
                result += DEVANAGARI_MAP[pair];
                i++;
                continue;
            }
        }
        if (DEVANAGARI_MAP[chars[i]] !== undefined) {
            result += DEVANAGARI_MAP[chars[i]];
        } else if (/[\u0900-\u097F]/.test(chars[i])) {
            // Unknown Devanagari — skip
        } else {
            result += chars[i];
        }
    }
    return result;
}

export function findName(text, accounts) {
    if (!accounts || accounts.length === 0) return { name: null, score: 0 };

    // Transliterate Hindi text to Latin
    const transliterated = transliterate(text);
    const lower = text.toLowerCase();
    const transLower = transliterated.toLowerCase();

    console.log('[VoiceBrain] Name search — original:', text, '→ transliterated:', transliterated);

    // Try exact full-name substring match first (both original + transliterated)
    for (const acc of accounts) {
        const accLower = acc.toLowerCase();
        if (lower.includes(accLower) || transLower.includes(accLower)) {
            return { name: acc, score: 1.0 };
        }
    }

    // Try first-name substring match
    // e.g. "haseeb" should match "Haseeb Koka"
    for (const acc of accounts) {
        const firstName = acc.split(/\s+/)[0].toLowerCase();
        if (lower.includes(firstName) || transLower.includes(firstName)) {
            return { name: acc, score: 0.95 };
        }
    }

    // Common filler words to skip
    const fillers = new Set([
        'ko', 'ka', 'ki', 'ke', 'ne', 'se', 'me', 'mein', 'hai', 'hain', 'ho',
        'the', 'tha', 'thi', 'woh', 'yeh', 'un', 'us', 'is', 'ye', 'wo',
        'rupaye', 'rupay', 'rupees', 'rs', 'paisa', 'paise', 'rupiya',
        'mila', 'mile', 'mili', 'diya', 'diye', 'di', 'de', 'do',
        'lena', 'lene', 'dena', 'dene', 'udhar', 'baaki', 'baki',
        'add', 'paid', 'received', 'got', 'owes', 'from', 'to', 'for',
        'payment', 'amount', 'balance', 'check', 'pending', 'settle', 'sale',
        'को', 'का', 'की', 'के', 'ने', 'से', 'में', 'है', 'हैं',
        'रुपये', 'रुपया', 'पैसे', 'पैसा', 'मिला', 'मिले', 'दिया', 'दिये',
        'लेना', 'देना', 'उधार', 'बाकी', 'बकाया', 'गया', 'गए', 'गयी',
        'मैं', 'कर', 'कि', 'और', 'एक', 'हज़ार', 'हजार', 'सौ', 'लाख',
        ...Object.keys(NUM_MAP),
    ]);

    // Extract candidate words from user's speech (both scripts)
    const origWords = text.split(/[\s,]+/);
    const transWords = transliterated.split(/[\s,]+/);

    let best = null, bestScore = 0;

    for (let i = 0; i < origWords.length; i++) {
        const orig = origWords[i];
        const trans = transWords[i] || orig;
        if (orig.length < 2 && trans.length < 2) continue;
        if (/^\d+$/.test(orig)) continue;
        if (fillers.has(orig.toLowerCase()) && fillers.has(trans.toLowerCase())) continue;

        // Match against EACH WORD of each customer name
        // So "haseef" can match the "Haseeb" part of "Haseeb Koka"
        for (const acc of accounts) {
            const nameParts = acc.split(/\s+/);
            let bestPartScore = 0;
            for (const part of nameParts) {
                const s1 = fuzzyMatch(orig, part);
                const s2 = fuzzyMatch(trans, part);
                bestPartScore = Math.max(bestPartScore, s1, s2);
            }
            // Also try against the full name
            const fullS1 = fuzzyMatch(orig, acc);
            const fullS2 = fuzzyMatch(trans, acc);
            const s = Math.max(bestPartScore, fullS1, fullS2);
            if (s > bestScore && s > 0.55) {
                bestScore = s;
                best = acc;
            }
        }
    }

    return { name: best, score: bestScore };
}

// ─── MAIN ANALYSIS (SEMANTIC) ───────────────────────────
export async function analyze(transcript, accounts = []) {
    if (!isReady || !extractorInstance) {
        throw new Error('Brain not loaded yet. Call loadBrain() first.');
    }

    console.log('[VoiceBrain] Analyzing:', transcript);

    // Get semantic embedding of user input
    const out = await extractorInstance(transcript, { pooling: 'mean', normalize: true });
    const inputEmbed = Array.from(out.data);

    // Compare to each intent's example embeddings (using top-3 similarity)
    const scores = {};
    for (const intent of Object.keys(EXAMPLES)) {
        scores[intent] = avgSimilarity(inputEmbed, exampleEmbeddings[intent]);
    }

    // Find winner + calculate confidence
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const winner = sorted[0];
    const runnerUp = sorted[1];
    const gap = winner[1] - runnerUp[1];
    const confidence = gap > 0.06 ? 'high' : gap > 0.03 ? 'medium' : 'low';

    // Extract amount + name
    const amount = extractAmount(transcript);
    const nameResult = findName(transcript, accounts);

    // Normalize scores to percentages for display
    const total = Object.values(scores).reduce((s, v) => s + v, 0);
    const pcts = {};
    for (const [k, v] of Object.entries(scores)) {
        pcts[k] = Math.round((v / total) * 100);
    }

    const result = {
        intent: winner[0],       // 'paid' | 'unpaid' | 'balance'
        confidence,              // 'high' | 'medium' | 'low'
        amount,                  // number | null
        name: nameResult.name,   // matched account name | null
        nameScore: nameResult.score,
        isNewName: nameResult.isNew || false,
        scores,                  // raw similarity scores
        pcts,                    // normalized % for display
        originalText: transcript,
    };

    console.log('[VoiceBrain] Result:', JSON.stringify({
        intent: result.intent,
        confidence: result.confidence,
        amount: result.amount,
        name: result.name,
        pcts: result.pcts,
    }));

    return result;
}

export const brainReady = () => isReady;

export const BRAIN_INFO = {
    type: 'ml-semantic',
    name: 'FinBook ML Brain',
    version: '3.0.0',
    model: 'Xenova/paraphrase-multilingual-MiniLM-L12-v2',
    description: 'Semantic sentence understanding using transformer embeddings. Understands meaning, not just keywords.',
    supportsLanguages: ['hindi', 'hinglish', 'english', 'urdu'],
};
