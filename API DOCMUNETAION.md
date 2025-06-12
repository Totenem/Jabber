# Room Management System API Documentation

## Authentication Endpoints

### Register Instructor
- **Endpoint:** `POST /auth/register`
- **Description:** Register a new instructor
- **Request Body:**
```json
{
    "name": "John Doe",
    "username": "johndoe",
    "password": "securepassword",
    "email": "john@example.com"
}
```
- **Response:**
```json
{
    "Status": "Success",
    "Message": "Instructor has been registered successfully"
}
```
- **Error Response:**
```json
{
    "Status": "Error",
    "Message": "Email already exists. Please use a different email."
}
```

### Login
- **Endpoint:** `POST /auth/login`
- **Description:** Login as an instructor
- **Request Body:**
```json
{
    "username": "johndoe",
    "password": "securepassword"
}
```
- **Response:**
```json
{
    "Status": "Success",
    "Message": "Login successful"
}
```
- **Error Response:**
```json
{
    "Status": "Error",
    "Message": "Invalid username or password"
}
```

### Logout
- **Endpoint:** `GET /auth/logout`
- **Description:** Logout the current instructor
- **Response:**
```json
{
    "Status": "Success",
    "Message": "Logged out"
}
```

---

## Classroom Endpoints

### Search Classrooms
- **Endpoint:** `GET /classroom/search`
- **Description:** Search and filter classrooms
- **Query Parameters:**
  - `room_type` (optional): Filter by room type (normal, computer_lab)
  - `status` (optional): Filter by status (available, booked, maintenance)
  - `min_capacity` (optional): Minimum capacity
  - `max_capacity` (optional): Maximum capacity
- **Response:**
```json
{
    "Status": "Success",
    "Classrooms": [
        {
            "classroom_id": 1,
            "room_number": "R-201",
            "capacity": 30,
            "equipment": "Whiteboard, Projector",
            "status": "available",
            "room_type": "normal"
        }
    ]
}
```

### Get Classroom Details
- **Endpoint:** `GET /classroom/{id}`
- **Description:** Get details of a specific classroom
- **Path Parameters:**
  - `id`: Classroom ID
- **Response:**
```json
{
    "Status": "Success",
    "Classroom Details": [
        {
            "classroom_id": 2,
            "room_number": "R-202",
            "capacity": 25,
            "equipment": "Whiteboard, TV",
            "status": "available",
            "room_type": "normal"
        }
    ]
}
```

---

## Booking Endpoints

### Create Booking
- **Endpoint:** `POST /create-booking`
- **Description:** Create a new classroom booking
- **Request Body:**
```json
{
    "classroom_id": 1,
    "start_time": "2025-06-11T09:00:00",
    "end_time": "2025-06-11T10:00:00",
    "purpose": "Lecture"
}
```
- **Response:**
```json
{
    "Status": "Success",
    "Message": "Booking created successfully"
}
```

### Update Booking
- **Endpoint:** `PUT /booking/{booking_id}`
- **Description:** Update an existing booking
- **Path Parameters:**
  - `booking_id`: ID of the booking to update
- **Request Body:** Same as create booking
- **Response:**
```json
{
    "Status": "Success",
    "Message": "Booking updated successfully"
}
```

### Delete Booking
- **Endpoint:** `DELETE /booking/{booking_id}`
- **Description:** Delete a booking
- **Path Parameters:**
  - `booking_id`: ID of the booking to delete
- **Response:**
```json
{
    "Status": "Success",
    "Message": "Booking deleted"
}
```

---

## Usage Log Endpoints

### Get Usage Logs
- **Endpoint:** `GET /usage-log/{classroom_id}`
- **Description:** Get usage logs for a specific classroom
- **Path Parameters:**
  - `classroom_id`: ID of the classroom
- **Response:**
```json
{
    "Status": "Success",
    "Logs": [
        {
            "log_id": 1,
            "classroom_id": 1,
            "date": "2025-06-11",
            "total_hours_used": 3.5
        }
    ]
}
```

### Add Usage Log (Manual)
- **Endpoint:** `POST /usage-log`
- **Description:** Add a new usage log entry manually
- **Request Body:**
```json
{
    "classroom_id": 1,
    "date": "2025-06-11",
    "total_hours_used": 2.0
}
```
- **Response:**
```json
{
    "Status": "Success",
    "Message": "Usage log added"
}
```

### Finish Usage (Automatic Logging)
- **Endpoint:** `POST /finish-usage/{booking_id}`
- **Description:** Automatically create a usage log for a booking when the user is done using the room. Calculates usage based on booking times.
- **Path Parameters:**
  - `booking_id`: ID of the booking to finish
- **Response:**
```json
{
    "Status": "Success",
    "Message": "Usage log created automatically"
}
```

---

## Error Responses
All endpoints may return the following error responses:

### Unauthorized Access
```json
{
    "Status": "Error",
    "Message": "Unauthorized Access"
}
```

### Internal Server Error
```json
{
    "Status": "Error",
    "Message": "Internal Error",
    "Details": "Error details..."
}
```