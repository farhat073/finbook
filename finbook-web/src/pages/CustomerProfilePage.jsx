import React, { useMemo, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    ArrowLeft, ArrowDownLeft, ArrowUpRight, Phone, MapPin, 
    User, Trash2, Share2, MessageCircle, FileText, Pencil, 
    X, Mail, IndianRupee, Clock, CheckCircle2, AlertCircle, 
    Send, MoreVertical, Download, ShoppingCart, Plus
} from 'lucide-react'
import { useApp } from '../AppContext'
import jsPDF from 'jspdf'
import { Capacitor } from '@capacitor/core'
import { cn, formatCurrency } from '../lib/utils'

export default function CustomerProfilePage({ partyName, onBack, onNavigate }) {
    const { 
        transactions, parties, getAvatarColor, deleteParty, 
        updateParty, addTransaction, storeProfile 
    } = useApp()

    const [paymentAmt, setPaymentAmt] = useState('')
    const [showEditModal, setShowEditModal] = useState(false)
    const [editForm, setEditForm] = useState({ phone: '', email: '', address: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const chatEndRef = useRef(null)

    useEffect(() => {
        const timeout = setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
        return () => clearTimeout(timeout)
    }, [transactions])

    const party = parties.find(p => p.name === partyName)
    const partyTxns = useMemo(() =>
        [...transactions]
            .filter(t => t.partyName === partyName)
            .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)),
        [transactions, partyName]
    )

    const totalSale = partyTxns.filter(t => t.type === 'sale').reduce((s, t) => s + t.total, 0)
    const totalPayments = partyTxns.filter(t => t.type === 'payment-in').reduce((s, t) => s + t.total, 0)
    const balance = party?.balance || 0

    const submitPayment = async (type) => {
        const amt = parseFloat(paymentAmt)
        if (!amt || amt <= 0) return
        setIsSubmitting(true)
        try {
            await addTransaction({
                billNo: Date.now().toString().slice(-6),
                type: type,
                partyName: partyName,
                billedItems: type === 'payment-in' ? 'Payment Received' : 'Payment Given',
                billedQty: '',
                paidAmt: type === 'payment-out' ? amt : 0,
                received: type === 'payment-in' ? amt : 0,
                total: amt
            })
            setPaymentAmt('')
        } finally {
            setIsSubmitting(false)
        }
    }

    function fmtDate(ts) {
        if (!ts) return ''
        const d = new Date(ts)
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    function fmtTime(ts) {
        if (!ts) return ''
        const d = new Date(ts)
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }

    const grouped = useMemo(() => {
        const g = {}
        partyTxns.forEach(t => {
            const key = fmtDate(t.timestamp)
            if (!g[key]) g[key] = []
            g[key].push(t)
        })
        return g
    }, [partyTxns])

    const handleShareLedger = async () => {
        const storeName = storeProfile?.name || 'My Store'
        let text = `*Account Statement*\n`
        text += `*Store:* ${storeName}\n`
        text += `*Customer:* ${partyName}\n\n`
        text += `*Total Purchases:* ${formatCurrency(totalSale)}\n`
        text += `*Total Payments:* ${formatCurrency(totalPayments)}\n`
        text += `*Net Balance:* ${balance >= 0 ? '+' : '-'}${formatCurrency(Math.abs(balance))}\n\n`
        text += `*Recent Activity:*\n`
        const recent = [...partyTxns].reverse().slice(0, 5)
        recent.forEach(t => {
            text += `- ${fmtDate(t.timestamp)}: ${t.type === 'sale' ? 'Sale' : 'Payment'} ${formatCurrency(t.total)}\n`
        })
        text += `\nShared via Finbook`

        if (navigator.share) {
            try {
                await navigator.share({ title: `Statement: ${partyName}`, text });
            } catch (err) { }
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        }
    }

    const handleSendReminder = () => {
        if (balance <= 0) return
        const amount = formatCurrency(Math.abs(balance))
        const storeName = storeProfile?.name || 'Our Store'
        
        const ledgerData = {
            storeName, customerName: partyName, totalSale, totalPaid: totalPayments,
            balance: Math.abs(balance), generatedAt: new Date().toISOString()
        }
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(ledgerData))))
        const ledgerUrl = `${window.location.origin}/#ledger=${encoded}`

        const msg = `*${storeName}* reminder: *${amount}* is pending in your account.\n\nDear ${partyName}, please clear your dues. 📄 Details: ${ledgerUrl}\n\nThank you! 🙏`

        if (party?.phone) {
            const phone = party.phone.replace(/[^0-9]/g, '')
            const fullPhone = phone.startsWith('91') ? phone : `91${phone}`
            window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`, '_blank')
        } else {
            navigator.clipboard?.writeText(msg);
            alert('Reminder link copied to clipboard!');
        }
    }

    const handleDownloadStatement = async () => {
        const pdf = new jsPDF('p', 'mm', 'a4')
        const pageW = pdf.internal.pageSize.getWidth()
        const margin = 20
        let y = margin
        const fmtPdf = (n) => `Rs. ${Math.abs(Number(n)).toLocaleString('en-IN')}`

        pdf.setFontSize(22); pdf.setTextColor(99, 102, 241); pdf.text('FINBOOK', margin, y);
        y += 8; pdf.setFontSize(10); pdf.setTextColor(100, 100, 100); pdf.text('BUSINESS STATEMENT', margin, y);
        if (storeProfile?.name) pdf.text(storeProfile.name.toUpperCase(), pageW - margin, y, { align: 'right' });
        y += 10; pdf.setDrawColor(226, 232, 240); pdf.line(margin, y, pageW - margin, y);
        y += 12; pdf.setFontSize(14); pdf.setTextColor(15, 23, 42); pdf.text(`Customer: ${partyName}`, margin, y);
        y += 6; pdf.setFontSize(10); pdf.setTextColor(100, 100, 100);
        if (party?.phone) { pdf.text(`Phone: ${party.phone}`, margin, y); y += 5; }
        if (party?.address) { pdf.text(`Address: ${party.address}`, margin, y); y += 5; }
        y += 10; pdf.setFillColor(248, 250, 252); pdf.roundedRect(margin, y, pageW - margin * 2, 20, 3, 3, 'F');
        y += 8; pdf.setFontSize(9); pdf.setTextColor(148, 163, 184); pdf.text('TOTAL SALE', margin + 10, y);
        pdf.text('TOTAL PAYMENTS', margin + 60, y); pdf.text('CURRENT BALANCE', margin + 110, y);
        y += 6; pdf.setFontSize(12); pdf.setTextColor(15, 23, 42); pdf.text(fmtPdf(totalSale), margin + 10, y);
        pdf.text(fmtPdf(totalPayments), margin + 60, y);
        pdf.setTextColor(balance < 0 ? [225, 29, 72] : [16, 185, 129]);
        pdf.text(`${balance < 0 ? 'Due: ' : 'Adv: '}${fmtPdf(Math.abs(balance))}`, margin + 110, y);
        y += 15;

        const cols = ['DATE', 'TYPE', 'PARTICULARS', 'TOTAL', 'PAID', 'BAL'];
        pdf.setFontSize(8); pdf.setTextColor(148, 163, 184);
        const cw = (pageW - margin * 2) / cols.length;
        cols.forEach((c, i) => pdf.text(c, margin + i * cw, y));
        y += 4; pdf.line(margin, y, pageW - margin, y); y += 6;

        let rBal = 0;
        partyTxns.forEach(t => {
            if (y > 270) { pdf.addPage(); y = margin; }
            if (t.type === 'sale') rBal -= (t.total - (t.received || 0));
            else if (t.type === 'purchase') rBal += (t.total - (t.paidAmt || 0));
            else if (t.type === 'payment-in') rBal += t.total;
            else if (t.type === 'payment-out') rBal -= t.total;

            pdf.setTextColor(71, 85, 105);
            pdf.text(fmtDate(t.timestamp), margin, y);
            pdf.text(t.type.toUpperCase(), margin + cw, y);
            pdf.text(t.billedItems?.substring(0, 20) || '-', margin + cw * 2, y);
            pdf.text(fmtPdf(t.total), margin + cw * 3, y);
            pdf.text(fmtPdf(t.type === 'sale' ? (t.received || 0) : (t.type === 'purchase' ? (t.paidAmt || 0) : t.total)), margin + cw * 4, y);
            pdf.setTextColor(rBal >= 0 ? [16, 185, 129] : [225, 29, 72]);
            pdf.text(fmtPdf(Math.abs(rBal)), margin + cw * 5, y);
            y += 8;
        });

        if (Capacitor.isNativePlatform()) {
            const pdfOutput = pdf.output('datauristring');
            const base64 = pdfOutput.split(',')[1];
            try {
                const { Filesystem, Directory } = await import('@capacitor/filesystem');
                const { Share } = await import('@capacitor/share');
                const fileName = `Finbook_${partyName}_Stmt.pdf`;
                const res = await Filesystem.writeFile({ path: fileName, data: base64, directory: Directory.Cache });
                await Share.share({ title: 'Statement', url: res.uri });
            } catch (err) { }
        } else {
            pdf.save(`Finbook_${partyName}_Stmt.pdf`);
        }
    }

    const handleSaveEdit = async () => {
        if (party?.id) {
            await updateParty(party.id, {
                phone: editForm.phone,
                email: editForm.email,
                address: editForm.address
            })
        }
        setShowEditModal(false)
    }

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-hidden relative">
            {/* Elegant Header */}
            <header className="shrink-0 bg-white border-b border-slate-100 px-4 py-4 lg:px-8 shadow-sm z-20">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <button 
                            onClick={onBack}
                            className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-900 hover:text-white transition-all active:scale-90"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-3 min-w-0">
                            <div 
                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-100 shrink-0"
                                style={{ background: getAvatarColor(partyName) }}
                            >
                                {partyName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-lg font-black text-slate-900 truncate tracking-tight">{partyName}</h1>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Ledger</span>
                                    {party?.phone && <div className="w-1 h-1 rounded-full bg-slate-300" />}
                                    <span className="text-[10px] font-bold text-slate-400 truncate">{party?.phone}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleDownloadStatement}
                            className="hidden sm:flex p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        >
                            <Download size={20} />
                        </button>
                        <button 
                            onClick={handleShareLedger}
                            className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                            <Share2 size={20} />
                        </button>
                        <div className="w-px h-6 bg-slate-100 mx-1 hidden sm:block" />
                        <button 
                            onClick={() => {
                                setEditForm({ phone: party?.phone || '', email: party?.email || '', address: party?.address || '' })
                                setShowEditModal(true)
                            }}
                            className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-900 hover:text-white transition-colors"
                        >
                            <Pencil size={20} />
                        </button>
                    </div>
                </div>

                {/* Stat Strip */}
                <div className="max-w-7xl mx-auto grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-50">
                    <div className="text-center group">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lifetime Sale</p>
                        <p className="text-sm font-black text-slate-900 tabular-nums">{formatCurrency(totalSale)}</p>
                    </div>
                    <div className="text-center border-x border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Net Paid</p>
                        <p className="text-sm font-black text-emerald-600 tabular-nums">{formatCurrency(totalPayments)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Balance</p>
                        <p className={cn(
                            "text-sm font-black tabular-nums",
                            balance >= 0 ? "text-indigo-600" : "text-rose-600"
                        )}>
                            {balance >= 0 ? '+' : '-'}{formatCurrency(Math.abs(balance))}
                        </p>
                    </div>
                </div>
            </header>

            {/* Scrollable Ledger */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-4 lg:px-8 py-6">
                <div className="max-w-3xl mx-auto space-y-10 pb-20">
                    <div className="text-center">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-200/50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <Clock size={12} /> Beginning of Ledger
                        </span>
                    </div>

                    {Object.entries(grouped).map(([date, txns]) => (
                        <div key={date} className="space-y-4">
                            <div className="sticky top-0 z-10 flex justify-center">
                                <span className="bg-slate-100/80 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-white/50 shadow-sm">
                                    {date}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {txns.map(t => {
                                    const isSale = t.type === 'sale'
                                    const isPaymentIn = t.type === 'payment-in'
                                    const isPaymentOut = t.type === 'payment-out'
                                    const isPositive = isSale || isPaymentOut
                                    const isPayment = isPaymentIn || isPaymentOut

                                    return (
                                        <motion.div 
                                            initial={{ opacity: 0, x: !isPositive ? 10 : -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            key={t.id} 
                                            className={cn(
                                                "flex w-full",
                                                !isPositive ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            <div 
                                                onClick={() => !isPayment && onNavigate('bill', { txn: t })}
                                                className={cn(
                                                    "max-w-[85%] rounded-[2rem] p-5 shadow-sm border transition-all active:scale-95 group cursor-pointer",
                                                    !isPositive 
                                                        ? "bg-white border-emerald-100 rounded-tr-none hover:shadow-emerald-100" 
                                                        : "bg-white border-rose-100 rounded-tl-none hover:shadow-rose-100"
                                                )}
                                            >
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                                                        !isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                                    )}>
                                                        {!isPositive ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={cn(
                                                            "text-[10px] font-black uppercase tracking-widest",
                                                            !isPositive ? "text-emerald-600" : "text-rose-600"
                                                        )}>
                                                            {isSale ? 'Sale' : isPaymentIn ? 'Payment Received' : isPaymentOut ? 'Payment Given' : 'Purchase'}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-slate-400 tabular-nums">#{t.billNo} • {fmtTime(t.timestamp)}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 mb-4">
                                                    {t.billedItems && (
                                                        <p className="text-sm font-bold text-slate-800 line-clamp-2 leading-relaxed">
                                                            {t.billedItems.split(',').join(', ')}
                                                        </p>
                                                    )}
                                                    <div className="flex items-end justify-between gap-4">
                                                        <p className="text-2xl font-black text-slate-900 tabular-nums tracking-tighter">
                                                            {formatCurrency(t.total)}
                                                        </p>
                                                        {!isPayment && (
                                                            <div className="text-right">
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Paid Amt</p>
                                                                <p className="text-xs font-black text-emerald-600 tabular-nums">{formatCurrency(isSale ? (t.received || 0) : (t.paidAmt || 0))}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="pt-3 border-t border-slate-50 flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", !isPositive ? "bg-emerald-500" : "bg-rose-500")} />
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entry Recorded</span>
                                                    </div>
                                                    {!isPayment && <FileText size={14} className="text-slate-200 group-hover:text-primary transition-colors" />}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}

                    {partyTxns.length === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-20 h-20 rounded-[2.5rem] bg-slate-100 flex items-center justify-center text-slate-300">
                                <Activity size={40} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Clear Slate</h3>
                                <p className="text-sm text-slate-400 font-medium">No transactions have been recorded yet</p>
                            </div>
                        </div>
                    )}

                    <div ref={chatEndRef} className="h-px" />
                </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="shrink-0 bg-white border-t border-slate-100 p-4 lg:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] z-30">
                <div className="max-w-3xl mx-auto">
                    {balance > 0 && (
                        <button 
                            onClick={handleSendReminder}
                            className="w-full mb-4 py-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all active:scale-[0.98]"
                        >
                            <MessageCircle size={16} /> Send Payment Reminder
                        </button>
                    )}
                    
                    <div className="flex items-center gap-3">
                        <div className="flex-1 relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                <IndianRupee size={18} strokeWidth={3} />
                            </div>
                            <input 
                                type="number" 
                                placeholder="Quick Payment..." 
                                value={paymentAmt}
                                onChange={e => setPaymentAmt(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-50 pl-11 pr-4 py-3.5 rounded-[1.25rem] text-sm font-black outline-none focus:bg-white focus:border-indigo-100 transition-all"
                            />
                        </div>
                        <button 
                            disabled={!paymentAmt || isSubmitting}
                            onClick={() => submitPayment('payment-in')}
                            className="bg-emerald-600 text-white px-6 py-4 rounded-[1.25rem] font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} strokeWidth={3} />}
                            Received
                        </button>
                        <button 
                            onClick={() => {
                                onNavigate('transactions', { openNew: true, defaultParty: partyName, defaultType: 'sale' })
                                onBack()
                            }}
                            className="p-4 bg-slate-900 text-white rounded-[1.25rem] shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
                        >
                            <Plus size={20} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showEditModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Customer</h2>
                                        <p className="text-sm text-slate-500 font-medium">Update contact information</p>
                                    </div>
                                    <button onClick={() => setShowEditModal(false)} className="p-2 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                                </div>
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                                        <div className="relative">
                                            <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                            <input className="w-full bg-slate-50 border-2 border-slate-50 pl-12 pr-5 py-4 rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-100 transition-all" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                                        <div className="relative">
                                            <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                            <input className="w-full bg-slate-50 border-2 border-slate-50 pl-12 pr-5 py-4 rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-100 transition-all" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Address / Notes</label>
                                        <div className="relative">
                                            <MapPin size={18} className="absolute left-5 top-4 text-slate-300" />
                                            <textarea rows={3} className="w-full bg-slate-50 border-2 border-slate-50 pl-12 pr-5 py-4 rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-100 transition-all resize-none" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-10 flex gap-4">
                                    <button onClick={() => {
                                        if (window.confirm(`Delete ${partyName} and all related data?`)) { deleteParty(party.id); onBack(); }
                                    }} className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-colors"><Trash2 size={20} /></button>
                                    <button onClick={handleSaveEdit} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95">Save Profile</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
