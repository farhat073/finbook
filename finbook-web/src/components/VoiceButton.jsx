import { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, X, Check, ShoppingCart, IndianRupee, RotateCcw, Loader2, Sparkles } from 'lucide-react'
import { useApp } from '../AppContext'
import { useVoiceAI } from '../hooks/useVoiceAI'
import { cn } from '../lib/utils'

export default function VoiceButton() {
    const { parties, addTransaction, getAvatarColor } = useApp()
    const [showHint, setShowHint] = useState(false)

    const accounts = useMemo(() => {
        if (!parties) return []
        return parties.map(p => p.name).filter(Boolean)
    }, [parties])

    useEffect(() => {
        const t1 = setTimeout(() => setShowHint(true), 4000)
        const t2 = setTimeout(() => setShowHint(false), 12000)
        return () => { clearTimeout(t1); clearTimeout(t2) }
    }, [])

    const handleSaveReceived = async (name, amount) => {
        await addTransaction({
            billNo: Date.now().toString().slice(-6),
            type: 'payment-in',
            partyName: name,
            billedItems: 'Payment Received (Voice)',
            billedQty: '',
            paidAmt: 0,
            received: amount,
            total: amount,
        })
    }

    const handleSaveSale = async (name, amount) => {
        await addTransaction({
            billNo: Date.now().toString().slice(-6),
            type: 'sale',
            partyName: name,
            billedItems: 'Sale (Voice)',
            billedQty: '',
            paidAmt: 0,
            received: 0,
            total: amount,
        })
    }

    const voice = useVoiceAI({
        accounts,
        onSaveReceived: handleSaveReceived,
        onSaveSale: handleSaveSale,
        onSaveUnpaid: handleSaveSale,
        language: 'hinglish',
    })

    const {
        state, loadProgress, transcript, messages, result,
        listen, stopListening, saveAsReceived, saveAsSale,
        cancel, retry
    } = voice

    const isOverlayActive = state === 'listening' || state === 'thinking'
    const isModalActive = state === 'confirm' || (state === 'idle' && messages.length > 0)
    const name = result?.name || null
    const amount = result?.amount || null
    const hintName = accounts.length > 0 ? accounts[0].split(/\s+/)[0] : 'Rajesh'

    return (
        <>
            {/* FAB Button */}
            <div className="fixed bottom-24 lg:bottom-8 right-6 lg:right-8 z-50 flex flex-col items-end gap-3">
                <AnimatePresence>
                    {showHint && state === 'idle' && !isModalActive && (
                        <motion.button
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={() => setShowHint(false)}
                            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl border border-white/10 flex items-center gap-2"
                        >
                            <Sparkles size={14} className="text-primary" />
                            Say "<span className="text-primary">{hintName} 500</span>"
                        </motion.button>
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        setShowHint(false)
                        if (state === 'idle') listen()
                        else if (state === 'listening') stopListening()
                    }}
                    disabled={state === 'loading' || state === 'thinking'}
                    className={cn(
                        "h-14 flex items-center gap-3 px-6 rounded-2xl font-black text-sm tracking-tight shadow-2xl transition-all relative overflow-hidden",
                        state === 'listening' 
                            ? "bg-rose-500 text-white" 
                            : "bg-slate-900 text-white border border-white/10"
                    )}
                >
                    {state === 'loading' || state === 'thinking' ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            <span>{state === 'loading' ? `${loadProgress}%` : 'AI Thinking...'}</span>
                        </>
                    ) : (
                        <>
                            <div className="relative">
                                {state === 'listening' && (
                                    <motion.div 
                                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                        className="absolute inset-0 bg-white rounded-full"
                                    />
                                )}
                                <Mic size={20} strokeWidth={3} className="relative z-10" />
                            </div>
                            <span>{state === 'listening' ? 'Listening...' : 'Add with AI'}</span>
                        </>
                    )}
                </motion.button>
            </div>

            {/* Full-screen Interaction Overlay */}
            <AnimatePresence>
                {isOverlayActive && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-lg flex flex-col items-center justify-center p-8 text-white"
                    >
                        {state === 'listening' ? (
                            <div className="w-full max-w-md flex flex-col items-center gap-12">
                                <div className="flex items-center gap-1 h-12">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <motion.div
                                            key={i}
                                            animate={{ height: [20, 60, 20] }}
                                            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                            className="w-2 bg-primary rounded-full"
                                        />
                                    ))}
                                </div>
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-black tracking-tight">Listening...</h2>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Say customer name and amount</p>
                                </div>
                                <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10 w-full min-h-[100px] flex items-center justify-center text-center">
                                    <p className="text-xl font-bold italic text-primary">
                                        {transcript ? `"${transcript}"` : 'Waiting for voice...'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-6">
                                <Loader2 size={48} className="text-primary animate-spin" />
                                <div className="text-center">
                                    <h2 className="text-xl font-black">AI Processing</h2>
                                    <p className="text-slate-400 text-sm font-medium">Extracting intent from your voice</p>
                                </div>
                            </div>
                        )}
                        
                        <button 
                            onClick={cancel}
                            className="absolute bottom-12 px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-sm transition-all"
                        >
                            Cancel
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {isModalActive && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={cancel}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
                        >
                            {state === 'confirm' && name ? (
                                <div className="flex flex-col items-center text-center">
                                    <div 
                                        className="w-20 h-20 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-lg mb-4"
                                        style={{ background: getAvatarColor(name) }}
                                    >
                                        {name.charAt(0).toUpperCase()}
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">{name}</h3>
                                    <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-black text-2xl tabular-nums mb-8 flex items-center gap-2">
                                        <IndianRupee size={20} strokeWidth={3} />
                                        {amount?.toLocaleString('en-IN')}
                                    </div>

                                    <div className="w-full space-y-3 mb-8">
                                        <button 
                                            onClick={saveAsReceived}
                                            className="w-full group flex items-center justify-between p-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                                    <Check size={18} strokeWidth={3} />
                                                </div>
                                                <span>Payment Received</span>
                                            </div>
                                            <ChevronRight size={18} className="opacity-50 group-hover:translate-x-1 transition-all" />
                                        </button>
                                        
                                        <button 
                                            onClick={saveAsSale}
                                            className="w-full group flex items-center justify-between p-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                                    <ShoppingCart size={18} strokeWidth={3} />
                                                </div>
                                                <span>New Sale</span>
                                            </div>
                                            <ChevronRight size={18} className="opacity-50 group-hover:translate-x-1 transition-all" />
                                        </button>
                                    </div>

                                    <button onClick={cancel} className="text-sm font-bold text-slate-400 hover:text-slate-600">Cancel</button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-center p-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                                        <AlertCircle size={32} className="text-slate-400" />
                                    </div>
                                    <div className="space-y-2 mb-8">
                                        {messages.map(msg => (
                                            <p key={msg.id} className="text-slate-600 font-bold leading-relaxed">{msg.text}</p>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={retry}
                                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all mb-4"
                                    >
                                        <RotateCcw size={18} /> Try Again
                                    </button>
                                    <button onClick={cancel} className="text-sm font-bold text-slate-400">Close</button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
