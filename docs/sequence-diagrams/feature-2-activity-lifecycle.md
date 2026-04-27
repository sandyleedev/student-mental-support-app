# Booking flow (counsellor-published activities / slots)

Counselling activities in the system represent bookable slots (e.g. sessions or workshops with capacity), and bookings link a student to an activity. This diagram focuses on the booking flow, showing how counsellors publish availability and how students discover and confirm bookings.

```mermaid
sequenceDiagram
    participant Counsellor
    participant Student
    participant counsellorActivityView as ":CounsellorActivityView"
    participant studentBookingView as ":StudentBookingView"
    participant activityHandler as ":ActivityHandler"
    participant bookingHandler as ":BookingHandler"
    participant activityRepository as ":ActivityRepository"
    participant bookingRepository as ":BookingRepository"

    %% a–b Counsellor creates available slots (activities)
    Counsellor->>+counsellorActivityView: Define session/workshop (time, capacity, title, …)
    counsellorActivityView->>+activityHandler: createActivity(counsellorId, activityDetails)
    activityHandler->>+activityRepository: saveActivity(activityDetails)
    activityRepository-->>-activityHandler: Saved activity (available slot)
    activityHandler-->>-counsellorActivityView: Return published activity
    counsellorActivityView-->>-Counsellor: Confirm slot listed

    %% c Student retrieves available slots
    Student->>+studentBookingView: Open booking / sessions page
    studentBookingView->>+activityHandler: getAvailableActivities(filters)
    activityHandler->>+activityRepository: findUpcomingActivitiesWithCapacity()
    activityRepository-->>-activityHandler: Activities with remaining capacity
    activityHandler-->>-studentBookingView: Return slot list
    studentBookingView-->>-Student: Show available slots

    %% d–e Student selects slot and booking is confirmed
    Student->>+studentBookingView: Select activity and confirm booking
    studentBookingView->>+bookingHandler: createConfirmedBooking(studentId, activityId)
    bookingHandler->>+activityRepository: findActivityForUpdate(activityId)
    activityRepository-->>-bookingHandler: Activity (capacity, type)
    bookingHandler->>+bookingRepository: saveBookingIfCapacityAllows(studentId, activityId, CONFIRMED)
    bookingRepository-->>-bookingHandler: Confirmed booking (or conflict / full)
    bookingHandler-->>-studentBookingView: Booking result
    studentBookingView-->>-Student: Show confirmation
```

## Covered flows

| Step            | What it shows                                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Publish slots   | **Counsellor** (or facilitator) creates an **activity**; **ActivityRepository** persists it as an available bookable slot. |
| Discover slots  | **Student** loads upcoming activities that still have **capacity**.                                                        |
| Confirm booking | **BookingHandler** validates capacity and persists a **CONFIRMED** row via **BookingRepository**.                          |
