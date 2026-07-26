# TechUp Week 09 — PostgreSQL Auth Blog Studio

Starter code for the Friday full-stack workshop.

Requirements: Node.js 20.19 or newer and a local PostgreSQL server.

## Student board

Download [`student-board.excalidraw`](./student-board.excalidraw) and open it with [Excalidraw](https://excalidraw.com/).

This README contains the setup steps, mission summary, and API summary. The board adds the architecture flow, ERD, mission prompts, endpoint exercise, and exit check.

## Your missions

1. Register a user with a hashed password.
2. Login and return a JWT.
3. List public posts from PostgreSQL.
4. Create a post with a verified Bearer token.
5. Connect the React application by filling only `client/src/config/apiEndpoints.js`.

Bonus missions: view, edit, and delete a post. Edit and delete must be limited to the post owner.

## Project structure

- `client/` — completed Vite + React interface
- `server/` — Express starter with PostgreSQL, bcrypt, and JWT mission comments
- `server/db/schema.sql` — database tables and seed posts
- `server/requests.http` — requests for testing the API
- `solution/` — completed Full-stack Solution for checking after the workshop

## 1. Prepare PostgreSQL

Create a local database named:

```text
techup_blog_studio
```

Run `server/db/schema.sql` against that database.

## 2. Start the server

```bash
cd server
npm install
```

Copy `.env.example` to `.env`, then update the values if your PostgreSQL credentials are different.

```bash
npm run dev
```

The API runs at `http://localhost:4000`.

## 3. Start the client

Open another terminal:

```bash
cd client
npm install
npm run dev
```

## Frontend task — แก้เพียงไฟล์เดียว

Frontend เตรียม UI, routing, form, validation, Axios และการแนบ JWT token ไว้ให้แล้ว นักเรียนไม่ต้องสร้าง component หรือเขียน request ใหม่

### Step 1: เปิดไฟล์ที่ต้องแก้

ใน VS Code Explorer ให้เปิดตามลำดับนี้:

```text
client
└── src
    └── config
        └── apiEndpoints.js  ← แก้เฉพาะไฟล์นี้
```

Full path คือ `client/src/config/apiEndpoints.js`

### Step 2: เติม endpoint งานหลัก 4 จุด

ในไฟล์จะมีช่องว่าง `""` เตรียมไว้ ให้เปลี่ยนเฉพาะค่าด้านขวาของ key ต่อไปนี้:

| Key ใน `apiEndpoints.js` | เชื่อมกับ Backend | ใช้ทำอะไร |
|---|---|---|
| `register` | `POST /auth/register` | สมัครสมาชิก |
| `login` | `POST /auth/login` | Login และรับ JWT |
| `listPosts` | `GET /posts` | โหลดรายการโพสต์และ filter |
| `createPost` | `POST /posts` | สร้างโพสต์ด้วย Bearer token |

ใส่เฉพาะ endpoint path ที่ขึ้นต้นด้วย `/` ไม่ต้องใส่ `http://localhost:4000` เพราะ Axios ตั้งค่า base URL ไว้แล้ว

### Step 3: ทำ Bonus หลังงานหลักผ่านแล้ว

ฟังก์ชัน Bonus เตรียม parameter `postId` ไว้แล้ว:

| Key | เชื่อมกับ Backend |
|---|---|
| `getPost(postId)` | `GET /posts/:postId` |
| `updatePost(postId)` | `PUT /posts/:postId` |
| `deletePost(postId)` | `DELETE /posts/:postId` |

ตอนเติม path ให้ใช้ค่า `postId` ที่ฟังก์ชันรับมาแทนข้อความ `:postId`

### ไฟล์ Frontend ที่ไม่ต้องแก้

- `src/api/apiClient.js` — เตรียม Axios, base URL และ JWT interceptor แล้ว
- `src/context/AuthContext.jsx` — เตรียม Login, Logout และการจำสถานะผู้ใช้แล้ว
- `src/pages/` — เตรียม Feed, Register, Login, Create, View และ Edit UI แล้ว
- `src/App.jsx` — เตรียม routes และ protected page แล้ว
- `src/styles.css` — เตรียม responsive design แล้ว

อย่าเพิ่ม `fetch`, อย่าสร้าง Axios request ซ้ำ, อย่าเปลี่ยน HTTP method, request body, query parameters หรือ token logic

### Step 4: ทดสอบหลังเติม endpoint

1. ตรวจว่า Backend ทำงานที่ `http://localhost:4000`
2. เปิดหน้า React แล้วลอง Register
3. Login ด้วย account ที่เพิ่งสร้าง
4. กลับหน้า Feed และตรวจว่ารายการโพสต์โหลดได้
5. Login แล้วลอง Create Post
6. Logout และตรวจว่ายังอ่าน Public Feed ได้

ถ้า endpoint ยังว่างหรือพิมพ์ผิด หน้าเว็บจะแสดงข้อความแนะนำแทนการยิง request ไปผิด URL

## API summary

| Method | Endpoint | Access |
|---|---|---|
| `GET` | `/health` | Public |
| `POST` | `/auth/register` | Public |
| `POST` | `/auth/login` | Public |
| `GET` | `/posts` | Public |
| `POST` | `/posts` | Bearer token |

Bonus endpoints:

- `GET /posts/:postId`
- `PUT /posts/:postId`
- `DELETE /posts/:postId`
