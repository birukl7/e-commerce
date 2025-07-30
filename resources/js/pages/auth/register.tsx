import { Head, useForm } from "@inertiajs/react"
import { LoaderCircle, User, Truck } from "lucide-react"
import { type FormEventHandler, useState } from "react"
import InputError from "@/components/input-error"
import TextLink from "@/components/text-link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AuthLayout from "@/layouts/auth-layout"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { route } from "@/utils/route" // Import route function

type RegisterForm = {
  name: string
  email: string
  password: string
  password_confirmation: string
  phone?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  role: "customer" | "supplier" | ""
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

export default function Register() {
  const [step, setStep] = useState(1)
  const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Ethiopia",
    role: "",
  })

  const submit: FormEventHandler = (e) => {
    e.preventDefault()
    if (step === 2) {
      post(route("register"), {
        onFinish: () => reset("password", "password_confirmation"),
        onSuccess: () => {
          // Handle successful registration
        },
        onError: (errors) => {
          console.log("Registration errors:", errors)
        },
      })
    }
  }

  const handleRoleSelect = (selectedRole: "customer" | "supplier") => {
    setData("role", selectedRole)
    setStep(2)
  }

  const handleGoogleSignUp = () => {
    window.location.href = route("auth.redirection")
  }

  return (
    <AuthLayout
      title={step === 1 ? "Choose your account type" : "Create your account"}
      description={
        step === 1
          ? "Select whether you are a customer or a supplier"
          : "Enter your details below to create your account"
      }
    >
      <Head title="Register" />

      {step === 1 && (
        <div className="flex flex-col gap-6">
          {/* Role Selection Cards */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Card
              className="flex-1 cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleRoleSelect("customer")}
            >
              <CardHeader className="flex flex-col items-center text-center">
                <User className="h-8 w-8 mb-2" />
                <CardTitle>Customer</CardTitle>
                <CardDescription>I want to buy products.</CardDescription>
              </CardHeader>
            </Card>
            <Card
              className="flex-1 cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleRoleSelect("supplier")}
            >
              <CardHeader className="flex flex-col items-center text-center">
                <Truck className="h-8 w-8 mb-2" />
                <CardTitle>Supplier</CardTitle>
                <CardDescription>I want to sell products.</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account? <TextLink href={route("login")}>Log in</TextLink>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          {/* Google Sign Up Button */}
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-gray-300 hover:bg-gray-50 transition-colors bg-transparent"
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
                <span className="bg-white px-4 text-gray-500">Or create account manually</span>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <form className="space-y-6" onSubmit={submit}>
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    autoFocus
                    tabIndex={1}
                    autoComplete="name"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    disabled={processing}
                    placeholder="Enter your full name"
                    className="h-11"
                  />
                  <InputError message={errors.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    tabIndex={2}
                    autoComplete="email"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                    disabled={processing}
                    placeholder="email@example.com"
                    className="h-11"
                  />
                  <InputError message={errors.email} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    tabIndex={3}
                    autoComplete="tel"
                    value={data.phone}
                    onChange={(e) => setData("phone", e.target.value)}
                    disabled={processing}
                    placeholder="+251912345678"
                    className="h-11"
                  />
                  <InputError message={errors.phone} />
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Security</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    tabIndex={4}
                    autoComplete="new-password"
                    value={data.password}
                    onChange={(e) => setData("password", e.target.value)}
                    disabled={processing}
                    placeholder="Create a strong password"
                    className="h-11"
                  />
                  <InputError message={errors.password} />
                  <p className="text-xs text-muted-foreground">
                    Must contain at least 8 characters with uppercase, lowercase, number, and special character.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password_confirmation">Confirm Password *</Label>
                  <Input
                    id="password_confirmation"
                    type="password"
                    required
                    tabIndex={5}
                    autoComplete="new-password"
                    value={data.password_confirmation}
                    onChange={(e) => setData("password_confirmation", e.target.value)}
                    disabled={processing}
                    placeholder="Confirm your password"
                    className="h-11"
                  />
                  <InputError message={errors.password_confirmation} />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
                <span className="text-sm text-muted-foreground">(Optional)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address_line_1">Street Address</Label>
                  <Input
                    id="address_line_1"
                    type="text"
                    tabIndex={6}
                    value={data.address_line_1}
                    onChange={(e) => setData("address_line_1", e.target.value)}
                    disabled={processing}
                    placeholder="123 Main Street"
                    className="h-11"
                  />
                  <InputError message={errors.address_line_1} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_line_2">Apartment/Suite</Label>
                  <Input
                    id="address_line_2"
                    type="text"
                    tabIndex={7}
                    value={data.address_line_2}
                    onChange={(e) => setData("address_line_2", e.target.value)}
                    disabled={processing}
                    placeholder="Apt 4B, Suite 100"
                    className="h-11"
                  />
                  <InputError message={errors.address_line_2} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    type="text"
                    tabIndex={8}
                    value={data.city}
                    onChange={(e) => setData("city", e.target.value)}
                    disabled={processing}
                    placeholder="Addis Ababa"
                    className="h-11"
                  />
                  <InputError message={errors.city} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Region</Label>
                  <Input
                    id="state"
                    type="text"
                    tabIndex={9}
                    value={data.state}
                    onChange={(e) => setData("state", e.target.value)}
                    disabled={processing}
                    placeholder="Addis Ababa"
                    className="h-11"
                  />
                  <InputError message={errors.state} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    type="text"
                    tabIndex={10}
                    value={data.postal_code}
                    onChange={(e) => setData("postal_code", e.target.value)}
                    disabled={processing}
                    placeholder="1000"
                    className="h-11"
                  />
                  <InputError message={errors.postal_code} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    type="text"
                    tabIndex={11}
                    value={data.country}
                    onChange={(e) => setData("country", e.target.value)}
                    disabled={processing}
                    placeholder="Ethiopia"
                    className="h-11"
                  />
                  <InputError message={errors.country} />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                onClick={() => setStep(1)}
                disabled={processing}
                variant="outline"
                className="h-12 sm:w-auto"
              >
                Back to Role Selection
              </Button>
              <Button type="submit" className="flex-1 h-12" tabIndex={12} disabled={processing}>
                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </div>
          </form>

          {/* Login Link */}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            Already have an account?{" "}
            <TextLink href={route("login")} tabIndex={13}>
              Log in
            </TextLink>
          </div>
        </div>
      )}
    </AuthLayout>
  )
}
