"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/providers/auth-provider"
import { Armchair } from "lucide-react"
import toast from "react-hot-toast"

type Seat = {
  id: string
  seat_number: string
  is_window: boolean
  status: "available" | "selected" | "booked" | "locked"
}

type SeatSelectionProps = {
  trainClassId: string
  trainId: string
  travelDate: string
  onSeatSelect: (seatId: string | null) => void
  selectedSeatId: string | null
}

export function SeatSelection({ trainClassId, trainId, travelDate, onSeatSelect, selectedSeatId }: SeatSelectionProps) {
  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchSeats()

    // Set up real-time subscription for seat updates
    const subscription = supabase
      .channel("seat-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `train_id=eq.${trainId}`,
        },
        () => {
          fetchSeats()
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "seat_locks",
          filter: `train_id=eq.${trainId}`,
        },
        () => {
          fetchSeats()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [trainClassId, trainId, travelDate])

  const fetchSeats = async () => {
    try {
      // Get all seats for this train class
      const { data: seatsData, error: seatsError } = await supabase
        .from("seats")
        .select("*")
        .eq("train_class_id", trainClassId)
        .order("seat_number")

      if (seatsError) throw seatsError

      // Get booked seats for this date
      const { data: bookedSeats, error: bookedError } = await supabase
        .from("bookings")
        .select("seat_id")
        .eq("train_id", trainId)
        .eq("travel_date", travelDate)
        .eq("status", "confirmed")

      if (bookedError) throw bookedError

      // Get locked seats (excluding current user's locks)
      const { data: lockedSeats, error: lockedError } = await supabase
        .from("seat_locks")
        .select("seat_id")
        .eq("train_id", trainId)
        .eq("travel_date", travelDate)
        .neq("user_id", user?.id || "")
        .gt("locked_until", new Date().toISOString())

      if (lockedError) throw lockedError

      const bookedSeatIds = new Set(bookedSeats?.map((b) => b.seat_id) || [])
      const lockedSeatIds = new Set(lockedSeats?.map((l) => l.seat_id) || [])

      const seatsWithStatus =
        seatsData?.map((seat) => ({
          ...seat,
          status: bookedSeatIds.has(seat.id)
            ? ("booked" as const)
            : lockedSeatIds.has(seat.id)
              ? ("locked" as const)
              : seat.id === selectedSeatId
                ? ("selected" as const)
                : ("available" as const),
        })) || []

      setSeats(seatsWithStatus)
    } catch (error) {
      toast.error("Failed to load seats")
    } finally {
      setLoading(false)
    }
  }

  const handleSeatClick = async (seat: Seat) => {
    if (seat.status === "booked" || seat.status === "locked") {
      return
    }

    if (seat.status === "selected") {
      // Deselect seat
      await releaseSeatLock(seat.id)
      onSeatSelect(null)
      return
    }

    // Release previous seat lock if any
    if (selectedSeatId) {
      await releaseSeatLock(selectedSeatId)
    }

    // Lock the new seat
    const success = await lockSeat(seat.id)
    if (success) {
      onSeatSelect(seat.id)
    }
  }

  const lockSeat = async (seatId: string): Promise<boolean> => {
    try {
      const lockUntil = new Date()
      lockUntil.setMinutes(lockUntil.getMinutes() + 10) // 10 minute lock

      const { error } = await supabase.from("seat_locks").upsert({
        seat_id: seatId,
        train_id: trainId,
        travel_date: travelDate,
        user_id: user?.id,
        locked_until: lockUntil.toISOString(),
      })

      if (error) {
        toast.error("Failed to select seat")
        return false
      }

      return true
    } catch (error) {
      toast.error("Failed to select seat")
      return false
    }
  }

  const releaseSeatLock = async (seatId: string) => {
    try {
      await supabase.from("seat_locks").delete().eq("seat_id", seatId).eq("user_id", user?.id)
    } catch (error) {
      console.error("Failed to release seat lock:", error)
    }
  }

  const getSeatIcon = (seat: Seat) => {
    return seat.is_window ? "🪟" : "🪑"
  }

  const getSeatClass = (seat: Seat) => {
    switch (seat.status) {
      case "available":
        return "seat-available"
      case "selected":
        return "seat-selected"
      case "booked":
        return "seat-booked"
      case "locked":
        return "seat-locked"
      default:
        return "seat-available"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Armchair className="mr-2 h-5 w-5" />
            Select Your Seat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group seats by rows (4 seats per row: A, B, C, D)
  const seatRows = []
  for (let i = 0; i < seats.length; i += 4) {
    seatRows.push(seats.slice(i, i + 4))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Armchair className="mr-2 h-5 w-5" />
          Select Your Seat
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 seat-available rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 seat-selected rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 seat-booked rounded"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 seat-locked rounded"></div>
            <span>Temporarily Locked</span>
          </div>
        </div>

        {/* Seat Map */}
        <div className="max-w-md mx-auto">
          <div className="text-center mb-4 text-sm text-gray-500">Front of Train</div>

          <div className="space-y-2">
            {seatRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-2">
                {/* Left side seats (A, B) */}
                <div className="flex gap-1">
                  {row.slice(0, 2).map((seat) => (
                    <Button
                      key={seat.id}
                      variant="outline"
                      size="sm"
                      className={`w-12 h-12 p-0 text-xs ${getSeatClass(seat)}`}
                      onClick={() => handleSeatClick(seat)}
                      disabled={seat.status === "booked" || seat.status === "locked"}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-xs">{getSeatIcon(seat)}</span>
                        <span className="text-xs">{seat.seat_number}</span>
                      </div>
                    </Button>
                  ))}
                </div>

                {/* Aisle */}
                <div className="w-8 flex items-center justify-center">
                  <div className="w-px h-8 bg-gray-300"></div>
                </div>

                {/* Right side seats (C, D) */}
                <div className="flex gap-1">
                  {row.slice(2, 4).map((seat) => (
                    <Button
                      key={seat.id}
                      variant="outline"
                      size="sm"
                      className={`w-12 h-12 p-0 text-xs ${getSeatClass(seat)}`}
                      onClick={() => handleSeatClick(seat)}
                      disabled={seat.status === "booked" || seat.status === "locked"}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-xs">{getSeatIcon(seat)}</span>
                        <span className="text-xs">{seat.seat_number}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-4 text-sm text-gray-500">Back of Train</div>
        </div>

        {selectedSeatId && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Armchair className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Selected Seat:</span>
              <Badge variant="secondary">{seats.find((s) => s.id === selectedSeatId)?.seat_number}</Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1">Seat reserved for 10 minutes. Complete booking to confirm.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
