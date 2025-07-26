import { type NextRequest, NextResponse } from "next/server"
import { initiateSTKPush, isMpesaConfigured } from "@/lib/mpesa"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    // Check if M-Pesa is configured
    if (!isMpesaConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "M-Pesa is not configured. Using demo mode.",
          demo: true,
        },
        { status: 200 },
      )
    }

    const { phoneNumber, amount, bookingId, bookingReference } = await request.json()

    // Validate required fields
    if (!phoneNumber || !amount || !bookingId || !bookingReference) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Verify booking exists and is pending
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .eq("status", "pending")
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ success: false, error: "Invalid booking" }, { status: 400 })
    }

    // Initiate STK Push
    const result = await initiateSTKPush(phoneNumber, amount, bookingReference, `Kututa Railway - ${bookingReference}`)

    if (result.success && result.checkoutRequestId) {
      // Store the checkout request ID for status tracking
      await supabase.from("payments").insert({
        booking_id: bookingId,
        amount: amount,
        payment_method: "mpesa",
        transaction_id: result.checkoutRequestId,
        status: "pending",
        metadata: {
          checkout_request_id: result.checkoutRequestId,
          phone_number: phoneNumber,
        },
      })

      return NextResponse.json({
        success: true,
        checkoutRequestId: result.checkoutRequestId,
        message: result.customerMessage || "Payment request sent to your phone",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || result.responseDescription || "Failed to initiate payment",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("STK Push API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
