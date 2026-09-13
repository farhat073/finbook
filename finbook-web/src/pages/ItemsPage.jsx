import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Package, Search, Trash2, Zap, AlertTriangle, 
    Plus, X, Filter, Download, ChevronRight, 
    Tag, ShoppingBag, Layers, IndianRupee
} from 'lucide-react'
import { useApp } from '../AppContext'
import { cn, formatCurrency } from '../lib/utils'

function AddItemModal({ onClose }) {
    const { addItem } = useApp()
    const [form, setForm] = useState({ name: '', type: 'product', itemCode: '', salePrice: '', purchasePrice: '', stock: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
    
    const submit = async () => {
        if (!form.name || !form.itemCode) return
        setIsSubmitting(true)
        try {
            await addItem({ 
                ...form, 
                salePrice: parseFloat(form.salePrice || 0), 
                purchasePrice: parseFloat(form.purchasePrice || 0), 
                stock: parseFloat(form.stock || 0) 
            })
            onClose()
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden"
            >
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Add New Item</h2>
                            <p className="text-sm text-slate-500 font-medium">Inventory or Service details</p>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-5">
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                            {['product', 'service'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => set('type', t)}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                                        form.type === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    {t === 'product' ? <Package size={14} /> : <Zap size={14} />}
                                    {t}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Item Name *</label>
                            <input 
                                autoFocus
                                className="w-full bg-slate-50 border-2 border-slate-50 px-5 py-4 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:bg-white focus:border-primary/20 transition-all outline-none"
                                placeholder="e.g. Basmati Rice 1kg" 
                                value={form.name} 
                                onChange={e => set('name', e.target.value)} 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Item Code / SKU</label>
                                <div className="relative">
                                    <Tag size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input 
                                        className="w-full bg-slate-50 border-2 border-slate-50 pl-12 pr-5 py-4 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:bg-white focus:border-primary/20 transition-all outline-none"
                                        placeholder="SKU-001" 
                                        value={form.itemCode} 
                                        onChange={e => set('itemCode', e.target.value)} 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Initial Stock</label>
                                <div className="relative">
                                    <Layers size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input 
                                        disabled={form.type === 'service'}
                                        className="w-full bg-slate-50 border-2 border-slate-50 pl-12 pr-5 py-4 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:bg-white focus:border-primary/20 transition-all outline-none disabled:opacity-50"
                                        placeholder="0" 
                                        type="number" 
                                        value={form.stock} 
                                        onChange={e => set('stock', e.target.value)} 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Sale Price</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <input 
                                        className="w-full bg-slate-50 border-2 border-slate-50 pl-10 pr-5 py-4 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:bg-white focus:border-primary/20 transition-all outline-none"
                                        placeholder="0" 
                                        type="number" 
                                        value={form.salePrice} 
                                        onChange={e => set('salePrice', e.target.value)} 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Purchase Price</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <input 
                                        className="w-full bg-slate-50 border-2 border-slate-50 pl-10 pr-5 py-4 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:bg-white focus:border-primary/20 transition-all outline-none"
                                        placeholder="0" 
                                        type="number" 
                                        value={form.purchasePrice} 
                                        onChange={e => set('purchasePrice', e.target.value)} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex gap-4">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-4 px-6 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            disabled={!form.name || !form.itemCode || isSubmitting}
                            onClick={submit}
                            className="flex-[2] bg-primary text-white py-4 px-6 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <Plus size={20} strokeWidth={3} />}
                            Save Item
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default function ItemsPage({ globalSearch }) {
    const { items, deleteItem, formatCurrency } = useApp()
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')
    const [showModal, setShowModal] = useState(false)

    const filtered = items.filter(i => {
        const query = globalSearch || search
        if (filter !== 'all' && i.type !== filter) return false
        if (query && !i.name.toLowerCase().includes(query.toLowerCase()) && !(i.itemCode || '').toLowerCase().includes(query.toLowerCase())) return false
        return true
    })

    const totalStockValue = items.filter(i => i.stock).reduce((s, i) => s + (i.salePrice * i.stock), 0)

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Summary Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 bg-slate-900 rounded-[2.5rem] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Package size={120} />
                </div>
                <div className="relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Inventory Valuation</p>
                    <h2 className="text-4xl font-black tabular-nums tracking-tighter">{formatCurrency(totalStockValue)}</h2>
                    <p className="text-xs text-slate-400 font-medium mt-2">Estimated value based on current stock & sale prices</p>
                </div>
                <div className="relative z-10 flex gap-4">
                    <div className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Items</p>
                        <p className="text-lg font-black">{items.length}</p>
                    </div>
                    <div className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Low Stock</p>
                        <p className="text-lg font-black text-rose-400">{items.filter(i => i.stock < 10 && i.type === 'product').length}</p>
                    </div>
                </div>
            </motion.div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto">
                    {['all', 'product', 'service'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "flex-1 sm:px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                                filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
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
                            placeholder="Search by name or code..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                            className="w-full bg-white border border-slate-200 pl-12 pr-4 py-3 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>
                )}

                <button 
                    onClick={() => setShowModal(true)}
                    className="w-full sm:w-auto bg-primary text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={18} strokeWidth={3} />
                    Add Item
                </button>
            </div>

            {/* Items Grid/List */}
            <AnimatePresence mode="wait">
                {filtered.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="py-20 flex flex-col items-center justify-center text-center space-y-4"
                    >
                        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center">
                            <ShoppingBag size={40} className="text-slate-200" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">No items found</h3>
                            <p className="text-sm text-slate-400 font-medium">Add products or services to start tracking</p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden"
                    >
                        <div className="divide-y divide-slate-50">
                            {filtered.map(item => (
                                <div 
                                    key={item.id} 
                                    className="w-full flex items-center gap-5 p-5 hover:bg-slate-50/80 transition-all group"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-primary transition-all shadow-sm">
                                        {item.type === 'product' ? <Package size={24} /> : <Zap size={24} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-base font-bold text-slate-900 truncate">{item.name}</h4>
                                            <span className="px-1.5 py-0.5 bg-slate-100 text-[9px] font-black uppercase text-slate-400 rounded">#{item.itemCode}</span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1">
                                            <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                                                <span className="text-emerald-600">Sale: {formatCurrency(item.salePrice)}</span>
                                            </div>
                                            <div className="text-[11px] font-bold text-slate-400">
                                                Buy: {formatCurrency(item.purchasePrice)}
                                            </div>
                                            {item.stock != null && item.type === 'product' && (
                                                <div className={cn(
                                                    "flex items-center gap-1.5 text-[11px] font-bold",
                                                    item.stock < 10 ? "text-rose-500" : "text-slate-400"
                                                )}>
                                                    <Layers size={12} /> {item.stock} in stock
                                                    {item.stock < 10 && <AlertTriangle size={12} className="animate-pulse" />}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => deleteItem(item.id)}
                                            className="p-3 rounded-xl text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <ChevronRight size={20} className="text-slate-100 group-hover:text-slate-300 transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showModal && <AddItemModal onClose={() => setShowModal(false)} />}
            </AnimatePresence>
        </div>
    )
}
