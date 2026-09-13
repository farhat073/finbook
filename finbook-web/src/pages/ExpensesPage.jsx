import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Wallet, Search, Trash2, FileText, CreditCard, 
    Plus, X, ChevronRight, TrendingDown, Filter, 
    Download, PieChart, LayoutGrid, List, Receipt,
    Loader2
} from 'lucide-react'
import { useApp } from '../AppContext'
import { cn, formatCurrency } from '../lib/utils'

function AddExpenseModal({ onClose }) {
    const { addExpense } = useApp()
    const [form, setForm] = useState({ category: '', itemName: '', qty: '', price: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
    const totalAmount = parseFloat(form.qty || 0) * parseFloat(form.price || 0)
    
    const submit = async () => {
        if (!form.category || !form.itemName) return
        setIsSubmitting(true)
        try {
            await addExpense({ 
                category: form.category, 
                itemName: form.itemName, 
                qty: parseFloat(form.qty || 1), 
                price: parseFloat(form.price || 0), 
                totalAmount 
            })
            onClose()
        } finally {
            setIsSubmitting(false)
        }
    }

    const cats = ['Rent', 'Transport', 'Electricity', 'Salaries', 'Marketing', 'Misc']

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Record Expense</h2>
                            <p className="text-sm text-slate-500 font-medium">Business spending entry</p>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Category *</label>
                            <div className="grid grid-cols-3 gap-2">
                                {cats.map(c => (
                                    <button 
                                        key={c}
                                        onClick={() => set('category', c)}
                                        className={cn(
                                            "py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                                            form.category === c 
                                                ? "bg-rose-50 border-rose-200 text-rose-600 shadow-sm" 
                                                : "bg-slate-50 border-slate-50 text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Expense Name *</label>
                            <input 
                                autoFocus
                                className="w-full bg-slate-50 border-2 border-slate-50 px-5 py-4 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:bg-white focus:border-rose-100 transition-all outline-none"
                                placeholder="e.g. Shop Rent - May" 
                                value={form.itemName} 
                                onChange={e => set('itemName', e.target.value)} 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Qty / Unit</label>
                                <input 
                                    className="w-full bg-slate-50 border-2 border-slate-50 px-5 py-4 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:bg-white focus:border-rose-100 transition-all outline-none"
                                    placeholder="1" 
                                    type="number" 
                                    value={form.qty} 
                                    onChange={e => set('qty', e.target.value)} 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Price per Unit</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <input 
                                        className="w-full bg-slate-50 border-2 border-slate-50 pl-10 pr-5 py-4 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:bg-white focus:border-rose-100 transition-all outline-none"
                                        placeholder="0" 
                                        type="number" 
                                        value={form.price} 
                                        onChange={e => set('price', e.target.value)} 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-6 rounded-[2rem] text-white flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Total Expense</p>
                                <h3 className="text-2xl font-black tabular-nums tracking-tighter">{formatCurrency(totalAmount)}</h3>
                            </div>
                            <TrendingDown size={32} className="text-rose-400" />
                        </div>
                    </div>

                    <div className="mt-10 flex gap-4">
                        <button onClick={onClose} className="flex-1 py-4 px-6 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                        <button 
                            disabled={!form.category || !form.itemName || isSubmitting}
                            onClick={submit}
                            className="flex-[2] bg-rose-600 text-white py-4 px-6 rounded-2xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} strokeWidth={3} />}
                            Save Expense
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default function ExpensesPage() {
    const { expenses, addExpense, deleteExpense, totalExpenses, formatCurrency } = useApp()
    const [tab, setTab] = useState('categories')
    const [showModal, setShowModal] = useState(false)

    const catMap = {}
    expenses.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + e.totalAmount })
    const categories = Object.entries(catMap).map(([k, v]) => ({ name: k, total: v }))
    const maxCat = Math.max(...categories.map(c => c.total), 1)

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Total Banner */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 bg-rose-600 rounded-[2.5rem] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Wallet size={120} />
                </div>
                <div className="relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-200 mb-2">Total Expenditures</p>
                    <h2 className="text-4xl font-black tabular-nums tracking-tighter">{formatCurrency(totalExpenses)}</h2>
                    <p className="text-xs text-rose-100 font-medium mt-2">Business operational costs till date</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="relative z-10 bg-white text-rose-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-900/20 hover:bg-rose-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={18} strokeWidth={3} />
                    Record Expense
                </button>
            </motion.div>

            {/* Content Tabs */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto relative">
                    {['categories', 'items'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={cn(
                                "flex-1 sm:px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative z-10 whitespace-nowrap",
                                tab === t ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {t}
                            {tab === t && (
                                <motion.div 
                                    layoutId="expenseTab"
                                    className="absolute inset-0 bg-white rounded-xl shadow-sm -z-10"
                                />
                            )}
                        </button>
                    ))}
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors shadow-sm">
                        <Filter size={20} />
                    </button>
                    <button className="flex-1 sm:flex-none p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors shadow-sm">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* List View */}
            <AnimatePresence mode="wait">
                {tab === 'categories' ? (
                    <motion.div 
                        key="cats"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-8"
                    >
                        {categories.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center">
                                    <PieChart size={40} className="text-slate-200" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">No categorised spending</h3>
                            </div>
                        ) : categories.map(cat => (
                            <div key={cat.name} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
                                            <CreditCard size={16} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-900 tabular-nums">{formatCurrency(cat.total)}</span>
                                </div>
                                <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(cat.total / maxCat) * 100}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-full bg-rose-500 rounded-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div 
                        key="items"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden"
                    >
                        <div className="divide-y divide-slate-50">
                            {expenses.length === 0 ? (
                                <div className="py-24 text-center">
                                    <Receipt size={48} className="mx-auto text-slate-200 mb-4" />
                                    <h3 className="text-lg font-bold text-slate-900">No expense items</h3>
                                </div>
                            ) : [...expenses].reverse().map(e => (
                                <div key={e.id} className="w-full flex items-center gap-5 p-5 hover:bg-slate-50/80 transition-all group">
                                    <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-400 group-hover:bg-white group-hover:text-rose-600 transition-all shadow-sm">
                                        <Wallet size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-base font-bold text-slate-900 truncate">{e.itemName}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="px-1.5 py-0.5 bg-slate-100 text-[9px] font-black uppercase text-slate-400 rounded">{e.category}</span>
                                            <span className="text-[11px] font-bold text-slate-400">{e.qty} × {formatCurrency(e.price)}</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-4">
                                        <p className="text-lg font-black text-rose-600 tabular-nums tracking-tight">{formatCurrency(e.totalAmount)}</p>
                                        <button 
                                            onClick={() => deleteExpense(e.id)}
                                            className="p-3 rounded-xl text-slate-200 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showModal && <AddExpenseModal onClose={() => setShowModal(false)} />}
            </AnimatePresence>
        </div>
    )
}
