import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    ArrowDownLeft, ArrowUpRight, Search, Users, 
    Phone, MapPin, Trash2, Plus, X, ChevronRight, 
    UserPlus, Filter, Download
} from 'lucide-react'
import { useApp } from '../AppContext'
import { cn, formatCurrency } from '../lib/utils'

function AddPartyModal({ onClose }) {
    const { addParty } = useApp()
    const [form, setForm] = useState({ name: '', phone: '', address: '', amount: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
    
    const submit = async () => {
        if (!form.name) return
        setIsSubmitting(true)
        try {
            await addParty({ 
                name: form.name, 
                phone: form.phone, 
                address: form.address, 
                amount: parseFloat(form.amount || 0) 
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
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Add Customer</h2>
                            <p className="text-sm text-slate-500 font-medium">Create a new ledger entry</p>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Customer Name *</label>
                            <input 
                                autoFocus
                                className="w-full bg-slate-50 border-2 border-slate-50 px-5 py-4 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:bg-white focus:border-primary/20 transition-all outline-none"
                                placeholder="e.g. Rajesh Kumar" 
                                value={form.name} 
                                onChange={e => set('name', e.target.value)} 
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input 
                                        className="w-full bg-slate-50 border-2 border-slate-50 pl-12 pr-5 py-4 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:bg-white focus:border-primary/20 transition-all outline-none"
                                        placeholder="10-digit mobile" 
                                        type="tel" 
                                        value={form.phone} 
                                        onChange={e => set('phone', e.target.value.replace(/[^0-9+\- ]/g, ''))} 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Opening Balance</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <input 
                                        className="w-full bg-slate-50 border-2 border-slate-50 pl-10 pr-5 py-4 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:bg-white focus:border-primary/20 transition-all outline-none"
                                        placeholder="0" 
                                        type="number" 
                                        value={form.amount} 
                                        onChange={e => set('amount', e.target.value)} 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Address / City</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input 
                                    className="w-full bg-slate-50 border-2 border-slate-50 pl-12 pr-5 py-4 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:bg-white focus:border-primary/20 transition-all outline-none"
                                    placeholder="City / Area" 
                                    value={form.address} 
                                    onChange={e => set('address', e.target.value)} 
                                />
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
                            disabled={!form.name || isSubmitting}
                            onClick={submit}
                            className="flex-[2] bg-primary text-white py-4 px-6 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <UserPlus size={20} />}
                            Save Customer
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default function PartiesPage({ globalSearch, onSelectParty }) {
    const { parties, getAvatarColor } = useApp()
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)

    const filtered = parties.filter(p => {
        const query = globalSearch || search
        return p.name.toLowerCase().includes(query.toLowerCase())
    })

    const totalToGet = parties.filter(p => p.balance > 0).reduce((s, p) => s + p.balance, 0)
    const totalToGive = parties.filter(p => p.balance < 0).reduce((s, p) => s + Math.abs(p.balance), 0)

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-emerald-50 border border-emerald-100 rounded-[2rem] flex flex-col justify-between"
                >
                    <div>
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm mb-4">
                            <ArrowDownLeft size={20} />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/60 mb-1">Total To Receive</p>
                        <h3 className="text-xl font-black text-emerald-900 tabular-nums">{formatCurrency(totalToGet)}</h3>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 bg-rose-50 border border-rose-100 rounded-[2rem] flex flex-col justify-between"
                >
                    <div>
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-rose-600 shadow-sm mb-4">
                            <ArrowUpRight size={20} />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-rose-600/60 mb-1">Total To Pay</p>
                        <h3 className="text-xl font-black text-rose-900 tabular-nums">{formatCurrency(totalToGive)}</h3>
                    </div>
                </motion.div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                {!globalSearch && (
                    <div className="w-full sm:flex-1 relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            placeholder="Search by name or number..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                            className="w-full bg-white border border-slate-200 pl-12 pr-4 py-3 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>
                )}
                <div className="w-full sm:w-auto flex items-center gap-2">
                    <button className="flex-1 sm:flex-none p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-900 transition-colors">
                        <Filter size={20} />
                    </button>
                    <button className="flex-1 sm:flex-none p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-900 transition-colors">
                        <Download size={20} />
                    </button>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="flex-[2] sm:flex-none bg-primary text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={18} strokeWidth={3} />
                        Add Customer
                    </button>
                </div>
            </div>

            {/* List Section */}
            <AnimatePresence mode="wait">
                {filtered.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="py-20 flex flex-col items-center justify-center text-center space-y-4"
                    >
                        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center">
                            <Users size={40} className="text-slate-200" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">No customers found</h3>
                            <p className="text-sm text-slate-400 font-medium">Try searching for something else or add a new customer.</p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden"
                    >
                        <div className="divide-y divide-slate-50">
                            {filtered.map(party => (
                                <button 
                                    key={party.id} 
                                    onClick={() => onSelectParty && onSelectParty(party.name)}
                                    className="w-full flex items-center gap-4 p-5 hover:bg-slate-50/80 transition-all text-left group"
                                >
                                    <div 
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-sm group-hover:scale-105 transition-transform shrink-0"
                                        style={{ background: getAvatarColor(party.name) }}
                                    >
                                        {party.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-base font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{party.name}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            {party.phone && (
                                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                                                    <Phone size={12} className="text-slate-300" /> {party.phone}
                                                </div>
                                            )}
                                            {party.address && (
                                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 truncate">
                                                    <MapPin size={12} className="text-slate-300" /> {party.address}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={cn(
                                            "text-lg font-black tabular-nums",
                                            party.balance >= 0 ? "text-emerald-600" : "text-rose-600"
                                        )}>
                                            {formatCurrency(party.balance)}
                                        </p>
                                        <div className={cn(
                                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                                            party.balance >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                        )}>
                                            {party.balance >= 0 ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                                            {party.balance >= 0 ? "Receive" : "Pay"}
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-slate-200 ml-2 group-hover:text-slate-400 transition-colors" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showModal && <AddPartyModal onClose={() => setShowModal(false)} />}
            </AnimatePresence>
        </div>
    )
}
