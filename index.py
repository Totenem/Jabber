from fastapi import FastAPI, Request, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from db_con import conn
import bcrypt
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel
from datetime import date, datetime

app = FastAPI()

# Configure CORS with specific settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js frontend URL
    allow_credentials=True,  # This is important for cookies
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Add session middleware with a secret key
app.add_middleware(SessionMiddleware, secret_key="my_super_secret_key")

@app.get("/")
async def root():
    return {
        "App":"Room Management System API",
        "Author": "Totemn"
    }

from models import InstructorRegister
@app.post("/auth/register")
async def registerInstructor(instructor: InstructorRegister):
    cursor = None
    try:
        cursor = conn.cursor()
        
        # Check if email already exists
        email_check_sql = "SELECT instructor_id FROM instructors WHERE email = %s"
        cursor.execute(email_check_sql, (instructor.email,))
        existing_email = cursor.fetchone()
        if existing_email:
            return {
                "Status": "Error",
                "Message": "Email already exists. Please use a different email."
            }

        # Check if username already exists
        username_check_sql = "SELECT instructor_id FROM instructors WHERE username = %s"
        cursor.execute(username_check_sql, (instructor.username,))
        existing_username = cursor.fetchone()
        if existing_username:
            return {
                "Status": "Error",
                "Message": "Username already exists. Please choose a different username."
            }
        
        # Hash the password before storing
        plain_password = instructor.password.encode('utf-8')
        hashed_password = bcrypt.hashpw(plain_password, bcrypt.gensalt()).decode('utf-8')
        
        #if its unique user proceed on the creation of data
        instructor_data ={
            'name': instructor.name,
            'username': instructor.username,
            'password': hashed_password,
            'email': instructor.email
        }
        
        sql = """
        INSERT INTO instructors (name, username, password, email)
        VALUES (%(name)s, %(username)s, %(password)s, %(email)s)
        """
        
        cursor.execute(sql, instructor_data)
        conn.commit()
        
        return{
            "Status": "Success",
            "Message": "Instructor has been registered successfully"
        }
    except Exception as e:
        if cursor:
            cursor.close()
        return {
            "Status": "Error",
            "Message": "Registration failed. Please try again.",
            "Details": str(e)
        }
    finally:
        if cursor:
            cursor.close()

from models import InstructorLogin
@app.post("/auth/login")
async def loginInstructor(instructor: InstructorLogin, request: Request,):
    try:
        cursor = conn.cursor()
        
        sql = "SELECT instructor_id, username, password FROM instructors WHERE username = %s"
        cursor.execute(sql, (instructor.username,))
        row = cursor.fetchone()
        
        # check if they found a user
        if row:
            instructor_id = row["instructor_id"]
            username = row["username"]
            hashed_password = row["password"].encode('utf-8')
            input_password = instructor.password.encode('utf-8')
            
             # Check password
            if bcrypt.checkpw(input_password, hashed_password):
                #setting user in cookie (session)
                request.session["instructor_id"] = instructor_id
                request.session["username"] = username
                
                cursor.close()
                return{
                    "Status": "Success",
                    "Message": "Login successful"
                }
            else:
                cursor.close()
                return {
                    "Status": "Error",
                    "Message": "Invalid username or password"
                }
        else:
            cursor.close()
            return {
                "Status": "Error",
                "Message": "Invalid username or password"
            }
    except Exception as e:
        return {
            "Status": "Error",
            "Message": "Something went wrong",
            "Details": str(e)
        }

@app.get("/auth/logout")
async def logout(request: Request):
    request.session.clear()
    return {"Status": "Success", "Message": "Logged out"} 

@app.get("/auth/user")
async def get_user_details(request: Request):
    instructor_id = request.session.get("instructor_id")
    if not instructor_id:
        return {
            "Status": "Error",
            "Message": "Unauthorized Access"
        }
    
    try:
        cursor = conn.cursor()
        sql = "SELECT instructor_id, name, username, email FROM instructors WHERE instructor_id = %s"
        cursor.execute(sql, (instructor_id,))
        user = cursor.fetchone()
        cursor.close()
        
        if user:
            return {
                "Status": "Success",
                "User": user
            }
        else:
            return {
                "Status": "Error",
                "Message": "User not found"
            }
    except Exception as e:
        return {
            "Status": "Error",
            "Message": "Failed to fetch user details",
            "Details": str(e)
        }

