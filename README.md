// outline the key states and transitions to  visualize the state machine:
// Initial State (Available/Not Booked)
// Instruments start in this state.

// --------------  Booking Requested -------------------//
// Trigger: User requests to book an instrument.
// Transition: From "Available" to "Booking Requested".
//--------------------------------------------------------

//--------------Waiting for Admin Approval--------------//
// Trigger: Booking request is pending admin approval.
// Transition: From "Booking Requested" to "Waiting for Admin Approval".
//--------------------------------------------------------

//--------------Booked----------------------------------//
// Trigger: Admin approves the booking request.
// Transition: From "Waiting for Admin Approval" to "Booked".
//--------------------------------------------------------

//--------------Release Requested-----------------------//
// Trigger: User requests to release the instrument.
// Transition: From "Booked" to "Release Requested".
//--------------------------------------------------------

//--------------Waiting for Admin to Confirm Release----//
// Trigger: Release request is pending admin approval.
// Transition: From "Release Requested" to "Waiting for Admin to Confirm Release".
//--------------------------------------------------------

//--------------Available/Not Booked (Again)------------//
// Trigger: Admin approves the release request.
// Transition: From "Waiting for Admin to Confirm Release" back to "Available/Not Booked".
//--------------------------------------------------------

//--------------Booking Rejected-----------------------//
// Trigger: Admin rejects the booking request.
// Transition: From "Waiting for Admin Approval" to "Available/Not Booked".
//--------------------------------------------------------
