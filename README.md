# Backend Optical Retail Management System

Backend Node.js Express cho he thong quan ly cua hang kinh. Hien tai repo da trien khai module Authentication theo chuan MVC voi CommonJS.

## Tech Stack

- Node.js
- Express
- dotenv
- bcryptjs
- jsonwebtoken
- nodemailer
- express-validator
- cors
- morgan

## Current Scope

Da trien khai:
- Authentication API
  - Register
  - Login
  - Logout
  - Refresh token
  - Forgot password
  - Reset password
  - Change password

Chua trien khai:
- Admin
- Cart
- Order Payment
- Product Categories

## Project Structure

```text
backend_optical_retail_management_system/
|-- src/
|   |-- controllers/
|   |-- middlewares/
|   |-- models/
|   |-- routes/
|   |-- utils/
|   `-- validators/
|-- .env.example
|-- .gitattributes
|-- .gitignore
|-- package.json
|-- package-lock.json
|-- README.md
`-- server.js
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

Copy `.env.example` thanh `.env`:

```bash
cp .env.example .env
```

Tren PowerShell:

```powershell
Copy-Item .env.example .env
```

### 3. Environment variables

`.env.example`:

```env
PORT=3000
JWT_ACCESS_SECRET=dev_access_secret_optical_retail_2026
JWT_REFRESH_SECRET=dev_refresh_secret_optical_retail_2026
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
OTP_EXPIRES_IN_MINUTES=5
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

Luu y:
- Neu chua cau hinh SMTP, API quen mat khau van hoat dong.
- OTP se duoc log ra terminal hoac file log de test local.

## Run Project

Chay development:

```bash
npm run dev
```

Neu `nodemon` gap van de tren mot so moi truong Windows/sandbox, chay:

```bash
npm start
```

Base URL mac dinh:

```text
http://localhost:3000
```

Health check:

```http
GET /
```

## Authentication APIs

### 1. Register

```http
POST /auth/register
```

Body:

```json
{
  "fullName": "Nguyen Van A",
  "email": "customer@example.com",
  "phone": "+84912345678",
  "password": "Password1",
  "confirmPassword": "Password1"
}
```

### 2. Login

```http
POST /auth/login
```

Body:

```json
{
  "email": "customer@example.com",
  "password": "Password1"
}
```

### 3. Logout

```http
POST /auth/logout
```

Header:

```text
Authorization: Bearer <accessToken>
```

### 4. Refresh Token

```http
POST /auth/refresh-token
```

Body:

```json
{
  "refreshToken": "your_refresh_token"
}
```

### 5. Forgot Password

```http
POST /auth/forgot-password
```

Body:

```json
{
  "email": "customer@example.com"
}
```

### 6. Reset Password

```http
POST /auth/reset-password
```

Body:

```json
{
  "email": "customer@example.com",
  "otp": "123456",
  "newPassword": "Password2"
}
```

### 7. Change Password

```http
POST /auth/change-password
```

Header:

```text
Authorization: Bearer <accessToken>
```

Body:

```json
{
  "currentPassword": "Password2",
  "newPassword": "Password3"
}
```

## Validation Rules

- Email phai dung dinh dang
- Password toi thieu 8 ky tu
- Confirm password phai khop password
- Phone chi chap nhan so di dong Viet Nam
  - `0xxxxxxxxx`
  - `84xxxxxxxxx`
  - `+84xxxxxxxxx`
- OTP gom 6 chu so

## Auth Notes

- Du lieu user hien dang luu bang in-memory store.
- Khi restart server, toan bo user, OTP va refresh token se bi reset.
- Moi user chi co 1 refresh token active tai mot thoi diem.
- Sau `logout`, `reset-password`, `change-password`, refresh token cu se mat hieu luc.

## Common Responses

Success:

```json
{
  "message": "..."
}
```

Error:

```json
{
  "message": "Noi dung loi"
}
```

Status codes chinh:

- `200` success
- `201` created
- `400` invalid input
- `401` unauthorized or invalid token
- `404` user not found
- `409` email already exists
- `500` internal server error

## Quick Test Flow

1. `POST /auth/register`
2. `POST /auth/login`
3. `POST /auth/refresh-token`
4. `POST /auth/logout`
5. `POST /auth/forgot-password`
6. Lay OTP trong terminal hoac log
7. `POST /auth/reset-password`
8. `POST /auth/change-password`

## Git Notes

- Khong commit `.env`
- Khong commit `node_modules`
- Repo da co `.gitignore` va `.gitattributes` de giu working tree sach va line endings on dinh