#===Classroom Endpoints
@app.get("/classroom/search")
async def filtersClassroom(
    request: Request,
    room_type: str = Query(None),
    status: str = Query(None),
    min_capacity: int = Query(None),
    max_capacity: int = Query(None),
    equipment: str = Query(None)
):
    instructor_id = request.session.get("instructor_id")
    if not instructor_id:
        return {
            "Status": "Error",
            "Message": "Unauthorized Access"
        }
    try:
        cursor = conn.cursor()
        sql = "SELECT * FROM classrooms WHERE 1=1"
        params = []

        if room_type:
            sql += " AND room_type = %s"
            params.append(room_type)
        if status:
            sql += " AND status = %s"
            params.append(status)
        if min_capacity is not None:
            sql += " AND capacity >= %s"
            params.append(min_capacity)
        if max_capacity is not None:
            sql += " AND capacity <= %s"
            params.append(max_capacity)
        if equipment:
            sql += " AND equipment LIKE %s"
            params.append(f"%{equipment}%")

        cursor.execute(sql, tuple(params))
        rows = cursor.fetchall()
        cursor.close()

        return {
            "Status": "Success",
            "Classrooms": rows
        }

    except Exception as e:
        return {
            "Status": "Error",
            "Message": "Can't filter Classrooms",
            "Details": str(e)
        }

@app.get("/classroom/{id}")
async def getRoomDetails(request: Request, id: str):
    instructor_id = request.session.get("instructor_id")
    if not instructor_id:
        return {
            "Status": "Error",
            "Message": "Unauthorized Access"
        }
    
    try:
        cursor = conn.cursor()
        
        sql = f"SELECT * FROM classrooms WHERE classroom_id='{id}'"
        cursor.execute(sql)
        rows = cursor.fetchall()
        cursor.close()
        
        if rows:
            return {
                "Status": "Success",
                "Classroom Details": rows
            }
        else:
            return{
                "Status": "Error",
                "Message": "No Room Found"
            }
    except Exception as e:
        return {
            "Status": "Error",
            "Message": "Inetrnal Error",
            "Details": str(e)
        }


# === Booking Endpoints       
from models import CreateBooking

