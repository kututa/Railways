"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { SeatSelection } from "@/components/booking/seat-selection"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/providers/auth-provider"
import { Train, User, CreditCard, MapPin, Clock, ArrowRight } from "lucide-react"
import toast from "react-hot-toast"
import { RealMpesaPayment } from "@/components/payment/real-mpesa-payment"

type TrainDetails = {
  id: string
  name: string
  number: string
  departure_time: string
  arrival_time: string
  route: {
    name: string
    distance_km: number
    duration_minutes: number
    origin_station: { name: string; code: string }
    destination_station: { name: string; code: string }
  }
}

type TrainClass = {
  id: string
  class_type: string
  total_seats: number
  price_per_km: number
}

type Passenger = {
  id?: string
  full_name: string
  id_number: string
  phone: string
  email: string
}

export default function BookingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, userProfile } = useAuth()

  const trainId = searchParams.get("train")
  const classId = searchParams.get("class")
  const travelDate = searchParams.get("date")

  const [trainDetails, setTrainDetails] = useState<TrainDetails | null>(null)
  const [trainClass, setTrainClass] = useState<TrainClass | null>(null)
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null)
  const [savedPassengers, setSavedPassengers] = useState<Passenger[]>([])
  const [passenger, setPassenger] = useState<Passenger>({
    full_name: userProfile?.full_name || "",
    id_number: "",
    phone: userProfile?.phone || "",
    email: userProfile?.email || "",
  })
  const [paymentMethod, setPaymentMethod] = useState("mpesa")
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [showMpesaModal, setShowMpesaModal] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    if (!trainId || !classId || !travelDate) {
      router.push("/search")
      return
    }

    fetchBookingDetails()
    fetchSavedPassengers()
  }, [trainId, classId, travelDate, user])

  const fetchBookingDetails = async () => {
    try {
      // Fetch train details
      const { data: trainData, error: trainError } = await supabase
        .from("trains")
        .select(`
          *,
          route:routes (
            *,
            origin_station:stations!routes_origin_station_id_fkey (*),
            destination_station:stations!routes_destination_station_id_fkey (*)
          )
        `)
        .eq("id", trainId)
        .single()

      if (trainError) throw trainError

      // Fetch train class details
      const { data: classData, error: classError } = await supabase
        .from("train_classes")
        .select("*")
        .eq("id", classId)
        .single()

      if (classError) throw classError

      setTrainDetails(trainData)
      setTrainClass(classData)
    } catch (error) {
      toast.error("Failed to load booking details")
      router.push("/search")
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedPassengers = async () => {
    try {
      const { data, error } = await supabase
        .from("passengers")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setSavedPassengers(data || [])
    } catch (error) {
      console.error("Failed to fetch saved passengers:", error)
    }
  }

  const calculateTotalAmount = () => {
    if (!trainClass || !trainDetails) return 0
    return Math.round(trainClass.price_per_km * trainDetails.route.distance_km)
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

  const generateBookingReference = () => {
    return "KR" + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase()
  }

  const simulatePayment = async (): Promise<boolean> => {
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // 90% success rate for demo
    return Math.random() > 0.1
  }

  const handleBooking = async () => {
    if (!selectedSeatId) {
      toast.error("Please select a seat")
      return
    }

    if (!passenger.full_name || !passenger.id_number || !passenger.phone) {
      toast.error("Please fill in all passenger details")
      return
    }

    setBooking(true)

    try {
      // Save passenger if not exists
      let passengerId = passenger.id
      if (!passengerId) {
        const { data: passengerData, error: passengerError } = await supabase
          .from("passengers")
          .insert({
            user_id: user?.id,
            full_name: passenger.full_name,
            id_number: passenger.id_number,
            phone: passenger.phone,
            email: passenger.email,
          })
          .select()
          .single()

        if (passengerError) throw passengerError
        passengerId = passengerData.id
      }

      // Create booking
      const bookingReference = generateBookingReference()
      const totalAmount = calculateTotalAmount()

      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: user?.id,
          train_id: trainId,
          passenger_id: passengerId,
          seat_id: selectedSeatId,
          travel_date: travelDate,
          class_type: trainClass?.class_type,
          total_amount: totalAmount,
          booking_reference: bookingReference,
          status: "pending",
        })
        .select()
        .single()

      if (bookingError) throw bookingError

      // Handle different payment methods
      if (paymentMethod === "mpesa") {
        // Show M-Pesa payment prompt
        const paymentConfirmed = await showMpesaPaymentPrompt(bookingReference, totalAmount, bookingData.id)

        if (paymentConfirmed) {
          await processSuccessfulPayment(bookingData, totalAmount, bookingReference)
        } else {
          await processFailedPayment(bookingData, totalAmount)
        }
      } else {
        // Simulate other payment methods
        toast.loading("Processing payment...")
        const paymentSuccess = await simulatePayment()

        if (paymentSuccess) {
          await processSuccessfulPayment(bookingData, totalAmount, bookingReference)
        } else {
          await processFailedPayment(bookingData, totalAmount)
        }
      }
    } catch (error) {
      toast.dismiss()
      toast.error("Booking failed. Please try again.")
      console.error("Booking error:", error)
    } finally {
      setBooking(false)
    }
  }

  const showMpesaPaymentPrompt = async (bookingRef: string, amount: number, bookingId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setShowMpesaModal(true)
      // Store the resolve function and booking ID
      window.mpesaPaymentResolve = resolve
      window.currentBookingId = bookingId
    })
  }

  const processSuccessfulPayment = async (bookingData: any, totalAmount: number, bookingReference: string) => {
    // Create payment record
    await supabase.from("payments").insert({
      booking_id: bookingData.id,
      amount: totalAmount,
      payment_method: paymentMethod,
      transaction_id: paymentMethod === "mpesa" ? "MP" + Date.now() : "TXN" + Date.now(),
      status: "completed",
    })

    // Update booking status
    await supabase.from("bookings").update({ status: "confirmed" }).eq("id", bookingData.id)

    // Remove seat lock
    await supabase.from("seat_locks").delete().eq("seat_id", selectedSeatId).eq("user_id", user?.id)

    toast.dismiss()
    toast.success("Payment confirmed! Booking successful!")
    router.push(`/booking-confirmation?ref=${bookingReference}`)
  }

  const processFailedPayment = async (bookingData: any, totalAmount: number) => {
    // Create failed payment record
    await supabase.from("payments").insert({
      booking_id: bookingData.id,
      amount: totalAmount,
      payment_method: paymentMethod,
      status: "failed",
    })

    toast.dismiss()
    toast.error("Payment failed or cancelled. Please try again.")
  }

  const selectSavedPassenger = (savedPassenger: Passenger) => {
    setPassenger(savedPassenger)
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

  if (!trainDetails || !trainClass) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Booking details not found.</p>
            <Button onClick={() => router.push("/search")} className="mt-4">
              Back to Search
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Booking Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Train Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Train className="mr-2 h-5 w-5" />
                    Journey Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{trainDetails.name}</h3>
                        <Badge variant="secondary">{trainDetails.number}</Badge>
                      </div>
                      <Badge className="capitalize">{trainClass.class_type.replace("_", " ")}</Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{trainDetails.route.origin_station.name}</span>
                        <ArrowRight className="h-4 w-4" />
                        <span>{trainDetails.route.destination_station.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(trainDetails.route.duration_minutes)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <p className="font-medium">{new Date(travelDate!).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Departure:</span>
                        <p className="font-medium">{formatTime(trainDetails.departure_time)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Arrival:</span>
                        <p className="font-medium">{formatTime(trainDetails.arrival_time)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Seat Selection */}
              <SeatSelection
                trainClassId={classId!}
                trainId={trainId!}
                travelDate={travelDate!}
                onSeatSelect={setSelectedSeatId}
                selectedSeatId={selectedSeatId}
              />

              {/* Passenger Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Passenger Details
                  </CardTitle>
                  {savedPassengers.length > 0 && <CardDescription>Or select from saved passengers</CardDescription>}
                </CardHeader>
                <CardContent>
                  {/* Saved Passengers */}
                  {savedPassengers.length > 0 && (
                    <div className="mb-6">
                      <Label className="text-sm font-medium mb-2 block">Saved Passengers</Label>
                      <div className="flex flex-wrap gap-2">
                        {savedPassengers.map((savedPassenger) => (
                          <Button
                            key={savedPassenger.id}
                            variant="outline"
                            size="sm"
                            onClick={() => selectSavedPassenger(savedPassenger)}
                            className={passenger.id === savedPassenger.id ? "bg-blue-50 border-blue-300" : ""}
                          >
                            {savedPassenger.full_name}
                          </Button>
                        ))}
                      </div>
                      <Separator className="my-4" />
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={passenger.full_name}
                        onChange={(e) => setPassenger((prev) => ({ ...prev, full_name: e.target.value }))}
                        placeholder="Enter full name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="idNumber">ID Number *</Label>
                      <Input
                        id="idNumber"
                        value={passenger.id_number}
                        onChange={(e) => setPassenger((prev) => ({ ...prev, id_number: e.target.value }))}
                        placeholder="Enter ID number"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={passenger.phone}
                        onChange={(e) => setPassenger((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone number"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={passenger.email}
                        onChange={(e) => setPassenger((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* M-Pesa Payment Instructions */}
                  {paymentMethod === "mpesa" && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-bold text-sm">M</span>
                        </div>
                        <h3 className="font-semibold text-green-800">M-Pesa Payment</h3>
                      </div>
                      <div className="space-y-2 text-sm text-green-700">
                        <p>
                          <strong>Step 1:</strong> Go to M-Pesa menu on your phone
                        </p>
                        <p>
                          <strong>Step 2:</strong> Select "Lipa na M-Pesa"
                        </p>
                        <p>
                          <strong>Step 3:</strong> Select "Buy Goods and Services"
                        </p>
                        <p>
                          <strong>Step 4:</strong> Enter Till Number:{" "}
                          <strong className="bg-green-100 px-2 py-1 rounded">247247</strong>
                        </p>
                        <p>
                          <strong>Step 5:</strong> Enter Amount:{" "}
                          <strong className="bg-green-100 px-2 py-1 rounded">
                            KSh {calculateTotalAmount().toLocaleString()}
                          </strong>
                        </p>
                        <p>
                          <strong>Step 6:</strong> Enter your M-Pesa PIN
                        </p>
                      </div>
                      <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-600">
                        <strong>Reference:</strong> Use booking reference for easy tracking
                      </div>
                    </div>
                  )}

                  {/* Card Payment Instructions */}
                  {paymentMethod === "card" && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center mb-3">
                        <CreditCard className="w-6 h-6 text-blue-600 mr-2" />
                        <h3 className="font-semibold text-blue-800">Card Payment</h3>
                      </div>
                      <p className="text-sm text-blue-700">
                        You will be redirected to our secure payment gateway to complete your card payment.
                      </p>
                    </div>
                  )}

                  {/* Bank Transfer Instructions */}
                  {paymentMethod === "bank" && (
                    <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center mb-3">
                        <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center mr-2">
                          <span className="text-white font-bold text-xs">B</span>
                        </div>
                        <h3 className="font-semibold text-purple-800">Bank Transfer</h3>
                      </div>
                      <div className="space-y-1 text-sm text-purple-700">
                        <p>
                          <strong>Bank:</strong> Equity Bank
                        </p>
                        <p>
                          <strong>Account:</strong> 1234567890
                        </p>
                        <p>
                          <strong>Account Name:</strong> Kututa Railway Ltd
                        </p>
                        <p>
                          <strong>Amount:</strong> KSh {calculateTotalAmount().toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Demo Mode:</strong> This is a simulated payment. No actual charges will be made.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Route:</span>
                      <span className="font-medium">
                        {trainDetails.route.origin_station.code} → {trainDetails.route.destination_station.code}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Date:</span>
                      <span className="font-medium">{new Date(travelDate!).toLocaleDateString()}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Class:</span>
                      <span className="font-medium capitalize">{trainClass.class_type.replace("_", " ")}</span>
                    </div>

                    {selectedSeatId && (
                      <div className="flex justify-between text-sm">
                        <span>Seat:</span>
                        <span className="font-medium">
                          {/* Find seat number from selected seat ID */}
                          Selected
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span>Distance:</span>
                      <span className="font-medium">{trainDetails.route.distance_km} km</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-green-600">KSh {calculateTotalAmount().toLocaleString()}</span>
                    </div>

                    <Button onClick={handleBooking} disabled={!selectedSeatId || booking} className="w-full" size="lg">
                      {booking ? "Processing..." : "Complete Booking"}
                    </Button>

                    <div className="text-xs text-gray-500 text-center">
                      By booking, you agree to our terms and conditions
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* M-Pesa Payment Modal */}
          {showMpesaModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <RealMpesaPayment
                amount={calculateTotalAmount()}
                bookingId={window.currentBookingId || ""}
                bookingReference={generateBookingReference()}
                onPaymentComplete={(success, transactionId) => {
                  setShowMpesaModal(false)
                  if (window.mpesaPaymentResolve) {
                    window.mpesaPaymentResolve(success)
                  }
                }}
                onCancel={() => {
                  setShowMpesaModal(false)
                  if (window.mpesaPaymentResolve) {
                    window.mpesaPaymentResolve(false)
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
