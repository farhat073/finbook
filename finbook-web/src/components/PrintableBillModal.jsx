import React, { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../AppContext'
import { Share2, Printer, ArrowLeft, Download, CheckCircle2, IndianRupee } from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { Share } from '@capacitor/share'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Printer as CapPrinter } from '@capgo/capacitor-printer'
import jsPDF from 'jspdf'
import { cn } from '../lib/utils'

function numberToWords(num) {
    if (num === 0) return 'Zero Rupees Only'
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen ']
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
    const convert_tens = (n) => {
        if (n < 20) return a[n]
        const digit = n % 10
        if (n < 100) return b[Math.floor(n / 10)] + (digit ? '-' + a[digit] : ' ')
    }
    const convert_hundreds = (n) => {
        if (n > 99) return a[Math.floor(n / 100)] + 'Hundred ' + convert_tens(n % 100)
        else return convert_tens(n)
    }
    const getWords = (n) => {
        if (n === 0) return ''
        let res = ''
        if (Math.floor(n / 10000000) > 0) { res += convert_hundreds(Math.floor(n / 10000000)) + 'Crore '; n %= 10000000; }
        if (Math.floor(n / 100000) > 0) { res += convert_hundreds(Math.floor(n / 100000)) + 'Lakh '; n %= 100000; }
        if (Math.floor(n / 1000) > 0) { res += convert_hundreds(Math.floor(n / 1000)) + 'Thousand '; n %= 1000; }
        if (n > 0) { res += convert_hundreds(n) }
        return res
    }
    return getWords(Math.round(num)).trim() + ' Rupees Only'
}

