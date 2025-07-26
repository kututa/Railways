"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/providers/auth-provider"
import { Train, Ticket, Clock, MapPin, Calendar, CreditCard } from "lucide-react"
import Link from "next/link"

type DashboardStats = {
  totalBookings: number
  upcomingTrips: number
  totalSpent: number
  favoriteRoute: string
}

type RecentBooking = {
  id: string
  booking_reference: string
  travel_date: string
  status: string
  total_amount: number
  train: {
    name: string
    number: string
    route: {
      origin_station: { name: string; code: string }
      destination_station: { name: string; code: string }
    }
  }
}

export default function DashboardPage() {
  const { user, userProfile } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    upcomingTrips: 0,
    totalSpent: 0,
    favoriteRoute: "N/A",
  })
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      // Fetch all bookings for stats
      const { data: allBookings, error: bookingsError } = await supabase
        .from("bookings")
        .select(`
          *,
          train:trains (
            name,
            number,
            route:routes (
              origin_station:stations!routes_origin_station_id_fkey (name, code),
              destination_station:stations!routes_destination_station_id_fkey (name, code)
            )
          )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (bookingsError) throw bookingsError

      // Calculate stats
      const totalBookings = allBookings?.length || 0
      const upcomingTrips =
        allBookings?.filter((booking) => new Date(booking.travel_date) > new Date() && booking.status === "confirmed")
          .length || 0
      const totalSpent = allBookings?.reduce((sum, booking) => sum + booking.total_amount, 0) || 0

      // Find favorite route (most booked)
      const routeCounts: { [key: string]: number } = {}
      allBookings?.forEach((booking) => {
        const routeKey = `${booking.train.route.origin_station.code}-${booking.train.route.destination_station.code}`
        routeCounts[routeKey] = (routeCounts[routeKey] || 0) + 1
      })
      const favoriteRoute =
        Object.keys(routeCounts).length > 0
          ? Object.keys(routeCounts).reduce((a, b) => (routeCounts[a] > routeCounts[b] ? a : b))
          : "N/A"

      setStats({
        totalBookings,
        upcomingTrips,
        totalSpent,
        favoriteRoute,
      })

      // Set recent bookings (last 5)
      setRecentBookings(allBookings?.slice(0, 5) || [])
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {userProfile?.full_name?.split(" ")[0]}!</h1>
          <p className="text-gray-600">Here's your travel overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">All time bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Trips</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingTrips}</div>
              <p className="text-xs text-muted-foreground">Confirmed journeys</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KSh {stats.totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Lifetime spending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorite Route</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.favoriteRoute}</div>
              <p className="text-xs text-muted-foreground">Most traveled</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Recent Bookings
                </CardTitle>
                <CardDescription>Your latest travel bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {recentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Train className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">{booking.train.name}</span>
                            <Badge variant="secondary">{booking.train.number}</Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            {booking.train.route.origin_station.name} → {booking.train.route.destination_station.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(booking.travel_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(booking.status)}>{booking.status.toUpperCase()}</Badge>
                          <div className="text-sm font-medium mt-1">KSh {booking.total_amount.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Train className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No bookings yet</p>
                    <Button asChild>
                      <Link href="/search">Book Your First Journey</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/search">
                    <Train className="mr-2 h-4 w-4" />
                    Book New Journey
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/bookings">
                    <Ticket className="mr-2 h-4 w-4" />
                    View All Bookings
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/routes">
                    <MapPin className="mr-2 h-4 w-4" />
                    Explore Routes
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Travel Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Travel Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Arrive 30 minutes before departure for smooth boarding</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Book window seats early for scenic views</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Save passenger details for faster future bookings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
