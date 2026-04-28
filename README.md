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
- sequelize
- mysql2

## Dependencies

### Production Dependencies

| Thư viện            | Phiên bản | Mô tả                                                                     |
| ------------------- | --------- | ------------------------------------------------------------------------- |
| `express`           | ^5.2.1    | Web framework Node.js, cung cấp các API HTTP cơ bản                       |
| `sequelize`         | ^6.37.8   | ORM (Object-Relational Mapping) cho Node.js, hỗ trợ các cơ sở dữ liệu SQL |
| `mysql2`            | ^3.22.0   | MySQL client driver cho Node.js, cho phép kết nối đến database MySQL      |
| `dotenv`            | ^17.4.2   | Tải biến môi trường từ file `.env` vào `process.env`                      |
| `bcryptjs`          | ^3.0.3    | Hash mật khẩu an toàn với thuật toán bcrypt                               |
| `jsonwebtoken`      | ^9.0.3    | Tạo và xác thực JWT (JSON Web Token) cho authentication                   |
| `express-validator` | ^7.3.2    | Middleware để validate và sanitize dữ liệu request                        |
| `nodemailer`        | ^8.0.5    | Gửi email qua SMTP, dùng cho OTP và khôi phục mật khẩu                    |
| `cors`              | ^2.8.6    | Middleware hỗ trợ CORS (Cross-Origin Resource Sharing)                    |
| `morgan`            | ^1.10.1   | HTTP request logger middleware                                            |

### Development Dependencies

| Thư viện  | Phiên bản | Mô tả                                                                     |
| --------- | --------- | ------------------------------------------------------------------------- |
| `nodemon` | ^3.1.14   | Tự động khởi động lại server khi code thay đổi (chỉ dùng khi development) |

## Current Scope

Da trien khai:

- Authentication API: Register, Login, Logout, Refresh token, Forgot/Reset/Change password
- Admin auth (login/logout/refresh/profile)
- Product/Category/Brand: CRUD (admin) + list/detail (public)
- Cart: dung bang `Orders` voi `status='Cart'` (add/update/remove/clear)
- Address: CRUD dia chi cua user
- Discount: CRUD + gan/bo discount cho product
- Order: checkout (cart -> order), list/detail/cancel cho user; admin list, update status, mark paid
- Comment / rating: CRUD review san pham (chi user da mua)

API endpoints chinh:

```text
Auth        : /auth/{register,login,logout,refresh-token,forgot-password,reset-password,change-password}
Admin       : /admin/{login,logout,refresh-token,me}
Products    : GET|POST|PUT|DELETE /products[/...]
Categories  : GET|POST|PUT|DELETE /categories[/...]
Brands      : GET|POST|PUT|DELETE /brands[/...]
Cart        : GET|POST|PUT|DELETE /cart[/items/:variantId]
Addresses   : GET|POST|PUT|DELETE /addresses[/:id]   (auth)
Discounts   : GET|POST|PUT|DELETE /discounts[/:id]; POST|DELETE /discounts/:id/products/:productId
Orders      : POST /orders/checkout; GET /orders, /orders/:id; POST /orders/:id/cancel
              Admin: GET /orders/admin/all, /orders/admin/:id; PATCH /orders/admin/:id/status, /orders/admin/:id/mark-paid
Comments    : GET /variants/:variantId/comments, /comments/:id; POST|PUT|DELETE /comments[/:id] (auth)
```

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

Cài đặt tất cả dependencies:

```bash
npm install
```

Hoặc cài đặt từng thư viện riêng lẻ:

```bash
# Web framework
npm install express

# Database & ORM
npm install sequelize mysql2

# Authentication
npm install bcryptjs jsonwebtoken

# Utilities
npm install dotenv cors morgan nodemailer express-validator

# Development
npm install --save-dev nodemon
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

Cookie:

```text
refreshToken=<httpOnly_cookie>
```

Luu y:

- API ho tro fallback nhan `refreshToken` trong body de tuong thich client cu.

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

- Du lieu user duoc luu trong MySQL thong qua Sequelize.
- Refresh token va OTP reset password hien tai duoc luu in-memory tai repository layer.
- Khi restart server, OTP va refresh token se bi reset.
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
