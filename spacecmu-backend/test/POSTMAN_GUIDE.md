# SpaceCMU Backend - Postman API Testing Guide

🚀 **คู่มือการใช้ Postman Collection สำหรับทดสอบ SpaceCMU Backend API**

## 📁 ไฟล์ Postman ที่สร้างแล้ว

### `SpaceCMU-API-Collection.postman_collection.json`

Collection หลักที่รวม API endpoints ทั้งหมด:

- 🔐 **Authentication** - Register, Login, Profile
- 📝 **Posts API** - Public & Protected endpoints
- 💬 **Chat API** - Direct messaging, Chat management
- 🛒 **Market API** - Product CRUD operations
- 👥 **Friends API** - Friend requests, Management
- 🎭 **Persona API** - Anonymous persona management
- 🚫 **Error Testing** - Test error scenarios

### `SpaceCMU-Environment.postman_environment.json`

Environment variables สำหรับการตั้งค่า:

- Base URLs (Docker, Local development)
- Auto-filled tokens และ IDs
- Test user credentials

## 🔧 การติดตั้งและใช้งาน

### 1. Import Collection และ Environment

#### ใน Postman Desktop App:

1. เปิด Postman
2. คลิก **Import** (ปุ่มด้านซ้ายบน)
3. ลาก drop หรือเลือกไฟล์:
   - `SpaceCMU-API-Collection.postman_collection.json`
   - `SpaceCMU-Environment.postman_environment.json`
4. คลิก **Import**

#### ผ่าน Postman Web:

