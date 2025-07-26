"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Phone, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

type RealMpesaPaymentProps = {
  amount: number
  bookingId: string
  bookingReference: string
  onPaymentComplete: (success: boolean, transactionId?: string) => void
  onCancel: () => void
}

export function RealMpesaPayment({
  amount,
  bookingId,
  bookingReference,
  onPaymentComplete,
  onCancel,
}: RealMpesaPaymentProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [step, setStep] = useState<"phone" | "processing" | "confirmation">("phone")
  const [loading, setLoading] = useState(false)
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null)
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null)
  const [isDemo, setIsDemo] = useState(false)

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval)
      }
    }
  }, [statusCheckInterval])

  const handlePhoneSubmit = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/mpesa/stk-push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          amount,
          bookingId,
          bookingReference,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCheckoutRequestId(data.checkoutRequestId)
        setStep("processing")
        toast.success(data.message || "Payment request sent to your phone!")

        // Start checking payment status
        startStatusCheck(data.checkoutRequestId)
      } else if (data.demo) {
        // M-Pesa not configured, use demo mode
        setIsDemo(true)
        setStep("processing")
        toast.info("M-Pesa not configured. Using demo mode.")

        // Simulate demo payment
        setTimeout(() => {
          setStep("confirmation")
        }, 3000)
      } else {
        toast.error(data.error || "Failed to initiate payment")
      }
    } catch (error) {
      toast.error("Failed to initiate payment. Please try again.")
      console.error("Payment initiation error:", error)
    } finally {
      setLoading(false)
    }
  }

  const startStatusCheck = (requestId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/mpesa/status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            checkoutRequestId: requestId,
            bookingId,
          }),
        })

        const data = await response.json()

        if (data.success && data.status === "completed") {
          clearInterval(interval)
          setStatusCheckInterval(null)
          toast.success("Payment completed successfully!")
          onPaymentComplete(true, data.mpesaReceiptNumber)
        } else if (data.status === "cancelled") {
          clearInterval(interval)
          setStatusCheckInterval(null)
          toast.error("Payment was cancelled")
          onPaymentComplete(false)
        }
        // Continue checking if still pending
      } catch (error) {
        console.error("Status check error:", error)
      }
    }, 5000) // Check every 5 seconds

    setStatusCheckInterval(interval)

    // Stop checking after 5 minutes
    setTimeout(() => {
      if (interval) {
        clearInterval(interval)
        setStatusCheckInterval(null)
        setStep("confirmation")
      }
    }, 300000) // 5 minutes
  }

  const handleManualConfirmation = (success: boolean) => {
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval)
      setStatusCheckInterval(null)
    }

    if (success) {
      const transactionId = isDemo ? "DEMO" + Date.now() : checkoutRequestId || "MP" + Date.now()
      onPaymentComplete(true, transactionId)
    } else {
      onPaymentComplete(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">M</span>
        </div>
        <CardTitle className="text-xl">{isDemo ? "M-Pesa Payment (Demo)" : "M-Pesa Payment"}</CardTitle>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary">Amount: KSh {amount.toLocaleString()}</Badge>
        </div>
      </CardHeader>

      <CardContent>
        {step === "phone" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0712345678 or 254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">Enter the M-Pesa registered phone number</p>
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Payment Details</h4>
              <div className="space-y-1 text-sm text-green-700">
                <p>
                  Amount: <strong>KSh {amount.toLocaleString()}</strong>
                </p>
                <p>
                  Reference: <strong>{bookingReference}</strong>
                </p>
                <p>
                  Merchant: <strong>Kututa Railway</strong>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handlePhoneSubmit}
                disabled={loading || !phoneNumber}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Payment Request"
                )}
              </Button>
              <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
              </div>
              <h3 className="font-semibold mb-2">Processing Payment</h3>
              <p className="text-sm text-gray-600">
                {isDemo ? "Demo payment is being processed..." : `Payment request sent to ${phoneNumber}`}
              </p>
            </div>

            {!isDemo && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-3">Complete the payment:</h4>
                <ol className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-start">
                    <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                      1
                    </span>
                    Check for M-Pesa notification on your phone
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                      2
                    </span>
                    Enter your M-Pesa PIN when prompted
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                      3
                    </span>
                    Wait for confirmation - we'll detect it automatically
                  </li>
                </ol>
              </div>
            )}

            <div className="text-center">
              <Button variant="ghost" size="sm" onClick={() => setStep("confirmation")} className="text-blue-600">
                Having issues? Manual confirmation
              </Button>
            </div>
          </div>
        )}

        {step === "confirmation" && (
          <div className="space-y-4">
            <div className="text-center">
              <Clock className="w-12 h-12 text-orange-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Confirm Payment Status</h3>
              <p className="text-sm text-gray-600">Did you complete the M-Pesa payment on your phone?</p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Check your phone:</strong> You should have received an M-Pesa confirmation SMS if the payment
                was successful.
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => handleManualConfirmation(true)} className="flex-1 bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Payment Completed
              </Button>
              <Button variant="outline" onClick={() => handleManualConfirmation(false)} className="flex-1">
                <AlertCircle className="w-4 h-4 mr-2" />
                Payment Failed
              </Button>
            </div>

            <div className="text-center">
              <Button variant="ghost" size="sm" onClick={() => setStep("phone")} className="text-blue-600">
                Try Different Number
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
