import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../AppContext'
import { Upload, Download, X, Database, FileSpreadsheet, FileJson, AlertTriangle, ShieldCheck } from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { cn } from '../lib/utils'

export default function DataManagementModal({ storeProfile, onSaveProfile, onClose }) {
    const { parties, rawParties, items, transactions, expenses, restoreData } = useApp()
    const isNative = Capacitor.isNativePlatform()

    const handleExport = async () => {
        const XLSX = await import('xlsx')
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rawParties || parties), 'Parties')
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(items), 'Items')
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(transactions), 'Transactions')
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expenses), 'Expenses')

        const fileName = `Finbook_Backup_${new Date().toISOString().slice(0, 10)}.xlsx`

        if (isNative) {
            const wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' })
            try {
                const result = await Filesystem.writeFile({ path: fileName, data: wbOut, directory: Directory.Cache })
                await Share.share({ title: 'Finbook Backup', text: 'Finbook business data backup.', url: result.uri });
            } catch (err) { alert('Export failed.'); }
        } else {
            XLSX.writeFile(wb, fileName)
        }
    }

    const handleJsonExport = async () => {
        const data = { version: 1, exportDate: new Date().toISOString(), storeProfile, parties: rawParties || parties, items, transactions, expenses }
        const jsonString = JSON.stringify(data, null, 2)
        const fileName = `Finbook_Backup_${new Date().toISOString().slice(0, 10)}.json`

        if (isNative) {
            try {
                const result = await Filesystem.writeFile({ path: fileName, data: btoa(unescape(encodeURIComponent(jsonString))), directory: Directory.Cache })
                await Share.share({ title: 'Finbook Backup', url: result.uri });
            } catch (err) { alert('Export failed.'); }
        } else {
            const blob = new Blob([jsonString], { type: 'application/json' })
            const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = fileName; a.click(); URL.revokeObjectURL(url);
        }
    }

    const handleImport = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const ext = file.name.split('.').pop().toLowerCase()

        if (ext === 'json') {
            const reader = new FileReader()
            reader.onload = (evt) => {
                try {
                    const data = JSON.parse(evt.target.result)
                    if (window.confirm("Restore this backup? Current data will be replaced.")) {
                        restoreData({ parties: data.parties, items: data.items, transactions: data.transactions, expenses: data.expenses })
                        if (data.storeProfile) onSaveProfile(data.storeProfile)
                        alert("Data imported successfully!"); onClose();
                    }
                } catch (err) { alert("Invalid backup file."); }
            }
            reader.readAsText(file)
        } else {
            import('xlsx').then(XLSX => {
                const reader = new FileReader()
                reader.onload = (evt) => {
                    try {
                        const wb = XLSX.read(evt.target.result, { type: 'binary' })
                        const data = {}
                        if (wb.SheetNames.includes('Parties')) data.parties = XLSX.utils.sheet_to_json(wb.Sheets['Parties'])
                        if (wb.SheetNames.includes('Items')) data.items = XLSX.utils.sheet_to_json(wb.Sheets['Items'])
                        if (wb.SheetNames.includes('Transactions')) data.transactions = XLSX.utils.sheet_to_json(wb.Sheets['Transactions'])
                        if (wb.SheetNames.includes('Expenses')) data.expenses = XLSX.utils.sheet_to_json(wb.Sheets['Expenses'])
                        if (window.confirm("Restore this backup? Current data will be replaced.")) {
                            restoreData(data); alert("Data imported successfully!"); onClose();
                        }
                    } catch (err) { alert("Invalid backup file."); }
                }
                reader.readAsBinaryString(file)
            })
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Database size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Data Vault</h2>
                                <p className="text-sm text-slate-500 font-medium">Backup and restore management</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                    </div>

                    <div className="space-y-8">
                        {/* Export */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Secure Export</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={handleExport}
                                    className="flex flex-col items-center gap-3 p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-50 hover:border-emerald-100 hover:bg-emerald-50 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                        <FileSpreadsheet size={24} />
                                    </div>
                                    <span className="text-xs font-black text-slate-700">Excel (.xlsx)</span>
                                </button>
                                <button 
                                    onClick={handleJsonExport}
                                    className="flex flex-col items-center gap-3 p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-50 hover:border-indigo-100 hover:bg-indigo-50 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                        <FileJson size={24} />
                                    </div>
                                    <span className="text-xs font-black text-slate-700">Backup (.json)</span>
                                </button>
                            </div>
                            <p className="text-[10px] text-center text-slate-400 font-medium leading-relaxed px-4">
                                {isNative ? 'Export and share your business data securely via other apps.' : 'Download your complete business records as a local file.'}
                            </p>
                        </div>

                        {/* Import */}
                        <div className="space-y-4 pt-8 border-t border-slate-100">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Restore Records</h3>
                            <label className="flex items-center justify-between p-4 bg-amber-50 border-2 border-amber-100 rounded-2xl cursor-pointer hover:bg-amber-100 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-amber-500 shadow-sm">
                                        <Upload size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-amber-900">Import Backup</p>
                                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-tighter">Replace all current data</p>
                                    </div>
                                </div>
                                <input type="file" accept=".xlsx,.json" className="hidden" onChange={handleImport} />
                                <ChevronRight size={20} className="text-amber-300 group-hover:translate-x-1 transition-all" />
                            </label>
                            
                            <div className="flex items-start gap-3 p-4 bg-slate-900 rounded-2xl">
                                <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
                                <p className="text-[10px] text-slate-400 font-bold leading-normal">
                                    Importing will overwrite all existing records on this device. We recommend taking a backup first.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={onClose}
                        className="w-full mt-8 py-4 text-sm font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                    >
                        Close Manager
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
