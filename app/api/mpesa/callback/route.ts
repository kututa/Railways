import { type NextRequest, NextResponse } from "next/server"
import { validateCallback } from "@/lib/mpesa"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const callbackData = await request.json()
    console.log("M-Pesa Callback received:", JSON.stringify(callbackData, null, 2))

    // Validate callback data
    const validation = validateCallback(callbackData)

    if (!validation.isValid) {
      console.error("Invalid callback data")
      return NextResponse.json({ ResultCode: 1, ResultDesc: "Invalid callback data" })
    }

    const { Body } = callbackData
    const { stkCallback } = Body
    const checkoutRequestId = stkCallback.CheckoutRequestID

    // Find the payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*, booking:bookings(*)")
      .eq("transaction_id", checkoutRequestId)
      .single()

    if (paymentError || !payment) {
      console.error("Payment not found for checkout request:", checkoutRequestId)
      return NextResponse.json({ ResultCode: 1, ResultDesc: "Payment not found" })
    }

    if (validation.resultCode === "0") {
      // Payment successful
      await supabase
        .from("payments")
        .update({
          status: "completed",
          transaction_id: validation.mpesaReceiptNumber || checkoutRequestId,
          metadata: {
            ...payment.metadata,
            mpesa_receipt_number: validation.mpesaReceiptNumber,
            transaction_date: validation.transactionDate,
            result_desc: validation.resultDesc,
          },
        })
        .eq("id", payment.id)

      // Update booking status
      await supabase.from("bookings").update({ status: "confirmed" }).eq("id", payment.booking_id)

      // Remove seat lock
      await supabase
        .from("seat_locks")
        .delete()
        .eq("seat_id", payment.booking.seat_id)
        .eq("user_id", payment.booking.user_id)

      console.log("Payment completed successfully:", validation.mpesaReceiptNumber)
    } else {
      // Payment failed
      await supabase
        .from("payments")
        .update({
          status: "failed",
          metadata: {
            ...payment.metadata,
            result_code: validation.resultCode,
            result_desc: validation.resultDesc,
          },
        })
        .eq("id", payment.id)

      // Update booking status
      await supabase.from("bookings").update({ status: "cancelled" }).eq("id", payment.booking_id)

      console.log("Payment failed:", validation.resultDesc)
    }

    // Acknowledge callback
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Callback processed successfully",
    })
  } catch (error) {
    console.error("Callback processing error:", error)
    return NextResponse.json({
      ResultCode: 1,
      ResultDesc: "Callback processing failed",
    })
  }
}
