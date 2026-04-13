import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Profile({ user }) {
  const [authMode, setAuthMode] = useState("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const normalizedEmail = email.trim().toLowerCase()

  const isConfirmationPending =
    error.toLowerCase().includes("email not confirmed") ||
    message.toLowerCase().includes("confirmation")

  const signUp = async () => {
    try {
      setLoading(true)
      setError("")
      setMessage("")

      const { error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
      })

      if (signUpError) {
        throw signUpError
      }

      setMessage("Account created. Check your inbox and confirm your email before signing in.")
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
        email: normalizedEmail,
        password,
      })

      if (signInError) {
        throw signInError
      }

      setMessage("Signed in successfully.")
    } catch (err) {
      if (err.message?.toLowerCase().includes("email not confirmed")) {
        setError("Email not confirmed. Please confirm via email, then try again.")
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const resendConfirmation = async () => {
    try {
      setLoading(true)
      setError("")
      setMessage("")

      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: normalizedEmail,
      })

      if (resendError) {
        throw resendError
      }

      setMessage("Confirmation email sent. Check spam/junk if you do not see it.")
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

  const switchMode = (mode) => {
    setAuthMode(mode)
    setMessage("")
    setError("")
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
            <p className="mb-3 text-sm text-slate-600">
              {authMode === "signin"
                ? "Sign in to add your own recipes."
                : "Create your account to start adding recipes."}
            </p>

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

            {authMode === "signin" ? (
              <>
                <button
                  onClick={signIn}
                  disabled={loading || !normalizedEmail || !password}
                  className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Sign in
                </button>

                <p className="mt-4 text-sm text-slate-600">If you do not have an account, please click here to register.</p>

                <button
                  onClick={() => switchMode("signup")}
                  className="mt-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Go to register
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={signUp}
                  disabled={loading || !normalizedEmail || !password}
                  className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Create account
                </button>

                <p className="mt-4 text-sm text-slate-600">Already have an account?</p>

                <button
                  onClick={() => switchMode("signin")}
                  className="mt-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Back to sign in
                </button>
              </>
            )}

            {isConfirmationPending && normalizedEmail && (
              <button
                onClick={resendConfirmation}
                disabled={loading}
                className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 disabled:opacity-50"
              >
                Resend confirmation email
              </button>
            )}
          </>
        )}

        {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}