"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, MapPin, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useRouter, useSearchParams } from "next/navigation"

interface Classroom {
  classroom_id: number
  room_number: string
  capacity: number
  equipment: string
  room_type: string
}

export default function NewBookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    classroom_id: "",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    purpose: "",
  })
  const [availableClassrooms, setAvailableClassrooms] = useState<Classroom[]>([])
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [prefillLoading, setPrefillLoading] = useState(false)

  // Fetch classrooms and handle pre-fill
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const res = await fetch("http://localhost:8000/classroom/search", { credentials: "include" })
        const data = await res.json()
        if (data.Status === "Success") {
          setAvailableClassrooms(data.Classrooms)
        }
      } catch (err) {
        // fallback: do nothing
      }
    }
    fetchClassrooms()
  }, [])

  // Pre-fill if ?room= is present
  useEffect(() => {
    const roomId = searchParams.get("room")
    if (roomId) {
      setPrefillLoading(true)
      setFormData((prev) => ({ ...prev, classroom_id: roomId.toString() }))
      fetch(`http://localhost:8000/classroom/${roomId}`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data.Status === "Success" && data["Classroom Details"] && data["Classroom Details"].length > 0) {
            setSelectedClassroom(data["Classroom Details"][0])
            // Ensure the room is in availableClassrooms for the dropdown label
            setAvailableClassrooms((prev) => {
              const exists = prev.some(
                c => c.classroom_id.toString() === data["Classroom Details"][0].classroom_id.toString()
              )
              if (!exists) {
                return [...prev, data["Classroom Details"][0]]
              }
              return prev
            })
          }
        })
        .finally(() => setPrefillLoading(false))
    }
  }, [searchParams])

  // Update selectedClassroom when classroom_id changes (if not prefilled)
  useEffect(() => {
    if (!formData.classroom_id) {
      setSelectedClassroom(null)
      return
    }
    if (!searchParams.get("room")) {
      const found = availableClassrooms.find((c) => c.classroom_id.toString() === formData.classroom_id)
      setSelectedClassroom(found || null)
    }
  }, [formData.classroom_id, availableClassrooms, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    // Validate form
    if (
      !formData.classroom_id ||
      !formData.start_date ||
      !formData.start_time ||
      !formData.end_date ||
      !formData.end_time ||
      !formData.purpose
    ) {
      setError("Please fill in all required fields")
      setLoading(false)
      return
    }

    // Create datetime strings
    const start_time = `${formData.start_date}T${formData.start_time}:00`
    const end_time = `${formData.end_date}T${formData.end_time}:00`

    // Validate end time is after start time
    if (new Date(end_time) <= new Date(start_time)) {
      setError("End time must be after start time")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("http://localhost:8000/create-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          classroom_id: parseInt(formData.classroom_id),
          start_time,
          end_time,
          purpose: formData.purpose
        })
      })
      const data = await response.json()
      if (data.Status === "Success") {
        setSuccess("Booking created successfully!")
        setFormData({
          classroom_id: "",
          start_date: "",
          start_time: "",
          end_date: "",
          end_time: "",
          purpose: "",
        })
      } else {
        setError(data.Message || "Failed to create booking. Please try again.")
      }
    } catch (err) {
      setError("Failed to create booking. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  console.log("availableClassrooms", availableClassrooms, "formData.classroom_id", formData.classroom_id);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/bookings">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bookings
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">New Booking</h1>
            <p className="text-gray-600 mt-1">Reserve a classroom for your session</p>
          </div>
        </div>

        {/* Form */}
        <Card className="border-purple-100">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Booking Details</CardTitle>
            <CardDescription>Fill in the information below to create your booking</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-700">{success}</AlertDescription>
                </Alert>
              )}

              {/* Classroom Selection */}
              <div className="space-y-2">
                <Label htmlFor="classroom" className="text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Classroom *
                </Label>
                {searchParams.get("room") ? (
                  prefillLoading ? (
                    <Input value="Loading..." disabled className="border-purple-200 focus:border-purple-400 bg-gray-100 text-gray-500" />
                  ) : selectedClassroom ? (
                    <Input value={selectedClassroom.room_number} disabled className="border-purple-200 focus:border-purple-400 bg-gray-100 text-gray-500" />
                  ) : null
                ) : (
                  <Select
                    value={formData.classroom_id}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, classroom_id: value }))}
                  >
                    <SelectTrigger className="border-purple-200 focus:border-purple-400">
                      <SelectValue placeholder="Select a classroom" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableClassrooms.map((classroom) => (
                        <SelectItem key={classroom.classroom_id} value={classroom.classroom_id.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>{classroom.room_number}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              ({classroom.capacity} seats, {classroom.room_type.replace("_", " ")})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {selectedClassroom && (
                  <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <p className="text-sm text-gray-700">
                      <strong>Equipment:</strong> {selectedClassroom.equipment}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Capacity:</strong> {selectedClassroom.capacity} people
                    </p>
                  </div>
                )}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Start
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="start_date" className="text-gray-700">
                      Date *
                    </Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                      className="border-purple-200 focus:border-purple-400"
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start_time" className="text-gray-700">
                      Time *
                    </Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData((prev) => ({ ...prev, start_time: e.target.value }))}
                      className="border-purple-200 focus:border-purple-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    End
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="end_date" className="text-gray-700">
                      Date *
                    </Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                      className="border-purple-200 focus:border-purple-400"
                      min={formData.start_date || new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time" className="text-gray-700">
                      Time *
                    </Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData((prev) => ({ ...prev, end_time: e.target.value }))}
                      className="border-purple-200 focus:border-purple-400"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Purpose */}
              <div className="space-y-2">
                <Label htmlFor="purpose" className="text-gray-700">
                  Purpose *
                </Label>
                <Textarea
                  id="purpose"
                  placeholder="Describe the purpose of your booking (e.g., Mathematics Lecture, Team Meeting, Workshop)"
                  value={formData.purpose}
                  onChange={(e) => setFormData((prev) => ({ ...prev, purpose: e.target.value }))}
                  className="border-purple-200 focus:border-purple-400 min-h-[100px]"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700" disabled={loading}>
                  {loading ? "Creating Booking..." : "Create Booking"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/bookings">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
