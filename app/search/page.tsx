"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { Search, Train, Clock, MapPin, ArrowRight } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

type Station = {
  id: string
  name: string
  code: string
  city: string
}

type TrainResult = {
  id: string
  name: string
  number: string
  departure_time: string
  arrival_time: string
  route: {
    name: string
    distance_km: number
    duration_minutes: number
    origin_station: Station
    destination_station: Station
  }
  classes: Array<{
    id: string
    class_type: string
    total_seats: number
    price_per_km: number
  }>
}

export default function SearchPage() {
  const [stations, setStations] = useState<Station[]>([])
  const [searchParams, setSearchParams] = useState({
    origin: "",
    destination: "",
    travelDate: "",
  })
  const [trains, setTrains] = useState<TrainResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    fetchStations()
    // Set default date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setSearchParams((prev) => ({
      ...prev,
      travelDate: tomorrow.toISOString().split("T")[0],
    }))
  }, [])

  const fetchStations = async () => {
    const { data, error } = await supabase.from("stations").select("*").order("name")

    if (error) {
      toast.error("Failed to load stations")
    } else {
      setStations(data || [])
    }
  }

  const searchTrains = async () => {
    if (!searchParams.origin || !searchParams.destination || !searchParams.travelDate) {
      toast.error("Please fill in all search fields")
      return
    }

    if (searchParams.origin === searchParams.destination) {
      toast.error("Origin and destination cannot be the same")
      return
    }

    setLoading(true)
    setSearched(true)

    try {
      const { data, error } = await supabase
        .from("trains")
        .select(`
          *,
          route:routes (
            *,
            origin_station:stations!routes_origin_station_id_fkey (*),
            destination_station:stations!routes_destination_station_id_fkey (*)
          ),
          classes:train_classes (*)
        `)
        .eq("is_active", true)
        .eq("route.origin_station_id", searchParams.origin)
        .eq("route.destination_station_id", searchParams.destination)

      if (error) {
        toast.error("Failed to search trains")
        setTrains([])
      } else {
        setTrains(data || [])
        if (!data || data.length === 0) {
          toast.info("No trains found for the selected route and date")
        }
      }
    } catch (error) {
      toast.error("An error occurred while searching")
      setTrains([])
    } finally {
      setLoading(false)
    }
  }

  const calculatePrice = (pricePerKm: number, distanceKm: number) => {
    return Math.round(pricePerKm * distanceKm)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="mr-2 h-5 w-5" />
              Search Trains
            </CardTitle>
            <CardDescription>Find and book your perfect journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">From</Label>
                <Select
                  value={searchParams.origin}
                  onValueChange={(value) => setSearchParams((prev) => ({ ...prev, origin: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select origin" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((station) => (
                      <SelectItem key={station.id} value={station.id}>
                        {station.name} ({station.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">To</Label>
                <Select
                  value={searchParams.destination}
                  onValueChange={(value) => setSearchParams((prev) => ({ ...prev, destination: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((station) => (
                      <SelectItem key={station.id} value={station.id}>
                        {station.name} ({station.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="travelDate">Travel Date</Label>
                <Input
                  id="travelDate"
                  type="date"
                  value={searchParams.travelDate}
                  onChange={(e) => setSearchParams((prev) => ({ ...prev, travelDate: e.target.value }))}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="flex items-end">
                <Button onClick={searchTrains} disabled={loading} className="w-full">
                  {loading ? "Searching..." : "Search Trains"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searched && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              {trains.length > 0 ? `Found ${trains.length} train(s)` : "No trains found"}
            </h2>

            {trains.map((train) => (
              <Card key={train.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Train Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Train className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold">{train.name}</h3>
                        <Badge variant="secondary">{train.number}</Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{train.route.origin_station.name}</span>
                          <ArrowRight className="h-4 w-4" />
                          <span>{train.route.destination_station.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDuration(train.route.duration_minutes)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <span className="text-gray-500">Departure:</span>
                          <span className="ml-1 font-medium">{formatTime(train.departure_time)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Arrival:</span>
                          <span className="ml-1 font-medium">{formatTime(train.arrival_time)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Distance:</span>
                          <span className="ml-1 font-medium">{train.route.distance_km} km</span>
                        </div>
                      </div>
                    </div>

                    {/* Classes and Pricing */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      {train.classes.map((trainClass) => (
                        <div key={trainClass.id} className="text-center p-3 border rounded-lg">
                          <div className="font-medium capitalize mb-1">{trainClass.class_type.replace("_", " ")}</div>
                          <div className="text-lg font-bold text-green-600 mb-2">
                            KSh {calculatePrice(trainClass.price_per_km, train.route.distance_km).toLocaleString()}
                          </div>
                          <Button size="sm" asChild>
                            <Link
                              href={`/booking?train=${train.id}&class=${trainClass.id}&date=${searchParams.travelDate}`}
                            >
                              Select
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Popular Routes */}
        {!searched && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Popular Routes</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Train className="mr-2 h-5 w-5 text-blue-600" />
                    Mombasa → Nairobi
                  </CardTitle>
                  <CardDescription>Madaraka Express</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Duration:</span> 8 hours
                    </p>
                    <p>
                      <span className="font-medium">Distance:</span> 485 km
                    </p>
                    <p>
                      <span className="font-medium">From:</span>{" "}
                      <span className="text-green-600 font-bold">KSh 1,212</span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Train className="mr-2 h-5 w-5 text-blue-600" />
                    Nairobi → Naivasha
                  </CardTitle>
                  <CardDescription>Naivasha Commuter</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Duration:</span> 2 hours
                    </p>
                    <p>
                      <span className="font-medium">Distance:</span> 90 km
                    </p>
                    <p>
                      <span className="font-medium">From:</span>{" "}
                      <span className="text-green-600 font-bold">KSh 162</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
