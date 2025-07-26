import { type NextRequest, NextResponse } from "next/server"
import { querySTKPushStatus } from "@/lib/mpesa"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { checkoutRequestId, bookingId } = await request.json()

    if (!checkoutRequestId || !bookingId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Query M-Pesa status
    const result = await querySTKPushStatus(checkoutRequestId)

    if (result.success) {
      // Update payment status based on result
      const { data: payment } = await supabase
        .from("payments")
        .select("*")
        .eq("transaction_id", checkoutRequestId)
        .single()

      if (payment) {
        if (result.resultCode === "0") {
          // Payment successful
          await supabase
            .from("payments")
            .update({
              status: "completed",
              transaction_id: result.mpesaReceiptNumber || checkoutRequestId,
              metadata: {
                ...payment.metadata,
                mpesa_receipt_number: result.mpesaReceiptNumber,
                transaction_date: result.transactionDate,
                result_desc: result.resultDesc,
              },
            })
            .eq("id", payment.id)

          await supabase.from("bookings").update({ status: "confirmed" }).eq("id", bookingId)

          return NextResponse.json({
            success: true,
            status: "completed",
            mpesaReceiptNumber: result.mpesaReceiptNumber,
            message: "Payment completed successfully",
          })
        } else if (result.resultCode === "1032") {
          // Payment cancelled by user
          await supabase
            .from("payments")
            .update({
              status: "cancelled",
              metadata: {
                ...payment.metadata,
                result_code: result.resultCode,
                result_desc: result.resultDesc,
              },
            })
            .eq("id", payment.id)

          return NextResponse.json({
            success: false,
            status: "cancelled",
            message: "Payment was cancelled",
          })
        } else {
          // Payment still pending or other status
          return NextResponse.json({
            success: true,
            status: "pending",
            message: "Payment is still being processed",
          })
        }
      }
    }

    return NextResponse.json(
      { success: false, error: result.error || "Failed to check payment status" },
      { status: 400 },
    )
  } catch (error) {
    console.error("Status check error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
