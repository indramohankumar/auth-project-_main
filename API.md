# VisitorPass API Documentation

Base URL: `/api`

## Authentication

All protected routes require a valid JWT token in the `Authorization` header:
`Authorization: Bearer <token>`

### Auth Routes

#### `POST /auth/register`
Register a new user (employee role by default).
- **Body**: `{ "name": "John", "email": "john@test.com", "password": "password123" }`
- **Response**: `201 Created` with User object.

#### `POST /auth/login`
Authenticate a user and get a token.
- **Body**: `{ "email": "john@test.com", "password": "password123" }`
- **Response**: `200 OK` with `{ "token": "...", "user": { ... } }`

#### `GET /auth/me`
Get current authenticated user profile.
- **Headers**: `Authorization`
- **Response**: `200 OK`

---

## Users

#### `GET /users`
Get all users (Admin only).
- **Headers**: `Authorization`
- **Response**: `200 OK` with array of users.

#### `PUT /users/:id`
Update a user's role (Admin only).
- **Body**: `{ "role": "security" }`
- **Response**: `200 OK`

#### `DELETE /users/:id`
Delete a user (Admin only).
- **Response**: `200 OK`

---

## Visitors

#### `POST /visitor`
Create a new visitor.
- **Headers**: `Authorization`
- **Body**: `multipart/form-data` with `name`, `email`, `phone`, `company`, `address`, and `photo` file.
- **Response**: `201 Created`

#### `POST /visitor/public-register`
Public pre-registration for visitors.
- **Body**: Same as above.
- **Response**: `201 Created`

#### `GET /visitor`
Get all visitors.
- **Headers**: `Authorization`
- **Response**: `200 OK`

#### `PUT /visitor/:id`
Update a visitor (Admin only).
- **Response**: `200 OK`

#### `DELETE /visitor/:id`
Delete a visitor (Admin only).
- **Response**: `200 OK`

---

## Appointments

#### `POST /appointment`
Schedule an appointment.
- **Headers**: `Authorization`
- **Body**: `{ "visitor": "ObjectId", "visitdate": "ISO Date", "purpose": "Meeting" }`
- **Response**: `201 Created`

#### `GET /appointment`
Get appointments.
- **Headers**: `Authorization`
- **Response**: `200 OK`

#### `PUT /appointment/:id/approve`
Approve an appointment (Admin/Employee).
- **Headers**: `Authorization`
- **Response**: `200 OK`

#### `PUT /appointment/:id/reject`
Reject an appointment (Admin/Employee).
- **Headers**: `Authorization`
- **Response**: `200 OK`

#### `DELETE /appointment/:id`
Delete an appointment (Admin only).
- **Response**: `200 OK`

---

## Passes

#### `POST /passes/generate/:appointmentid`
Generate a digital pass for an approved appointment.
- **Headers**: `Authorization`
- **Response**: `201 Created` with pass details.

#### `GET /passes/pdf/:passid`
Get a PDF of the pass.
- **Headers**: `Authorization`
- **Response**: `200 OK` (PDF Stream)

#### `GET /passes/public/pdf/:passnumber`
Publicly get a PDF of a pass by its number.
- **Response**: `200 OK` (PDF Stream)

---

## Check In / Out

#### `POST /check/checkin/:passid`
Check in a visitor (Admin only).
- **Headers**: `Authorization`
- **Response**: `200 OK`

#### `POST /check/checkout/:passid`
Check out a visitor (Admin only).
- **Headers**: `Authorization`
- **Response**: `200 OK`
