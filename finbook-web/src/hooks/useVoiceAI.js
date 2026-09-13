/**
 * useVoiceAI — React hook for FinBook Voice Commands
 * 
 * State: loading → idle → listening → thinking → confirm → idle
 * 
 * Key design decisions:
 * - ONLY matches saved customers (no new name creation)
 * - Uses actual app transaction format (partyName, type, total, received, etc.)
 * - Offers two action buttons: "Received" or "Sale" for paid intent
 * - Calmer, slower TTS for natural speech
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { loadBrain, analyze, brainReady } from '../voice/VoiceBrainAI';

// ─── CAPACITOR PLUGIN ACCESS ────────────────────────────
function getCapacitorSpeechPlugin() {
    try {
        if (window?.Capacitor?.Plugins?.SpeechRecognition) {
            return window.Capacitor.Plugins.SpeechRecognition;
        }
    } catch (e) { /* not in Capacitor */ }
    return null;
}

function getWebSpeechRecognition() {
    if (typeof window === 'undefined') return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

// ─── AUTO-DETECT LANGUAGE FROM TRANSCRIPT ────────────────
function detectLanguage(text) {
    // If text contains Devanagari characters → Hindi
    if (/[\u0900-\u097F]/.test(text)) return 'hinglish';
    // If text is mostly English characters → English
    const englishWords = text.split(/\s+/).filter(w => /^[a-zA-Z]+$/.test(w));
    const totalWords = text.split(/\s+/).length;
    if (englishWords.length / totalWords > 0.6) return 'english';
    return 'hinglish';
}

// ─── CALMER TTS ─────────────────────────────────────────
function speakText(text, lang = 'en-IN') {
    return new Promise((resolve) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            resolve();
            return;
        }
        window.speechSynthesis.cancel();

        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = lang;
        utter.rate = 0.85;    // Slower — more natural
        utter.pitch = 1.0;    // Natural pitch
        utter.volume = 0.9;
        utter.onend = () => setTimeout(resolve, 200);  // Small pause after speaking
        utter.onerror = resolve;

        // Give synthesis time to prepare
        setTimeout(() => window.speechSynthesis.speak(utter), 150);
    });
}

// ─── MULTILINGUAL RESPONSES ─────────────────────────────
const RESPONSES = {
    hinglish: {
        confirm_amount: (a, n) => `${n} ke khaate mein ${a} rupaye add karne hain. Received ya Sale?`,
        confirm_unpaid: (a, n) => `${n} se ${a} rupaye lene hain. Khaate mein add karoon?`,
        confirm_balance: (n) => `${n} ka balance check karoon?`,
        saved_received: (a, n) => `Ho gaya! ${n} ke khaate mein ${a} rupaye received add kar diye.`,
        saved_sale: (a, n) => `Ho gaya! ${n} ke khaate mein ${a} rupaye ki sale add kar di.`,
        saved_unpaid: (a, n) => `Note ho gaya! ${n} se ${a} rupaye lene hain.`,
        cancelled: () => `Cancel kar diya. Dobara mic tap karo.`,
        no_amount: (n) => `${n} samajh gaya, lekin amount nahi suna. Kitne rupaye bolein?`,
        no_name: (a) => `${a} rupaye samajh gaya, lekin customer ka naam nahi suna.`,
        not_understood: () => `Samajh nahi aaya. Aise bolein: "Haseeb ke khaate mein 2000 daal do"`,
        ambiguous: () => `Clear nahi hua. Batao — paisa mila ya dena hai?`,
        customer_missing: (n) => `"${n}" customer save nahi hai. Pehle Customers tab mein add karo.`,
        mic_error: () => `Aawaz nahi aayi. Dobara try karein.`,
        model_loading: (p) => `AI brain load ho raha hai... ${p}%`,
    },
    hindi: {
        confirm_amount: (a, n) => `${n} के खाते में ${a} रुपये डालने हैं। रिसीव्ड या सेल?`,
        confirm_unpaid: (a, n) => `${n} से ${a} रुपये लेने हैं। खाते में डालूं?`,
        confirm_balance: (n) => `${n} का बैलेंस देखूं?`,
        saved_received: (a, n) => `हो गया! ${n} के खाते में ${a} रुपये रिसीव्ड जोड़ दिए।`,
        saved_sale: (a, n) => `हो गया! ${n} के खाते में ${a} रुपये की सेल जोड़ दी।`,
        saved_unpaid: (a, n) => `नोट हो गया! ${n} से ${a} रुपये बाकी हैं।`,
        cancelled: () => `रद्द कर दिया। दोबारा बोलें!`,
        no_amount: (n) => `${n} समझ गया, राशि नहीं सुनी।`,
        no_name: (a) => `${a} रुपये समझ गया, कस्टमर का नाम नहीं सुना।`,
        not_understood: () => `समझ नहीं आया। ऐसे बोलें: "हसीब के खाते में 2000 डालो"`,
        ambiguous: () => `क्लीयर नहीं हुआ — पैसे मिले या देने हैं?`,
        customer_missing: (n) => `"${n}" कस्टमर सेव नहीं है।`,
        mic_error: () => `आवाज़ नहीं आई। दोबारा करें।`,
        model_loading: (p) => `AI लोड हो रहा है... ${p}%`,
    },
    english: {
        confirm_amount: (a, n) => `Add ₹${a} to ${n}'s account. Received or Sale?`,
        confirm_unpaid: (a, n) => `Mark ₹${a} from ${n} as pending. Confirm?`,
        confirm_balance: (n) => `Check balance for ${n}?`,
        saved_received: (a, n) => `Done! Added ₹${a} as received to ${n}'s account.`,
        saved_sale: (a, n) => `Done! Added ₹${a} sale to ${n}'s account.`,
        saved_unpaid: (a, n) => `Saved! ₹${a} from ${n} is pending.`,
        cancelled: () => `Cancelled. Tap mic to try again.`,
        no_amount: (n) => `Got ${n}, but what's the amount?`,
        no_name: (a) => `Got ₹${a}, but which customer?`,
        not_understood: () => `Didn't understand. Try: "Add 2000 to Haseeb's account"`,
        ambiguous: () => `Not clear — money received or owed?`,
        customer_missing: (n) => `"${n}" is not a saved customer. Add them first.`,
        mic_error: () => `Couldn't hear. Please try again.`,
        model_loading: (p) => `AI brain loading... ${p}%`,
    },
};

