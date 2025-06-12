"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, Plus } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { FinishUsageButton } from "@/components/finish-usage-button"
import { useRouter } from "next/navigation"

interface Booking {
  booking_id: number
  classroom_id: number
  classroom_number: string
  start_time: string
  end_time: string
  purpose: string
  status: "upcoming" | "active" | "completed"
}

interface Classroom {
  classroom_id: number
  room_number: string
  capacity: number
  status: "available" | "booked"
  room_type: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [availableRooms, setAvailableRooms] = useState<Classroom[]>([])
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    availableRooms: 0,
    totalRooms: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch available rooms
        const roomsResponse = await fetch('http://localhost:8000/classroom/search?status=available', {
          credentials: 'include',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        const roomsData = await roomsResponse.json()
        console.log('Available Rooms API Response:', roomsData) // Debug log
        
        if (roomsData.Status === "Success") {
          setAvailableRooms(roomsData.Classrooms)
          setStats(prev => ({
            ...prev,
            availableRooms: roomsData.Classrooms.length
          }))
        }

        // Fetch all rooms for total count
        const allRoomsResponse = await fetch('http://localhost:8000/classroom/search', {
          credentials: 'include',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        const allRoomsData = await allRoomsResponse.json()
        console.log('All Rooms API Response:', allRoomsData) // Debug log
        
        if (allRoomsData.Status === "Success") {
          setStats(prev => ({
            ...prev,
            totalRooms: allRoomsData.Classrooms.length
          }))
        }

        // Fetch user's bookings using the /bookings/user endpoint
        const bookingsResponse = await fetch('http://localhost:8000/bookings/user', {
          credentials: 'include',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        const bookingsData = await bookingsResponse.json()
        console.log('Bookings API Response:', bookingsData) // Debug log
        
        if (bookingsData.Status === "Success") {
          // Format the bookings data to match our interface
          const formattedBookings = bookingsData.Bookings.map((booking: any) => ({
            booking_id: booking.booking_id,
            classroom_id: booking.classroom_id,
            classroom_number: booking.room_number, // Note: backend returns room_number
            start_time: booking.start_time,
            end_time: booking.end_time,
            purpose: booking.purpose,
            status: getBookingStatus(booking.start_time, booking.end_time)
          }))
          console.log('Formatted Bookings:', formattedBookings) // Debug log
          
          setRecentBookings(formattedBookings)
          
          // Update stats based on booking statuses
          const activeBookings = formattedBookings.filter((b: Booking) => b.status === "active").length
          setStats(prev => ({
            ...prev,
            totalBookings: formattedBookings.length,
            activeBookings: activeBookings
          }))
        }
      } catch (err) {
        setError("Failed to load dashboard data")
        console.error("Dashboard data fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getBookingStatus = (startTime: string, endTime: string): "upcoming" | "active" | "completed" => {
    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(endTime)

    if (now < start) return "upcoming"
    if (now >= start && now <= end) return "active"
    return "completed"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleFinishUsage = async (bookingId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/finish-usage/${bookingId}`, {
        method: 'POST',
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.Status === "Success") {
        // Update the booking status in the dashboard
        setRecentBookings((prev) =>
          prev.map((b) => (b.booking_id === bookingId ? { ...b, status: "completed" as const } : b))
        )
        // Update stats
        setStats(prev => ({
          ...prev,
          activeBookings: prev.activeBookings - 1
        }))
      }
    } catch (err) {
      console.error("Error finishing usage:", err)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading dashboard data...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-red-600">{error}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's your classroom overview.</p>
          </div>
          <div className="flex gap-3">
            <Button asChild className="bg-purple-600 hover:bg-purple-700">
              <Link href="/bookings/new">
                <Plus className="h-4 w-4 mr-2" />
                New Booking
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalBookings}</div>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="border-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Bookings</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.activeBookings}</div>
              <p className="text-xs text-gray-500 mt-1">Currently running</p>
            </CardContent>
          </Card>

          <Card className="border-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Available Rooms</CardTitle>
              <MapPin className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.availableRooms}</div>
              <p className="text-xs text-gray-500 mt-1">Ready to book</p>
            </CardContent>
          </Card>

          <Card className="border-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Rooms</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalRooms}</div>
              <p className="text-xs text-gray-500 mt-1">In system</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Recent Bookings</CardTitle>
              <CardDescription>Your latest classroom reservations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.booking_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{booking.classroom_number}</span>
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{booking.purpose}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(booking.start_time).toLocaleDateString()} • {new Date(booking.start_time).toLocaleTimeString()} - {new Date(booking.end_time).toLocaleTimeString()}
                      </p>
                    </div>
                    {booking.status === "active" && (
                      <FinishUsageButton
                        bookingId={booking.booking_id}
                        onFinish={() => handleFinishUsage(booking.booking_id)}
                      />
                    )}
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/bookings">View All Bookings</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Available Rooms */}
          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Available Rooms</CardTitle>
              <CardDescription>Rooms ready for booking right now</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableRooms.map((room) => (
                  <div
                    key={room.classroom_id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{room.room_number}</span>
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          {room.room_type.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">Capacity: {room.capacity} people</p>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => router.push(`/bookings/new?room=${room.classroom_id}`)}
                    >
                      Book Now
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/classrooms">Browse All Rooms</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
