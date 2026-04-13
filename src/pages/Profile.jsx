import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Profile({ user }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const signUp = async () => {
    try {
      setLoading(true)
      setError("")
      setMessage("")

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        throw signUpError
      }

      setMessage("Account created. Check your email if confirmation is enabled.")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async () => {
    try {
      setLoading(true)
      setError("")
      setMessage("")

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw signInError
      }

      setMessage("Signed in successfully.")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      setError(signOutError.message)
      return
    }
    setMessage("Signed out.")
  }

  return (
    <div className="mx-auto max-w-2xl px-1 pb-2">
      <h1 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">Profile</h1>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {user ? (
          <>
            <p className="mb-3 text-sm text-slate-600">Signed in as {user.email}</p>
            <button
              onClick={signOut}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <p className="mb-3 text-sm text-slate-600">Create an account or sign in to add your own recipes.</p>

            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                placeholder="Email"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                placeholder="Password"
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={signIn}
                disabled={loading || !email || !password}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Sign in
              </button>
              <button
                onClick={signUp}
                disabled={loading || !email || !password}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
              >
                Sign up
              </button>
            </div>
          </>
        )}

        {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}