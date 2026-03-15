const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "uniconnect",
});

db.connect((err) => {
  if (err) {
    console.log("Database connection failed ❌", err);
  } else {
    console.log("Connected to MySQL ✅");
  }
});

app.get("/api/message", (req, res) => {
  res.send("Backend + Database connected 🚀");
});

app.post("/api/login", (req, res) => {
  const { college_email, password, role } = req.body;

  if (!college_email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "Please fill all fields",
    });
  }

  const sql =
    "SELECT * FROM users WHERE college_email = ? AND password = ? AND role = ?";

  db.query(sql, [college_email, password, role], (err, result) => {
    if (err) {
      console.log("Login query error:", err);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }

    if (result.length > 0) {
      return res.json({
        success: true,
        message: `Login successful as ${role}`,
        user: result[0],
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid email, password, or role",
      });
    }
  });
});

app.post("/api/student-signup", (req, res) => {
  const { name, college_email, password, department, year } = req.body;

  if (!name || !college_email || !password || !department || !year) {
    return res.status(400).json({
      success: false,
      message: "Please fill all signup fields",
    });
  }

  const checkSql = "SELECT * FROM users WHERE college_email = ?";

  db.query(checkSql, [college_email], (checkErr, checkResult) => {
    if (checkErr) {
      console.log("Signup check error:", checkErr);
      return res.status(500).json({
        success: false,
        message: "Could not process signup",
      });
    }

    if (checkResult.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered",
      });
    }

    const insertUserSql = `
      INSERT INTO users (name, college_email, password, role)
      VALUES (?, ?, ?, 'student')
    `;

    db.query(
      insertUserSql,
      [name, college_email, password],
      (userErr, userResult) => {
        if (userErr) {
          console.log("Signup user insert error:", userErr);
          return res.status(500).json({
            success: false,
            message: "Could not create user",
          });
        }

        const user_id = userResult.insertId;

        const insertStudentSql = `
          INSERT INTO students (user_id, department, year)
          VALUES (?, ?, ?)
        `;

        db.query(
          insertStudentSql,
          [user_id, department, year],
          (studentErr) => {
            if (studentErr) {
              console.log("Signup student insert error:", studentErr);
              return res.status(500).json({
                success: false,
                message: "User created but student profile failed",
              });
            }

            return res.json({
              success: true,
              message: "Student signup successful. Please login now.",
            });
          }
        );
      }
    );
  });
});

