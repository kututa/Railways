"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { CheckCircle, Download, Train, User, CreditCard, ArrowRight } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

type BookingDetails = {
  id: string
  booking_reference: string
  travel_date: string
  total_amount: number
  status: string
  created_at: string
  train: {
    name: string
    number: string
    departure_time: string
    arrival_time: string
    route: {
      distance_km: number
      duration_minutes: number
      origin_station: { name: string; code: string }
      destination_station: { name: string; code: string }
    }
  }
  passenger: {
    full_name: string
    id_number: string
    phone: string
    email: string
  }
  seat: {
    seat_number: string
    is_window: boolean
  }
  class_type: string
  payment: {
    payment_method: string
    transaction_id: string
    status: string
  }
}

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const bookingRef = searchParams.get("ref")

  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (bookingRef) {
      fetchBookingDetails()
    }
  }, [bookingRef])

  const fetchBookingDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          train:trains (
            name,
            number,
            departure_time,
            arrival_time,
            route:routes (
              distance_km,
              duration_minutes,
              origin_station:stations!routes_origin_station_id_fkey (name, code),
              destination_station:stations!routes_destination_station_id_fkey (name, code)
            )
          ),
          passenger:passengers (
            full_name,
            id_number,
            phone,
            email
          ),
          seat:seats (
            seat_number,
            is_window
          ),
          payment:payments (
            payment_method,
            transaction_id,
            status
          )
        `)
        .eq("booking_reference", bookingRef)
        .single()

      if (error) throw error
      setBooking(data)
    } catch (error) {
      toast.error("Booking not found")
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const downloadTicket = async () => {
    if (!booking) return

    // Create ticket content
    const ticketContent = `
      KUTUTA RAILWAY TICKET
      =====================
      
      Booking Reference: ${booking.booking_reference}
      
      JOURNEY DETAILS
      ---------------
      Train: ${booking.train.name} (${booking.train.number})
      Route: ${booking.train.route.origin_station.name} → ${booking.train.route.destination_station.name}
      Date: ${new Date(booking.travel_date).toLocaleDateString()}
      Departure: ${formatTime(booking.train.departure_time)}
      Arrival: ${formatTime(booking.train.arrival_time)}
      Duration: ${formatDuration(booking.train.route.duration_minutes)}
      
      PASSENGER DETAILS
      -----------------
      Name: ${booking.passenger.full_name}
      ID Number: ${booking.passenger.id_number}
      Phone: ${booking.passenger.phone}
      
      SEAT DETAILS
      ------------
      Class: ${booking.class_type.replace("_", " ").toUpperCase()}
      Seat: ${booking.seat.seat_number} ${booking.seat.is_window ? "(Window)" : "(Aisle)"}
      
      PAYMENT DETAILS
      ---------------
      Amount: KSh ${booking.total_amount.toLocaleString()}
      Method: ${booking.payment.payment_method.toUpperCase()}
      Transaction ID: ${booking.payment.transaction_id}
      
      Status: CONFIRMED
      
      Please arrive at the station 30 minutes before departure.
      Present this ticket and valid ID for boarding.
      
      Thank you for choosing Kututa Railway!
    `

    // Create and download file
    const blob = new Blob([ticketContent], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `kututa-ticket-${booking.booking_reference}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast.success("Ticket downloaded successfully!")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
            <p className="text-gray-600 mb-6">The booking reference you provided could not be found.</p>
            <Button asChild>
              <Link href="/search">Book New Journey</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-green-600 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600">Your train ticket has been successfully booked.</p>
          </div>

          {/* Booking Details Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Booking Details</span>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {booking.booking_reference}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Journey Details */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Train className="mr-2 h-4 w-4" />
                  Journey Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Train:</span>
                    <p className="font-medium">
                      {booking.train.name} ({booking.train.number})
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Class:</span>
                    <p className="font-medium capitalize">{booking.class_type.replace("_", " ")}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Route:</span>
                    <p className="font-medium flex items-center">
                      {booking.train.route.origin_station.name}
                      <ArrowRight className="h-4 w-4 mx-1" />
                      {booking.train.route.destination_station.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <p className="font-medium">{new Date(booking.travel_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Departure:</span>
                    <p className="font-medium">{formatTime(booking.train.departure_time)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Arrival:</span>
                    <p className="font-medium">{formatTime(booking.train.arrival_time)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Passenger Details */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Passenger Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <p className="font-medium">{booking.passenger.full_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">ID Number:</span>
                    <p className="font-medium">{booking.passenger.id_number}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <p className="font-medium">{booking.passenger.phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Seat:</span>
                    <p className="font-medium">
                      {booking.seat.seat_number} {booking.seat.is_window ? "(Window)" : "(Aisle)"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Details */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Payment Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Amount:</span>
                    <p className="font-medium text-green-600">KSh {booking.total_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Method:</span>
                    <div className="flex items-center gap-2">
                      {booking.payment.payment_method === "mpesa" && (
                        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">M</span>
                        </div>
                      )}
                      <p className="font-medium capitalize">{booking.payment.payment_method}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Transaction ID:</span>
                    <p className="font-medium">{booking.payment.transaction_id}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {booking.payment.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {booking.payment.payment_method === "mpesa" && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      <strong>M-Pesa Payment Confirmed</strong>
                      <br />
                      You should have received an M-Pesa confirmation SMS for this transaction. Keep this message for
                      your records.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={downloadTicket} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download Ticket
            </Button>
            <Button variant="outline" asChild className="flex-1 bg-transparent">
              <Link href="/bookings">View All Bookings</Link>
            </Button>
          </div>

          {/* Important Notice */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-blue-800 mb-2">Important Information</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Please arrive at the station 30 minutes before departure</li>
                <li>• Carry a valid ID that matches the passenger details</li>
                <li>• Present this ticket (digital or printed) for boarding</li>
                <li>• Contact support for any changes or cancellations</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
