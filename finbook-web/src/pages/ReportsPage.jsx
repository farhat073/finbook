import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    BarChart2, Users, Package, Wallet, FileText, 
    ChevronRight, X, ArrowLeft, TrendingUp, 
    TrendingDown, AlertTriangle, Download, 
    Calendar, Filter, Search, Receipt, ShoppingBag, 
    Layers, CreditCard, Activity, PieChart
} from 'lucide-react'
import { useApp } from '../AppContext'
import { cn, formatCurrency } from '../lib/utils'

const REPORT_GROUPS = [
    {
        id: 'transactions',
        title: 'Transactions',
        description: 'Sales, purchases and financial performance',
        icon: BarChart2,
        color: 'bg-indigo-50 text-indigo-600',
        items: ['Sale Report', 'Purchase Report', 'Daily Book', 'All Transactions', 'Profit & Loss', 'Cashflow', 'Balance Sheet']
    },
    {
        id: 'customers',
        title: 'Customers',
        description: 'Statements and customer analytics',
        icon: Users,
        color: 'bg-emerald-50 text-emerald-600',
        items: ['Customer Statement', 'All Customer Report', 'Customer Report by Items', 'Sale/Purchase by Customer']
    },
    {
        id: 'stock',
        title: 'Inventory',
        description: 'Stock summary and item performance',
        icon: Package,
        color: 'bg-amber-50 text-amber-600',
        items: ['Stock Summary', 'Item Detail Report', 'Low Stock Alert', 'Item Wise Profit & Loss']
    },
    {
        id: 'expenses',
        title: 'Expenses',
        description: 'Detailed analysis of business spend',
        icon: Wallet,
        color: 'bg-rose-50 text-rose-600',
        items: ['Expense Transaction Report', 'Expense Category Report', 'Expense Item Report']
    }
]

