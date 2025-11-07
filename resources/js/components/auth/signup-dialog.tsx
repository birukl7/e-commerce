import { useEffect, useState } from "react"
import { router } from "@inertiajs/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Mail } from "lucide-react"

const GoogleIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)

interface SignupDialogProps {
  trigger?: React.ReactNode
  listenForOpenEvent?: boolean
}

export function SignupDialog({ trigger, listenForOpenEvent = false }: SignupDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!listenForOpenEvent) return

    const handler = () => setOpen(true)
    window.addEventListener("auth:open-signup", handler)
    return () => window.removeEventListener("auth:open-signup", handler)
  }, [listenForOpenEvent])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)

    router.post(
      route("register"),
      {
        name,
        email,
        password,
        password_confirmation: password,
        role: "customer",
      },
      {
        onFinish: () => setIsSubmitting(false),
        onSuccess: () => {
          setOpen(false)
          setPassword("")
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

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return
      }

      if (event.data?.type === "oauth-success") {
        const redirectUrl: string = event.data.redirectUrl || (route("home") as string)
        window.location.href = redirectUrl
      }
    }

    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="w-full max-w-sm p-6">
        <DialogClose className="absolute right-4 top-4" />
        <DialogHeader>
          <DialogTitle>Create an account</DialogTitle>
          <DialogDescription>Sign up to unlock personalised shopping on ShopHub.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="dialog-signup-name" className="text-sm font-medium text-foreground">
              First name
            </label>
            <Input
              id="dialog-signup-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
              placeholder="Jane"
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="dialog-signup-email" className="text-sm font-medium text-foreground">
              Email address
            </label>
            <Input
              id="dialog-signup-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="dialog-signup-password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <Input
              id="dialog-signup-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
              placeholder="Create a secure password"
              className="h-12"
            />
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            Continue with email
          </Button>
        </form>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <span className="relative mx-auto flex w-fit bg-background px-2 text-xs text-muted-foreground">or</span>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-center rounded-full"
          onClick={handleGoogle}
          disabled={isSubmitting}
        >
          <GoogleIcon className="mr-2" />
          Continue with Google
        </Button>
        <DialogFooter>
          <p className="text-center text-sm text-muted-foreground w-full">
            By creating an account you agree to our
            <a href={route("terms") as string} target="_blank" rel="noopener noreferrer" className="ml-1 underline">
              Terms of Service
            </a>
            .
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

