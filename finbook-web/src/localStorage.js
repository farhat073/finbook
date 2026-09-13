// Local Storage Service for Offline Mode
// Provides functions to save and load data from localStorage

const STORAGE_KEYS = {
  STORE_PROFILE: 'finbook_storeProfile',
  PARTIES: 'finbook_parties',
  ITEMS: 'finbook_items',
  TRANSACTIONS: 'finbook_transactions',
  EXPENSES: 'finbook_expenses',
  OFFLINE_MODE: 'finbook_offlineMode',
  LAST_SYNC: 'finbook_lastSync'
}

// Store Profile
export const saveStoreProfile = (profile) => {
  localStorage.setItem(STORAGE_KEYS.STORE_PROFILE, JSON.stringify(profile))
}

export const getStoreProfile = () => {
  const data = localStorage.getItem(STORAGE_KEYS.STORE_PROFILE)
  return data ? JSON.parse(data) : {
    name: 'My Store',
    tagline: 'Premium Business',
    phone: '',
    address: '',
    email: '',
    website: '',
    paymentInstructions: ''
  }
}

// Parties
export const saveParties = (parties) => {
  localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(parties))
}

export const getParties = () => {
  const data = localStorage.getItem(STORAGE_KEYS.PARTIES)
  return data ? JSON.parse(data) : []
}

// Items
export const saveItems = (items) => {
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items))
}

export const getItems = () => {
  const data = localStorage.getItem(STORAGE_KEYS.ITEMS)
  return data ? JSON.parse(data) : []
}

// Transactions
export const saveTransactions = (transactions) => {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions))
}

export const getTransactions = () => {
  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
  return data ? JSON.parse(data) : []
}

// Expenses
export const saveExpenses = (expenses) => {
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses))
}

export const getExpenses = () => {
  const data = localStorage.getItem(STORAGE_KEYS.EXPENSES)
  return data ? JSON.parse(data) : []
}

// Offline Mode Status
export const setOfflineMode = (isOffline) => {
  localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, JSON.stringify(isOffline))
}

export const getOfflineMode = () => {
  const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_MODE)
  return data ? JSON.parse(data) : false
}

// Last Sync Timestamp
export const setLastSync = (timestamp) => {
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp)
}

export const getLastSync = () => {
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNC)
}

// Export all data as JSON
export const exportAllData = () => {
  const data = {
    storeProfile: getStoreProfile(),
    parties: getParties(),
    items: getItems(),
    transactions: getTransactions(),
    expenses: getExpenses(),
    lastSync: new Date().toISOString()
  }
  return JSON.stringify(data, null, 2)
}

// Import data from JSON
export const importAllData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString)
    if (data.storeProfile) saveStoreProfile(data.storeProfile)
    if (data.parties) saveParties(data.parties)
    if (data.items) saveItems(data.items)
    if (data.transactions) saveTransactions(data.transactions)
    if (data.expenses) saveExpenses(data.expenses)
    if (data.lastSync) setLastSync(data.lastSync)
    return true
  } catch (e) {
    console.error('Error importing data:', e)
    return false
  }
}

// Clear all local data
export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key)
  })
}
