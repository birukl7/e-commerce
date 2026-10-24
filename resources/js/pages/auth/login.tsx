"use client"

import { useEffect, useState } from "react"
import { Head, router } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, X } from "lucide-react"

const GoogleIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)

const FacebookIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const AppleIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.62-.75 1.04-1.8 0.93-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.95 2.76.99.08 2.05-.51 2.67-1.26z" />
  </svg>
)

interface LoginProps {
  status?: string
  canResetPassword?: boolean
}

export default function Login({ status }: LoginProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(true)
  const [step, setStep] = useState<"email" | "password">("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [staySignedIn, setStaySignedIn] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      if (window.history.length > 1) {
        window.history.back()
      } else {
        router.visit("/")
      }
    }
  }

  const handleContinueEmail = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email.trim()) return

    setErrorMessage(null)
    setStep("password")
  }

  const handlePasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setErrorMessage(null)

    router.post(
      route("login"),
      {
        email,
        password,
        remember: staySignedIn,
      },
      {
        onError: (errors) => {
          setIsSubmitting(false)
          const firstError = Object.values(errors)[0]
          setErrorMessage(typeof firstError === "string" ? firstError : "Invalid credentials")
        },
        onFinish: () => setIsSubmitting(false),
        onSuccess: () => {
          setOpen(false)
        },
      }
    )
  }

  const handleGoogle = () => {
    const popupWidth = 500
    const popupHeight = 650
    const dualScreenLeft = window.screenLeft ?? window.screenX
    const dualScreenTop = window.screenTop ?? window.screenY
    const width = window.innerWidth ?? document.documentElement.clientWidth ?? screen.width
    const height = window.innerHeight ?? document.documentElement.clientHeight ?? screen.height
    const left = dualScreenLeft + (width - popupWidth) / 2
    const top = dualScreenTop + (height - popupHeight) / 2

    const popup = window.open(
      route("auth.redirection", { popup: 1 }) as string,
      "google-oauth",
      `scrollbars=yes,width=${popupWidth},height=${popupHeight},top=${top},left=${left}`
    )

    popup?.focus()
  }

  return (
    <>
      <Head title="Sign In" />
      {/* Background blurred backdrop or subtle presentation */}
      <div className="min-h-screen w-full bg-slate-100/80 backdrop-blur-sm flex items-center justify-center p-4">
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent 
            hideDefaultClose
            className="w-[calc(100%-2rem)] max-w-[420px] rounded-[32px] p-8 sm:p-9 bg-white shadow-2xl border-0 overflow-visible relative"
          >
            {/* Floating circular close button outside/top-right edge */}
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="absolute -top-3 -right-3 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border-2 border-white shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer focus:outline-none"
              aria-label="Close"
            >
              <X className="h-5 w-5 stroke-[2.5]" />
            </button>

            {/* Brand Logo Header */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F1641E] text-white shadow-sm mb-4">
                <span className="font-serif font-black text-2xl tracking-tighter">E</span>
              </div>
              <DialogTitle className="font-serif text-[28px] font-normal text-slate-900 tracking-tight leading-snug">
                {t("auth.specialStartsOnSerdo", "Special starts on Etsy")}
              </DialogTitle>
              <p className="mt-2 text-sm text-slate-700">
                {t("auth.newToSerdo", "New to Etsy?")}{" "}
                <button
                  type="button"
                  onClick={() => router.visit(route("register"))}
                  className="font-medium text-slate-900 underline underline-offset-4 hover:text-[#F1641E] transition-colors"
                >
                  {t("auth.createAccount", "Create an account")}
                </button>
              </p>
            </div>

            {status && (
              <div className="mt-4 rounded-xl bg-green-50 border border-green-200 px-3.5 py-2.5 text-xs text-green-700 text-center font-medium">
                {status}
              </div>
            )}

            {errorMessage && (
              <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs text-red-600 text-center font-medium">
                {errorMessage}
              </div>
            )}

            {step === "email" ? (
              <form onSubmit={handleContinueEmail} className="mt-6 space-y-4">
                <div className="space-y-1.5 text-left">
                  <label
                    htmlFor="dialog-login-email"
                    className="text-sm font-semibold text-slate-800"
                  >
                    {t("auth.emailAddress", "Email address")}
                  </label>
                  <Input
                    id="dialog-login-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                    className="h-12 rounded-xl border-slate-300 px-4 text-base shadow-xs focus-visible:border-slate-800 focus-visible:ring-1 focus-visible:ring-slate-800"
                    autoFocus
                  />
                </div>

                <div className="flex items-center space-x-2 pt-1 pb-1">
                  <Checkbox
                    id="stay-signed-in"
                    checked={staySignedIn}
                    onCheckedChange={(checked) => setStaySignedIn(!!checked)}
                    className="rounded border-slate-400 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                  />
                  <label
                    htmlFor="stay-signed-in"
                    className="text-sm text-slate-700 cursor-pointer select-none font-normal"
                  >
                    {t("auth.staySignedIn", "Stay signed in")}
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-full bg-[#312B35] hover:bg-slate-800 text-white font-semibold text-base transition-all shadow-sm"
                  disabled={!email.trim()}
                >
                  {t("auth.signIn", "Sign in")}
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 truncate max-w-[220px]">{email}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null)
                        setStep("email")
                      }}
                      className="text-xs text-[#F1641E] hover:underline"
                    >
                      Change
                    </button>
                  </div>
                  <label
                    htmlFor="dialog-login-password"
                    className="text-sm font-semibold text-slate-800 block"
                  >
                    {t("auth.password", "Password")}
                  </label>
                  <Input
                    id="dialog-login-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    className="h-12 rounded-xl border-slate-300 px-4 text-base shadow-xs focus-visible:border-slate-800 focus-visible:ring-1 focus-visible:ring-slate-800"
                    autoFocus
                  />
                </div>

                <div className="flex items-center space-x-2 pt-1 pb-1">
                  <Checkbox
                    id="stay-signed-in-step2"
                    checked={staySignedIn}
                    onCheckedChange={(checked) => setStaySignedIn(!!checked)}
                    className="rounded border-slate-400 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                  />
                  <label
                    htmlFor="stay-signed-in-step2"
                    className="text-sm text-slate-700 cursor-pointer select-none font-normal"
                  >
                    {t("auth.staySignedIn", "Stay signed in")}
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-full bg-[#312B35] hover:bg-slate-800 text-white font-semibold text-base transition-all shadow-sm"
                  disabled={isSubmitting || !password}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : null}
                  {t("auth.signIn", "Sign in")}
                </Button>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <span className="relative mx-auto flex w-fit bg-white px-3 text-xs text-slate-500">
                {t("auth.or", "or")}
              </span>
            </div>

            {/* Social round buttons */}
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handleGoogle}
                className="flex h-12 w-20 items-center justify-center rounded-full border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer"
                aria-label="Continue with Google"
              >
                <GoogleIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleGoogle}
                className="flex h-12 w-20 items-center justify-center rounded-full border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer"
                aria-label="Continue with Facebook"
              >
                <FacebookIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleGoogle}
                className="flex h-12 w-20 items-center justify-center rounded-full border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer text-slate-900"
                aria-label="Continue with Apple"
              >
                <AppleIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Footer Terms */}
            <p className="mt-6 text-center text-xs text-slate-600 leading-relaxed px-1">
              {t("auth.termsAgreementLogin", "By continuing, you agree to our")}{" "}
              <a
                href={typeof route === "function" ? (route("terms") as string) : "/terms"}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 text-slate-800 hover:text-slate-950 font-normal"
              >
                {t("auth.termsOfService", "Terms of Use")}
              </a>{" "}
              and{" "}
              <a
                href={typeof route === "function" ? (route("privacy") as string) : "/privacy"}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 text-slate-800 hover:text-slate-950 font-normal"
              >
                Privacy Policy
              </a>
              .
            </p>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