app.get("/api/events", (req, res) => {
  const sql = `
    SELECT 
      events.event_id,
      events.event_name,
      events.date,
      events.venue,
      events.capacity,
      events.division_id,
      divisions.division_name,
      organisers.club AS organizer_club
    FROM events
    JOIN divisions ON events.division_id = divisions.division_id
    JOIN organisers ON events.organizer_id = organisers.organizer_id
    ORDER BY events.date ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("Events query error:", err);
      return res.status(500).json({
        success: false,
        message: "Could not fetch events",
      });
    }

    return res.json({
      success: true,
      events: result,
    });
  });
});

app.get("/api/organizer-events/:userId", (req, res) => {
  const { userId } = req.params;

  const organizerSql = "SELECT organizer_id, club FROM organisers WHERE user_id = ?";

  db.query(organizerSql, [userId], (orgErr, orgResult) => {
    if (orgErr) {
      console.log("Organizer lookup error:", orgErr);
      return res.status(500).json({
        success: false,
        message: "Could not find organizer",
      });
    }

    if (orgResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Organizer record not found",
      });
    }

    const organizer_id = orgResult[0].organizer_id;

    const sql = `
      SELECT 
        events.event_id,
        events.event_name,
        events.date,
        events.venue,
        events.capacity,
        events.division_id,
        divisions.division_name,
        organisers.club AS organizer_club,
        COUNT(CASE WHEN registrations.status = 'Confirmed' THEN 1 END) AS confirmed_count
      FROM events
      JOIN divisions ON events.division_id = divisions.division_id
      JOIN organisers ON events.organizer_id = organisers.organizer_id
      LEFT JOIN registrations ON events.event_id = registrations.event_id
      WHERE events.organizer_id = ?
      GROUP BY 
        events.event_id,
        events.event_name,
        events.date,
        events.venue,
        events.capacity,
        events.division_id,
        divisions.division_name,
        organisers.club
      ORDER BY events.date ASC
    `;

    db.query(sql, [organizer_id], (err, result) => {
      if (err) {
        console.log("Organizer events query error:", err);
        return res.status(500).json({
          success: false,
          message: "Could not fetch organizer events",
        });
      }

      return res.json({
        success: true,
        events: result,
      });
    });
  });
});

app.get("/api/divisions", (req, res) => {
  db.query("SELECT * FROM divisions", (err, result) => {
    if (err) {
      console.log("Divisions query error:", err);
      return res.status(500).json({
        success: false,
        message: "Could not fetch divisions",
      });
    }

    return res.json({
      success: true,
      divisions: result,
    });
  });
});

app.post("/api/create-event", (req, res) => {
  const { user_id, event_name, date, venue, division_id, capacity } = req.body;

  if (!user_id || !event_name || !date || !venue || !division_id) {
    return res.status(400).json({
      success: false,
      message: "Please fill all required event fields",
    });
  }

  const organizerSql = "SELECT organizer_id FROM organisers WHERE user_id = ?";

  db.query(organizerSql, [user_id], (orgErr, orgResult) => {
    if (orgErr) {
      console.log("Organizer lookup error:", orgErr);
      return res.status(500).json({
        success: false,
        message: "Could not find organizer",
      });
    }

    if (orgResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Organizer record not found",
      });
    }

    const organizer_id = orgResult[0].organizer_id;

    const insertSql = `
      INSERT INTO events (event_name, date, venue, organizer_id, division_id, capacity)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertSql,
      [event_name, date, venue, organizer_id, division_id, capacity || null],
      (insertErr, insertResult) => {
        if (insertErr) {
          console.log("Create event error:", insertErr);
          return res.status(500).json({
            success: false,
            message: "Could not create event",
          });
        }

        return res.json({
          success: true,
          message: "Event created successfully",
          event_id: insertResult.insertId,
        });
      }
    );
  });
});

app.put("/api/update-event/:eventId", (req, res) => {
  const { eventId } = req.params;
  const { user_id, event_name, date, venue, division_id, capacity } = req.body;

  if (!user_id || !event_name || !date || !venue || !division_id) {
    return res.status(400).json({
      success: false,
      message: "Please fill all required event fields",
    });
  }

  const organizerSql = "SELECT organizer_id FROM organisers WHERE user_id = ?";

  db.query(organizerSql, [user_id], (orgErr, orgResult) => {
    if (orgErr) {
      console.log("Organizer lookup error:", orgErr);
      return res.status(500).json({
        success: false,
        message: "Could not find organizer",
      });
    }

    if (orgResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Organizer record not found",
      });
    }

    const organizer_id = orgResult[0].organizer_id;

    const updateSql = `
      UPDATE events
      SET event_name = ?, date = ?, venue = ?, division_id = ?, capacity = ?
      WHERE event_id = ? AND organizer_id = ?
    `;

    db.query(
      updateSql,
      [event_name, date, venue, division_id, capacity || null, eventId, organizer_id],
      (updateErr, updateResult) => {
        if (updateErr) {
          console.log("Update event error:", updateErr);
          return res.status(500).json({
            success: false,
            message: "Could not update event",
          });
        }

        if (updateResult.affectedRows === 0) {
          return res.status(403).json({
            success: false,
            message: "You can only edit your own events",
          });
        }

        return res.json({
          success: true,
          message: "Event updated successfully",
        });
      }
    );
  });
});

