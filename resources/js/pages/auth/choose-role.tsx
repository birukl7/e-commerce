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

type ChooseRoleForm = {
  role: "customer" | "supplier" | ""
  phone?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
}

export default function ChooseRole() {
  const [selectedRole, setSelectedRole] = useState<"customer" | "supplier" | "">("")

  const { data, setData, post, processing, errors } = useForm<ChooseRoleForm>({
    role: "",
    phone: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Ethiopia",
  })

  const handleRoleSelect = (role: "customer" | "supplier") => {
    setSelectedRole(role)
    setData("role", role)
  }

  const submit: FormEventHandler = (e) => {
    e.preventDefault()

    if (!selectedRole) {
      // You could add a custom error state here
      return
    }

    post(route("choose-role.store"), {
      onSuccess: () => {
        // Handle successful role selection and address update
        console.log("Role and address information saved successfully")
      },
      onError: (errors) => {
        console.log("Choose role errors:", errors)
      },
    })
  }

  return (
    <AuthLayout
      title="Choose your account type"
      description="Select Whether you are a customer or a supplier"
    >
      <Head title="Choose Role" />

      <form className="space-y-8" onSubmit={submit}>
        {/* Role Selection Section */}
        <div className="space-y-4">

          <div className="flex flex-col gap-4 sm:flex-row">
            <Card
              className={`flex-1 cursor-pointer transition-all duration-200 ${
                selectedRole === "customer"
                  ? "border-primary bg-primary/5 shadow-md"
                  : "hover:border-primary/50 hover:shadow-sm"
              }`}
              onClick={() => handleRoleSelect("customer")}
            >
              <CardHeader className="flex flex-col items-center text-center p-6">
                <div
                  className={`p-3 rounded-full mb-3 ${
                    selectedRole === "customer" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <User className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Customer</CardTitle>
                <CardDescription className="text-center">
                  I want to buy products.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className={`flex-1 cursor-pointer transition-all duration-200 ${
                selectedRole === "supplier"
                  ? "border-primary bg-primary/5 shadow-md"
                  : "hover:border-primary/50 hover:shadow-sm"
              }`}
              onClick={() => handleRoleSelect("supplier")}
            >
              <CardHeader className="flex flex-col items-center text-center p-6">
                <div
                  className={`p-3 rounded-full mb-3 ${
                    selectedRole === "supplier" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <Truck className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Supplier</CardTitle>
                <CardDescription className="text-center">
                  I want to sell products.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {errors.role && (
            <div className="text-center">
              <InputError message={errors.role} />
            </div>
          )}
        </div>

        {/* Contact Information Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            <span className="text-sm text-muted-foreground"></span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              tabIndex={1}
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

        {/* Address Information Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
            <span className="text-sm text-muted-foreground"></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address_line_1">Street Address</Label>
              <Input
                id="address_line_1"
                type="text"
                tabIndex={2}
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
                tabIndex={3}
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
                tabIndex={4}
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
                tabIndex={5}
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
                tabIndex={6}
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
                tabIndex={7}
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

        {/* Submit Button */}
        <div className="pt-4">
          <Button type="submit" className="w-full h-12" tabIndex={8} disabled={processing || !selectedRole}>
            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            Complete Profile
          </Button>
        </div>
      </form>

      {/* Skip Link */}
      <div className="text-center text-sm text-muted-foreground pt-6 border-t">
        <TextLink href={route("user.dashboard")} tabIndex={9}>
          Skip for now - I'll complete this later
        </TextLink>
      </div>
    </AuthLayout>
  )
}
