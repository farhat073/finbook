import React, { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
    ArrowDownLeft, ArrowUpRight, FileText, ShoppingCart, 
    Wallet, TrendingUp, TrendingDown, Users, Package, 
    CreditCard, AlertTriangle, ChevronRight, Plus, 
    Calendar, ArrowRight, IndianRupee
} from 'lucide-react'
import { 
    LineChart, Line, XAxis, Tooltip, ResponsiveContainer, 
    CartesianGrid, Area, AreaChart, YAxis 
} from 'recharts'
import { useApp } from '../AppContext'
import { cn, formatCurrency } from '../lib/utils'

export default function DashboardPage({ onNavigate }) {
    const {
        parties, items, transactions, expenses,
        totalSale, totalPurchase, totalToGet, totalToGive, totalExpenses,
        getAvatarColor, offlineMode
    } = useApp()

    const recentTxns = [...transactions].slice(-5).reverse()
    const netProfit = totalSale - totalPurchase - totalExpenses

    const now = new Date()
    const currentDay = now.getDate()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    
    const chartData = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1
        const sales = transactions.filter(t => {
            if (t.type !== 'sale') return false
            const d = new Date(t.timestamp || Date.now())
            return d.getFullYear() === now.getFullYear() &&
                d.getMonth() === now.getMonth() &&
                d.getDate() === day
        }).reduce((sum, t) => sum + t.total, 0)
        return { name: day, sales, day }
    })

    const salesTillNow = chartData.filter(d => d.day <= currentDay && d.sales > 0).map(d => d.sales)
    const maxSales = salesTillNow.length > 0 ? Math.max(...salesTillNow) : 0

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
                    <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                        <Calendar size={14} /> {now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <button 
                    onClick={() => onNavigate('transactions', { openNew: true })}
                    className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all"
                >
                    <Plus size={18} strokeWidth={3} />
                    New Transaction
                </button>
            </div>

            {offlineMode && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-4"
                >
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle size={20} className="text-amber-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-amber-900">Offline Mode Active</h4>
                        <p className="text-xs text-amber-700 font-medium">Data is currently stored on this device only. Sign in to sync with cloud.</p>
                    </div>
                </motion.div>
            )}

            {/* Bento Grid Layout */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {/* Main Metric Card: Net Profit */}
                <motion.div 
                    variants={itemVariants}
                    className="md:col-span-2 lg:col-span-2 p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <IndianRupee size={120} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Net Business Balance</p>
                        <h2 className={cn(
                            "text-5xl font-black tracking-tighter tabular-nums",
                            netProfit >= 0 ? "text-slate-900" : "text-rose-600"
                        )}>
                            {formatCurrency(netProfit)}
                        </h2>
                    </div>
                    
                    <div className="mt-8 flex items-center gap-2">
                        <div className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5",
                            netProfit >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        )}>
                            {netProfit >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {netProfit >= 0 ? "Profit" : "Loss"}
                        </div>
                        <p className="text-[11px] font-semibold text-slate-400 italic">calculated from all sales & expenses</p>
                    </div>
                </motion.div>

                {/* Balance Cards */}
                <motion.div 
                    variants={itemVariants}
                    onClick={() => onNavigate('parties')}
                    className="p-6 bg-emerald-50 border border-emerald-100 rounded-[2rem] flex flex-col justify-between cursor-pointer hover:shadow-xl hover:shadow-emerald-500/5 transition-all group"
                >
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm mb-4">
                        <ArrowDownLeft size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/60 mb-1">To Receive</p>
                        <h3 className="text-2xl font-black text-emerald-900 tabular-nums">{formatCurrency(totalToGet)}</h3>
                    </div>
                    <div className="mt-4 flex items-center text-emerald-600 text-[11px] font-bold group-hover:gap-2 transition-all">
                        View Customers <ArrowRight size={14} className="ml-1" />
                    </div>
                </motion.div>

                <motion.div 
                    variants={itemVariants}
                    onClick={() => onNavigate('parties')}
                    className="p-6 bg-rose-50 border border-rose-100 rounded-[2rem] flex flex-col justify-between cursor-pointer hover:shadow-xl hover:shadow-rose-500/5 transition-all group"
                >
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-rose-600 shadow-sm mb-4">
                        <ArrowUpRight size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-rose-600/60 mb-1">To Pay</p>
                        <h3 className="text-2xl font-black text-rose-900 tabular-nums">{formatCurrency(totalToGive)}</h3>
                    </div>
                    <div className="mt-4 flex items-center text-rose-600 text-[11px] font-bold group-hover:gap-2 transition-all">
                        View Vendors <ArrowRight size={14} className="ml-1" />
                    </div>
                </motion.div>

                {/* Sales Chart Bento Item */}
                <motion.div 
                    variants={itemVariants}
                    className="md:col-span-2 lg:col-span-3 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Sales Velocity</h3>
                            <p className="text-xs text-slate-500 font-medium">Daily transaction performance for {now.toLocaleString('default', { month: 'short' })}</p>
                        </div>
                        <div className="hidden sm:flex bg-slate-50 p-1 rounded-lg">
                            <div className="px-3 py-1 rounded-md bg-white text-[10px] font-bold text-slate-900 shadow-sm">Daily</div>
                            <div className="px-3 py-1 rounded-md text-[10px] font-bold text-slate-400">Weekly</div>
                        </div>
                    </div>
                    
                    <div className="h-[240px] w-full mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.15} />
                                        <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.01} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                                    interval={window.innerWidth < 768 ? 4 : 2}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                                    tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                                />
                                <Tooltip 
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xl">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Day {payload[0].payload.day}</p>
                                                    <p className="text-sm font-black text-slate-900">{formatCurrency(payload[0].value)}</p>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="sales" 
                                    stroke="var(--primary)" 
                                    strokeWidth={3} 
                                    fill="url(#chartGradient)" 
                                    animationDuration={2000}
                                    activeDot={{ r: 6, fill: "var(--primary)", stroke: "#fff", strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Mini Metric Card: Total Sales */}
                <motion.div 
                    variants={itemVariants}
                    className="bg-slate-900 p-6 rounded-[2rem] text-white flex flex-col justify-between"
                >
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <TrendingUp size={20} />
                        </div>
                        <TrendingUp size={16} className="text-emerald-400" />
                    </div>
                    <div className="mt-8">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Gross Sales</p>
                        <h4 className="text-2xl font-black tabular-nums">{formatCurrency(totalSale)}</h4>
                    </div>
                    <p className="text-[10px] font-medium text-slate-500 mt-2">Lifetime earnings</p>
                </motion.div>

                {/* Business Stats Grid */}
                <motion.div 
                    variants={itemVariants}
                    className="md:col-span-2 lg:col-span-1 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4"
                >
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Quick Stats</h3>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Users size={16} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Parties</p>
                            <p className="text-sm font-black text-slate-800">{parties.length}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <Package size={16} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">In Stock</p>
                            <p className="text-sm font-black text-slate-800">{items.length} items</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                            <Wallet size={16} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Expenses</p>
                            <p className="text-sm font-black text-slate-800">{formatCurrency(totalExpenses)}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Recent Transactions Bento Item */}
                <motion.div 
                    variants={itemVariants}
                    className="md:col-span-2 lg:col-span-3 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
                        <button 
                            onClick={() => onNavigate('transactions')}
                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                        >
                            View Ledger <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className="space-y-1">
                        {recentTxns.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 text-sm font-medium">No transactions found</div>
                        ) : (
                            recentTxns.map((t, idx) => (
                                <div 
                                    key={t.id} 
                                    className={cn(
                                        "flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group",
                                        idx !== recentTxns.length - 1 && "border-b border-slate-50"
                                    )}
                                >
                                    <div 
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm group-hover:scale-105 transition-transform"
                                        style={{ background: getAvatarColor(t.partyName) }}
                                    >
                                        {t.partyName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-slate-800 truncate">{t.partyName}</h4>
                                        <p className="text-[11px] font-medium text-slate-400">Bill #{t.billNo}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn(
                                            "text-sm font-black tabular-nums",
                                            t.type === 'sale' ? "text-emerald-600" : "text-rose-600"
                                        )}>
                                            {t.type === 'sale' ? '+' : '-'}{formatCurrency(t.total)}
                                        </p>
                                        <div className={cn(
                                            "inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider",
                                            t.type === 'sale' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                        )}>
                                            {t.type}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}
