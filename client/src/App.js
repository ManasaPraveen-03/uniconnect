import { useMemo, useState } from "react";
import "./App.css";

function App() {
  const [role, setRole] = useState("student");
  const [collegeEmail, setCollegeEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isGuestMode, setIsGuestMode] = useState(false);

  const [studentEvents, setStudentEvents] = useState([]);
  const [organizerEvents, setOrganizerEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [currentPage, setCurrentPage] = useState("login");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  const [regFullName, setRegFullName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");

  const [registrationResultMessage, setRegistrationResultMessage] = useState("");
  const [registrationResultType, setRegistrationResultType] = useState("");

  const [divisions, setDivisions] = useState([]);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [divisionId, setDivisionId] = useState("");
  const [capacityOption, setCapacityOption] = useState("");
  const [capacity, setCapacity] = useState("");
  const [createEventMessage, setCreateEventMessage] = useState("");
  const [createEventMessageType, setCreateEventMessageType] = useState("");

  const [selectedOrganizerEvent, setSelectedOrganizerEvent] = useState(null);
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [loadingEventRegistrations, setLoadingEventRegistrations] = useState(false);

  const [selectedRegistrationToCancel, setSelectedRegistrationToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [customCancelReason, setCustomCancelReason] = useState("");
  const [cancelResultMessage, setCancelResultMessage] = useState("");
  const [cancelResultType, setCancelResultType] = useState("");

  const [searchText, setSearchText] = useState("");
  const [domainFilter, setDomainFilter] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupDepartment, setSignupDepartment] = useState("");
  const [signupYear, setSignupYear] = useState("");
  const [signupMessage, setSignupMessage] = useState("");
  const [signupMessageType, setSignupMessageType] = useState("");

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(false);

  const cancelReasonOptions = [
    "I have another academic commitment",
    "I registered by mistake",
    "I am not available on the event date",
    "I registered for another event at the same time",
    "Other",
  ];

  const normalizeEvent = (event) => {
    return {
      ...event,
      organizer_club: event.organizer_club || "Not available",
      confirmed_count: event.confirmed_count ?? 0,
    };
  };

  const fetchStudentEvents = async () => {
    setLoadingEvents(true);
    try {
      const response = await fetch("http://localhost:5000/api/events");
      const data = await response.json();
      if (data.success) {
        setStudentEvents((data.events || []).map(normalizeEvent));
      } else {
        setStudentEvents([]);
      }
    } catch (error) {
      console.error("Student events fetch error:", error);
      setStudentEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchOrganizerEvents = async (userId) => {
    setLoadingEvents(true);
    try {
      const response = await fetch(`http://localhost:5000/api/organizer-events/${userId}`);
      const data = await response.json();
      if (data.success) {
        setOrganizerEvents((data.events || []).map(normalizeEvent));
      } else {
        setOrganizerEvents([]);
      }
    } catch (error) {
      console.error("Organizer events fetch error:", error);
      setOrganizerEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchDivisions = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/divisions");
      const data = await response.json();
      if (data.success) {
        setDivisions(data.divisions || []);
      }
    } catch (error) {
      console.error("Divisions fetch error:", error);
    }
  };

  const fetchMyRegistrations = async () => {
    if (!loggedInUser || isGuestMode) return;

    setLoadingRegistrations(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/my-registrations/${loggedInUser.user_id}`
      );
      const data = await response.json();
      if (data.success) {
        setMyRegistrations(data.registrations || []);
      } else {
        setMyRegistrations([]);
      }
    } catch (error) {
      console.error("My registrations fetch error:", error);
      setMyRegistrations([]);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const fetchEventRegistrations = async (eventId) => {
    setLoadingEventRegistrations(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/event-registrations/${eventId}`
      );
      const data = await response.json();
      if (data.success) {
        setEventRegistrations(data.registrations || []);
      } else {
        setEventRegistrations([]);
      }
    } catch (error) {
      console.error("Event registrations fetch error:", error);
      setEventRegistrations([]);
    } finally {
      setLoadingEventRegistrations(false);
    }
  };

  const getOrganizerDisplay = (event) => {
    return event?.organizer_club || "Not available";
  };

  const getCapacityDisplay = (event) => {
    if (
      event?.capacity !== null &&
      event?.capacity !== undefined &&
      event?.capacity !== ""
    ) {
      return event.capacity;
    }
    return "No specific capacity";
  };

  const filteredStudentEvents = useMemo(() => {
    return studentEvents.filter((event) => {
      const query = searchText.toLowerCase();

      const matchesText =
        event.event_name?.toLowerCase().includes(query) ||
        event.venue?.toLowerCase().includes(query) ||
        event.organizer_club?.toLowerCase().includes(query);

      const matchesDomain = !domainFilter || event.division_name === domainFilter;

      return matchesText && matchesDomain;
    });
  }, [studentEvents, searchText, domainFilter]);

  const filteredOrganizerEvents = useMemo(() => {
    return organizerEvents.filter((event) => {
      const query = searchText.toLowerCase();

      const matchesText =
        event.event_name?.toLowerCase().includes(query) ||
        event.venue?.toLowerCase().includes(query) ||
        event.organizer_club?.toLowerCase().includes(query);

      const matchesDomain = !domainFilter || event.division_name === domainFilter;

      return matchesText && matchesDomain;
    });
  }, [organizerEvents, searchText, domainFilter]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatusMessage("");
    setIsError(false);
    setIsGuestMode(false);

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          college_email: collegeEmail,
          password,
          role
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setLoggedInUser(data.user);
        setStatusMessage(data.message);
        setIsError(false);
        setSearchText("");
        setDomainFilter("");

        if (data.user.role === "student") {
          await fetchStudentEvents();
          setCurrentPage("studentDashboard");
        } else {
          await fetchOrganizerEvents(data.user.user_id);
          setCurrentPage("organizerDashboard");
        }
      } else {
        setIsError(true);
        setStatusMessage(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login fetch error:", error);
      setIsError(true);
      setStatusMessage("Could not connect to backend");
    }
  };

  const handleGuestMode = async () => {
    setLoggedInUser({
      user_id: null,
      name: "Guest User",
      college_email: "Guest Mode",
      role: "student",
    });
    setIsGuestMode(true);
    setStatusMessage("");
    setIsError(false);
    setSearchText("");
    setDomainFilter("");
    await fetchStudentEvents();
    setCurrentPage("studentDashboard");
  };

  const handleStudentSignup = async (e) => {
    e.preventDefault();
    setSignupMessage("");
    setSignupMessageType("");

    try {
      const response = await fetch("http://localhost:5000/api/student-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: signupName,
          college_email: signupEmail,
          password: signupPassword,
          department: signupDepartment,
          year: signupYear
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSignupMessage(data.message);
        setSignupMessageType("success");
        setSignupName("");
        setSignupEmail("");
        setSignupPassword("");
        setSignupDepartment("");
        setSignupYear("");
      } else {
        setSignupMessage(data.message || "Signup failed");
        setSignupMessageType("error");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setSignupMessage("Could not connect to backend");
      setSignupMessageType("error");
    }
  };

  const refreshCurrentRoleEvents = async () => {
    if (isGuestMode) {
      await fetchStudentEvents();
      return;
    }

    if (!loggedInUser) return;

    if (loggedInUser.role === "student") {
      await fetchStudentEvents();
    } else {
      await fetchOrganizerEvents(loggedInUser.user_id);
    }
  };

  const resetEventForm = () => {
    setEventName("");
    setEventDate("");
    setEventVenue("");
    setDivisionId("");
    setCapacityOption("");
    setCapacity("");
    setCreateEventMessage("");
    setCreateEventMessageType("");
    setIsEditMode(false);
    setEditingEventId(null);
  };

  const closeDeleteModal = () => {
    if (deletingEvent) return;
    setShowDeleteModal(false);
    setEventToDelete(null);
  };

  const handleLogout = () => {
    setRole("student");
    setCollegeEmail("");
    setPassword("");
    setStatusMessage("");
    setIsError(false);
    setLoggedInUser(null);
    setIsGuestMode(false);

    setStudentEvents([]);
    setOrganizerEvents([]);
    setLoadingEvents(false);

    setCurrentPage("login");
    setSelectedEvent(null);

    setMyRegistrations([]);
    setLoadingRegistrations(false);

    setRegFullName("");
    setRegNumber("");
    setPhoneNumber("");
    setWhatsappNumber("");
    setDepartment("");
    setSpecialization("");
    setYearOfStudy("");

    setRegistrationResultMessage("");
    setRegistrationResultType("");

    setDivisions([]);
    resetEventForm();

    setSelectedOrganizerEvent(null);
    setEventRegistrations([]);
    setLoadingEventRegistrations(false);

    setSelectedRegistrationToCancel(null);
    setCancelReason("");
    setCustomCancelReason("");
    setCancelResultMessage("");
    setCancelResultType("");

    setSearchText("");
    setDomainFilter("");

    setSignupName("");
    setSignupEmail("");
    setSignupPassword("");
    setSignupDepartment("");
    setSignupYear("");
    setSignupMessage("");
    setSignupMessageType("");

    setShowDeleteModal(false);
    setEventToDelete(null);
    setDeletingEvent(false);
  };

  const goBackToLogin = () => {
    handleLogout();
  };

  const backToDashboard = async () => {
    await refreshCurrentRoleEvents();
    if (isGuestMode || loggedInUser?.role === "student") {
      setCurrentPage("studentDashboard");
    } else {
      setCurrentPage("organizerDashboard");
    }
  };

  const openRegisterPage = (event) => {
    if (isGuestMode) {
      setStatusMessage("Guest mode is view-only. Please login or sign up to register.");
      setIsError(true);
      return;
    }

    setSelectedEvent(event);
    setRegFullName(loggedInUser?.name || "");
    setRegNumber("");
    setPhoneNumber("");
    setWhatsappNumber("");
    setDepartment("");
    setSpecialization("");
    setYearOfStudy("");
    setCurrentPage("registerPage");
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/register-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: loggedInUser.user_id,
          event_id: selectedEvent.event_id,
          full_name: regFullName,
          registration_number: regNumber,
          phone_number: phoneNumber,
          whatsapp_number: whatsappNumber,
          department,
          specialization,
          year_of_study: yearOfStudy
        })
      });

      const data = await response.json();

      if (data.success) {
        setRegistrationResultMessage(data.message);
        setRegistrationResultType("success");
      } else {
        setRegistrationResultMessage(data.message || "Registration failed");
        setRegistrationResultType("error");
      }

      setCurrentPage("registrationResult");
      await fetchStudentEvents();
    } catch (error) {
      console.error("Registration error:", error);
      setRegistrationResultMessage("Could not register for event");
      setRegistrationResultType("error");
      setCurrentPage("registrationResult");
    }
  };

  const openMyRegistrationsPage = async () => {
    if (isGuestMode) return;
    await fetchMyRegistrations();
    setCurrentPage("myRegistrations");
  };

  const openCancelRegistrationPage = (registration) => {
    setSelectedRegistrationToCancel(registration);
    setCancelReason("");
    setCustomCancelReason("");
    setCurrentPage("cancelRegistrationPage");
  };

  const handleCancelRegistrationSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/cancel-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          registration_id: selectedRegistrationToCancel.registration_id,
          cancel_reason: cancelReason,
          custom_cancel_reason: cancelReason === "Other" ? customCancelReason : ""
        })
      });

      const data = await response.json();

      if (data.success) {
        setCancelResultMessage(data.message);
        setCancelResultType("success");
      } else {
        setCancelResultMessage(data.message || "Could not cancel registration");
        setCancelResultType("error");
      }

      setCurrentPage("cancelRegistrationResult");
      await fetchMyRegistrations();
      await fetchStudentEvents();
    } catch (error) {
      console.error("Cancel registration error:", error);
      setCancelResultMessage("Could not cancel registration");
      setCancelResultType("error");
      setCurrentPage("cancelRegistrationResult");
    }
  };

  const openCreateEventPage = async () => {
    await fetchDivisions();
    resetEventForm();
    setCurrentPage("createEventPage");
  };

  const openEditEventPage = async (event) => {
    await fetchDivisions();
    setIsEditMode(true);
    setEditingEventId(event.event_id);
    setEventName(event.event_name || "");
    setEventDate(event.date?.split("T")[0] || event.date || "");
    setEventVenue(event.venue || "");
    setDivisionId(String(event.division_id || ""));
    setCapacityOption(
      event.capacity !== null && event.capacity !== undefined && event.capacity !== ""
        ? "yes"
        : "no"
    );
    setCapacity(event.capacity ?? "");
    setCreateEventMessage("");
    setCreateEventMessageType("");
    setCurrentPage("createEventPage");
  };

  const handleCreateEventSubmit = async (e) => {
    e.preventDefault();

    if (!divisionId) {
      setCreateEventMessage("Please select a domain");
      setCreateEventMessageType("error");
      setCurrentPage("createEventResult");
      return;
    }

    if (!capacityOption) {
      setCreateEventMessage("Please select whether capacity is needed");
      setCreateEventMessageType("error");
      setCurrentPage("createEventResult");
      return;
    }

    if (capacityOption === "yes" && !capacity) {
      setCreateEventMessage("Please enter capacity");
      setCreateEventMessageType("error");
      setCurrentPage("createEventResult");
      return;
    }

    try {
      const url = isEditMode
        ? `http://localhost:5000/api/update-event/${editingEventId}`
        : "http://localhost:5000/api/create-event";

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: loggedInUser.user_id,
          event_name: eventName,
          date: eventDate,
          venue: eventVenue,
          division_id: divisionId,
          capacity: capacityOption === "yes" ? capacity : null
        })
      });

      const data = await response.json();

      if (data.success) {
        setCreateEventMessage(
          isEditMode ? "Event updated successfully" : data.message
        );
        setCreateEventMessageType("success");

        await fetchOrganizerEvents(loggedInUser.user_id);
        await fetchStudentEvents();
      } else {
        setCreateEventMessage(
          data.message || (isEditMode ? "Could not update event" : "Could not create event")
        );
        setCreateEventMessageType("error");
      }

      setCurrentPage("createEventResult");
    } catch (error) {
      console.error("Create/update event error:", error);
      setCreateEventMessage(
        isEditMode ? "Could not update event" : "Could not create event"
      );
      setCreateEventMessageType("error");
      setCurrentPage("createEventResult");
    }
  };

  const openDeleteEventModal = (event) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete || !loggedInUser) return;

    setDeletingEvent(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/delete-event/${eventToDelete.event_id}/${loggedInUser.user_id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (data.success) {
        setShowDeleteModal(false);
        setEventToDelete(null);
        await fetchOrganizerEvents(loggedInUser.user_id);
        await fetchStudentEvents();
      } else {
        setShowDeleteModal(false);
        setEventToDelete(null);
        setStatusMessage(data.message || "Could not delete event");
        setIsError(true);
      }
    } catch (error) {
      console.error("Delete event error:", error);
      setShowDeleteModal(false);
      setEventToDelete(null);
      setStatusMessage("Could not delete event");
      setIsError(true);
    } finally {
      setDeletingEvent(false);
    }
  };

  const openEventRegistrationsPage = async (event) => {
    setSelectedOrganizerEvent(event);
    await fetchEventRegistrations(event.event_id);
    setCurrentPage("organizerEventRegistrations");
  };

  const goBackToRegistrationPage = () => setCurrentPage("registerPage");
  const goBackToCreateEventPage = () => setCurrentPage("createEventPage");
  const goBackToCancelRegistrationPage = () => setCurrentPage("cancelRegistrationPage");

  const renderBackground = () => (
    <>
      <div className="bg-shape shape1"></div>
      <div className="bg-shape shape2"></div>
      <div className="bg-shape shape3"></div>
      <div className="bg-shape shape4"></div>
      <div className="bg-shape shape5"></div>
      <div className="bg-grid"></div>
      <div className="noise-layer"></div>
    </>
  );

  const renderWatermark = () => (
    <div className="watermark">
      Made by Manasa Praveen &amp; Harshvikha Tanusree
    </div>
  );

  const renderDeleteModal = () => {
    if (!showDeleteModal || !eventToDelete) return null;

    return (
      <div className="modal-overlay" onClick={closeDeleteModal}>
        <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
          <p className="modal-badge">Delete Event</p>
          <h2 className="modal-title">Are you sure?</h2>
          <p className="modal-text">
            You are about to delete <strong>{eventToDelete.event_name}</strong>.
          </p>
          <p className="modal-warning">
            All registrations for this event will also be deleted.
          </p>

          <div className="modal-event-box">
            <p><strong>Domain:</strong> {eventToDelete.division_name}</p>
            <p><strong>Date:</strong> {eventToDelete.date?.split("T")[0] || eventToDelete.date}</p>
            <p><strong>Venue:</strong> {eventToDelete.venue}</p>
            <p><strong>Capacity:</strong> {getCapacityDisplay(eventToDelete)}</p>
            <p><strong>Current Registrations:</strong> {eventToDelete.confirmed_count}</p>
          </div>

          <div className="modal-actions">
            <button
              className="secondary-nav-btn"
              onClick={closeDeleteModal}
              disabled={deletingEvent}
            >
              Cancel
            </button>

            <button
              className="danger-modal-btn"
              onClick={confirmDeleteEvent}
              disabled={deletingEvent}
            >
              {deletingEvent ? "Deleting..." : "Yes, Delete Event"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderFilters = () => (
    <div className="filters-bar">
      <input
        type="text"
        className="filter-input"
        placeholder="Search by event name, venue, or organizer"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      <select
        className="styled-select filter-select"
        value={domainFilter}
        onChange={(e) => setDomainFilter(e.target.value)}
      >
        <option value="">All Domains</option>
        <option value="Technical">Technical</option>
        <option value="Non-Technical">Non-Technical</option>
        <option value="Cultural">Cultural</option>
      </select>
    </div>
  );

  if (currentPage === "signupPage") {
    return (
      <div className="page">
        {renderBackground()}
        <div className="register-page-wrapper">
          <div className="page-topbar">
            <button className="back-btn" onClick={() => setCurrentPage("login")}>
              ← Back
            </button>
          </div>

          <div className="register-card">
            <p className="register-badge">Student Signup</p>
            <h1>Create Student Account</h1>
            <p className="register-subtitle">
              Fill these details to create a new student account.
            </p>

            <form className="register-form" onSubmit={handleStudentSignup}>
              <label>Full Name</label>
              <input
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="Enter your full name"
                required
              />

              <label>College Email</label>
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="youremail@srmist.edu.in"
                required
              />

              <label>Password</label>
              <input
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="Create password"
                required
              />

              <label>Department</label>
              <input
                type="text"
                value={signupDepartment}
                onChange={(e) => setSignupDepartment(e.target.value)}
                placeholder="Enter department"
                required
              />

              <label>Year</label>
              <input
                type="number"
                value={signupYear}
                onChange={(e) => setSignupYear(e.target.value)}
                placeholder="Enter year"
                min="1"
                max="5"
                required
              />

              <button type="submit" className="register-submit-btn">
                Sign Up
              </button>
            </form>

            {signupMessage && (
              <p
                className={
                  signupMessageType === "success"
                    ? "status-message success-text"
                    : "status-message error-text"
                }
              >
                {signupMessage}
              </p>
            )}
          </div>
        </div>
        {renderWatermark()}
      </div>
    );
  }

  if (currentPage === "cancelRegistrationResult" && selectedRegistrationToCancel) {
    return (
      <div className="page">
        {renderBackground()}
        <div className="result-page-wrapper">
          <div className="result-card">
            <p className="result-badge">Cancellation Status</p>
            <h1 className="result-title">
              {cancelResultType === "success" ? "Registration Cancelled" : "Cancellation Failed"}
            </h1>
            <p className={cancelResultType === "success" ? "result-message success-result" : "result-message error-result"}>
              {cancelResultMessage}
            </p>

            <div className="result-event-box">
              <h3>{selectedRegistrationToCancel.event_name}</h3>
              <p><strong>Division:</strong> {selectedRegistrationToCancel.division_name}</p>
              <p><strong>Date:</strong> {selectedRegistrationToCancel.date?.split("T")[0] || selectedRegistrationToCancel.date}</p>
              <p><strong>Venue:</strong> {selectedRegistrationToCancel.venue}</p>
              <p><strong>Organized by:</strong> {getOrganizerDisplay(selectedRegistrationToCancel)}</p>
            </div>

            <div className="result-actions">
              <button className="secondary-nav-btn" onClick={goBackToCancelRegistrationPage}>
                Back to Cancel Page
              </button>
              <button className="primary-nav-btn" onClick={openMyRegistrationsPage}>
                Back to My Registrations
              </button>
            </div>
          </div>
        </div>
        {renderWatermark()}
      </div>
    );
  }

  if (currentPage === "cancelRegistrationPage" && selectedRegistrationToCancel) {
    return (
      <div className="page">
        {renderBackground()}
        <div className="register-page-wrapper">
          <div className="page-topbar">
            <button className="back-btn" onClick={openMyRegistrationsPage}>← Back</button>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>

          <div className="register-card">
            <p className="register-badge">Cancel Registration</p>
            <h1>Cancel for {selectedRegistrationToCancel.event_name}</h1>
            <p className="register-subtitle">
              Please tell us why you want to cancel this registration.
            </p>

            <div className="selected-event-box">
              <h3>{selectedRegistrationToCancel.event_name}</h3>
              <p><strong>Division:</strong> {selectedRegistrationToCancel.division_name}</p>
              <p><strong>Date:</strong> {selectedRegistrationToCancel.date?.split("T")[0] || selectedRegistrationToCancel.date}</p>
              <p><strong>Venue:</strong> {selectedRegistrationToCancel.venue}</p>
              <p><strong>Organized by:</strong> {getOrganizerDisplay(selectedRegistrationToCancel)}</p>
            </div>

            <form className="register-form" onSubmit={handleCancelRegistrationSubmit}>
              <label>Reason for cancellation</label>
              <div className="cancel-reasons-list">
                {cancelReasonOptions.map((reason) => (
                  <label className="radio-line" key={reason}>
                    <input
                      type="radio"
                      name="cancelReason"
                      value={reason}
                      checked={cancelReason === reason}
                      onChange={(e) => setCancelReason(e.target.value)}
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              {cancelReason === "Other" && (
                <>
                  <label>Custom reason</label>
                  <textarea
                    className="styled-textarea"
                    value={customCancelReason}
                    onChange={(e) => setCustomCancelReason(e.target.value)}
                    placeholder="Enter your custom reason"
                    required
                  />
                </>
              )}

              <button type="submit" className="register-submit-btn">
                Confirm Cancellation
              </button>
            </form>
          </div>
        </div>
        {renderWatermark()}
      </div>
    );
  }

  if (currentPage === "organizerEventRegistrations" && selectedOrganizerEvent) {
    const confirmedRegistrations = eventRegistrations.filter(
      (item) => item.status === "Confirmed"
    );
    const cancelledRegistrations = eventRegistrations.filter(
      (item) => item.status === "Cancelled"
    );

    return (
      <div className="page">
        {renderBackground()}
        <div className="dashboard-wrapper">
          <div className="page-topbar">
            <button className="back-btn" onClick={backToDashboard}>← Back</button>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>

          <div className="dashboard-topbar">
            <div>
              <p className="dashboard-role">Organizer Dashboard</p>
              <h1 className="dashboard-title">Event Registrations</h1>
              <p className="dashboard-subtitle">{selectedOrganizerEvent.event_name}</p>
            </div>
          </div>

          <div className="selected-event-box">
            <h3>{selectedOrganizerEvent.event_name}</h3>
            <p><strong>Division:</strong> {selectedOrganizerEvent.division_name}</p>
            <p><strong>Date:</strong> {selectedOrganizerEvent.date?.split("T")[0] || selectedOrganizerEvent.date}</p>
            <p><strong>Venue:</strong> {selectedOrganizerEvent.venue}</p>
            <p><strong>Organized by:</strong> {getOrganizerDisplay(selectedOrganizerEvent)}</p>
            <p><strong>Capacity:</strong> {getCapacityDisplay(selectedOrganizerEvent)}</p>
          </div>

          <div className="dashboard-section">
            <h2 className="section-title">Confirmed Registrations</h2>
            {loadingEventRegistrations ? (
              <p className="dashboard-note">Loading registrations...</p>
            ) : confirmedRegistrations.length === 0 ? (
              <p className="dashboard-note">No confirmed registrations yet.</p>
            ) : (
              <div className="registrations-grid">
                {confirmedRegistrations.map((item) => (
                  <div className="registration-card" key={item.registration_id}>
                    <h3>{item.full_name}</h3>
                    <p><strong>Registration No:</strong> {item.registration_number}</p>
                    <p><strong>Phone:</strong> {item.phone_number}</p>
                    <p><strong>WhatsApp:</strong> {item.whatsapp_number}</p>
                    <p><strong>Department:</strong> {item.department}</p>
                    <p><strong>Specialization:</strong> {item.specialization}</p>
                    <p><strong>Year:</strong> {item.year_of_study}</p>
                    <p><strong>Status:</strong> {item.status}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-section">
            <h2 className="section-title">Cancelled Registrations</h2>
            {loadingEventRegistrations ? (
              <p className="dashboard-note">Loading cancellations...</p>
            ) : cancelledRegistrations.length === 0 ? (
              <p className="dashboard-note">No cancelled registrations yet.</p>
            ) : (
              <div className="registrations-grid">
                {cancelledRegistrations.map((item) => (
                  <div className="registration-card cancelled-card" key={item.registration_id}>
                    <h3>{item.full_name}</h3>
                    <p><strong>Registration No:</strong> {item.registration_number}</p>
                    <p><strong>Phone:</strong> {item.phone_number}</p>
                    <p><strong>WhatsApp:</strong> {item.whatsapp_number}</p>
                    <p><strong>Department:</strong> {item.department}</p>
                    <p><strong>Specialization:</strong> {item.specialization}</p>
                    <p><strong>Year:</strong> {item.year_of_study}</p>
                    <p><strong>Status:</strong> {item.status}</p>
                    <p><strong>Reason:</strong> {item.cancel_reason}</p>
                    {item.custom_cancel_reason && (
                      <p><strong>Custom Reason:</strong> {item.custom_cancel_reason}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {renderWatermark()}
      </div>
    );
  }

  if (currentPage === "createEventResult") {
    return (
      <div className="page">
        {renderBackground()}
        <div className="result-page-wrapper">
          <div className="result-card">
            <p className="result-badge">{isEditMode ? "Edit Event Status" : "Create Event Status"}</p>
            <h1 className="result-title">
              {createEventMessageType === "success"
                ? isEditMode
                  ? "Event Updated Successfully"
                  : "Event Created Successfully"
                : isEditMode
                  ? "Event Not Updated"
                  : "Event Not Created"}
            </h1>
            <p className={createEventMessageType === "success" ? "result-message success-result" : "result-message error-result"}>
              {createEventMessage}
            </p>
            <div className="result-actions">
              <button className="secondary-nav-btn" onClick={goBackToCreateEventPage}>
                Back to {isEditMode ? "Edit Event" : "Create Event"}
              </button>
              <button className="primary-nav-btn" onClick={backToDashboard}>
                Back to Organizer Dashboard
              </button>
            </div>
          </div>
        </div>
        {renderWatermark()}
      </div>
    );
  }

  if (currentPage === "createEventPage") {
    return (
      <div className="page">
        {renderBackground()}
        <div className="register-page-wrapper">
          <div className="page-topbar">
            <button className="back-btn" onClick={backToDashboard}>← Back</button>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>

          <div className="register-card">
            <p className="register-badge">Organizer Action</p>
            <h1>{isEditMode ? "Edit Event" : "Create New Event"}</h1>
            <p className="register-subtitle">
              {isEditMode
                ? "Update the event details below."
                : "Fill all details to publish a new campus event."}
            </p>

            <form className="register-form" onSubmit={handleCreateEventSubmit}>
              <label>Event Name</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Enter event name"
                required
              />

              <label>Event Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />

              <label>Venue</label>
              <input
                type="text"
                value={eventVenue}
                onChange={(e) => setEventVenue(e.target.value)}
                placeholder="Enter venue"
                required
              />

              <label>Domain</label>
              <select
                value={divisionId}
                onChange={(e) => setDivisionId(e.target.value)}
                className="styled-select"
                required
              >
                <option value="">Select division</option>
                {divisions.map((division) => (
                  <option key={division.division_id} value={division.division_id}>
                    {division.division_name}
                  </option>
                ))}
              </select>

              <label>Set Capacity</label>
              <select
                value={capacityOption}
                onChange={(e) => {
                  setCapacityOption(e.target.value);
                  if (e.target.value === "no") {
                    setCapacity("");
                  }
                }}
                className="styled-select"
                required
              >
                <option value="">Select option</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>

              {capacityOption === "yes" && (
                <>
                  <label>Capacity</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="Enter capacity"
                    min="1"
                    required
                  />
                </>
              )}

              <button type="submit" className="register-submit-btn">
                {isEditMode ? "Update Event" : "Create Event"}
              </button>
            </form>
          </div>
        </div>
        {renderWatermark()}
      </div>
    );
  }

  if (currentPage === "registrationResult" && selectedEvent) {
    return (
      <div className="page">
        {renderBackground()}
        <div className="result-page-wrapper">
          <div className="result-card">
            <p className="result-badge">Registration Status</p>
            <h1 className="result-title">
              {registrationResultType === "success" ? "Registration Successful" : "Registration Not Completed"}
            </h1>
            <p className={registrationResultType === "success" ? "result-message success-result" : "result-message error-result"}>
              {registrationResultMessage}
            </p>

            <div className="result-event-box">
              <h3>{selectedEvent.event_name}</h3>
              <p><strong>Division:</strong> {selectedEvent.division_name}</p>
              <p><strong>Date:</strong> {selectedEvent.date?.split("T")[0] || selectedEvent.date}</p>
              <p><strong>Venue:</strong> {selectedEvent.venue}</p>
              <p><strong>Organized by:</strong> {getOrganizerDisplay(selectedEvent)}</p>
              <p><strong>Capacity:</strong> {getCapacityDisplay(selectedEvent)}</p>
            </div>

            <div className="result-actions">
              <button className="secondary-nav-btn" onClick={goBackToRegistrationPage}>
                Back to Registration Page
              </button>
              <button className="primary-nav-btn" onClick={backToDashboard}>
                Back to Student Dashboard
              </button>
            </div>
          </div>
        </div>
        {renderWatermark()}
      </div>
    );
  }

  if (currentPage === "myRegistrations") {
    const filteredRegistrations = myRegistrations.filter((item) => {
      const query = searchText.toLowerCase();

      const matchesText =
        item.event_name?.toLowerCase().includes(query) ||
        item.venue?.toLowerCase().includes(query) ||
        item.organizer_club?.toLowerCase().includes(query);

      const matchesDomain = !domainFilter || item.division_name === domainFilter;

      return matchesText && matchesDomain;
    });

    return (
      <div className="page">
        {renderBackground()}
        <div className="dashboard-wrapper">
          <div className="page-topbar">
            <button className="back-btn" onClick={backToDashboard}>← Back</button>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>

          <div className="dashboard-topbar">
            <div>
              <p className="dashboard-role">Student Dashboard</p>
              <h1 className="dashboard-title">My Registrations</h1>
              <p className="dashboard-subtitle">
                Events you have successfully registered for
              </p>
            </div>
          </div>

          {renderFilters()}

          <div className="dashboard-section">
            {loadingRegistrations ? (
              <p className="dashboard-note">Loading registrations...</p>
            ) : filteredRegistrations.length === 0 ? (
              <p className="dashboard-note">No registrations found yet.</p>
            ) : (
              <div className="events-grid">
                {filteredRegistrations.map((item) => (
                  <div
                    className={`event-card ${item.status === "Cancelled" ? "cancelled-card" : ""}`}
                    key={item.registration_id}
                  >
                    <div className="event-badge">{item.division_name}</div>
                    <h3>{item.event_name}</h3>
                    <p><strong>Date:</strong> {item.date?.split("T")[0] || item.date}</p>
                    <p><strong>Venue:</strong> {item.venue}</p>
                    <p><strong>Organized by:</strong> {getOrganizerDisplay(item)}</p>
                    <p><strong>Status:</strong> {item.status}</p>
                    <p><strong>Reg No:</strong> {item.registration_number}</p>
                    <p><strong>Department:</strong> {item.department}</p>
                    <p><strong>Specialization:</strong> {item.specialization}</p>
                    <p><strong>Year:</strong> {item.year_of_study}</p>
                    <p><strong>Capacity:</strong> {getCapacityDisplay(item)}</p>

                    {item.status === "Cancelled" && item.cancel_reason && (
                      <p><strong>Reason:</strong> {item.cancel_reason}</p>
                    )}

                    {item.status === "Confirmed" && (
                      <button
                        className="event-btn danger-btn"
                        onClick={() => openCancelRegistrationPage(item)}
                      >
                        Cancel Registration
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {renderWatermark()}
      </div>
    );
  }

  if (currentPage === "registerPage" && selectedEvent) {
    return (
      <div className="page">
        {renderBackground()}
        <div className="register-page-wrapper">
          <div className="page-topbar">
            <button className="back-btn" onClick={backToDashboard}>← Back</button>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>

          <div className="register-card">
            <p className="register-badge">Event Registration</p>
            <h1>Register for {selectedEvent.event_name}</h1>
            <p className="register-subtitle">
              Fill all details to complete your registration.
            </p>

            <div className="selected-event-box">
              <h3>{selectedEvent.event_name}</h3>
              <p><strong>Division:</strong> {selectedEvent.division_name}</p>
              <p><strong>Date:</strong> {selectedEvent.date?.split("T")[0] || selectedEvent.date}</p>
              <p><strong>Venue:</strong> {selectedEvent.venue}</p>
              <p><strong>Organized by:</strong> {getOrganizerDisplay(selectedEvent)}</p>
              <p><strong>Capacity:</strong> {getCapacityDisplay(selectedEvent)}</p>
            </div>

            <form className="register-form" onSubmit={handleRegisterSubmit}>
              <label>Full Name</label>
              <input
                type="text"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                required
              />

              <label>Registration Number</label>
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="Enter your registration number"
                required
              />

              <label>College Email</label>
              <input type="email" value={loggedInUser?.college_email || ""} readOnly />

              <label>Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                required
              />

              <label>WhatsApp Number</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="Enter WhatsApp number"
                required
              />

              <label>Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Enter department"
                required
              />

              <label>Specialization</label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="Enter specialization"
                required
              />

              <label>Year</label>
              <input
                type="text"
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                placeholder="Enter year"
                required
              />

              <button type="submit" className="register-submit-btn">
                Confirm Registration
              </button>
            </form>
          </div>
        </div>
        {renderWatermark()}
      </div>
    );
  }

  if (currentPage === "studentDashboard") {
    return (
      <div className="page">
        {renderBackground()}
        <div className="dashboard-wrapper">
          <div className="page-topbar">
            <button className="back-btn" onClick={goBackToLogin}>← Back</button>
            <button className="logout-btn" onClick={handleLogout}>
              {isGuestMode ? "Exit Guest Mode" : "Logout"}
            </button>
          </div>

          <div className="dashboard-topbar">
            <div>
              <p className="dashboard-role">{isGuestMode ? "Guest Mode" : "Student Dashboard"}</p>
              <h1 className="dashboard-title">Welcome, {loggedInUser.name}</h1>
              <p className="dashboard-subtitle">{loggedInUser.college_email}</p>
            </div>

            {!isGuestMode && (
              <button className="my-reg-btn" onClick={openMyRegistrationsPage}>
                My Registrations
              </button>
            )}
          </div>

          {renderFilters()}

          {isGuestMode && (
            <p className="guest-note">
              Guest mode is view-only. Login or sign up to register for events.
            </p>
          )}

          {statusMessage && (
            <p className={isError ? "status-message error-text" : "status-message success-text"}>
              {statusMessage}
            </p>
          )}

          <div className="dashboard-section">
            <h2 className="section-title">Upcoming Events</h2>

            {loadingEvents ? (
              <p className="dashboard-note">Loading events...</p>
            ) : filteredStudentEvents.length === 0 ? (
              <p className="dashboard-note">No events found.</p>
            ) : (
              <div className="events-grid">
                {filteredStudentEvents.map((event) => (
                  <div className="event-card" key={event.event_id}>
                    <div className="event-badge">{event.division_name}</div>
                    <h3>{event.event_name}</h3>
                    <p><strong>Date:</strong> {event.date?.split("T")[0] || event.date}</p>
                    <p><strong>Venue:</strong> {event.venue}</p>
                    <p><strong>Organized by:</strong> {getOrganizerDisplay(event)}</p>
                    <p><strong>Capacity:</strong> {getCapacityDisplay(event)}</p>

                    <button className="event-btn" onClick={() => openRegisterPage(event)}>
                      {isGuestMode ? "Login to Register" : "Register"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {renderWatermark()}
      </div>
    );
  }

  if (currentPage === "organizerDashboard") {
    return (
      <div className="page">
        {renderBackground()}
        <div className="dashboard-wrapper">
          <div className="page-topbar">
            <button className="back-btn" onClick={goBackToLogin}>← Back</button>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>

          <div className="dashboard-topbar">
            <div>
              <p className="dashboard-role">Organizer Dashboard</p>
              <h1 className="dashboard-title">Welcome, {loggedInUser.name}</h1>
              <p className="dashboard-subtitle">{loggedInUser.college_email}</p>
            </div>

            <button className="my-reg-btn" onClick={openCreateEventPage}>
              Create Event
            </button>
          </div>

          {renderFilters()}

          {statusMessage && (
            <p className={isError ? "status-message error-text" : "status-message success-text"}>
              {statusMessage}
            </p>
          )}

          <div className="dashboard-section">
            <h2 className="section-title">Manage Your Events</h2>

            {loadingEvents ? (
              <p className="dashboard-note">Loading events...</p>
            ) : filteredOrganizerEvents.length === 0 ? (
              <p className="dashboard-note">No events found for your club yet.</p>
            ) : (
              <div className="events-grid">
                {filteredOrganizerEvents.map((event) => (
                  <div className="event-card" key={event.event_id}>
                    <div className="event-badge">{event.division_name}</div>
                    <h3>{event.event_name}</h3>
                    <p><strong>Date:</strong> {event.date?.split("T")[0] || event.date}</p>
                    <p><strong>Venue:</strong> {event.venue}</p>
                    <p><strong>Organized by:</strong> {getOrganizerDisplay(event)}</p>
                    <p><strong>Capacity:</strong> {getCapacityDisplay(event)}</p>
                    <p><strong>Live Registrations:</strong> {event.confirmed_count}</p>

                    <div className="card-action-group">
                      <button
                        className="event-btn"
                        onClick={() => openEventRegistrationsPage(event)}
                      >
                        View Registrations
                      </button>

                      <button
                        className="event-btn edit-btn"
                        onClick={() => openEditEventPage(event)}
                      >
                        Edit Event
                      </button>

                      <button
                        className="event-btn danger-btn"
                        onClick={() => openDeleteEventModal(event)}
                      >
                        Delete Event
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {renderDeleteModal()}
        {renderWatermark()}
      </div>
    );
  }

  return (
    <div className="page">
      {renderBackground()}
      <div className="main-card">
        <div className="left-panel">
          <div className="brand-badge">SRM Campus Platform</div>
          <h1>UniConnect</h1>
          <p className="tagline">
            A smarter way to discover, organize, and experience university events.
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-dot"></span>
              <p>Explore technical, cultural, and non-technical events</p>
            </div>
            <div className="feature-item">
              <span className="feature-dot"></span>
              <p>Register instantly and track participation seamlessly</p>
            </div>
            <div className="feature-item">
              <span className="feature-dot"></span>
              <p>Empower clubs with one unified event dashboard</p>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-card">
              <h3>All Campus Events</h3>
              <span>Discover everything happening across your university.</span>
            </div>
            <div className="stat-card">
              <h3>Smart Registration</h3>
              <span>Register instantly for events without paperwork.</span>
            </div>
            <div className="stat-card">
              <h3>Real-Time Updates</h3>
              <span>Stay updated with schedules and announcements.</span>
            </div>
            <div className="stat-card">
              <h3>24/7 Access</h3>
              <span>Access UniConnect anytime from anywhere.</span>
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="login-card">
            <p className="welcome-text">Welcome back</p>
            <h2>Login to your account</h2>
            <p className="sub-text">
              Use your college credentials to continue into UniConnect.
            </p>

            <div className="role-toggle">
              <button
                className={role === "student" ? "role-btn active-role" : "role-btn"}
                onClick={() => setRole("student")}
                type="button"
              >
                Student
              </button>

              <button
                className={role === "organizer" ? "role-btn active-role" : "role-btn"}
                onClick={() => setRole("organizer")}
                type="button"
              >
                Organizer
              </button>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
              <label>College Email</label>
              <input
                type="email"
                placeholder="youremail@srmist.edu.in"
                value={collegeEmail}
                onChange={(e) => setCollegeEmail(e.target.value)}
              />

              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="login-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>

                <button type="button" className="link-btn">
                  Forgot password?
                </button>
              </div>

              <button type="submit" className="login-btn">
                Login as {role === "student" ? "Student" : "Organizer"}
              </button>

              <button type="button" className="secondary-btn" onClick={handleGuestMode}>
                Continue as Guest
              </button>
            </form>

            {statusMessage && (
              <p className={isError ? "status-message error-text" : "status-message success-text"}>
                {statusMessage}
              </p>
            )}

            <p className="bottom-text">
              New here?{" "}
              <button
                type="button"
                className="inline-link-btn"
                onClick={() => setCurrentPage("signupPage")}
              >
                Sign up as Student
              </button>
            </p>
          </div>
        </div>
      </div>
      {renderWatermark()}
    </div>
  );
}

export default App;