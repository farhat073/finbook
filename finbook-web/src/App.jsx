import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AppProvider, useApp } from './AppContext'
import DashboardPage from './pages/DashboardPage'
import PartiesPage from './pages/PartiesPage'
import ItemsPage from './pages/ItemsPage'
import TransactionsPage from './pages/TransactionsPage'
import ExpensesPage from './pages/ExpensesPage'
import ReportsPage from './pages/ReportsPage'
import CustomerProfilePage from './pages/CustomerProfilePage'
import PublicLedgerPage from './pages/PublicLedgerPage'
import PrintableBillModal from './components/PrintableBillModal'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import BottomNav from './components/BottomNav'
import StoreSettingsModal from './components/StoreSettingsModal'
import DataManagementModal from './components/DataManagementModal'
import VoiceButton from './components/VoiceButton'
import { App as CapacitorApp } from '@capacitor/app'
import { setOfflineMode } from './localStorage'
import { supabase } from './supabase'
import AuthPage from './components/AuthPage'
import { cn } from './lib/utils'

/* ─── Main Layout ─────────────────────────────────────── */
function MainLayout({ onLogout }) {
  const { storeProfile, setStoreProfile, parties, transactions, offlineMode } = useApp()
  const [currentPath, setCurrentPath] = useState('dashboard')
  const [navParams, setNavParams] = useState({})
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showDataMgmt, setShowDataMgmt] = useState(false)
  const [customerProfileParty, setCustomerProfileParty] = useState(null)

  // Search states for TopBar
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [globalSearch, setGlobalSearch] = useState('')
  const searchRef = useRef(null)

  // OTA Update Logic
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateReady, setUpdateReady] = useState(false)

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`)
        if (res.ok) {
          const data = await res.json()
          const stored = localStorage.getItem('finbook_version')
          if (!stored) {
            localStorage.setItem('finbook_version', data.version)
          } else if (stored !== String(data.version)) {
            setUpdateAvailable(true)
          }
        }
      } catch (e) { /* ignore */ }
    }
    checkVersion()
    window.addEventListener('focus', checkVersion)
    return () => window.removeEventListener('focus', checkVersion)
  }, [])

  const handleUpdateClick = () => {
    setIsUpdating(true)
    setTimeout(() => { setIsUpdating(false); setUpdateReady(true) }, 1500)
  }

  const handleRestartApp = () => {
    fetch(`/version.json?t=${Date.now()}`).then(r => r.json()).then(d => {
      localStorage.setItem('finbook_version', d.version)
      window.location.reload(true)
    }).catch(() => window.location.reload(true))
  }

  // Build unified customer list
  const allCustomerNames = React.useMemo(() => {
    const nameSet = new Set()
    parties.forEach(p => nameSet.add(p.name))
    transactions.forEach(t => { if (t.partyName) nameSet.add(t.partyName) })
    return [...nameSet]
  }, [parties, transactions])

  const searchResults = isSearchActive && globalSearch.trim().length > 0
    ? allCustomerNames
      .filter(name => name.toLowerCase().includes(globalSearch.toLowerCase()))
      .slice(0, 8)
      .map(name => {
        const party = parties.find(p => p.name === name)
        return { name, phone: party?.phone || '', id: party?.id || name }
      })
    : []

  const PAGE_LABELS = {
    dashboard: 'Dashboard', parties: 'Customers', items: 'Items',
    transactions: 'Transactions', expenses: 'Expenses', reports: 'Reports'
  }

  const navigate = (path, params = {}) => {
    if (path === 'settings') {
      setShowSettings(true)
      return
    }
    setCurrentPath(path)
    setNavParams(params)
    setSidebarOpen(false)
    setIsSearchActive(false)
    setGlobalSearch('')
    setCustomerProfileParty(null)
  }

  const openCustomerProfile = (partyName) => {
    setCustomerProfileParty(partyName)
    setIsSearchActive(false)
    setGlobalSearch('')
  }

  // Dynamic Scroll Navbar State
  const [isScrolled, setIsScrolled] = useState(false)

  // Native hardware back button
  useEffect(() => {
    const handleBackButton = () => {
      if (showSettings) { setShowSettings(false) }
      else if (isSearchActive) { setIsSearchActive(false); setGlobalSearch('') }
      else if (navParams?.txn) { setNavParams(prev => ({ ...prev, txn: null })) }
      else if (customerProfileParty) { setCustomerProfileParty(null) }
      else if (currentPath !== 'dashboard') { navigate('dashboard') }
      else { CapacitorApp.exitApp() }
    }
    const backListener = CapacitorApp.addListener('backButton', handleBackButton)
    return () => { backListener.then(listener => listener.remove()) }
  }, [showSettings, isSearchActive, navParams, customerProfileParty, currentPath])

  // Scroll handler for morphing navbar
  useEffect(() => {
    const handleScroll = (e) => {
      const scrollTop = e.target.scrollTop || window.scrollY || 0;
      setIsScrolled(scrollTop > 20);
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        currentPath={currentPath}
        onNavigate={navigate}
        storeProfile={storeProfile}
        offlineMode={offlineMode}
        onOpenSettings={() => setShowSettings(true)}
        onGoOnline={onLogout}
        onDataManagement={() => { setSidebarOpen(false); setShowDataMgmt(true) }}
        updateAvailable={updateAvailable}
        updateReady={updateReady}
        isUpdating={isUpdating}
        onUpdateClick={handleUpdateClick}
        onRestartApp={handleRestartApp}
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <TopBar
          title={customerProfileParty ? 'Customer Profile' : PAGE_LABELS[currentPath] || 'Finbook'}
          isSearchActive={isSearchActive}
          globalSearch={globalSearch}
          searchResults={searchResults}
          onSearchChange={setGlobalSearch}
          onToggleSearch={() => { setIsSearchActive(!isSearchActive); setGlobalSearch('') }}
          onOpenSettings={() => setShowSettings(true)}
          onOpenSidebar={() => setSidebarOpen(true)}
          onSelectSearchResult={openCustomerProfile}
          searchRef={searchRef}
        />

        <div className="flex-1 overflow-y-auto no-scrollbar pb-32 lg:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={customerProfileParty ? `profile-${customerProfileParty}` : currentPath}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full"
            >
              {customerProfileParty ? (
                <CustomerProfilePage partyName={customerProfileParty} onBack={() => setCustomerProfileParty(null)} onNavigate={navigate} />
              ) : (
                <>
                  {currentPath === 'dashboard' && <DashboardPage onNavigate={navigate} />}
                  {currentPath === 'parties' && <PartiesPage globalSearch={globalSearch} onSelectParty={setCustomerProfileParty} />}
                  {currentPath === 'items' && <ItemsPage globalSearch={globalSearch} />}
                  {currentPath === 'transactions' && <TransactionsPage openNew={navParams?.openNew} defaultParty={navParams?.defaultParty} defaultType={navParams?.defaultType} openFilter={navParams?.filter} globalSearch={globalSearch} onNavigate={navigate} />}
                  {currentPath === 'expenses' && <ExpensesPage />}
                  {currentPath === 'reports' && <ReportsPage />}

                  {currentPath === 'bill' && navParams?.txn && (
                    <PrintableBillModal
                      txn={navParams.txn}
                      onBack={() => navigate('transactions')}
                    />
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {!customerProfileParty && (
          <BottomNav
            currentPath={currentPath}
            onNavigate={navigate}
            isScrolled={isScrolled}
          />
        )}
        
        <VoiceButton />
      </main>

      {showSettings && (
        <StoreSettingsModal
          profile={storeProfile}
          onSave={(newProfile) => { setStoreProfile(newProfile); setShowSettings(false) }}
          onClose={() => setShowSettings(false)}
          onLogout={onLogout}
        />
      )}

      {showDataMgmt && (
        <DataManagementModal
          storeProfile={storeProfile}
          onSaveProfile={(newProfile) => { setStoreProfile(newProfile) }}
          onClose={() => setShowDataMgmt(false)}
        />
      )}
    </div>
  )
}

/* ─── App Root ────────────────────────────────────────── */
function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (accessToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        })
        if (error) {
          console.error('Error setting session from OAuth callback:', error)
        } else if (data.session) {
          setSession(data.session)
          window.history.replaceState(null, '', window.location.pathname)
          setLoading(false)
          return
        }
      }

      const { data: { session: existingSession } } = await supabase.auth.getSession()
      setSession(existingSession)
      setLoading(false)
    }

    handleOAuthCallback()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    let appUrlListener
    if (typeof CapacitorApp?.addListener === 'function') {
      appUrlListener = CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
        if (url && url.includes('access_token')) {
          try {
            const hashPart = url.split('#')[1]
            if (hashPart) {
              const params = new URLSearchParams(hashPart)
              const at = params.get('access_token')
              const rt = params.get('refresh_token')
              if (at) {
                const { data, error } = await supabase.auth.setSession({
                  access_token: at,
                  refresh_token: rt || ''
                })
                if (!error && data.session) {
                  setSession(data.session)
                }
              }
            }
          } catch (e) {
            console.error('Error handling OAuth deep link:', e)
          }
        }
      })
    }

    return () => {
      subscription.unsubscribe()
      if (appUrlListener) appUrlListener.remove()
    }
  }, [])

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-4"
        />
        <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">Finbook</p>
      </div>
    )
  }

  const hash = window.location.hash
  if (hash.startsWith('#ledger=')) {
    try {
      const encoded = hash.replace('#ledger=', '')
      const decoded = JSON.parse(decodeURIComponent(escape(atob(encoded))))
      return <PublicLedgerPage data={decoded} />
    } catch (e) { }
  }

  if (!session) {
    return <AuthPage onAuthSuccess={setSession} />
  }

  const handleLogout = async () => {
    setOfflineMode(false)
    if (session?.access_token !== 'offline-mode') {
      await supabase.auth.signOut()
    }
    setSession(null)
  }

  return (
    <AppProvider session={session}>
      <MainLayout onLogout={handleLogout} />
    </AppProvider>
  )
}

export default App