1. ไปที่ [postman.com](https://web.postman.com)
2. เลือก **Import** -> **Upload Files**
3. Upload ทั้ง 2 ไฟล์

### 2. ตั้งค่า Environment

1. เลือก **SpaceCMU Environments** จาก dropdown ด้านขวาบน
2. คลิกไอคอน 👁️ เพื่อดู/แก้ไข variables
3. ตรวจสอบ `baseUrl`:
   - **Docker**: `http://localhost:3000/api` (default)
   - **Local Dev**: `http://localhost:3001/api`

### 3. เริ่มการทดสอบ

#### เตรียม Backend Server:

```bash
# Docker (แนะนำ)
docker-compose up -d

# หรือ Local development
npm run dev
```

## 🎯 วิธีใช้งาน Collection

### 🔐 **ขั้นตอนแรก - Authentication**

#### 1. Register User

```
POST {{baseUrl}}/users/register
```

**Body**: ใช้ข้อมูล default หรือแก้ไข studentId/email

#### 2. Login User

```
POST {{baseUrl}}/users/login
```

**ผลลัพธ์**: Token จะถูกเซฟอัตโนมัติใน `{{authToken}}`

#### 3. Get My Profile

```
GET {{baseUrl}}/users/me
```

**Header**: ใช้ `Authorization: Bearer {{authToken}}`

### 📝 **Posts API Testing**

#### Public Endpoints (ไม่ต้อง auth):

- **Get Public Feed**: ดู posts สาธารณะ
- **Get All Posts**: ดู posts ทั้งหมด
- **Get Post by ID**: ดู post เฉพาะ
- **Search Posts**: ค้นหาตาม author

#### Protected Endpoints (ต้อง auth):

- **Create Post**: สร้าง post ใหม่
- **Get Friends Feed**: ดู posts ของเพื่อน
- **Like/Unlike Post**: กดไลค์หรือยกเลิก

### 💬 **Chat API Testing**

#### ⚠️ **สำคัญ - UUID Format**

Chat API ต้องการ **UUID format** สำหรับ user IDs:

- ✅ ถูกต้อง: `"otherUserId": "{{validUserId2}}"`
- ❌ ผิด: `"otherUserId": "testUser2"` (จะได้ 500 error)

#### ลำดับการทดสอบ:

1. **Get My Chats** - ดูแชททั้งหมด
2. **Create Direct Chat** - สร้างแชท (ใช้ {{validUserId2}} แล้ว chatId จะ auto-save)
3. **Send Message** - ส่งข้อความ
4. **Get Chat Messages** - ดูข้อความ
5. **Get Chat Participants** - ดูผู้เข้าร่วม
6. **Clear Chat Messages** - ล้างข้อความ

#### 🔧 **Body Format for Create Direct Chat:**

```json
{
  "otherUserId": "{{validUserId2}}"
}
```

### 🛒 **Market API Testing**

#### Public:

- **Get All Products** - ดูสินค้าทั้งหมด (ไม่ต้อง auth)

#### Protected:

1. **Create Product** - สร้างสินค้า (productId จะ auto-save)
2. **Update Product Status** - เปลี่ยนสถานะ (**เฉพาะ "active" และ "sold"**)
3. **Delete Product** - ลบสินค้า

#### ⚠️ **สำคัญ - Product Status Values**

Server รับเฉพาะ 2 ค่า:

- ✅ `"active"` - สินค้าพร้อมขาย
- ✅ `"sold"` - สินค้าขายแล้ว
- ❌ `"reserved"`, `"available"` - ไม่รองรับ (จะได้ 400 error)

#### 🔧 **Body Format for Update Status:**

```json
{
  "status": "active" // หรือ "sold"
}
```

## 🔧 Features พิเศษ

### 🤖 **Auto-Variable Management**

- **authToken**: อัปเดตอัตโนมัติเมื่อ login สำเร็จ
- **userId**: เซฟจาก login response
- **chatId**: เซฟจาก create chat response
- **productId**: เซฟจาก create product response
- **validUserId1**: Pre-set UUID สำหรับ Test User 1
- **validUserId2**: Pre-set UUID สำหรับ User A (ใช้สำหรับทดสอบ chat/friends)
- **validToken**: Pre-generated JWT token สำหรับทดสอบด่วน

### ⚡ **Quick Testing Variables**

Environment มี pre-set values พร้อมใช้:

- `{{validUserId1}}`: f3a3a204-652a-464d-9f74-9b807a515806
- `{{validUserId2}}`: db7d463f-0430-4b6b-ad8d-1bf0ba5ca2a8
- `{{validToken}}`: JWT token ที่ใช้งานได้ (อายุ 7 วัน)

### 📊 **Auto-Logging**

Collection มี pre-request และ test scripts ที่:

- Log ทุก API call พร้อม response time
- แสดงข้อผิดพลาดใน Console
- อัปเดต environment variables อัตโนมัติ

### 🚫 **Error Testing**

Folder พิเศษสำหรับทดสอบ error cases:

- **401 Unauthorized** - เข้าถึงโดยไม่มี token
- **400 Bad Request** - ส่งข้อมูลผิด
- **404 Not Found** - resource ที่ไม่มี

## 📋 การใช้งานขั้นสูง

### 🔄 **Collection Runner**

รัน tests แบบอัตโนมัติ:

1. คลิกขวาที่ Collection -> **Run Collection**
2. เลือก requests ที่ต้องการ
3. ตั้งค่า **Delay** (แนะนำ 1000ms)
4. คลิก **Run SpaceCMU Backend API**

### 🧪 **Test Automation**

เพิ่ม Test Scripts ใน **Tests** tab:

```javascript
// ตรวจสอบ status code
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

// ตรวจสอบ response data
pm.test("Response has data", function () {
  const response = pm.response.json();
  pm.expect(response.data).to.exist;
});

// เซฟ ID จาก response
pm.test("Save ID to variable", function () {
  const response = pm.response.json();
  const id = response.data?.id;
  if (id) {
    pm.collectionVariables.set("savedId", id);
  }
});
```

### 🌐 **Multiple Environments**

สร้าง environments เพิ่มเติม:

- **Development**: Local server
- **Staging**: Test server
- **Production**: Live server

## 🧪 Multi-User Chat Testing

### 📝 **Test Scenarios**

ดู [MULTI_USER_CHAT_GUIDE.md](./MULTI_USER_CHAT_GUIDE.md) สำหรับรายละเอียด

#### **Quick Multi-User Test:**

```bash
node test/multi_user_chat_test.js
```

### 👥 **Multi-User Environment Variables**

```javascript
// User Tokens
{{userAToken}} - User A authentication
{{userBToken}} - User B authentication
{{userCToken}} - User C authentication

// User IDs
{{userAId}} - f3a3a204-652a-464d-9f74-9b807a515806
{{userBId}} - be9e9d69-8fe3-4bb4-9a66-1c8f0c8a8b8b
{{userCId}} - ff5bca81-2b5c-4f28-8e8b-7d5c4b8a8b8b

// Chat IDs
{{chatABId}} - Chat between A and B
{{chatCAId}} - Chat between C and A
{{chatCBId}} - Chat between C and B
```

### 💬 **Chat Test Scenarios:**

1. **A → B**: User A ส่งข้อความหา User B, B ตอบกลับ
2. **C → A**: User C เชิญ A เข้า study group
3. **C → B**: User C เชิญ B เข้า study session

## 🐞 การแก้ไขปัญหา

### Connection Issues

```
Error: connect ECONNREFUSED
```

**แก้ไข**:

- ตรวจสอบ server ทำงาน: `docker-compose ps`
- เช็ค port ใน environment: `baseUrl`
- ดู server logs: `docker-compose logs backend`

### Authentication Issues

```
401 Unauthorized
```

**แก้ไข**:

- ทำ login ใหม่
- เช็ค `{{authToken}}` ใน environment
- ตรวจสอบ Authorization header format

### Variable Issues

```
{{variable}} not resolved
```

**แก้ไข**:

- เลือก Environment ที่ถูกต้อง
- รัน requests ตามลำดับ (Register -> Login -> Other APIs)
- เช็ค variable names ใน Environment

## 📊 Test Scenarios

### 🎯 **Complete Flow Test**

ลำดับการทดสอบแบบครบวงจร:

1. **Setup Phase**:

   - Register User
   - Login User
   - Get My Profile

2. **Posts Phase**:

   - Get Public Feed
   - Create Post
   - Like Post
   - Get Friends Feed

3. **Chat Phase**:

   - Create Direct Chat
   - Send Message
   - Get Messages
   - Get Participants

4. **Market Phase**:

   - Get All Products
   - Create Product
   - Update Status
   - Delete Product

5. **Error Phase**:
   - Test 401 Unauthorized
   - Test 400 Bad Request
   - Test 404 Not Found

### 🔄 **Performance Testing**

ใช้ Collection Runner:

- **Iterations**: 5-10 รอบ
- **Delay**: 500-1000ms
- **Data File**: CSV สำหรับ test data

## 📝 หมายเหตุ

- Collection รองรับทั้ง Docker (port 3000) และ Local (port 3001)
- Environment variables จะ auto-update จาก API responses
- ใช้ Console tab เพื่อดู logs และ debug info
- Test scripts จะรันอัตโนมัติหลังทุก request
- สามารถ export results เป็น JSON หรือ HTML ได้

## 🔗 ทรัพยากรเพิ่มเติม

- [Postman Documentation](https://learning.postman.com/docs/)
- [Collection Variables](https://learning.postman.com/docs/sending-requests/variables/)
- [Writing Tests](https://learning.postman.com/docs/writing-scripts/test-scripts/)
- [Collection Runner](https://learning.postman.com/docs/running-collections/intro-to-collection-runs/)