app.delete("/api/delete-event/:eventId/:userId", (req, res) => {
  const { eventId, userId } = req.params;

  const organizerSql = "SELECT organizer_id FROM organisers WHERE user_id = ?";

  db.query(organizerSql, [userId], (orgErr, orgResult) => {
    if (orgErr) {
      console.log("Organizer lookup error:", orgErr);
      return res.status(500).json({
        success: false,
        message: "Could not find organizer",
      });
    }

    if (orgResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Organizer record not found",
      });
    }

    const organizer_id = orgResult[0].organizer_id;

    const deleteRegistrationsSql = `
      DELETE registrations
      FROM registrations
      JOIN events ON registrations.event_id = events.event_id
      WHERE events.event_id = ? AND events.organizer_id = ?
    `;

    db.query(deleteRegistrationsSql, [eventId, organizer_id], (regErr) => {
      if (regErr) {
        console.log("Delete registrations error:", regErr);
        return res.status(500).json({
          success: false,
          message: "Could not delete related registrations",
        });
      }

      const deleteEventSql = `
        DELETE FROM events
        WHERE event_id = ? AND organizer_id = ?
      `;

      db.query(deleteEventSql, [eventId, organizer_id], (eventErr, eventResult) => {
        if (eventErr) {
          console.log("Delete event error:", eventErr);
          return res.status(500).json({
            success: false,
            message: "Could not delete event",
          });
        }

        if (eventResult.affectedRows === 0) {
          return res.status(403).json({
            success: false,
            message: "You can only delete your own events",
          });
        }

        return res.json({
          success: true,
          message: "Event deleted successfully",
        });
      });
    });
  });
});

