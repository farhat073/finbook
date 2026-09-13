import React from 'react'
import { motion } from 'framer-motion'
import { Store, IndianRupee, Clock, CheckCircle2, ShieldCheck } from 'lucide-react'
import { cn } from '../lib/utils'

export default function PublicLedgerPage({ data }) {
    const { storeName, customerName, totalSale, totalPaid, balance, generatedAt } = data
    const formatCurrency = (n) => `₹ ${Math.abs(Number(n)).toLocaleString('en-IN')}`

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 sm:p-12 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-24 bg-emerald-600" />
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-50">
                <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-3xl" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[440px] relative z-10 space-y-6"
            >
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                    <div className="p-10">
                        {/* Store Identity */}
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-600 text-white shadow-xl shadow-emerald-200 mb-6 font-black text-3xl">
                                {storeName?.charAt(0)?.toUpperCase() || 'F'}
                            </div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{storeName}</h1>
                            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">Verified Business Statement</p>
                        </div>

                        {/* Amount Due Card */}
                        <div className="bg-rose-50 border-2 border-rose-100 rounded-[2rem] p-8 text-center mb-10">
                            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Pending Balance Due</p>
                            <h2 className="text-5xl font-black text-rose-600 tabular-nums tracking-tighter">
                                {formatCurrency(balance)}
                            </h2>
                            <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 bg-white/50 rounded-full">
                                <Clock size={12} className="text-rose-400" />
                                <span className="text-[10px] font-bold text-rose-600 uppercase">Immediate Action Required</span>
                            </div>
                        </div>

                        {/* Personalized Msg */}
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-10">
                            <p className="text-sm font-bold text-slate-600 leading-relaxed">
                                Dear <span className="text-slate-900">{customerName}</span>, you have a pending balance with <span className="text-slate-900">{storeName}</span>. Please clear your dues at your earliest convenience.
                            </p>
                        </div>

                        {/* Account Stats */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <IndianRupee size={16} strokeWidth={3} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Lifetime Bill</span>
                                </div>
                                <span className="text-sm font-black text-slate-900 tabular-nums">{formatCurrency(totalSale)}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <CheckCircle2 size={16} strokeWidth={3} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Paid</span>
                                </div>
                                <span className="text-sm font-black text-emerald-600 tabular-nums">{formatCurrency(totalPaid)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Security Footer */}
                    <div className="px-10 py-6 bg-slate-900 flex items-center justify-center gap-3">
                        <ShieldCheck size={18} className="text-emerald-400" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Secure Ledger Snapshot</span>
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Generated on {new Date(generatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">
                        Powered by Finbook
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