function fmtDate(ts) {
    if (!ts) return '—'
    const d = new Date(ts)
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

/* ─── Modern Report Table ────────────────────────── */
function ReportTable({ columns, rows, footer }) {
    return (
        <div className="overflow-x-auto no-scrollbar -mx-5 px-5">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b border-slate-100">
                        {columns.map((col, idx) => (
                            <th key={col.key || idx} className={cn(
                                "py-4 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap",
                                col.align === 'right' ? "text-right" : "text-left"
                            )}>
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="py-20 text-center text-sm font-medium text-slate-400">
                                No data available for this report
                            </td>
                        </tr>
                    ) : rows.map((row, i) => (
                        <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                            {columns.map((col, idx) => (
                                <td key={col.key || idx} className={cn(
                                    "py-4 px-3 text-sm font-bold whitespace-nowrap",
                                    col.align === 'right' ? "text-right tabular-nums" : "text-left",
                                    col.bold ? "text-slate-900" : "text-slate-500",
                                    row._color?.[col.key] && (
                                        row._color[col.key] === 'var(--green)' ? "text-emerald-600" : 
                                        row._color[col.key] === 'var(--red)' ? "text-rose-600" : ""
                                    )
                                )}>
                                    {row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
                {footer && (
                    <tfoot className="border-t-2 border-slate-100 bg-slate-50/50">
                        <tr>
                            {columns.map((col, idx) => (
                                <td key={col.key || idx} className={cn(
                                    "py-4 px-3 text-sm font-black whitespace-nowrap",
                                    col.align === 'right' ? "text-right tabular-nums" : "text-left",
                                    footer._color?.[col.key] && (
                                        footer._color[col.key] === 'var(--green)' ? "text-emerald-600" : 
                                        footer._color[col.key] === 'var(--red)' ? "text-rose-600" : "text-slate-900"
                                    )
                                )}>
                                    {footer[col.key] || ''}
                                </td>
                            ))}
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    )
}

function StatRow({ label, value, color, formatCurrency }) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-slate-50 last:border-none">
            <span className="text-sm font-bold text-slate-500">{label}</span>
            <span className={cn(
                "text-lg font-black tabular-nums tracking-tight",
                color === 'var(--green)' ? "text-emerald-600" : color === 'var(--red)' ? "text-rose-600" : "text-slate-900"
            )}>
                {formatCurrency(value)}
            </span>
        </div>
    )
}

export default function ReportsPage() {
    const { 
        parties, items, transactions, expenses, totalSale, 
        totalPurchase, totalExpenses, totalToGet, totalToGive, 
        formatCurrency, getAvatarColor 
    } = useApp()
    
    const [selectedReport, setSelectedReport] = useState(null)
    const [selectedParty, setSelectedParty] = useState(null)
    const [selectedItem, setSelectedItem] = useState(null)

    const closeModal = useCallback(() => {
        setSelectedReport(null)
        setSelectedParty(null)
        setSelectedItem(null)
    }, [])

    function renderReportContent(name) {
        switch (name) {
            case 'Sale Report': {
                const sales = [...transactions].filter(t => t.type === 'sale').sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                const total = sales.reduce((s, t) => s + t.total, 0)
                return <ReportTable
                    columns={[
                        { key: 'date', label: 'Date' },
                        { key: 'party', label: 'Customer', bold: true },
                        { key: 'bill', label: 'Bill#' },
                        { key: 'amount', label: 'Amount', align: 'right', bold: true },
                    ]}
                    rows={sales.map(t => ({
                        date: fmtDate(t.timestamp),
                        party: t.partyName,
                        bill: `#${t.billNo}`,
                        amount: formatCurrency(t.total),
                        _color: { amount: 'var(--green)' }
                    }))}
                    footer={{ date: 'Total', amount: formatCurrency(total), _color: { amount: 'var(--green)' } }}
                />
            }

            case 'Profit & Loss': {
                const netProfit = totalSale - totalPurchase - totalExpenses
                return (
                    <div className="space-y-4">
                        <div className="bg-slate-50 p-6 rounded-3xl space-y-2">
                            <StatRow label="Gross Sales" value={totalSale} color="var(--green)" formatCurrency={formatCurrency} />
                            <StatRow label="Direct Purchases" value={totalPurchase} color="var(--red)" formatCurrency={formatCurrency} />
                            <StatRow label="Operating Expenses" value={totalExpenses} color="var(--red)" formatCurrency={formatCurrency} />
                        </div>
                        <div className="flex items-center justify-between p-8 bg-slate-900 rounded-[2.5rem] text-white">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Net Earnings</p>
                                <h3 className="text-3xl font-black tabular-nums tracking-tighter">
                                    {netProfit >= 0 ? '+' : '-'}{formatCurrency(Math.abs(netProfit))}
                                </h3>
                            </div>
                            <div className={cn(
                                "w-16 h-16 rounded-full flex items-center justify-center",
                                netProfit >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                            )}>
                                {netProfit >= 0 ? <TrendingUp size={32} /> : <TrendingDown size={32} />}
                            </div>
                        </div>
                    </div>
                )
            }

            case 'Cashflow': {
                const moneyIn = totalSale
                const moneyOut = totalPurchase + totalExpenses
                const net = moneyIn - moneyOut
                return (
                    <div className="space-y-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-1">Inflow</p>
                            <div className="bg-emerald-50/50 p-6 rounded-3xl">
                                <StatRow label="Sales Revenue" value={totalSale} color="var(--green)" formatCurrency={formatCurrency} />
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-1">Outflow</p>
                            <div className="bg-rose-50/50 p-6 rounded-3xl space-y-2">
                                <StatRow label="Purchase Costs" value={totalPurchase} color="var(--red)" formatCurrency={formatCurrency} />
                                <StatRow label="Expenses" value={totalExpenses} color="var(--red)" formatCurrency={formatCurrency} />
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between px-2">
                            <span className="text-base font-black text-slate-900">Net Movement</span>
                            <span className={cn(
                                "text-2xl font-black tabular-nums",
                                net >= 0 ? "text-emerald-600" : "text-rose-600"
                            )}>
                                {net >= 0 ? '+' : '-'}{formatCurrency(Math.abs(net))}
                            </span>
                        </div>
                    </div>
                )
            }

            case 'Balance Sheet': {
                const net = totalToGet - totalToGive
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-6 rounded-3xl">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Current Assets</p>
                                <StatRow label="Receivable" value={totalToGet} color="var(--green)" formatCurrency={formatCurrency} />
                            </div>
                            <div className="bg-slate-50 p-6 rounded-3xl">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Liabilities</p>
                                <StatRow label="Payable" value={totalToGive} color="var(--red)" formatCurrency={formatCurrency} />
                            </div>
                        </div>
                        <div className="p-8 bg-primary rounded-[2.5rem] text-white flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Owner Equity (Est.)</p>
                                <h3 className="text-3xl font-black tabular-nums tracking-tighter">{formatCurrency(net)}</h3>
                            </div>
                            <PieChart size={40} className="text-white/20" />
                        </div>
                    </div>
                )
            }

            case 'Daily Book': {
                const sorted = [...transactions].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                const grouped = {}
                sorted.forEach(t => {
                    const key = fmtDate(t.timestamp)
                    if (!grouped[key]) grouped[key] = []
                    grouped[key].push(t)
                })
                return (
                    <div className="space-y-8">
                        {Object.entries(grouped).map(([date, txns]) => (
                            <div key={date}>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-3 mb-4">{date}</div>
                                <div className="space-y-1">
                                    {txns.map(t => (
                                        <div key={t.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                                    {t.type === 'sale' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-800">{t.partyName}</div>
                                                    <div className="text-[10px] font-medium text-slate-400">Bill #{t.billNo} • {t.type}</div>
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "text-sm font-black tabular-nums",
                                                t.type === 'sale' ? "text-emerald-600" : "text-rose-600"
                                            )}>
                                                {t.type === 'sale' ? '+' : '-'}{formatCurrency(t.total)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }

            case 'Customer Statement': {
                if (!selectedParty) {
                    return (
                        <div className="space-y-2">
                            {parties.map(p => (
                                <button 
                                    key={p.id} 
                                    onClick={() => setSelectedParty(p.name)}
                                    className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all text-left group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold group-hover:bg-primary group-hover:text-white transition-all">
                                        {p.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-slate-800">{p.name}</div>
                                        <div className="text-[10px] font-medium text-slate-400">{p.phone}</div>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                                </button>
                            ))}
                        </div>
                    )
                }
                const partyTxns = [...transactions].filter(t => t.partyName === selectedParty).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                return (
                    <div className="space-y-6">
                        <button onClick={() => setSelectedParty(null)} className="flex items-center gap-2 text-xs font-bold text-primary hover:gap-3 transition-all">
                            <ArrowLeft size={16} /> Select Different Customer
                        </button>
                        <div className="p-6 bg-slate-50 rounded-[2rem]">
                            <h3 className="text-xl font-black text-slate-900 mb-1">{selectedParty}</h3>
                            <p className="text-xs text-slate-500 font-medium">{partyTxns.length} records found in history</p>
                        </div>
                        <ReportTable
                            columns={[
                                { key: 'date', label: 'Date' },
                                { key: 'type', label: 'Type' },
                                { key: 'bill', label: 'Bill#' },
                                { key: 'amount', label: 'Amount', align: 'right', bold: true },
                            ]}
                            rows={partyTxns.map(t => ({
                                date: fmtDate(t.timestamp),
                                type: t.type.charAt(0).toUpperCase() + t.type.slice(1),
                                bill: `#${t.billNo}`,
                                amount: `${t.type === 'sale' ? '+' : '-'}${formatCurrency(t.total)}`,
                                _color: { amount: t.type === 'sale' ? 'var(--green)' : 'var(--red)' }
                            }))}
                        />
                    </div>
                )
            }

            default:
                return (
                    <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                        <AlertTriangle size={48} className="mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest">Report Detail View coming soon</p>
                    </div>
                )
        }
    }

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
                {!selectedReport ? (
                    <motion.div 
                        key="list"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {REPORT_GROUPS.map((group) => (
                            <div key={group.id} className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">
                                <div className="p-8 border-b border-slate-50 flex items-start gap-5">
                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", group.color)}>
                                        <group.icon size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight">{group.title}</h3>
                                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{group.description}</p>
                                    </div>
                                </div>
                                <div className="flex-1 p-4 space-y-1">
                                    {group.items.map((item) => (
                                        <button
                                            key={item}
                                            onClick={() => setSelectedReport(item)}
                                            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-2xl transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:bg-white transition-all shadow-sm">
                                                    <FileText size={16} />
                                                </div>
                                                <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{item}</span>
                                            </div>
                                            <ChevronRight size={16} className="text-slate-100 group-hover:text-slate-400 transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div 
                        key="detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden"
                    >
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <button 
                                    onClick={closeModal}
                                    className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-900 hover:text-white transition-all active:scale-90"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedReport}</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Financial Report • Internal</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-colors">
                                    <Download size={20} />
                                </button>
                                <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-colors">
                                    <Filter size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="p-8 overflow-y-auto no-scrollbar max-h-[70vh]">
                            {renderReportContent(selectedReport)}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
