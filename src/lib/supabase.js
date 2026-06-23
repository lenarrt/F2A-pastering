import { createClient } from '@supabase/supabase-js'

// Public Supabase keys — safe to embed in compiled builds (protected by RLS).
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://lhlhsonziausynkzqrys.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_hj_lB78bOsSP3enS-AkEhQ_Zj2NLCJH'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
