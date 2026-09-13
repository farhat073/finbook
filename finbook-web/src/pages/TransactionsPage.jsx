import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    FileText, Search, Trash2, Plus, X, 
    ArrowRight, ChevronRight, Filter, Download, 
    User, ShoppingBag, Receipt, IndianRupee, 
    Calendar, Tag, Clock, CheckCircle2, AlertCircle
} from 'lucide-react'
import { useApp } from '../AppContext'
import { cn, formatCurrency } from '../lib/utils'

function AddModal({ onClose, onSave, defaultParty, defaultType }) {
    const { parties, items: inventoryItems, addParty, transactions } = useApp()
    
    const [form, setForm] = useState({
        billNo: '',
        isManualParty: true,
        partyName: defaultParty || '',
        partyPhone: '',
        partyAddress: '',
        type: defaultType || 'sale',
        items: [{ itemId: '', name: '', qty: '', price: '' }],
        paidAmt: '',
        received: ''
    })
    
    const [errors, setErrors] = useState({})
    const [showPartyDropdown, setShowPartyDropdown] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const setLineItem = (i, k, v) => {
        const arr = [...form.items]
        arr[i] = { ...arr[i], [k]: v }
        setForm(f => ({ ...f, items: arr }))
    }

    const addFromInventory = (invId) => {
        if (!invId) return
        const selectedInvItem = inventoryItems.find(inv => inv.id.toString() === invId)
        if (selectedInvItem) {
            const newItem = {
                itemId: selectedInvItem.id,
                name: selectedInvItem.name,
                qty: 1,
                price: form.type === 'sale' ? selectedInvItem.salePrice : selectedInvItem.purchasePrice
            }
            const lastItem = form.items[form.items.length - 1]
            if (form.items.length === 1 && !lastItem.name && !lastItem.price) {
                setForm(f => ({ ...f, items: [newItem] }))
            } else {
                setForm(f => ({ ...f, items: [...f.items, newItem] }))
            }
        }
    }

    const removeLineItem = (index) => {
        setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== index) }))
    }

    const total = form.items.reduce((s, item) => s + (parseFloat(item.qty || 0) * parseFloat(item.price || 0)), 0)

    const submit = async () => {
        const validItems = form.items.filter(i => i.name)
        const newErrors = {}
        if (!form.billNo) newErrors.billNo = true
        if (!form.partyName) newErrors.partyName = true
        if (validItems.length === 0) newErrors.items = true

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setIsSubmitting(true)
        try {
            if (form.isManualParty) {
                const existing = parties.find(p => p.name.toLowerCase() === form.partyName.toLowerCase())
                if (!existing && addParty) {
                    await addParty({ name: form.partyName, phone: form.partyPhone || '', address: form.partyAddress || '', amount: 0 })
                }
            }

            await onSave({
                billNo: parseInt(form.billNo),
                type: form.type,
                partyName: form.partyName,
                partyPhone: form.isManualParty ? form.partyPhone : parties.find(p => p.name === form.partyName)?.phone,
                billedItems: validItems.map(i => i.name).join(','),
                billedQty: validItems.map(i => i.qty || 0).join(','),
                paidAmt: parseFloat(form.paidAmt || 0),
                received: parseFloat(form.received || 0),
                total
            })
            onClose()
        } finally {
            setIsSubmitting(false)
        }
    }

    const autoGenerateBillNo = () => {
        const todayStr = new Date().toISOString().slice(2, 10).replace(/-/g, '')
        const todayCount = transactions.filter(t => new Date(t.timestamp || Date.now()).toDateString() === new Date().toDateString()).length
        const nextSeq = (todayCount + 1).toString().padStart(2, '0')
        set('billNo', `${todayStr}${nextSeq}`)
        setErrors(err => ({ ...err, billNo: false }))
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Modal Header */}
                <div className="p-8 pb-4 border-b border-slate-50 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Transaction</h2>
                        <p className="text-sm text-slate-500 font-medium">Record a sale or purchase entry</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Type</label>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                {['sale', 'purchase'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => set('type', t)}
                                        className={cn(
                                            "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                            form.type === t 
                                                ? "bg-white text-slate-900 shadow-sm" 
                                                : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className={cn(
                                "text-[10px] font-bold uppercase tracking-widest ml-1",
                                errors.billNo ? "text-rose-500" : "text-slate-400"
                            )}>Bill Number *</label>
                            <div className="flex gap-2">
                                <input 
                                    className={cn(
                                        "flex-1 bg-slate-50 border-2 px-4 py-2.5 rounded-xl text-sm font-bold outline-none transition-all",
                                        errors.billNo ? "border-rose-100 bg-rose-50 text-rose-900" : "border-slate-50 focus:bg-white focus:border-primary/20"
                                    )}
                                    placeholder="e.g. 1001" 
                                    value={form.billNo} 
                                    onChange={e => { set('billNo', e.target.value); setErrors(err => ({ ...err, billNo: false })) }} 
                                />
                                <button 
                                    onClick={autoGenerateBillNo}
                                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Auto
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Customer Selection */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className={cn(
                                "text-[10px] font-bold uppercase tracking-widest ml-1",
                                errors.partyName ? "text-rose-500" : "text-slate-400"
                            )}>Customer / Party *</label>
                            <button 
                                onClick={() => { setForm(f => ({ ...f, isManualParty: !f.isManualParty, partyName: '', partyPhone: '', partyAddress: '' })); setErrors(err => ({ ...err, partyName: false })) }}
                                className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider"
                            >
                                {form.isManualParty ? 'Select Saved' : '+ Manual Entry'}
                            </button>
                        </div>

                        {form.isManualParty ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input 
                                    className={cn(
                                        "bg-slate-50 border-2 px-4 py-3 rounded-xl text-sm font-bold outline-none transition-all",
                                        errors.partyName ? "border-rose-100 bg-rose-50 text-rose-900" : "border-slate-50 focus:bg-white focus:border-primary/20"
                                    )}
                                    placeholder="Name" 
                                    value={form.partyName} 
                                    onChange={e => { set('partyName', e.target.value); setErrors(err => ({ ...err, partyName: false })) }} 
                                />
                                <input 
                                    className="bg-slate-50 border-2 border-slate-50 px-4 py-3 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-primary/20 transition-all"
                                    placeholder="Phone (optional)" 
                                    type="tel" 
                                    value={form.partyPhone} 
                                    onChange={e => set('partyPhone', e.target.value.replace(/[^0-9+\- ]/g, ''))} 
                                />
                            </div>
                        ) : (
                            <div className="relative">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    className={cn(
                                        "w-full bg-slate-50 border-2 pl-12 pr-4 py-3 rounded-xl text-sm font-bold outline-none transition-all",
                                        errors.partyName ? "border-rose-100 bg-rose-50 text-rose-900" : "border-slate-50 focus:bg-white focus:border-primary/20"
                                    )}
                                    placeholder="Search customers..."
                                    value={form.partyName}
                                    onFocus={() => setShowPartyDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowPartyDropdown(false), 200)}
                                    onChange={e => { set('partyName', e.target.value); setErrors(err => ({ ...err, partyName: false })); setShowPartyDropdown(true) }}
                                />
                                <AnimatePresence>
                                    {showPartyDropdown && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 max-h-48 overflow-y-auto no-scrollbar"
                                        >
                                            {parties.filter(p => p.name.toLowerCase().includes(form.partyName.toLowerCase())).map(p => (
                                                <button 
                                                    key={p.id}
                                                    onMouseDown={(e) => { e.preventDefault(); set('partyName', p.name); setErrors(err => ({ ...err, partyName: false })); setShowPartyDropdown(false) }}
                                                    className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors text-left"
                                                >
                                                    <span className="text-sm font-bold text-slate-800">{p.name}</span>
                                                    <span className="text-[10px] font-medium text-slate-400">{p.phone}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* Items Table */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className={cn(
                                "text-[10px] font-bold uppercase tracking-widest ml-1",
                                errors.items ? "text-rose-500" : "text-slate-400"
                            )}>Line Items *</label>
                            <div className="relative group">
                                <select 
                                    className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase outline-none cursor-pointer hover:bg-slate-200 transition-colors"
                                    value="" 
                                    onChange={e => { addFromInventory(e.target.value); setErrors(err => ({ ...err, items: false })) }}
                                >
                                    <option value="">+ From Inventory</option>
                                    {inventoryItems.map(inv => (
                                        <option key={inv.id} value={inv.id}>{inv.name} (₹{form.type === 'sale' ? inv.salePrice : inv.purchasePrice})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {form.items.map((item, i) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                    key={i} 
                                    className="flex items-center gap-2 group"
                                >
                                    <input 
                                        className="flex-[2.5] bg-slate-50 border-2 border-slate-50 px-3 py-2.5 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-primary/10 transition-all min-w-0" 
                                        placeholder="Item name" 
                                        value={item.name} 
                                        onChange={e => { setLineItem(i, 'name', e.target.value); setErrors(err => ({ ...err, items: false })) }} 
                                    />
                                    <input 
                                        className="flex-1 bg-slate-50 border-2 border-slate-50 px-3 py-2.5 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-primary/10 transition-all text-center min-w-0" 
                                        placeholder="Qty" type="number" 
                                        value={item.qty} 
                                        onChange={e => setLineItem(i, 'qty', e.target.value)} 
                                    />
                                    <input 
                                        className="flex-1.5 bg-slate-50 border-2 border-slate-50 px-3 py-2.5 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-primary/10 transition-all text-right min-w-0" 
                                        placeholder="Price" type="number" 
                                        value={item.price} 
                                        onChange={e => setLineItem(i, 'price', e.target.value)} 
                                    />
                                    <div className="flex-1.5 bg-slate-100 px-3 py-2.5 rounded-xl text-sm font-black text-slate-900 text-right tabular-nums min-w-0">
                                        ₹{(parseFloat(item.qty || 0) * parseFloat(item.price || 0)).toFixed(0)}
                                    </div>
                                    {form.items.length > 1 && (
                                        <button onClick={() => removeLineItem(i)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                        <button 
                            onClick={() => setForm(f => ({ ...f, items: [...f.items, { itemId: '', name: '', qty: '', price: '' }] }))}
                            className="w-full py-2 border-2 border-dashed border-slate-100 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:border-slate-200 hover:text-slate-500 transition-all"
                        >
                            + Add Manual Row
                        </button>
                    </div>

                    {/* Totals & Payment */}
                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-8">
                        <div className="text-center sm:text-left">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">Grand Total</p>
                            <h3 className="text-4xl font-black tracking-tighter tabular-nums">{formatCurrency(total)}</h3>
                        </div>
                        <div className="w-full sm:w-auto space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                                {form.type === 'sale' ? 'Amount Received' : 'Amount Paid'}
                            </label>
                            <div className="relative">
                                <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    className="w-full sm:w-48 bg-white/10 border border-white/10 pl-10 pr-4 py-3 rounded-xl text-lg font-black outline-none focus:bg-white/20 transition-all"
                                    placeholder="0" 
                                    type="number"
                                    value={form.type === 'sale' ? form.received : form.paidAmt}
                                    onChange={e => set(form.type === 'sale' ? 'received' : 'paidAmt', e.target.value)} 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-8 pt-4 border-t border-slate-50 flex gap-4 shrink-0">
                    <button onClick={onClose} className="flex-1 py-4 text-sm font-bold text-slate-400 hover:text-slate-600">Cancel</button>
                    <button 
                        disabled={isSubmitting}
                        onClick={submit}
                        className="flex-[2] bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <CheckCircle2 size={20} />}
                        Save Transaction
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

export default function TransactionsPage({ openNew, defaultParty, defaultType, openFilter, globalSearch, onNavigate }) {
    const { transactions, deleteTransaction, addTransaction, getAvatarColor, formatCurrency } = useApp()
    const [filter, setFilter] = useState(openFilter || 'all')
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        if (openNew) setShowModal(true)
    }, [openNew])

    const filtered = transactions.filter(t => {
        const query = globalSearch || search
        if (filter !== 'all' && t.type !== filter) return false
        if (query && !t.partyName.toLowerCase().includes(query.toLowerCase()) && !t.billNo.toString().includes(query)) return false
        return true
    }).reverse()

    const totalSales = transactions.filter(t => t.type === 'sale').reduce((s, t) => s + t.total, 0)
    const totalPurchases = transactions.filter(t => t.type === 'purchase').reduce((s, t) => s + t.total, 0)

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header / Summary */}
            <div className="flex flex-col sm:flex-row items-end justify-between gap-4">
                <div className="w-full sm:w-auto grid grid-cols-2 gap-3">
                    <div className="px-5 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sales Volume</p>
                        <p className="text-lg font-black text-emerald-600 tabular-nums">{formatCurrency(totalSales)}</p>
                    </div>
                    <div className="px-5 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Purchase Volume</p>
                        <p className="text-lg font-black text-rose-600 tabular-nums">{formatCurrency(totalPurchases)}</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="w-full sm:w-auto bg-primary text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={18} strokeWidth={3} />
                    New Entry
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto">
                    {['all', 'sale', 'purchase'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "flex-1 sm:px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                                filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {f === 'all' ? 'All' : f + 's'}
                        </button>
                    ))}
                </div>
                
                {!globalSearch && (
                    <div className="w-full sm:flex-1 relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            placeholder="Search by name or bill number..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                            className="w-full bg-white border border-slate-200 pl-12 pr-4 py-3 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>
                )}
            </div>

            {/* Transactions List */}
            <AnimatePresence mode="wait">
                {filtered.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="py-20 flex flex-col items-center justify-center text-center space-y-4"
                    >
                        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center">
                            <Receipt size={40} className="text-slate-200" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">No transactions recorded</h3>
                            <p className="text-sm text-slate-400 font-medium">Your business entries will appear here</p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden"
                    >
                        <div className="divide-y divide-slate-50">
                            {filtered.map(t => {
                                const balance = t.total - Math.max(t.received || 0, t.paidAmt || 0)
                                const isFullyPaid = balance <= 0
                                
                                return (
                                    <div 
                                        key={t.id} 
                                        onClick={() => onNavigate('bill', { txn: t })}
                                        className="w-full flex items-center gap-5 p-5 hover:bg-slate-50/80 transition-all group cursor-pointer"
                                    >
                                        <div 
                                            className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0",
                                                t.type === 'sale' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                            )}
                                        >
                                            {t.type === 'sale' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-base font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{t.partyName}</h4>
                                                <span className="text-[10px] font-black text-slate-300 tabular-nums">#{t.billNo}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                    <Clock size={12} className="text-slate-300" /> 
                                                    {new Date(t.timestamp || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                </div>
                                                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 max-w-[150px] truncate">
                                                    <Tag size={12} className="text-slate-300" />
                                                    {t.billedItems?.split(',').join(', ')}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <p className={cn(
                                                "text-lg font-black tabular-nums tracking-tight",
                                                t.type === 'sale' ? "text-slate-900" : "text-rose-600"
                                            )}>
                                                {formatCurrency(t.total)}
                                            </p>
                                            <div className={cn(
                                                "flex items-center justify-end gap-1.5 text-[10px] font-bold",
                                                isFullyPaid ? "text-emerald-500" : "text-amber-500"
                                            )}>
                                                {isFullyPaid ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                                {isFullyPaid ? "Paid" : `Pending ${formatCurrency(balance)}`}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); deleteTransaction(t.id); }}
                                                className="p-3 rounded-xl text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <ChevronRight size={20} className="text-slate-100 group-hover:text-slate-300 transition-colors" />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showModal && (
                    <AddModal 
                        onClose={() => setShowModal(false)} 
                        onSave={addTransaction} 
                        defaultParty={defaultParty} 
                        defaultType={defaultType} 
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
