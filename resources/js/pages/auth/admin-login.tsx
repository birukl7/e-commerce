import { Head, useForm } from "@inertiajs/react"
import { LoaderCircle } from "lucide-react"
import type { FormEventHandler } from "react"
import InputError from "@/components/input-error"
import TextLink from "@/components/text-link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AuthLayout from "@/layouts/auth-layout"

type LoginForm = {
  email: string
  password: string
  remember: boolean
}

interface LoginProps {
  status?: string
  canResetPassword: boolean
}

export default function AdminLogin({ status, canResetPassword }: LoginProps) {
  const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
    email: "",
    password: "",
    remember: false,
  })

  const submit: FormEventHandler = (e) => {
    e.preventDefault()

    post(route("admin.login"), {
      onFinish: () => reset("password"),
      onSuccess: () => {
        // Handle successful login - Inertia will handle redirect automatically
      },
      onError: (errors) => {
        // Handle login errors - errors will be shown via InputError components
        console.log("Login errors:", errors)
      },
    })
  }

  return (
    <AuthLayout title="Admin Login" description="Enter your admin credentials to access the dashboard">
      <Head title="Admin Login" />

      {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}

      <form className="flex flex-col gap-6" onSubmit={submit}>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              required
              autoFocus
              tabIndex={1}
              autoComplete="email"
              value={data.email}
              onChange={(e) => setData("email", e.target.value)}
              placeholder="admin@example.com"
              disabled={processing}
              className="h-11"
            />
            <InputError message={errors.email} />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              {canResetPassword && (
                <TextLink href={route("admin.password.request")} className="ml-auto text-sm" tabIndex={4}>
                  Forgot password?
                </TextLink>
              )}
            </div>
            <Input
              id="password"
              type="password"
              required
              tabIndex={2}
              autoComplete="current-password"
              value={data.password}
              onChange={(e) => setData("password", e.target.value)}
              placeholder="Enter your password"
              disabled={processing}
              className="h-11"
            />
            <InputError message={errors.password} />
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="remember"
              name="remember"
              checked={data.remember}
              onCheckedChange={(checked) => setData("remember", !!checked)}
              tabIndex={3}
              disabled={processing}
            />
            <Label htmlFor="remember" className="cursor-pointer">
              Remember me
            </Label>
          </div>

          <Button type="submit" className="mt-4 w-full h-12" tabIndex={4} disabled={processing}>
            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </div>
      </form>

      <div className="text-center text-sm text-muted-foreground mt-6 pt-4 border-t">
        <TextLink href={route("login")}>Back to User Login</TextLink>
      </div>
    </AuthLayout>
  )
}
