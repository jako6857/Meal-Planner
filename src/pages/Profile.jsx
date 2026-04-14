import { useState } from "react"
import { supabase } from "../lib/supabase"

const copy = {
  en: {
    title: "Profile",
    accountTab: "Account",
    settingsTab: "Settings",
    signedInAs: "Signed in as",
    signOut: "Sign out",
    signInPrompt: "Sign in to add your own recipes.",
    signUpPrompt: "Create your account to start adding recipes.",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    noAccount: "If you do not have an account, please click here to register.",
    goRegister: "Go to register",
    createAccount: "Create account",
    hasAccount: "Already have an account?",
    backToSignIn: "Back to sign in",
    resendConfirmation: "Resend confirmation email",
    signedOut: "Signed out.",
    accountCreated: "Account created. Check your inbox and confirm your email before signing in.",
    signedInSuccess: "Signed in successfully.",
    emailNotConfirmed: "Email not confirmed. Please confirm via email, then try again.",
    confirmationSent: "Confirmation email sent. Check spam/junk if you do not see it.",
    settingsIntro: "Your preferences are saved on this device.",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    language: "Language",
    english: "English",
    danish: "Danish",
    textSize: "Text size",
    normalText: "Normal",
    largeText: "Large",
    motion: "Animations",
    fullMotion: "Full",
    reducedMotion: "Reduced",
    accessibility: "Accessibility",
  },
  da: {
    title: "Profil",
    accountTab: "Konto",
    settingsTab: "Indstillinger",
    signedInAs: "Logget ind som",
    signOut: "Log ud",
    signInPrompt: "Log ind for at tilfoeje dine egne opskrifter.",
    signUpPrompt: "Opret en konto for at tilfoeje opskrifter.",
    email: "Email",
    password: "Adgangskode",
    signIn: "Log ind",
    noAccount: "Hvis du ikke har en konto, saa klik her for at registrere dig.",
    goRegister: "Gaa til registrering",
    createAccount: "Opret konto",
    hasAccount: "Har du allerede en konto?",
    backToSignIn: "Tilbage til log ind",
    resendConfirmation: "Send bekraeftelsesmail igen",
    signedOut: "Du er logget ud.",
    accountCreated: "Konto oprettet. Tjek din indbakke og bekraeft din email, foer du logger ind.",
    signedInSuccess: "Logget ind.",
    emailNotConfirmed: "Email er ikke bekraeftet endnu. Bekraeft via email og proev igen.",
    confirmationSent: "Bekraeftelsesmail sendt. Tjek spam/uonsket post, hvis du ikke kan se den.",
    settingsIntro: "Dine indstillinger gemmes paa denne enhed.",
    theme: "Tema",
    light: "Lys",
    dark: "Moerk",
    language: "Sprog",
    english: "Engelsk",
    danish: "Dansk",
    textSize: "Tekststoerrelse",
    normalText: "Normal",
    largeText: "Stor",
    motion: "Animationer",
    fullMotion: "Fulde",
    reducedMotion: "Reduceret",
    accessibility: "Tilgaengelighed",
  },
}

const SettingToggle = ({ label, options, value, onChange }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-3">
    <p className="mb-2 text-sm font-semibold text-slate-700">{label}</p>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            value === option.value
              ? "bg-blue-600 text-white"
              : "border border-slate-300 bg-white text-slate-700"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
)

export default function Profile({ user, settings, onUpdateSettings }) {
  const [authMode, setAuthMode] = useState("signin")
  const [activeTab, setActiveTab] = useState("account")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const normalizedEmail = email.trim().toLowerCase()
  const t = copy[settings?.language] || copy.en

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

      setMessage(t.accountCreated)
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

      setMessage(t.signedInSuccess)
    } catch (err) {
      if (err.message?.toLowerCase().includes("email not confirmed")) {
        setError(t.emailNotConfirmed)
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

      setMessage(t.confirmationSent)
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
    setMessage(t.signedOut)
  }

  const switchMode = (mode) => {
    setAuthMode(mode)
    setMessage("")
    setError("")
  }

  return (
    <div className="mx-auto max-w-2xl px-1 pb-2">
      <h1 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">{t.title}</h1>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("account")}
          className={`rounded-lg px-3 py-2 text-sm font-semibold ${
            activeTab === "account"
              ? "bg-blue-600 text-white"
              : "border border-slate-300 bg-white text-slate-700"
          }`}
        >
          {t.accountTab}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`rounded-lg px-3 py-2 text-sm font-semibold ${
            activeTab === "settings"
              ? "bg-blue-600 text-white"
              : "border border-slate-300 bg-white text-slate-700"
          }`}
        >
          {t.settingsTab}
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {activeTab === "settings" ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">{t.settingsIntro}</p>

            <SettingToggle
              label={t.theme}
              value={settings.theme}
              onChange={(value) => onUpdateSettings({ theme: value })}
              options={[
                { value: "light", label: t.light },
                { value: "dark", label: t.dark },
              ]}
            />

            <SettingToggle
              label={t.language}
              value={settings.language}
              onChange={(value) => onUpdateSettings({ language: value })}
              options={[
                { value: "en", label: t.english },
                { value: "da", label: t.danish },
              ]}
            />

            <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{t.accessibility}</p>

            <SettingToggle
              label={t.textSize}
              value={settings.textSize}
              onChange={(value) => onUpdateSettings({ textSize: value })}
              options={[
                { value: "normal", label: t.normalText },
                { value: "large", label: t.largeText },
              ]}
            />

            <SettingToggle
              label={t.motion}
              value={settings.motion}
              onChange={(value) => onUpdateSettings({ motion: value })}
              options={[
                { value: "full", label: t.fullMotion },
                { value: "reduced", label: t.reducedMotion },
              ]}
            />
          </div>
        ) : user ? (
          <>
            <p className="mb-3 text-sm text-slate-600">{t.signedInAs} {user.email}</p>
            <button
              onClick={signOut}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              {t.signOut}
            </button>
          </>
        ) : (
          <>
            <p className="mb-3 text-sm text-slate-600">
              {authMode === "signin" ? t.signInPrompt : t.signUpPrompt}
            </p>

            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                placeholder={t.email}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                placeholder={t.password}
              />
            </div>

            {authMode === "signin" ? (
              <>
                <button
                  onClick={signIn}
                  disabled={loading || !normalizedEmail || !password}
                  className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {t.signIn}
                </button>

                <p className="mt-4 text-sm text-slate-600">{t.noAccount}</p>

                <button
                  onClick={() => switchMode("signup")}
                  className="mt-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  {t.goRegister}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={signUp}
                  disabled={loading || !normalizedEmail || !password}
                  className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {t.createAccount}
                </button>

                <p className="mt-4 text-sm text-slate-600">{t.hasAccount}</p>

                <button
                  onClick={() => switchMode("signin")}
                  className="mt-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  {t.backToSignIn}
                </button>
              </>
            )}

            {isConfirmationPending && normalizedEmail && (
              <button
                onClick={resendConfirmation}
                disabled={loading}
                className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 disabled:opacity-50"
              >
                {t.resendConfirmation}
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