// ─── HOOK ───────────────────────────────────────────────
export function useVoiceAI({ accounts = [], onSaveReceived, onSaveSale, onSaveUnpaid, language = 'hinglish' }) {
    const [state, setState] = useState('loading');
    const [loadProgress, setLoadProgress] = useState(0);
    const [transcript, setTranscript] = useState('');
    const [messages, setMessages] = useState([]);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [scores, setScores] = useState(null);

    const recognitionRef = useRef(null);
    const isCapacitorRef = useRef(false);
    const listenersRef = useRef([]);
    const timeoutRef = useRef(null);
    const pendingRef = useRef(null);

    const R = useCallback(() => RESPONSES[language] || RESPONSES.hinglish, [language]);
    const ttsLang = language === 'hindi' ? 'hi-IN' : 'en-IN';

    const addMsg = useCallback((text, type = 'ai') => {
        setMessages(prev => [...prev, { text, type, id: Date.now() }]);
    }, []);

    const clearAll = useCallback(() => {
        setMessages([]);
        setTranscript('');
        setResult(null);
        setError(null);
        setScores(null);
        pendingRef.current = null;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }, []);

    // ─── LOAD AI BRAIN ON MOUNT ───────────────────────────
    useEffect(() => {
        if (brainReady()) {
            setState('idle');
            return;
        }

        loadBrain((progress) => {
            setLoadProgress(progress.pct);
            if (progress.stage === 'ready') setState('idle');
        }).then(success => {
            if (!success) {
                console.warn('[VoiceAI] Brain failed to load');
                setState('error');
            }
        }).catch(() => setState('error'));
    }, []);

    // ─── STOP LISTENING ───────────────────────────────────
    const stopListening = useCallback(async () => {
        try {
            if (isCapacitorRef.current) {
                const plugin = getCapacitorSpeechPlugin();
                if (plugin) try { await plugin.stop(); } catch (e) { }
                listenersRef.current.forEach(l => { try { l.remove(); } catch (e) { } });
                listenersRef.current = [];
            } else if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
        } catch (e) { }
    }, []);

    // ─── PROCESS TRANSCRIPT THROUGH AI ────────────────────
    const processTranscript = useCallback(async (text) => {
        clearAll();
        addMsg(text, 'user');
        setTranscript(text);
        setState('thinking');

        // Auto-detect language from what the user said
        const detectedLang = detectLanguage(text);
        const lang = detectedLang;
        const resp = RESPONSES[lang] || RESPONSES.hinglish;
        const tts = lang === 'hindi' ? 'hi-IN' : 'en-IN';

        try {
            const brainResult = await analyze(text, accounts);
            setResult(brainResult);
            setScores(brainResult.pcts);

            const { intent, confidence, amount, name } = brainResult;

            // ── PRIORITY 1: Customer name found? ──
            // If a name matches a saved customer, ALWAYS show Received/Sale
            // regardless of intent confidence.
            if (name) {
                // Verify name exists in saved accounts (fuzzy already matched)
                const found = accounts.find(a => a.toLowerCase() === name.toLowerCase());
                if (found) {
                    brainResult.name = found;

                    // Name + Amount → show Received / Sale buttons
                    if (amount) {
                        const msg = resp.confirm_amount(amount, found);
                        pendingRef.current = brainResult;
                        addMsg(msg);
                        setState('confirm');
                        await speakText(msg, tts);
                        return;
                    }

                    // Name but no amount → ask for amount
                    const msg = resp.no_amount(found);
                    addMsg(msg, 'info');
                    setState('idle');
                    await speakText(msg, tts);
                    return;
                }
                // Name was extracted but doesn't match any saved customer
                // (shouldn't happen since findName only returns saved names now,
                //  but just in case)
            }

            // ── PRIORITY 2: Amount found but no name? ──
            if (amount && !name) {
                const msg = resp.no_name(amount);
                addMsg(msg, 'info');
                setState('idle');
                await speakText(msg, tts);
                return;
            }

            // ── PRIORITY 3: Nothing matched ──
            const msg = resp.not_understood();
            addMsg(msg, 'error');
            setState('idle');
            await speakText(msg, tts);

        } catch (err) {
            console.error('[VoiceAI] Brain error:', err);
            const msg = resp.not_understood();
            addMsg(msg, 'error');
            setState('idle');
            await speakText(msg, tts);
        }
    }, [accounts, addMsg, clearAll]);

    // ─── START LISTENING ──────────────────────────────────
    const listen = useCallback(async () => {
        if (state !== 'idle') return;

        if (!brainReady()) {
            const msg = R().model_loading(loadProgress);
            addMsg(msg, 'info');
            await speakText(msg, ttsLang);
            return;
        }

        clearAll();
        setState('listening');

        // Try Capacitor native plugin first
        const plugin = getCapacitorSpeechPlugin();
        if (plugin) {
            try {
                isCapacitorRef.current = true;

                try {
                    const permResult = await plugin.requestPermissions();
                    if (permResult?.speechRecognition === 'denied') {
                        setError('Microphone permission denied');
                        setState('idle');
                        return;
                    }
                } catch (e) {
                    console.warn('[VoiceAI] Perm check:', e);
                }

                let hasProcessed = false;
                const listener = await plugin.addListener('partialResults', (data) => {
                    if (data.matches && data.matches.length > 0) {
                        const text = data.matches[0];
                        setTranscript(text);
                        if (!hasProcessed && text.trim()) {
                            hasProcessed = true;
                            if (timeoutRef.current) clearTimeout(timeoutRef.current);
                            timeoutRef.current = setTimeout(() => {
                                processTranscript(text.trim());
                            }, 800);
                        }
                    }
                });
                listenersRef.current.push(listener);

                await plugin.start({
                    language: 'en-IN',
                    maxResults: 3,
                    prompt: 'Bolo...',
                    partialResults: true,
                    popup: false,
                });

                timeoutRef.current = setTimeout(async () => {
                    try { await plugin.stop(); } catch (e) { }
                    listenersRef.current.forEach(l => { try { l.remove(); } catch (e) { } });
                    listenersRef.current = [];
                    setState(prev => {
                        if (prev === 'listening') {
                            addMsg(R().mic_error(), 'error');
                            speakText(R().mic_error(), ttsLang);
                            return 'idle';
                        }
                        return prev;
                    });
                }, 12000);

                return;
            } catch (e) {
                console.warn('[VoiceAI] Capacitor speech failed:', e);
                isCapacitorRef.current = false;
            }
        }

        // Fallback: Web Speech API
        const WebSR = getWebSpeechRecognition();
        if (!WebSR) {
            setError('Speech recognition not available');
            setState('idle');
            return;
        }

        const recognition = new WebSR();
        recognition.lang = 'en-IN';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;
        recognitionRef.current = recognition;

        let capturedTranscript = '';
        recognition.onresult = (event) => {
            let finalText = '', interimText = '';
            for (let i = 0; i < event.results.length; i++) {
                const r = event.results[i];
                if (r.isFinal) finalText += r[0].transcript;
                else interimText += r[0].transcript;
            }
            capturedTranscript = finalText || interimText;
            setTranscript(capturedTranscript);
        };

        recognition.onend = () => {
            if (capturedTranscript?.trim()) {
                processTranscript(capturedTranscript.trim());
            } else {
                addMsg(R().mic_error(), 'error');
                setState('idle');
                speakText(R().mic_error(), ttsLang);
            }
        };

        recognition.onerror = () => {
            addMsg(R().mic_error(), 'error');
            setState('idle');
        };

        try { recognition.start(); } catch (e) {
            setError('Could not start speech');
            setState('idle');
        }

        timeoutRef.current = setTimeout(() => {
            stopListening();
            setState(prev => {
                if (prev === 'listening') {
                    addMsg(R().mic_error(), 'error');
                    return 'idle';
                }
                return prev;
            });
        }, 12000);
    }, [state, loadProgress, R, addMsg, clearAll, processTranscript, stopListening, ttsLang]);

    // ─── SAVE AS RECEIVED (payment-in) ────────────────────
    const saveAsReceived = useCallback(async () => {
        const pending = pendingRef.current;
        if (!pending || !onSaveReceived) return;
        setState('thinking');
        try {
            await onSaveReceived(pending.name, pending.amount);
            const msg = R().saved_received(pending.amount, pending.name);
            clearAll();
            addMsg(msg);
            setState('idle');
            await speakText(msg, ttsLang);
            pendingRef.current = null;
        } catch (err) {
            console.error('[VoiceAI] Save error:', err);
            setState('idle');
        }
    }, [onSaveReceived, R, addMsg, clearAll, ttsLang]);

    // ─── SAVE AS SALE ─────────────────────────────────────
    const saveAsSale = useCallback(async () => {
        const pending = pendingRef.current;
        if (!pending || !onSaveSale) return;
        setState('thinking');
        try {
            await onSaveSale(pending.name, pending.amount);
            const msg = R().saved_sale(pending.amount, pending.name);
            clearAll();
            addMsg(msg);
            setState('idle');
            await speakText(msg, ttsLang);
            pendingRef.current = null;
        } catch (err) {
            console.error('[VoiceAI] Save error:', err);
            setState('idle');
        }
    }, [onSaveSale, R, addMsg, clearAll, ttsLang]);

    // ─── SAVE AS UNPAID ───────────────────────────────────
    const saveAsUnpaid = useCallback(async () => {
        const pending = pendingRef.current;
        if (!pending || !onSaveUnpaid) return;
        setState('thinking');
        try {
            await onSaveUnpaid(pending.name, pending.amount);
            const msg = R().saved_unpaid(pending.amount, pending.name);
            clearAll();
            addMsg(msg);
            setState('idle');
            await speakText(msg, ttsLang);
            pendingRef.current = null;
        } catch (err) {
            console.error('[VoiceAI] Save error:', err);
            setState('idle');
        }
    }, [onSaveUnpaid, R, addMsg, clearAll, ttsLang]);

    // ─── CANCEL ───────────────────────────────────────────
    const cancel = useCallback(() => {
        pendingRef.current = null;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        stopListening();
        window.speechSynthesis?.cancel(); // Stop any ongoing speech
        setMessages([]);
        setTranscript('');
        setResult(null);
        setError(null);
        setScores(null);
        setState('idle');
    }, [stopListening]);

    // ─── RETRY ────────────────────────────────────────────
    const retry = useCallback(() => {
        clearAll();
        setState('idle');
        setTimeout(() => listen(), 300);
    }, [clearAll, listen]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            stopListening();
        };
    }, [stopListening]);

    return {
        state,
        loadProgress,
        transcript,
        result,
        messages,
        error,
        scores,
        listen,
        stopListening,
        saveAsReceived,
        saveAsSale,
        saveAsUnpaid,
        cancel,
        retry,
        clearAll,
        brainReady: brainReady(),
    };
}

export default useVoiceAI;
