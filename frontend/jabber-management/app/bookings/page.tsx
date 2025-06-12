"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, MapPin, Plus, Search, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { FinishUsageButton } from "@/components/finish-usage-button"
import { EditBookingModal } from "@/components/edit-booking-modal"
import { DeleteBookingModal } from "@/components/delete-booking-modal"
import { toast } from "sonner"
import { Toaster } from "sonner"

const API_BASE_URL = "http://localhost:8000"

interface Booking {
  booking_id: number
  classroom_id: number
  room_number: string
  start_time: string
  end_time: string
  purpose: string
  status: "upcoming" | "active" | "ended" | "cancelled"
  created_at: string
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
  })
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [deletingBookingId, setDeletingBookingId] = useState<number | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, bookings])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/user`, {
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }

      const data = await response.json()
      console.log('Bookings API Response:', data) // Debug log
      
      if (data.Status === 'Success') {
        const transformedBookings = data.Bookings.map((booking: any) => ({
          booking_id: booking.booking_id,
          classroom_id: booking.classroom_id,
          room_number: booking.room_number,
          start_time: booking.start_time,
          end_time: booking.end_time,
          purpose: booking.purpose,
          status: getBookingStatus(booking),
          created_at: booking.created_at || new Date().toISOString(),
        }))
        console.log('Transformed Bookings:', transformedBookings) // Debug log
        setBookings(transformedBookings)
      } else {
        throw new Error(data.Message || 'Failed to fetch bookings')
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error)
      toast.error("Failed to fetch bookings")
    } finally {
      setLoading(false)
    }
  }

  const getBookingStatus = (booking: any): Booking['status'] => {
    if (booking.status) {
      if (booking.status === 'ended') return 'ended';
      if (booking.status === 'cancelled') return 'cancelled';
      if (booking.status === 'active') return 'active';
      if (booking.status === 'upcoming') return 'upcoming';
    }
    // Fallback to time-based logic if no status field
    const now = new Date();
    const start = new Date(booking.start_time);
    const end = new Date(booking.end_time);
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'active';
    return 'ended';
  }

  const applyFilters = () => {
    let filtered = bookings

    if (filters.search) {
      filtered = filtered.filter(
        (booking) =>
          booking.room_number.toLowerCase().includes(filters.search.toLowerCase()) ||
          booking.purpose.toLowerCase().includes(filters.search.toLowerCase()),
      )
    }

    if (filters.status !== "all") {
      filtered = filtered.filter((booking) => booking.status === filters.status)
    }

    setFilteredBookings(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "ended":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }

  const handleEditBooking = async (updatedData: Partial<Omit<Booking, 'status'>>) => {
    if (!editingBooking) return

    try {
      const response = await fetch(`${API_BASE_URL}/booking/${editingBooking.booking_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedData),
      })

      if (!response.ok) {
        throw new Error('Failed to update booking')
      }

      const data = await response.json()
      if (data.Status === 'Success') {
        setBookings((prev) =>
          prev.map((booking) =>
            booking.booking_id === editingBooking.booking_id
              ? {
                  ...booking,
                  ...updatedData,
                  status: getBookingStatus(booking),
                }
              : booking
          )
        )
        toast.success("Booking updated successfully")
      } else {
        throw new Error(data.Message || 'Failed to update booking')
      }
    } catch (error) {
      console.error("Failed to update booking:", error)
      toast.error("Failed to update booking")
      throw error
    }
  }

  const handleDeleteBooking = async (bookingId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/booking/${bookingId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to delete booking')
      }

      const data = await response.json()
      if (data.Status === 'Success') {
        setBookings((prev) => prev.filter((booking) => booking.booking_id !== bookingId))
      } else {
        throw new Error(data.Message || 'Failed to delete booking')
      }
    } catch (error) {
      console.error("Failed to delete booking:", error)
      throw error
    }
  }

  const handleFinishUsage = async (bookingId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/finish-usage/${bookingId}`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to finish usage')
      }

      const data = await response.json()
      if (data.Status === 'Success') {
        setBookings((prev) =>
          prev.map((b) =>
            b.booking_id === bookingId ? { ...b, status: "ended" as const } : b
          )
        )
        toast.success("Booking marked as ended")
        
        fetchBookings()
      } else {
        throw new Error(data.Message || 'Failed to finish usage')
      }
    } catch (error) {
      console.error("Failed to finish usage:", error)
      toast.error("Failed to finish usage")
    }
  }

  return (
    <DashboardLayout>
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600 mt-1">Manage your classroom reservations</p>
          </div>
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href="/bookings/new">
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-purple-100">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search bookings..."
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                    className="pl-10 border-purple-200 focus:border-purple-400"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="border-purple-200 focus:border-purple-400">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="ended">Ended</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="border-purple-100 animate-pulse">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded mb-2 w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredBookings.length === 0 ? (
            <Card className="border-purple-100">
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-600 mb-4">
                  You haven't made any bookings yet or no bookings match your search.
                </p>
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/bookings/new">Create Your First Booking</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredBookings.map((booking) => {
              const startDateTime = formatDateTime(booking.start_time)
              const endDateTime = formatDateTime(booking.end_time)

              return (
                <Card key={booking.booking_id} className="border-purple-100 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-purple-600" />
                            {booking.room_number}
                          </h3>
                          <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                        </div>

                        <p className="text-gray-700 mb-2 font-medium">{booking.purpose}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {startDateTime.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {startDateTime.time} - {endDateTime.time}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {booking.status === "active" && (
                          <FinishUsageButton
                            bookingId={booking.booking_id}
                            onFinish={() => handleFinishUsage(booking.booking_id)}
                          />
                        )}
                        {(booking.status === "upcoming" || booking.status === "active") && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-purple-200"
                              onClick={() => setEditingBooking(booking)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => setDeletingBookingId(booking.booking_id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Results Summary */}
        {!loading && filteredBookings.length > 0 && (
          <div className="text-center text-sm text-gray-600">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </div>
        )}
      </div>

      {/* Modals */}
      {editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          isOpen={!!editingBooking}
          onClose={() => setEditingBooking(null)}
          onSave={handleEditBooking}
        />
      )}

      {deletingBookingId && (
        <DeleteBookingModal
          bookingId={deletingBookingId}
          isOpen={!!deletingBookingId}
          onClose={() => setDeletingBookingId(null)}
          onDelete={handleDeleteBooking}
        />
      )}
    </DashboardLayout>
  )
}
