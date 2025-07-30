"use client"

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
// import { route } from "ziggy-js" // Import route from ziggy-js

type LoginForm = {
  email: string
  password: string
  remember: boolean
}

interface LoginProps {
  status?: string
  canResetPassword: boolean
}

// Google Icon Component
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
)

export default function Login({ status, canResetPassword }: LoginProps) {
  const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
    email: "",
    password: "",
    remember: false,
  })

  const submit: FormEventHandler = (e) => {
    e.preventDefault()

    post(route("login"), {
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

  const handleGoogleSignUp = () => {
    window.location.href = route("auth.redirection")
  }

  return (
    <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">
      <Head title="Log in" />

      {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}

      <div className="flex flex-col gap-6">
        {/* Google Sign Up Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 border-gray-300 hover:bg-gray-50 transition-colors bg-transparent"
          onClick={handleGoogleSignUp}
          disabled={processing}
        >
          <GoogleIcon />
          <span className="ml-3 text-gray-700 font-medium">Continue with Google</span>
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-500">Or continue with email</span>
          </div>
        </div>

        {/* Email/Password Form */}
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
                placeholder="email@example.com"
                disabled={processing}
              />
              <InputError message={errors.email} />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                {canResetPassword && (
                  <TextLink href={route("password.request")} className="ml-auto text-sm" tabIndex={5}>
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
                placeholder="Password"
                disabled={processing}
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

            <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
              {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              Log in
            </Button>
          </div>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <TextLink href={route("register")} tabIndex={6}>
            Sign up
          </TextLink>
        </div>
      </div>
    </AuthLayout>
  )
}
