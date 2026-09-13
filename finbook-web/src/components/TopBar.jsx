import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, User, Menu, Users, Bell } from 'lucide-react'
import { cn } from '../lib/utils'

export default function TopBar({
    title,
    isSearchActive,
    globalSearch,
    searchResults,
    onSearchChange,
    onToggleSearch,
    onOpenSettings,
    onOpenSidebar,
    onSelectSearchResult,
    searchRef
}) {
    return (
        <header className="sticky top-0 z-30 w-full h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center px-4 lg:px-8">
            <button 
                className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 transition-colors"
                onClick={onOpenSidebar}
            >
                <Menu size={22} />
            </button>

            <div className="flex-1 flex items-center justify-center lg:justify-start">
                <AnimatePresence mode="wait">
                    {isSearchActive ? (
                        <motion.div 
                            key="search"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="flex-1 max-w-2xl relative mx-4" 
                            ref={searchRef}
                        >
                            <div className="relative flex items-center">
                                <Search size={18} className="absolute left-3 text-slate-400" />
                                <input
                                    autoFocus
                                    placeholder="Search customers by name or phone..."
                                    value={globalSearch}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    className="w-full bg-slate-100 border-none pl-10 pr-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                />
                            </div>
                            
                            {/* Search Results Dropdown */}
                            <AnimatePresence>
                                {globalSearch.trim() !== '' && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50"
                                    >
                                        {searchResults.length > 0 ? (
                                            <div className="max-h-[320px] overflow-y-auto no-scrollbar">
                                                {searchResults.map(p => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => onSelectSearchResult(p.name)}
                                                        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none text-left group"
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                            <Users size={18} className="text-slate-400 group-hover:text-primary transition-colors" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-800">{p.name}</div>
                                                            {p.phone && <div className="text-[11px] text-slate-400">{p.phone}</div>}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center">
                                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                                                    <Search size={20} className="text-slate-300" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-500">No customers found for "{globalSearch}"</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <motion.h2 
                            key="title"
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -4 }}
                            className="text-lg font-bold text-slate-900 lg:text-xl"
                        >
                            {title}
                        </motion.h2>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex items-center gap-2">
                <button 
                    onClick={onToggleSearch}
                    className={cn(
                        "p-2.5 rounded-xl transition-all",
                        isSearchActive ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                >
                    {isSearchActive ? <X size={20} /> : <Search size={20} />}
                </button>
                <button className="hidden sm:flex p-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all relative">
                    <Bell size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white" />
                </button>
                <button 
                    onClick={onOpenSettings}
                    className="ml-2 w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:ring-2 hover:ring-primary/20 transition-all"
                >
                    <User size={20} />
                </button>
            </div>
        </header>
    )
}