app.post("/api/register-event", (req, res) => {
  const {
    user_id,
    event_id,
    full_name,
    registration_number,
    phone_number,
    whatsapp_number,
    department,
    specialization,
    year_of_study,
  } = req.body;

  if (
    !user_id ||
    !event_id ||
    !full_name ||
    !registration_number ||
    !phone_number ||
    !whatsapp_number ||
    !department ||
    !specialization ||
    !year_of_study
  ) {
    return res.status(400).json({
      success: false,
      message: "Please fill all registration fields",
    });
  }

  const studentSql = "SELECT student_id FROM students WHERE user_id = ?";

  db.query(studentSql, [user_id], (studentErr, studentResult) => {
    if (studentErr) {
      console.log("Student lookup error:", studentErr);
      return res.status(500).json({
        success: false,
        message: "Could not find student",
      });
    }

    if (studentResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student record not found",
      });
    }

    const student_id = studentResult[0].student_id;

    const eventSql = `
      SELECT 
        events.capacity,
        COUNT(CASE WHEN registrations.status = 'Confirmed' THEN 1 END) AS confirmed_count
      FROM events
      LEFT JOIN registrations ON events.event_id = registrations.event_id
      WHERE events.event_id = ?
      GROUP BY events.event_id, events.capacity
    `;

    db.query(eventSql, [event_id], (eventErr, eventResult) => {
      if (eventErr) {
        console.log("Event capacity check error:", eventErr);
        return res.status(500).json({
          success: false,
          message: "Could not validate event capacity",
        });
      }

      if (eventResult.length > 0) {
        const { capacity, confirmed_count } = eventResult[0];
        if (capacity !== null && Number(confirmed_count) >= Number(capacity)) {
          return res.status(400).json({
            success: false,
            message: "Registration closed. Event capacity is full.",
          });
        }
      }

      const checkSql =
        "SELECT * FROM registrations WHERE student_id = ? AND event_id = ? AND status = 'Confirmed'";

      db.query(checkSql, [student_id, event_id], (checkErr, checkResult) => {
        if (checkErr) {
          console.log("Duplicate check error:", checkErr);
          return res.status(500).json({
            success: false,
            message: "Could not validate registration",
          });
        }

        if (checkResult.length > 0) {
          return res.status(400).json({
            success: false,
            message: "You are already registered for this event",
          });
        }

        const insertSql = `
          INSERT INTO registrations (
            status,
            student_id,
            event_id,
            full_name,
            registration_number,
            phone_number,
            whatsapp_number,
            department,
            specialization,
            year_of_study
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
          insertSql,
          [
            "Confirmed",
            student_id,
            event_id,
            full_name,
            registration_number,
            phone_number,
            whatsapp_number,
            department,
            specialization,
            year_of_study,
          ],
          (insertErr) => {
            if (insertErr) {
              console.log("Registration insert error:", insertErr);
              return res.status(500).json({
                success: false,
                message: "Could not register for event",
              });
            }

            return res.json({
              success: true,
              message: "Registration successful",
            });
          }
        );
      });
    });
  });
});

app.get("/api/my-registrations/:userId", (req, res) => {
  const { userId } = req.params;

  const studentSql = "SELECT student_id FROM students WHERE user_id = ?";

  db.query(studentSql, [userId], (studentErr, studentResult) => {
    if (studentErr) {
      console.log("Student lookup error:", studentErr);
      return res.status(500).json({
        success: false,
        message: "Could not find student",
      });
    }

    if (studentResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student record not found",
      });
    }

    const student_id = studentResult[0].student_id;

    const sql = `
      SELECT 
        registrations.registration_id,
        registrations.status,
        registrations.full_name,
        registrations.registration_number,
        registrations.phone_number,
        registrations.whatsapp_number,
        registrations.department,
        registrations.specialization,
        registrations.year_of_study,
        registrations.cancel_reason,
        registrations.custom_cancel_reason,
        registrations.cancelled_at,
        events.event_id,
        events.event_name,
        events.date,
        events.venue,
        events.capacity,
        events.division_id,
        divisions.division_name,
        organisers.club AS organizer_club
      FROM registrations
      JOIN events ON registrations.event_id = events.event_id
      JOIN divisions ON events.division_id = divisions.division_id
      JOIN organisers ON events.organizer_id = organisers.organizer_id
      WHERE registrations.student_id = ?
      ORDER BY events.date ASC
    `;

    db.query(sql, [student_id], (err, result) => {
      if (err) {
        console.log("My registrations query error:", err);
        return res.status(500).json({
          success: false,
          message: "Could not fetch registrations",
        });
      }

      return res.json({
        success: true,
        registrations: result,
      });
    });
  });
});

app.post("/api/cancel-registration", (req, res) => {
  const { registration_id, cancel_reason, custom_cancel_reason } = req.body;

  if (!registration_id || !cancel_reason) {
    return res.status(400).json({
      success: false,
      message: "Please select a cancellation reason",
    });
  }

  const sql = `
    UPDATE registrations
    SET 
      status = 'Cancelled',
      cancel_reason = ?,
      custom_cancel_reason = ?,
      cancelled_at = NOW()
    WHERE registration_id = ?
  `;

  db.query(
    sql,
    [cancel_reason, custom_cancel_reason || null, registration_id],
    (err) => {
      if (err) {
        console.log("Cancel registration error:", err);
        return res.status(500).json({
          success: false,
          message: "Could not cancel registration",
        });
      }

      return res.json({
        success: true,
        message:
          "Your registration has been cancelled successfully. Please check your schedule carefully before registering for future events.",
      });
    }
  );
});

app.get("/api/event-registrations/:eventId", (req, res) => {
  const { eventId } = req.params;

  const sql = `
    SELECT
      registrations.registration_id,
      registrations.full_name,
      registrations.registration_number,
      registrations.phone_number,
      registrations.whatsapp_number,
      registrations.department,
      registrations.specialization,
      registrations.year_of_study,
      registrations.status,
      registrations.cancel_reason,
      registrations.custom_cancel_reason,
      registrations.cancelled_at
    FROM registrations
    WHERE registrations.event_id = ?
    ORDER BY registrations.registration_id DESC
  `;

  db.query(sql, [eventId], (err, result) => {
    if (err) {
      console.log("Event registrations query error:", err);
      return res.status(500).json({
        success: false,
        message: "Could not fetch event registrations",
      });
    }

    return res.json({
      success: true,
      registrations: result,
    });
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});