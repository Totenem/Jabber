"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, MapPin, Plus, Search, Users } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { toast } from "sonner"
import { Toaster } from "sonner"

const API_BASE_URL = "http://localhost:8000"

interface Classroom {
  classroom_id: number
  room_number: string
  room_type: string
  capacity: number
  equipment: string
  status: "available" | "booked" | "maintenance"
}

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [filteredClassrooms, setFilteredClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    room_type: "all",
    status: "all",
    min_capacity: "",
    max_capacity: "",
    equipment: "",
  })

  useEffect(() => {
    fetchClassrooms()
    // Set up polling to refresh classroom status every 30 seconds
    const interval = setInterval(fetchClassrooms, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, classrooms])

  const fetchClassrooms = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/classroom/search`, {
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch classrooms')
      }

      const data = await response.json()
      if (data.Status === 'Success') {
        setClassrooms(data.Classrooms)
      } else {
        throw new Error(data.Message || 'Failed to fetch classrooms')
      }
    } catch (error) {
      console.error("Failed to fetch classrooms:", error)
      toast.error("Failed to fetch classrooms")
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = classrooms

    if (filters.search) {
      filtered = filtered.filter(
        (classroom) =>
          classroom.room_number.toLowerCase().includes(filters.search.toLowerCase()) ||
          classroom.equipment.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    if (filters.room_type !== "all") {
      filtered = filtered.filter((classroom) => classroom.room_type === filters.room_type)
    }

    if (filters.status !== "all") {
      filtered = filtered.filter((classroom) => classroom.status === filters.status)
    }

    if (filters.min_capacity) {
      filtered = filtered.filter(
        (classroom) => classroom.capacity >= parseInt(filters.min_capacity)
      )
    }

    if (filters.max_capacity) {
      filtered = filtered.filter(
        (classroom) => classroom.capacity <= parseInt(filters.max_capacity)
      )
    }

    if (filters.equipment) {
      filtered = filtered.filter((classroom) =>
        classroom.equipment.toLowerCase().includes(filters.equipment.toLowerCase())
      )
    }

    setFilteredClassrooms(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200"
      case "booked":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "maintenance":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <DashboardLayout>
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Classrooms</h1>
            <p className="text-gray-600 mt-1">Browse and book available classrooms</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search rooms..."
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  className="pl-10 border-purple-200 focus:border-purple-400"
                />
              </div>

              <Select
                value={filters.room_type}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, room_type: value }))}
              >
                <SelectTrigger className="border-purple-200 focus:border-purple-400">
                  <SelectValue placeholder="Room Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="lecture">Lecture Hall</SelectItem>
                  <SelectItem value="lab">Laboratory</SelectItem>
                  <SelectItem value="seminar">Seminar Room</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.status}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="border-purple-200 focus:border-purple-400">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min Capacity"
                  value={filters.min_capacity}
                  onChange={(e) => setFilters((prev) => ({ ...prev, min_capacity: e.target.value }))}
                  className="border-purple-200 focus:border-purple-400"
                />
                <Input
                  type="number"
                  placeholder="Max Capacity"
                  value={filters.max_capacity}
                  onChange={(e) => setFilters((prev) => ({ ...prev, max_capacity: e.target.value }))}
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>

              <Input
                placeholder="Equipment (e.g., projector)"
                value={filters.equipment}
                onChange={(e) => setFilters((prev) => ({ ...prev, equipment: e.target.value }))}
                className="border-purple-200 focus:border-purple-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Classrooms List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-purple-100 animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredClassrooms.length === 0 ? (
            <Card className="col-span-full border-purple-100">
              <CardContent className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No classrooms found</h3>
                <p className="text-gray-600">
                  No classrooms match your search criteria. Try adjusting your filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredClassrooms.map((classroom) => (
              <Card key={classroom.classroom_id} className="border-purple-100 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {classroom.room_number}
                      </h3>
                      <Badge className={getStatusColor(classroom.status)}>
                        {classroom.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        Capacity: {classroom.capacity} people
                      </div>
                      <div className="text-sm text-gray-600">
                        Type: {classroom.room_type}
                      </div>
                      <div className="text-sm text-gray-600">
                        Equipment: {classroom.equipment}
                      </div>
                    </div>
                    {classroom.status === "available" && (
                      <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                        <Link href={`/bookings/new?classroom=${classroom.classroom_id}`}>
                          Book Now
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Results Summary */}
        {!loading && filteredClassrooms.length > 0 && (
          <div className="text-center text-sm text-gray-600">
            Showing {filteredClassrooms.length} of {classrooms.length} classrooms
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}