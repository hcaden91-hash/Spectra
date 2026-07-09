import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  // { claimed, is_admin } from the security-definer RPC; null until fetched.
  const [adminStatus, setAdminStatus] = useState(null)

  const refreshAdminStatus = useCallback(async () => {
    if (!isSupabaseConfigured) return
    const { data, error } = await supabase.rpc('get_admin_status')
    if (!error && data) setAdminStatus(data)
    return data
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
      setAuthLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  // Admin status depends on who is signed in; refresh whenever that changes.
  useEffect(() => {
    refreshAdminStatus()
  }, [session?.user?.id, refreshAdminStatus])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    isAdmin: Boolean(adminStatus?.is_admin),
    adminClaimed: adminStatus ? Boolean(adminStatus.claimed) : null,
    adminStatusLoaded: adminStatus !== null,
    authLoading,
    refreshAdminStatus,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