export default function PrintableBillModal({ txn, onBack, formatCurrency }) {
    const { storeProfile, parties } = useApp()
    const isSale = txn.type === 'sale'
    const [isGenerating, setIsGenerating] = useState(false)

    const currentParty = parties?.find(p => p.name === txn.partyName)
    const partyAddress = currentParty?.address

    const items = (txn.billedItems || '').split(',').map((name, i) => {
        const qtys = (txn.billedQty || '').split(',')
        let qty = parseInt(qtys[i] || '1')
        let price = null
        if ((txn.billedItems || '').split(',').length === 1) {
            price = txn.total / qty;
        }
        return { name: name.trim(), qty, price }
    }).filter(i => i.name)

    const totalQty = items.reduce((sum, item) => sum + item.qty, 0)
    const amountPaid = Math.max(isSale ? txn.received || 0 : txn.paidAmt || 0, 0)
    const balanceDue = txn.total - amountPaid

    const printRef = useRef(null)
    const isNative = Capacitor.isNativePlatform()

    const generatePdfDocument = () => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const margin = 15;
        const contentW = pageW - margin * 2;
        let y = margin;
        const fmtPdf = (n) => `Rs. ${Math.abs(Number(n)).toLocaleString('en-IN')}`;

        pdf.setFillColor(16, 185, 129); pdf.rect(0, 0, pageW, 6, 'F'); y += 8;
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(16); pdf.setTextColor(0, 0, 0); pdf.text('TAX INVOICE', pageW / 2, y, { align: 'center' });
        y += 12; pdf.setFontSize(18); pdf.text(storeProfile.name || 'My Business', margin, y);
        y += 6; pdf.setFontSize(10); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(80, 80, 80);
        if (storeProfile.address) { pdf.text(storeProfile.address, margin, y); y += 5; }
        if (storeProfile.phone) { pdf.text(`Ph: ${storeProfile.phone}`, margin, y); y += 5; }
        y += 5; pdf.setDrawColor(200, 200, 200); pdf.setLineWidth(0.3); pdf.line(margin, y, pageW - margin, y);
        y += 8; const rightColX = pageW / 2 + 10;
        pdf.setFontSize(10); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(0, 0, 0); pdf.text('Bill To:', margin, y); pdf.text('Bill Details:', rightColX, y);
        y += 5; pdf.setFont('helvetica', 'normal'); pdf.text(txn.partyName || 'Customer', margin, y); pdf.text(`Date: ${new Date(txn.timestamp || Date.now()).toLocaleDateString('en-IN')}`, rightColX, y);
        y += 5; if (txn.partyPhone) { pdf.text(`Ph: ${txn.partyPhone}`, margin, y); } pdf.text(`Bill No: ${txn.billNo}`, rightColX, y);
        y += 5; if (partyAddress) { const lines = pdf.splitTextToSize(partyAddress, pageW / 2 - margin - 10); pdf.text(lines, margin, y); y += lines.length * 5; }
        y += 5; pdf.setDrawColor(0, 0, 0); pdf.setLineWidth(0.3); pdf.line(margin, y, pageW - margin, y);
        y += 6; pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9);
        const col1 = margin + 5, col2 = margin + 15, col3 = margin + 95, col4 = margin + 125, col5 = margin + 145, col6 = pageW - margin - 5;
        pdf.text('#', col1, y); pdf.text('Item Name', col2, y); pdf.text('HSN/SAC', col3, y); pdf.text('Quantity', col4, y); pdf.text('Price/Unit', col5, y); pdf.text('Amount', col6, y, { align: 'right' });
        y += 3; pdf.line(margin, y, pageW - margin, y); y += 6; pdf.setFont('helvetica', 'normal');
        items.forEach((item, idx) => {
            const amt = item.price ? item.price * item.qty : null;
            pdf.text(`${idx + 1}`, col1, y); pdf.text(item.name, col2, y); pdf.text('-', col3, y, { align: 'center' }); pdf.text(`${item.qty}`, col4, y, { align: 'center' });
            pdf.text(item.price ? fmtPdf(item.price).replace('Rs. ', '') : '-', col5, y, { align: 'right' });
            pdf.text(amt ? fmtPdf(amt).replace('Rs. ', '') : '-', col6, y, { align: 'right' });
            y += 6;
        });
        pdf.setDrawColor(0, 0, 0); pdf.line(margin, y - 2, pageW - margin, y - 2); y += 4;
        pdf.setFont('helvetica', 'bold'); pdf.text('Total', col2, y); pdf.text(`${totalQty}`, col4, y, { align: 'center' }); pdf.text(fmtPdf(txn.total).replace('Rs. ', ''), col6, y, { align: 'right' });
        y += 3; pdf.line(margin, y, pageW - margin, y); y += 8;
        const summaryW = 80, summaryX = pageW - margin - summaryW;
        pdf.setFont('helvetica', 'normal'); pdf.text('Sub Total', summaryX, y); pdf.text(fmtPdf(txn.total), pageW - margin - 5, y, { align: 'right' });
        y += 6; pdf.setFont('helvetica', 'bold'); pdf.text('Total', summaryX, y); pdf.text(fmtPdf(txn.total), pageW - margin - 5, y, { align: 'right' });
        y += 6; pdf.setFont('helvetica', 'normal'); pdf.text('Paid', summaryX, y); pdf.text(fmtPdf(amountPaid), pageW - margin - 5, y, { align: 'right' });
        y += 6; pdf.setFont('helvetica', 'bold'); pdf.text('Balance', summaryX, y); pdf.text(fmtPdf(balanceDue), pageW - margin - 5, y, { align: 'right' });
        y += 10; pdf.setFontSize(9); pdf.setFont('helvetica', 'bold'); pdf.text('Bill Amount in Words:', margin, y); pdf.setFont('helvetica', 'normal'); pdf.text(numberToWords(txn.total), margin, y + 5);
        const footerY = pageH - 45; pdf.setDrawColor(200, 200, 200); pdf.rect(margin, footerY, contentW, 25);
        pdf.setFontSize(8); pdf.setFont('helvetica', 'bold'); pdf.text('Terms & Conditions:', margin + 5, footerY + 8);
        pdf.setFont('helvetica', 'normal'); pdf.text('Thanks for doing business with us!', margin + 5, footerY + 14);
        pdf.setFont('helvetica', 'bold'); pdf.text(`For ${storeProfile.name || 'Business Name'}:`, pageW - margin - 55, footerY + 8);
        pdf.text('Authorized Signatory', pageW - margin - 55, footerY + 20);
        return pdf;
    };

    const handlePrint = async () => {
        setIsGenerating(true)
        try {
            if (isNative) {
                const pdf = generatePdfDocument();
                const base64Data = pdf.output('datauristring').split(',')[1];
                const savedFile = await Filesystem.writeFile({ path: `Print_${txn.billNo}.pdf`, data: base64Data, directory: Directory.Cache });
                await CapPrinter.printPdf({ name: `Invoice_${txn.billNo}`, path: savedFile.uri });
            } else {
                window.print();
            }
        } finally { setIsGenerating(false) }
    }

    const handleShare = async () => {
        setIsGenerating(true)
        try {
            const text = `*${storeProfile.name || 'Store'}* Bill #${txn.billNo}\nTotal: ${formatCurrency(txn.total)}\nBalance: ${formatCurrency(balanceDue)}`;
            const pdf = generatePdfDocument();
            if (isNative) {
                const base64Data = pdf.output('datauristring').split(',')[1];
                const savedFile = await Filesystem.writeFile({ path: `Invoice_${txn.billNo}.pdf`, data: base64Data, directory: Directory.Cache });
                await Share.share({ title: `Invoice #${txn.billNo}`, text, url: savedFile.uri });
            } else {
                const pdfBlob = pdf.output('blob');
                const file = new File([pdfBlob], `Invoice_${txn.billNo}.pdf`, { type: 'application/pdf' });
                if (navigator.canShare?.({ files: [file] })) { await navigator.share({ title: `Invoice #${txn.billNo}`, text, files: [file] }); }
                else { pdf.save(`Invoice_${txn.billNo}.pdf`); }
            }
        } finally { setIsGenerating(false) }
    }

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-hidden relative">
            {/* Header */}
            <header className="shrink-0 bg-white border-b border-slate-100 px-4 py-4 lg:px-8 flex items-center justify-between shadow-sm z-20 print:hidden">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack}
                        className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-900 hover:text-white transition-all active:scale-90"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 tracking-tight">Invoice Details</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bill No: #{txn.billNo}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleShare}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-all disabled:opacity-50"
                    >
                        <Share2 size={16} strokeWidth={3} /> {isGenerating ? 'Wait...' : 'Share'}
                    </button>
                    <button 
                        onClick={handlePrint}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                        <Printer size={16} strokeWidth={3} /> {isGenerating ? 'Wait...' : 'Print'}
                    </button>
                </div>
            </header>

            {/* Preview Area */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-8 no-scrollbar bg-slate-100/50 print:bg-white print:p-0">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Status Info */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center justify-between print:hidden">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center",
                                balanceDue <= 0 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                            )}>
                                {balanceDue <= 0 ? <CheckCircle2 size={24} /> : <IndianRupee size={24} />}
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900">
                                    {balanceDue <= 0 ? 'Fully Paid' : 'Payment Pending'}
                                </h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                    Total: {formatCurrency(txn.total)}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Due Balance</p>
                            <p className={cn(
                                "text-xl font-black tabular-nums tracking-tighter",
                                balanceDue <= 0 ? "text-emerald-600" : "text-rose-600"
                            )}>
                                {formatCurrency(balanceDue)}
                            </p>
                        </div>
                    </div>

                    {/* Paper Preview */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white shadow-2xl rounded-sm mx-auto overflow-hidden print:shadow-none print:rounded-none" 
                        style={{ minHeight: '1100px', width: '100%', maxWidth: '800px' }}
                        ref={printRef}
                    >
                        {/* THE BILL CONTENT - KEPT THE SAME FOR PDF FIDELITY */}
                        <div className="h-2 w-full bg-emerald-500" />
                        <div className="p-10 lg:p-14 space-y-10">
                            <div className="text-center">
                                <h2 className="text-xl font-black uppercase tracking-[0.3em] text-slate-900">Tax Invoice</h2>
                            </div>

                            <div className="flex flex-col md:flex-row justify-between gap-8">
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{storeProfile.name || 'Business Name'}</h1>
                                    <div className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs">
                                        {storeProfile.address && <p>{storeProfile.address}</p>}
                                        {storeProfile.phone && <p>Ph: {storeProfile.phone}</p>}
                                    </div>
                                </div>
                                <div className="md:text-right space-y-4 pt-2">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bill Details</p>
                                        <div className="text-sm font-bold text-slate-900 space-y-1">
                                            <p><span className="text-slate-400 font-medium">Invoice No:</span> #{txn.billNo}</p>
                                            <p><span className="text-slate-400 font-medium">Date:</span> {new Date(txn.timestamp || Date.now()).toLocaleDateString('en-IN')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bill To</p>
                                    <p className="text-lg font-black text-slate-900">{txn.partyName}</p>
                                    <div className="text-sm text-slate-500 font-medium leading-relaxed">
                                        {txn.partyPhone && <p>Ph: {txn.partyPhone}</p>}
                                        {partyAddress && <p>{partyAddress}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="border-y-2 border-slate-900">
                                        <tr>
                                            <th className="py-4 font-black uppercase tracking-widest text-[10px]">#</th>
                                            <th className="py-4 font-black uppercase tracking-widest text-[10px]">Description</th>
                                            <th className="py-4 text-center font-black uppercase tracking-widest text-[10px]">Qty</th>
                                            <th className="py-4 text-right font-black uppercase tracking-widest text-[10px]">Price</th>
                                            <th className="py-4 text-right font-black uppercase tracking-widest text-[10px]">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {items.map((item, i) => (
                                            <tr key={i}>
                                                <td className="py-4 text-slate-400 font-bold">{i + 1}</td>
                                                <td className="py-4 font-bold text-slate-900">{item.name}</td>
                                                <td className="py-4 text-center font-bold text-slate-900">{item.qty}</td>
                                                <td className="py-4 text-right font-bold text-slate-900 tabular-nums">
                                                    {item.price ? formatCurrency(item.price).replace('₹', '') : '-'}
                                                </td>
                                                <td className="py-4 text-right font-black text-slate-900 tabular-nums">
                                                    {item.price ? formatCurrency(item.price * item.qty).replace('₹', '') : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="border-y border-slate-200">
                                        <tr>
                                            <td colSpan={2} className="py-4 font-black text-slate-900">Total Units: {totalQty}</td>
                                            <td colSpan={2} className="py-4 text-right font-bold text-slate-500 uppercase tracking-widest text-[10px]">Grand Total</td>
                                            <td className="py-4 text-right font-black text-slate-900 text-lg tabular-nums">{formatCurrency(txn.total)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <div className="flex flex-col md:flex-row justify-between gap-10 pt-10">
                                <div className="flex-1 space-y-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount in Words</p>
                                        <p className="text-sm font-bold text-slate-900 italic underline decoration-slate-200 underline-offset-4">{numberToWords(txn.total)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Instructions</p>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{storeProfile.paymentInstructions || 'Please clear your dues as per agreed terms.'}</p>
                                    </div>
                                </div>

                                <div className="w-full md:w-64 space-y-4">
                                    <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                                        <span>Sub Total</span>
                                        <span className="tabular-nums">{formatCurrency(txn.total)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-black text-emerald-600">
                                        <span>Amount Paid</span>
                                        <span className="tabular-nums">{formatCurrency(amountPaid)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-lg font-black text-slate-900 pt-2 border-t border-slate-100">
                                        <span>Balance</span>
                                        <span className={cn("tabular-nums", balanceDue > 0 ? "text-rose-600" : "text-emerald-600")}>{formatCurrency(balanceDue)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-end pt-20">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Terms</p>
                                    <p className="text-[10px] text-slate-300 font-medium">This is a computer generated invoice.</p>
                                </div>
                                <div className="text-center space-y-12">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Authorized Signatory</p>
                                    <div className="w-40 h-px bg-slate-900 mx-auto" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{storeProfile.name}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="h-20 print:hidden" />
                </div>
            </div>
        </div>
    )
}
