import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Settings, WifiOff, Download, RefreshCw, Cloud, Database, 
    LayoutDashboard, Users, Package, FileText, TrendingDown, 
    BarChart2, MessageSquare, Mail, X, ChevronRight, Store 
} from 'lucide-react'
import { cn } from '../lib/utils'

export default function Sidebar({
    currentPath,
    onNavigate,
    storeProfile,
    offlineMode,
    onOpenSettings,
    onGoOnline,
    onDataManagement,
    updateAvailable,
    updateReady,
    isUpdating,
    onUpdateClick,
    onRestartApp,
    sidebarOpen,
    onClose
}) {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'parties', label: 'Customers', icon: Users },
        { id: 'items', label: 'Items', icon: Package },
        { id: 'transactions', label: 'Transactions', icon: FileText },
        { id: 'expenses', label: 'Expenses', icon: TrendingDown },
        { id: 'reports', label: 'Reports', icon: BarChart2 },
    ]

    const optionsItems = [
        { id: 'online', label: 'Go Online', icon: Cloud, action: onGoOnline },
        { id: 'data', label: 'Data Management', icon: Database, action: onDataManagement },
        { id: 'suggest', label: 'Feedback', icon: MessageSquare, action: () => window.location.href = 'mailto:finbooksup@gmail.com' },
        { id: 'contact', label: 'Contact Dev', icon: Mail, action: () => window.location.href = 'mailto:fskp7527@gmail.com' },
    ]

    const isActive = (path) => currentPath === path

    return (
        <>
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            <motion.nav
                initial={false}
                animate={{ x: (sidebarOpen || window.innerWidth >= 1024) ? 0 : '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={cn(
                    "fixed top-0 left-0 bottom-0 w-[280px] bg-white border-r border-slate-200 z-50 flex flex-col",
                    "lg:translate-x-0 lg:static lg:z-0 lg:w-72"
                )}
            >
                {/* Header / Logo */}
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <Store size={24} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-slate-900">Finbook</h1>
                            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Business Manager</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Offline Indicator */}
                {offlineMode && (
                    <div className="mx-6 mb-4 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
                        <WifiOff size={16} className="text-amber-500" />
                        <span className="text-xs font-semibold text-amber-700">Working Offline</span>
                    </div>
                )}

                {/* Store Selector / Profile */}
                <button 
                    onClick={onOpenSettings}
                    className="mx-4 mb-6 p-3 flex items-center gap-3 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100"
                >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                        {storeProfile.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                        <h3 className="text-sm font-bold text-slate-800 truncate">{storeProfile.name}</h3>
                        <p className="text-[11px] text-slate-500 truncate">{storeProfile.tagline || 'Business Profile'}</p>
                    </div>
                    <Settings size={16} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                </button>

                {/* Navigation */}
                <div className="flex-1 px-4 space-y-8 overflow-y-auto no-scrollbar">
                    <div>
                        <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Navigation</p>
                        <div className="space-y-1">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => { onNavigate(item.id); onClose(); }}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group",
                                        isActive(item.id) 
                                            ? "text-primary bg-primary/5 font-semibold" 
                                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    )}
                                >
                                    <item.icon size={20} className={cn(
                                        "transition-colors",
                                        isActive(item.id) ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
                                    )} />
                                    <span className="text-sm">{item.label}</span>
                                    {isActive(item.id) && (
                                        <motion.div 
                                            layoutId="activeNav"
                                            className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">System</p>
                        <div className="space-y-1">
                            {optionsItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => { item.action?.(); onClose(); }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all group"
                                >
                                    <item.icon size={20} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                                    <span className="text-sm">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer / Updates */}
                <div className="p-4 mt-auto space-y-4">
                    {updateAvailable && (
                        <button 
                            onClick={onUpdateClick}
                            disabled={isUpdating}
                            className={cn(
                                "w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-sm transition-all active:scale-95",
                                updateReady 
                                    ? "bg-accent text-white hover:bg-accent/90" 
                                    : "bg-primary text-white hover:bg-primary/90"
                            )}
                        >
                            {updateReady ? <RefreshCw size={18} /> : <Download size={18} />}
                            {isUpdating ? 'Installing...' : (updateReady ? 'Restart App' : 'Update Available')}
                        </button>
                    )}

                    <div className="px-3 py-2 flex items-center justify-between border-t border-slate-100 pt-4">
                        <div className="text-[10px] font-medium text-slate-400">
                            v1.0.2 • Farhat Iqbal
                        </div>
                        <div className="flex gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                            <span className="text-[10px] font-bold text-slate-500">Live</span>
                        </div>
                    </div>
                </div>
            </motion.nav>
        </>
    )
}