@app.post("/create-booking")
async def bookingRoom(request: Request, booking: CreateBooking = Body(...)):
    instructor_id = request.session.get("instructor_id")
    if not instructor_id:
        return {
            "Status": "Error",
            "Message": "Unauthorized Access"
        }
    try:
        cursor = conn.cursor()
        # Check for overlapping bookings
        overlap_sql = """
            SELECT booking_id FROM bookings
            WHERE classroom_id = %s
              AND (
                (start_time < %s AND end_time > %s) OR
                (start_time < %s AND end_time > %s) OR
                (start_time >= %s AND end_time <= %s)
              )
        """
        cursor.execute(
            overlap_sql,
            (
                booking.classroom_id,
                booking.end_time, booking.start_time,
                booking.end_time, booking.end_time,
                booking.start_time, booking.end_time
            )
        )
        overlap = cursor.fetchone()
        if overlap:
            cursor.close()
            return {
                "Status": "Error",
                "Message": "Classroom is already booked for the selected time."
            }

        # Insert the booking
        sql = """
            INSERT INTO bookings (classroom_id, instructor_id, course_id, purpose, start_time, end_time)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(
            sql,
            (
                booking.classroom_id,
                instructor_id,
                booking.course_id,
                booking.purpose,
                booking.start_time,
                booking.end_time
            )
        )

        # Update classroom status to 'booked'
        update_sql = "UPDATE classrooms SET status = 'booked' WHERE classroom_id = %s"
        cursor.execute(update_sql, (booking.classroom_id,))

        conn.commit()
        cursor.close()
        return {
            "Status": "Success",
            "Message": "Booking created successfully"
        }
    except Exception as e:
        return {
            "Status": "Error",
            "Message": "Failed to create booking",
            "Details": str(e)
        }

from models import UsageLog
     
@app.get("/usage-log/{classroom_id}")
async def get_usage_logs(request: Request, classroom_id: int):
    instructor_id = request.session.get("instructor_id")
    if not instructor_id:
        return {"Status": "Error", "Message": "Unauthorized Access"}
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM usage_logs WHERE classroom_id = %s", (classroom_id,))
        logs = cursor.fetchall()
        cursor.close()
        return {"Status": "Success", "Logs": logs}
    except Exception as e:
        return {"Status": "Error", "Message": "Failed to fetch usage logs", "Details": str(e)}

@app.post("/usage-log")
async def add_usage_log(request: Request, log: UsageLog = Body(...)):
    instructor_id = request.session.get("instructor_id")
    if not instructor_id:
        return {"Status": "Error", "Message": "Unauthorized Access"}
    try:
        cursor = conn.cursor()
        sql = """
            INSERT INTO usage_logs (classroom_id, date, total_hours_used)
            VALUES (%s, %s, %s)
        """
        cursor.execute(sql, (log.classroom_id, log.date, log.total_hours_used))
        conn.commit()
        cursor.close()
        return {"Status": "Success", "Message": "Usage log added"}
    except Exception as e:
        return {"Status": "Error", "Message": "Failed to add usage log", "Details": str(e)}

@app.put("/booking/{booking_id}")
async def update_booking(request: Request, booking_id: int, booking: CreateBooking = Body(...)):
    instructor_id = request.session.get("instructor_id")
    if not instructor_id:
        return {"Status": "Error", "Message": "Unauthorized Access"}
    try:
        cursor = conn.cursor()
        # Check for overlapping bookings (excluding this booking)
        overlap_sql = """
            SELECT booking_id FROM bookings
            WHERE classroom_id = %s
              AND booking_id != %s
              AND (
                (start_time < %s AND end_time > %s) OR
                (start_time < %s AND end_time > %s) OR
                (start_time >= %s AND end_time <= %s)
              )
        """
        cursor.execute(
            overlap_sql,
            (
                booking.classroom_id,
                booking_id,
                booking.end_time, booking.start_time,
                booking.end_time, booking.end_time,
                booking.start_time, booking.end_time
            )
        )
        overlap = cursor.fetchone()
        if overlap:
            cursor.close()
            return {"Status": "Error", "Message": "Classroom is already booked for the selected time."}
        # Update booking
        sql = """
            UPDATE bookings
            SET classroom_id=%s, course_id=%s, purpose=%s, start_time=%s, end_time=%s
            WHERE booking_id=%s AND instructor_id=%s
        """
        cursor.execute(
            sql,
            (
                booking.classroom_id,
                booking.course_id,
                booking.purpose,
                booking.start_time,
                booking.end_time,
                booking_id,
                instructor_id
            )
        )
        # Update classroom status to 'booked'
        cursor.execute("UPDATE classrooms SET status = 'booked' WHERE classroom_id = %s", (booking.classroom_id,))
        conn.commit()
        cursor.close()
        return {"Status": "Success", "Message": "Booking updated successfully"}
    except Exception as e:
        return {"Status": "Error", "Message": "Failed to update booking", "Details": str(e)}

@app.delete("/booking/{booking_id}")
async def delete_booking(request: Request, booking_id: int):
    instructor_id = request.session.get("instructor_id")
    if not instructor_id:
        return {"Status": "Error", "Message": "Unauthorized Access"}
    try:
        cursor = conn.cursor()
        # Get classroom_id before deleting for status update
        cursor.execute("SELECT classroom_id FROM bookings WHERE booking_id = %s AND instructor_id = %s", (booking_id, instructor_id))
        row = cursor.fetchone()
        if not row:
            cursor.close()
            return {"Status": "Error", "Message": "Booking not found or not authorized"}
        classroom_id = row[0]
        cursor.execute("DELETE FROM bookings WHERE booking_id = %s AND instructor_id = %s", (booking_id, instructor_id))
        # Optionally set classroom status to 'available' if no more bookings
        cursor.execute("SELECT COUNT(*) FROM bookings WHERE classroom_id = %s", (classroom_id,))
        count = cursor.fetchone()[0]
        if count == 0:
            cursor.execute("UPDATE classrooms SET status = 'available' WHERE classroom_id = %s", (classroom_id,))
        conn.commit()
        cursor.close()
        return {"Status": "Success", "Message": "Booking deleted"}
    except Exception as e:
        return {"Status": "Error", "Message": "Failed to delete booking", "Details": str(e)}
    
    
@app.post("/finish-usage/{booking_id}")
async def finish_usage(request: Request, booking_id: int):
    instructor_id = request.session.get("instructor_id")
    if not instructor_id:
        return {"Status": "Error", "Message": "Unauthorized Access"}
    try:
        cursor = conn.cursor()
        # Get booking details
        cursor.execute(
            "SELECT classroom_id FROM bookings WHERE booking_id = %s AND instructor_id = %s",
            (booking_id, instructor_id)
        )
        booking = cursor.fetchone()
        print("DEBUG: booking result =", booking)
        if not booking or booking['classroom_id'] is None:
            cursor.close()
            return {"Status": "Error", "Message": "Booking not found or not authorized"}
        classroom_id = booking['classroom_id']
        # Update classroom status to available
        cursor.execute("UPDATE classrooms SET status = 'available' WHERE classroom_id = %s", (classroom_id,))
        # Update booking status to 'ended'
        cursor.execute("UPDATE bookings SET status = 'ended' WHERE booking_id = %s", (booking_id,))
        conn.commit()
        cursor.close()
        return {"Status": "Success", "Message": "Classroom and booking status updated to available/ended"}
    except Exception as e:
        print("DEBUG: Exception in finish_usage:", e)
        return {"Status": "Error", "Message": "Failed to update classroom or booking status", "Details": str(e)}

@app.get("/bookings/user")
async def get_user_bookings(request: Request):
    instructor_id = request.session.get("instructor_id")
    if not instructor_id:
        return {
            "Status": "Error",
            "Message": "Unauthorized Access"
        }
    
    try:
        cursor = conn.cursor()
        sql = """
            SELECT b.booking_id, b.classroom_id, c.room_number, b.start_time, b.end_time, b.purpose
            FROM bookings b
            JOIN classrooms c ON b.classroom_id = c.classroom_id
            WHERE b.instructor_id = %s
            ORDER BY b.start_time DESC
        """
        cursor.execute(sql, (instructor_id,))
        bookings = cursor.fetchall()
        cursor.close()
        
        return {
            "Status": "Success",
            "Bookings": bookings
        }
    except Exception as e:
        return {
            "Status": "Error",
            "Message": "Failed to fetch bookings",
            "Details": str(e)
        }