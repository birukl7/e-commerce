"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Mock MainLayout for demonstration
const MainLayout = ({
  title,
  className,
  children,
}: { title: string; className: string; children: React.ReactNode }) => (
  <div className={`min-h-screen bg-background font-sans ${className}`}>
    <div className="container mx-auto">
      <title>{title}</title>
      {children}
    </div>
  </div>
)

const Payment = () => {
  const [errors, setErrors] = useState<Record<string, string> | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handlePayment = async () => {
    setIsLoading(true)
    setErrors(null)
    setSuccess(null)

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock success response
      setSuccess("Payment processed successfully! You will be redirected shortly.")
    } catch (error) {
      setErrors({ payment: "Payment failed. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MainLayout title="Payment With Paypal" className="">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-foreground">
          {isLoading ? "Processing Payment..." : "PayPal Payment"}
        </h1>

        <div className="mx-auto max-w-7xl px-4 py-8">
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle className="text-foreground">PayPal Payment</CardTitle>
              <CardDescription>Complete your transaction securely with PayPal</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Error Handling */}
              {errors && Object.keys(errors).length > 0 && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>
                    {Object.values(errors).map((error, index) => (
                      <p key={index}>{error}</p>
                    ))}
                  </AlertDescription>
                </Alert>
              )}

              {/* Success Message */}
              {success && (
                <Alert
                  variant="default"
                  className="mb-4 border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
                >
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* Payment Button */}
              <Button onClick={handlePayment} className="w-full" variant="default" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  "Pay $100.00 with PayPal"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

export default Payment
