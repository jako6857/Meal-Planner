import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

const missingConfigError = new Error("Supabase is not configured")

const createDisabledQueryBuilder = () => ({
  select() {
    return this
  },
  eq() {
    return this
  },
  order() {
    return this
  },
  maybeSingle() {
    return this
  },
  upsert() {
    return Promise.resolve({ data: null, error: missingConfigError })
  },
  insert() {
    return Promise.resolve({ data: null, error: missingConfigError })
  },
  delete() {
    return this
  },
  then(resolve) {
    return Promise.resolve(resolve({ data: null, error: missingConfigError }))
  },
})

const createDisabledClient = () => ({
  auth: {
    getSession: async () => ({ data: { session: null }, error: missingConfigError }),
    onAuthStateChange: () => ({
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    }),
    signUp: async () => ({ data: null, error: missingConfigError }),
    signInWithPassword: async () => ({ data: null, error: missingConfigError }),
    resend: async () => ({ data: null, error: missingConfigError }),
    signOut: async () => ({ error: null }),
  },
  from: () => createDisabledQueryBuilder(),
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: missingConfigError }),
      getPublicUrl: () => ({ data: { publicUrl: "" } }),
    }),
  },
})

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createDisabledClient()

if (!isSupabaseConfigured) {
  console.warn("Supabase URL/key missing. Running in offline-only mode.")
}
