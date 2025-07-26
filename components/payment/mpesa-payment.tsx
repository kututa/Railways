"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Phone, CheckCircle, Clock, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"

type MpesaPaymentProps = {
  amount: number
  bookingReference: string
  onPaymentComplete: (success: boolean, transactionId?: string) => void
  onCancel: () => void
}

export function MpesaPayment({ amount, bookingReference, onPaymentComplete, onCancel }: MpesaPaymentProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [step, setStep] = useState<"phone" | "instructions" | "confirmation">("phone")
  const [loading, setLoading] = useState(false)

  const handlePhoneSubmit = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number")
      return
    }

    setLoading(true)

    // Simulate sending STK push
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setLoading(false)
    setStep("instructions")

    toast.success("Payment request sent to your phone!")
  }

  const handlePaymentConfirmation = async (success: boolean) => {
    if (success) {
      // Simulate payment verification
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setLoading(false)

      const transactionId = "MP" + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase()
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
        <CardTitle className="text-xl">M-Pesa Payment</CardTitle>
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
                  placeholder="0712345678"
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
                {loading ? "Sending..." : "Send Payment Request"}
              </Button>
              <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {step === "instructions" && (
          <div className="space-y-4">
            <div className="text-center">
              <Clock className="w-12 h-12 text-orange-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Check Your Phone</h3>
              <p className="text-sm text-gray-600">
                A payment request has been sent to <strong>{phoneNumber}</strong>
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-3">Follow these steps:</h4>
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
                  Wait for confirmation SMS
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                    4
                  </span>
                  Click "Payment Completed" below
                </li>
              </ol>
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="text-sm text-center text-gray-600">Did you complete the payment on your phone?</p>

              <div className="flex gap-3">
                <Button
                  onClick={() => handlePaymentConfirmation(true)}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {loading ? "Verifying..." : "Payment Completed"}
                </Button>
                <Button variant="outline" onClick={() => handlePaymentConfirmation(false)} className="flex-1">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Payment Failed
                </Button>
              </div>
            </div>

            <div className="text-center">
              <Button variant="ghost" size="sm" onClick={() => setStep("phone")} className="text-blue-600">
                Use Different Number
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
