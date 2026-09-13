import React from 'react'
import { motion } from 'framer-motion'
import { Home, Users, ShoppingBag, Plus, ArrowLeftRight, Receipt, PieChart, LayoutDashboard, FileText, TrendingDown, BarChart2, Package } from 'lucide-react'
import { cn } from '../lib/utils'

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'parties', label: 'Parties', icon: Users },
    { id: 'new-txt', label: 'Add', icon: Plus, isAction: true },
    { id: 'transactions', label: 'Sales', icon: FileText },
    { id: 'reports', label: 'Reports', icon: BarChart2 },
]

export default function BottomNav({ currentPath, onNavigate, isScrolled }) {
    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 pb-8 z-40 flex justify-center pointer-events-none">
            <motion.nav 
                initial={false}
                animate={{ 
                    y: isScrolled ? 100 : 0,
                    opacity: isScrolled ? 0 : 1,
                    scale: isScrolled ? 0.95 : 1
                }}
                className={cn(
                    "w-full max-w-md bg-white border border-slate-200 shadow-2xl rounded-2xl flex items-center justify-between px-2 py-2 pointer-events-auto",
                    "backdrop-blur-lg bg-white/90"
                )}
            >
                {NAV_ITEMS.map((item) => {
                    const isActive = currentPath === item.id
                    
                    if (item.isAction) {
                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate('transactions', { openNew: true })}
                                className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30 active:scale-90 transition-transform -mt-10 border-4 border-white"
                            >
                                <Plus size={28} strokeWidth={3} />
                            </button>
                        )
                    }

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={cn(
                                "flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all relative",
                                isActive ? "text-primary" : "text-slate-400"
                            )}
                        >
                            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider relative z-10",
                                isActive ? "opacity-100" : "opacity-0"
                            )}>
                                {item.label}
                            </span>
                            {isActive && (
                                <motion.div 
                                    layoutId="bottomNavActive"
                                    className="absolute inset-0 bg-primary/5 rounded-xl"
                                    transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                                />
                            )}
                        </button>
                    )
                })}
            </motion.nav>
        </div>
    )
}
