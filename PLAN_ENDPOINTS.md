🔷 Authentication -DONE
✅ POST /api/auth/login
✅ POST /api/auth/logout
✅ POST /api/auth/register (if you want instructors to self-register)

🔷 Classrooms - DONE
✅ GET /api/classrooms/{id} — Get details for a specific classroom
✅ GET /api/classrooms/search — Search and filter classrooms based on capacity, equipment, status, etc.
PUT /classrooms/{room_number}/status - Let you update status (available, booked, maintenance).

🔷 Bookings
✅ GET /api/bookings — List all bookings
✅ GET /api/bookings/{id} — Get a specific booking
✅ POST /api/bookings — Create a new booking
✅ PUT /api/bookings/{id} — Update an existing booking
✅ DELETE /api/bookings/{id} — Delete a booking
✅ GET /api/bookings/calendar — Get a calendar view of bookings (maybe by day/week/month)

🔷 Reports & Statistics
✅ GET /api/reports/utilization — Generate utilization reports
✅ GET /api/reports/underused — Identify underused classrooms
✅ GET /api/reports/overbooked — Identify overbooked classrooms

✅ Possible Additional Endpoints
🔹 GET /api/dashboard/overview — Get an overview of availability/bookings (e.g., summary counts).
🔹 POST /api/bookings/check-availability — Check if a classroom is available for a given slot.
🔹 GET /api/instructors/{id}/bookings — Get all bookings for a specific instructor.

{
  "name": "Dr. Emily White",
  "username": "ewhite12",
  "password": "123456",
  "email": "ewhite@example.com"
}