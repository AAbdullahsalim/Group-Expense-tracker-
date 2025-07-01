# Group Expense Tracker API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
All endpoints except `/api/health` require Supabase authentication via session cookies.

## API Endpoints

### 🏥 Health Check

#### GET `/api/health`
Check if the API is running properly.

**Request:**
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-06-30T23:54:47.757Z",
  "service": "group-expense-tracker"
}
```

---

### 👥 Groups Management

#### GET `/api/groups`
Get all groups for the authenticated user.

**Request:**
```http
GET /api/groups
Cookie: supabase-auth-token={your-session-token}
```

**Response:**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Trip to Bali",
    "created_by": "user-id",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

#### POST `/api/groups`
Create a new group.

**Request:**
```http
POST /api/groups
Content-Type: application/json
Cookie: supabase-auth-token={your-session-token}

{
  "name": "Weekend Trip"
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Weekend Trip",
  "created_by": "user-id",
  "created_at": "2025-01-01T00:00:00Z"
}
```

#### PUT `/api/groups/[groupId]`
Update a group's information.

**Request:**
```http
PUT /api/groups/123e4567-e89b-12d3-a456-426614174000
Content-Type: application/json
Cookie: supabase-auth-token={your-session-token}

{
  "name": "Updated Group Name"
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Updated Group Name",
  "created_by": "user-id",
  "created_at": "2025-01-01T00:00:00Z"
}
```

#### DELETE `/api/groups/[groupId]`
Delete a group and all its expenses.

**Request:**
```http
DELETE /api/groups/123e4567-e89b-12d3-a456-426614174000
Cookie: supabase-auth-token={your-session-token}
```

**Response:**
```json
{
  "success": true
}
```

---

### 💰 Group Expenses

#### GET `/api/expenses/[groupId]`
Get all expenses for a specific group.

**Request:**
```http
GET /api/expenses/123e4567-e89b-12d3-a456-426614174000
Cookie: supabase-auth-token={your-session-token}
```

**Response:**
```json
[
  {
    "id": "expense-id-1",
    "description": "Restaurant dinner",
    "amount": 150.50,
    "group_id": "123e4567-e89b-12d3-a456-426614174000",
    "created_by": "user-id",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

#### POST `/api/expenses/[groupId]`
Add a new expense to a group.

**Request:**
```http
POST /api/expenses/123e4567-e89b-12d3-a456-426614174000
Content-Type: application/json
Cookie: supabase-auth-token={your-session-token}

{
  "description": "Grocery shopping",
  "amount": 85.20
}
```

**Response:**
```json
{
  "id": "expense-id-2",
  "description": "Grocery shopping",
  "amount": 85.20,
  "group_id": "123e4567-e89b-12d3-a456-426614174000",
  "created_by": "user-id",
  "created_at": "2025-01-01T00:00:00Z"
}
```

---

### 📝 Individual Expense Management

#### PUT `/api/expense/[expenseId]`
Update an individual expense.

**Request:**
```http
PUT /api/expense/expense-id-1
Content-Type: application/json
Cookie: supabase-auth-token={your-session-token}

{
  "description": "Updated description",
  "amount": 200.00
}
```

**Response:**
```json
{
  "id": "expense-id-1",
  "description": "Updated description",
  "amount": 200.00,
  "group_id": "123e4567-e89b-12d3-a456-426614174000",
  "created_by": "user-id",
  "created_at": "2025-01-01T00:00:00Z"
}
```

#### DELETE `/api/expense/[expenseId]`
Delete an individual expense.

**Request:**
```http
DELETE /api/expense/expense-id-1
Cookie: supabase-auth-token={your-session-token}
```

**Response:**
```json
{
  "success": true
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Description and amount are required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Group not found or access denied"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Authentication Notes

1. **Session-based Authentication**: Uses Supabase session cookies
2. **User Isolation**: Users can only access their own groups and expenses
3. **Row Level Security**: Enforced at the database level

## Database Schema

### Groups Table
- `id` (UUID, Primary Key)
- `name` (String)
- `created_by` (UUID, Foreign Key to auth.users)
- `created_at` (Timestamp)

### Expenses Table
- `id` (UUID, Primary Key)
- `description` (String)
- `amount` (Decimal)
- `group_id` (UUID, Foreign Key to groups)
- `created_by` (UUID, Foreign Key to auth.users)
- `created_at` (Timestamp) 