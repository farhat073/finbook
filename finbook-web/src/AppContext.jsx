import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './supabase'
import {
    saveStoreProfile, getStoreProfile,
    saveParties, getParties,
    saveItems, getItems,
    saveTransactions, getTransactions,
    saveExpenses, getExpenses,
    setOfflineMode as setOfflineModeStorage,
    getOfflineMode as getOfflineModeStorage
} from './localStorage'

const AppContext = createContext(null)

const avatarColors = [
    '#1A7F64', '#2563EB', '#7C3AED', '#DB2777', '#EA580C',
    '#0891B2', '#65A30D', '#DC2626', '#9333EA', '#0284C7'
]

export function AppProvider({ children, session }) {
    const [parties, setParties] = useState([])
    const [items, setItems] = useState([])
    const [transactions, setTransactions] = useState([])
    const [expenses, setExpenses] = useState([])
    const [storeProfile, setStoreProfileState] = useState({
        name: 'My Store',
        tagline: 'Premium Business',
        phone: '',
        address: ''
    })
    const [loadingData, setLoadingData] = useState(true)

    // Check if we're in offline mode
    const isOfflineMode = session?.offline === true || session?.access_token === 'offline-mode'

    // Store the offline mode status in context
    const [offlineMode, setOfflineMode] = useState(isOfflineMode)

    const userId = session?.user?.id

    useEffect(() => {
        // Load data based on mode
        if (isOfflineMode) {
            // Load from localStorage in offline mode
            setLoadingData(true)
            try {
                setStoreProfileState(getStoreProfile())
                setParties(getParties())
                setItems(getItems())
                setTransactions(getTransactions())
                setExpenses(getExpenses())
            } catch (err) {
                console.error("Error loading data from localStorage:", err)
            } finally {
                setLoadingData(false)
            }
            return
        }

        if (!userId) return

        const loadData = async () => {
            setLoadingData(true)
            try {
                // Fetch Store Profile
                const { data: profileData } = await supabase.from('store_profiles').select('*').eq('user_id', userId).single()
                if (profileData) {
                    setStoreProfileState({
                        name: profileData.name || 'My Store',
                        tagline: profileData.tagline || '',
                        phone: profileData.phone || '',
                        address: profileData.address || ''
                    })
                }

                // Fetch Parties
                const { data: partiesData } = await supabase.from('parties').select('*').order('created_at', { ascending: true })
                if (partiesData) setParties(partiesData)

                // Fetch Items
                const { data: itemsData } = await supabase.from('items').select('*').order('created_at', { ascending: true })
                if (itemsData) setItems(itemsData)

                // Fetch Transactions
                const { data: txnsData } = await supabase.from('transactions').select('*').order('timestamp', { ascending: true })
                if (txnsData) setTransactions(txnsData)

                // Fetch Expenses
                const { data: expData } = await supabase.from('expenses').select('*').order('created_at', { ascending: true })
                if (expData) setExpenses(expData)

            } catch (err) {
                console.error("Error loading data from Supabase:", err)
            } finally {
                setLoadingData(false)
            }
        }

        loadData()
    }, [userId, isOfflineMode])

    // Compute dynamic balances for all parties based on transactions
    const partiesWithBalance = parties.map(p => {
        const pTxns = transactions.filter(t => t.partyName === p.name)
        const sale = pTxns.filter(t => t.type === 'sale').reduce((acc, t) => acc + Number(t.total || 0), 0)
        const recv = pTxns.filter(t => t.type === 'sale').reduce((acc, t) => acc + Number(t.received || 0), 0)
        const purc = pTxns.filter(t => t.type === 'purchase').reduce((acc, t) => acc + Number(t.total || 0), 0)
        const paid = pTxns.filter(t => t.type === 'purchase').reduce((acc, t) => acc + Number(t.paidAmt || 0), 0)
        const payIn = pTxns.filter(t => t.type === 'payment-in').reduce((acc, t) => acc + Number(t.total || 0), 0)
        const payOut = pTxns.filter(t => t.type === 'payment-out').reduce((acc, t) => acc + Number(t.total || 0), 0)

        // Positive means they owe us (You'll Get). Negative means we owe them (You'll Give)
        const balance = (parseFloat(p.amount) || 0) + sale - recv - purc + paid - payIn + payOut;
        return { ...p, balance }
    })

    // Computed totals
    const totalSale = transactions.filter(t => t.type === 'sale').reduce((s, t) => s + Number(t.total || 0), 0)
    const totalPurchase = transactions.filter(t => t.type === 'purchase').reduce((s, t) => s + Number(t.total || 0), 0)

    // Globally correct totals to get/give
    const totalToGet = partiesWithBalance.filter(p => p.balance > 0).reduce((s, p) => s + p.balance, 0)
    const totalToGive = partiesWithBalance.filter(p => p.balance < 0).reduce((s, p) => s + Math.abs(p.balance), 0)
    const totalExpenses = expenses.reduce((s, e) => s + Number(e.totalAmount || 0), 0)

    // --- CRUD WRAPPERS ---

    const setStoreProfile = async (profile) => {
        setStoreProfileState(profile)

        if (isOfflineMode) {
            // Save to localStorage in offline mode
            saveStoreProfile(profile)
            return
        }

        if (!userId) return

        // Upsert profile
        await supabase.from('store_profiles').upsert({
            user_id: userId,
            name: profile.name,
            tagline: profile.tagline,
            phone: profile.phone,
            address: profile.address
        }, { onConflict: 'user_id' })
    }

    const addParty = async (party) => {
        if (isOfflineMode) {
            const newParty = { ...party, id: party.id || `local_${Date.now()}`, created_at: new Date().toISOString() }
            const updatedParties = [...parties, newParty]
            setParties(updatedParties)
            saveParties(updatedParties)
            return
        }

        const newParty = { user_id: userId, ...party }
        const { data, error } = await supabase.from('parties').insert([newParty]).select().single()
        if (data && !error) setParties(p => [...p, data])
    }

    const updateParty = async (id, updates) => {
        if (isOfflineMode) {
            const updatedParties = parties.map(p => p.id === id ? { ...p, ...updates } : p)
            setParties(updatedParties)
            saveParties(updatedParties)
            return
        }

        const { data, error } = await supabase.from('parties').update(updates).eq('id', id).select().single()
        if (data && !error) setParties(p => p.map(x => x.id === id ? data : x))
    }

    const addItem = async (item) => {
        if (isOfflineMode) {
            // Save to localStorage in offline mode
            const newItem = { ...item, id: item.id || `local_${Date.now()}`, created_at: new Date().toISOString() }
            const updatedItems = [...items, newItem]
            setItems(updatedItems)
            saveItems(updatedItems)
            return
        }

        const newItem = { user_id: userId, ...item }
        const { data, error } = await supabase.from('items').insert([newItem]).select().single()
        if (data && !error) setItems(i => [...i, data])
    }

    const addTransaction = async (txn) => {
        if (isOfflineMode) {
            // Save to localStorage in offline mode
            const newTxn = { ...txn, id: txn.id || `local_${Date.now()}`, timestamp: Date.now(), created_at: new Date().toISOString() }
            const updatedTransactions = [...transactions, newTxn]
            setTransactions(updatedTransactions)
            saveTransactions(updatedTransactions)
            return
        }

        const newTxn = { user_id: userId, timestamp: Date.now(), ...txn }
        const { data, error } = await supabase.from('transactions').insert([newTxn]).select().single()
        if (data && !error) setTransactions(t => [...t, data])
    }

    const addExpense = async (exp) => {
        if (isOfflineMode) {
            const newExp = { ...exp, id: exp.id || `local_${Date.now()}`, created_at: new Date().toISOString() }
            const updatedExpenses = [...expenses, newExp]
            setExpenses(updatedExpenses)
            saveExpenses(updatedExpenses)
            return
        }

        const newExp = { user_id: userId, ...exp }
        const { data, error } = await supabase.from('expenses').insert([newExp]).select().single()
        if (data && !error) setExpenses(e => [...e, data])
    }

    const deleteParty = async (id) => {
        if (isOfflineMode) {
            // Delete from localStorage in offline mode
            const updatedParties = parties.filter(x => x.id !== id)
            setParties(updatedParties)
            saveParties(updatedParties)
            return
        }

        await supabase.from('parties').delete().eq('id', id)
        setParties(p => p.filter(x => x.id !== id))
    }

    const deleteItem = async (id) => {
        if (isOfflineMode) {
            // Delete from localStorage in offline mode
            const updatedItems = items.filter(x => x.id !== id)
            setItems(updatedItems)
            saveItems(updatedItems)
            return
        }

        await supabase.from('items').delete().eq('id', id)
        setItems(i => i.filter(x => x.id !== id))
    }

    const deleteTransaction = async (id) => {
        if (isOfflineMode) {
            // Delete from localStorage in offline mode
            const updatedTransactions = transactions.filter(x => x.id !== id)
            setTransactions(updatedTransactions)
            saveTransactions(updatedTransactions)
            return
        }

        await supabase.from('transactions').delete().eq('id', id)
        setTransactions(t => t.filter(x => x.id !== id))
    }

    const deleteExpense = async (id) => {
        if (isOfflineMode) {
            // Delete from localStorage in offline mode
            const updatedExpenses = expenses.filter(x => x.id !== id)
            setExpenses(updatedExpenses)
            saveExpenses(updatedExpenses)
            return
        }

        await supabase.from('expenses').delete().eq('id', id)
        setExpenses(e => e.filter(x => x.id !== id))
    }

    const restoreData = (data) => {
        // Replace in-memory state
        if (data.parties) {
            setParties(data.parties)
            if (isOfflineMode) saveParties(data.parties)
        }
        if (data.items) {
            setItems(data.items)
            if (isOfflineMode) saveItems(data.items)
        }
        if (data.transactions) {
            setTransactions(data.transactions)
            if (isOfflineMode) saveTransactions(data.transactions)
        }
        if (data.expenses) {
            setExpenses(data.expenses)
            if (isOfflineMode) saveExpenses(data.expenses)
        }
    }

    const getAvatarColor = (name) => {
        if (!name) return avatarColors[0]
        let hash = 0
        for (let c of name) hash = (c.charCodeAt(0) + hash * 31) & 0xffffffff
        return avatarColors[Math.abs(hash) % avatarColors.length]
    }

    const formatCurrency = (n) => `₹ ${Math.abs(Number(n)).toLocaleString('en-IN')}`

    if (loadingData && !isOfflineMode) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', gap: 20 }}>
                <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    border: '4px solid var(--border)',
                    borderTopColor: 'var(--accent)',
                    animation: 'spin 1s linear infinite'
                }} />
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 15, letterSpacing: '0.5px', animation: 'pulse 1.5s ease-in-out infinite' }}>
                    Loading Data...
                </div>
                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                `}</style>
            </div>
        )
    }

    return (
        <AppContext.Provider value={{
            parties: partiesWithBalance, rawParties: parties, items, transactions, expenses, storeProfile,
            totalSale, totalPurchase, totalToGet, totalToGive, totalExpenses,
            addParty, updateParty, addItem, addTransaction, addExpense, setStoreProfile,
            deleteParty, deleteItem, deleteTransaction, deleteExpense,
            restoreData, getAvatarColor, formatCurrency,
            offlineMode: isOfflineMode
        }}>
            {children}
        </AppContext.Provider>
    )
}

export const useApp = () => useContext(AppContext)
