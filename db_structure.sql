-- classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
    classroom_id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(20) NOT NULL UNIQUE,
    capacity INT NOT NULL,
    equipment TEXT,
    status ENUM('available', 'booked', 'maintenance') DEFAULT 'available',
    room_type ENUM('normal', 'computer_lab') DEFAULT 'normal'
);

-- instructors as users with login info
CREATE TABLE IF NOT EXISTS instructors (
    instructor_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- store hashed passwords ideally!
    email VARCHAR(100) UNIQUE
);

-- courses table
CREATE TABLE IF NOT EXISTS courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    course_code VARCHAR(20) UNIQUE
);

-- bookings table
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    classroom_id INT NOT NULL,
    instructor_id INT NOT NULL,
    course_id INT,
    purpose VARCHAR(255),
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(classroom_id),
    FOREIGN KEY (instructor_id) REFERENCES instructors(instructor_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

-- usage_logs table
CREATE TABLE IF NOT EXISTS usage_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    classroom_id INT NOT NULL,
    date DATE NOT NULL,
    total_hours_used DECIMAL(4,2),
    FOREIGN KEY (classroom_id) REFERENCES classrooms(classroom_id)
);









