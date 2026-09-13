import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, X, Store, Tag, Phone, MapPin, Mail, Globe, CreditCard, Save } from 'lucide-react'
import { cn } from '../lib/utils'

export default function StoreSettingsModal({ profile, onSave, onClose, onLogout }) {
    const [form, setForm] = useState({ ...profile })

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
                className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-8 pb-4 border-b border-slate-50 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <Store size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Business Profile</h2>
                            <p className="text-sm text-slate-500 font-medium">Manage your store information</p>
                        </div>
                    </div>
                    <button 
                        onClick={onLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
                    >
                        <LogOut size={14} strokeWidth={3} /> Logout
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Store Name</label>
                            <div className="relative">
                                <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input 
                                    className="w-full bg-slate-50 border-2 border-slate-50 pl-12 pr-4 py-3.5 rounded-2xl font-bold outline-none focus:bg-white focus:border-primary/20 transition-all"
                                    value={form.name} 
                                    onChange={e => setForm({ ...form, name: e.target.value })} 
                                    placeholder="e.g. Ram Traders" 
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Tagline</label>
                            <div className="relative">
                                <Tag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input 
                                    className="w-full bg-slate-50 border-2 border-slate-50 pl-12 pr-4 py-3.5 rounded-2xl font-bold outline-none focus:bg-white focus:border-primary/20 transition-all"
                                    value={form.tagline} 
                                    onChange={e => setForm({ ...form, tagline: e.target.value })} 
                                    placeholder="e.g. Smart Business Manager" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input 
                                    className="w-full bg-slate-50 border-2 border-slate-50 pl-12 pr-4 py-3.5 rounded-2xl font-bold outline-none focus:bg-white focus:border-primary/20 transition-all"
                                    value={form.phone} 
                                    onChange={e => setForm({ ...form, phone: e.target.value })} 
                                    placeholder="e.g. +91 9876543210" 
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input 
                                    className="w-full bg-slate-50 border-2 border-slate-50 pl-12 pr-4 py-3.5 rounded-2xl font-bold outline-none focus:bg-white focus:border-primary/20 transition-all"
                                    type="email"
                                    value={form.email} 
                                    onChange={e => setForm({ ...form, email: e.target.value })} 
                                    placeholder="store@example.com" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Store Address</label>
                        <div className="relative">
                            <MapPin size={18} className="absolute left-4 top-4 text-slate-300" />
                            <textarea 
                                className="w-full bg-slate-50 border-2 border-slate-50 pl-12 pr-4 py-4 rounded-2xl font-bold outline-none focus:bg-white focus:border-primary/20 transition-all resize-none"
                                value={form.address} 
                                onChange={e => setForm({ ...form, address: e.target.value })} 
                                placeholder="e.g. 123 Main St, Mumbai" 
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Bank / Payment Details</label>
                        <div className="relative">
                            <CreditCard size={18} className="absolute left-4 top-4 text-slate-300" />
                            <textarea 
                                className="w-full bg-slate-50 border-2 border-slate-50 pl-12 pr-4 py-4 rounded-2xl font-bold outline-none focus:bg-white focus:border-primary/20 transition-all resize-none"
                                value={form.paymentInstructions} 
                                onChange={e => setForm({ ...form, paymentInstructions: e.target.value })} 
                                placeholder="e.g. Pay via Bank Transfer: AC 123456789 IFSC SBIN000123" 
                                rows={2}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 pt-4 border-t border-slate-50 flex gap-4 shrink-0">
                    <button onClick={onClose} className="flex-1 py-4 text-sm font-bold text-slate-400 hover:text-slate-600">Cancel</button>
                    <button 
                        onClick={() => onSave(form)}
                        className="flex-[2] bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Save size={18} strokeWidth={3} />
                        Update Profile
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
