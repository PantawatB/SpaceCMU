# Multi-User Chat Testing Guide

## 🧪 การทดสอบ Multi-User Chat Scenarios

### 📁 ไฟล์ที่เกี่ยวข้อง

- `multi_user_chat_test.js` - Test script สำหรับทดสอบการสนทนาระหว่างหลายผู้ใช้
- `SpaceCMU-Environment.postman_environment.json` - Environment variables รองรับ multi-user

### 🚀 วิธีการใช้งาน

#### 1. Run Multi-User Chat Test

```bash
cd spacecmu-backend
node test/multi_user_chat_test.js
```

#### 2. Test Scenarios ที่ครอบคลุม

##### **Scenario 1: User A → User B**

- User A ส่งข้อความทักทาย User B
- User B ตอบกลับและสอบถามกลับ
- แสดงการสนทนาแบบ 2 ทาง

##### **Scenario 2: User C → User A**

- User C เชิญ User A เข้าร่วม study group
- User A ตอบรับและสอบถามรายละเอียด
- User C ให้ข้อมูลเวลาและสถานที่

##### **Scenario 3: User C → User B**

- User C เชิญ User B เข้าร่วม study session
- User B ตอบรับและอ้างอิงการสนทนากับ User A
- User C ยืนยันการนัดหมาย

### 📊 Test Results

```
🎉 Multi-user chat testing completed!

📊 Test Results:
✅ User authentication and setup
✅ Direct chat creation between users
✅ Message sending and receiving
✅ Multi-user conversation scenarios
✅ Chat message retrieval and display
```

### 🔧 Postman Collection Features

#### Multi-User Environment Variables:

- `{{userAToken}}` - Token สำหรับ User A
- `{{userBToken}}` - Token สำหรับ User B
- `{{userCToken}}` - Token สำหรับ User C
- `{{userAId}}` - User ID ของ User A
- `{{userBId}}` - User ID ของ User B
- `{{userCId}}` - User ID ของ User C
- `{{chatABId}}` - Chat ID ระหว่าง A และ B
- `{{chatCAId}}` - Chat ID ระหว่าง C และ A
- `{{chatCBId}}` - Chat ID ระหว่าง C และ B

#### การใช้งานใน Postman:

1. **Login as Different Users:**

   ```json
   POST {{baseUrl}}/users/login
   {
     "email": "user1@cmu.ac.th",
     "password": "password123"
   }
   ```

2. **Create Direct Chat:**

   ```json
   POST {{baseUrl}}/chats/direct
   Authorization: Bearer {{userAToken}}
   {
     "otherUserId": "{{userBId}}"
   }
   ```

3. **Send Message:**

   ```json
   POST {{baseUrl}}/chats/{{chatABId}}/messages
   Authorization: Bearer {{userAToken}}
   {
     "content": "Hello User B! How are you? 👋"
   }
   ```

4. **Get Messages:**
   ```json
   GET {{baseUrl}}/chats/{{chatABId}}/messages
   Authorization: Bearer {{userBToken}}
   ```

### 🎯 การทดสอบแบบ Manual ใน Postman

#### ขั้นตอนที่ 1: Setup Users

1. Login เป็น User A → เก็บ token ใน `{{userAToken}}`
2. Register + Login User B → เก็บ token ใน `{{userBToken}}`
3. Register + Login User C → เก็บ token ใน `{{userCToken}}`

#### ขั้นตอนที่ 2: Create Chats

1. User A สร้าง chat กับ User B → เก็บ chat ID ใน `{{chatABId}}`
2. User C สร้าง chat กับ User A → เก็บ chat ID ใน `{{chatCAId}}`
3. User C สร้าง chat กับ User B → เก็บ chat ID ใน `{{chatCBId}}`

#### ขั้นตอนที่ 3: Send Messages

1. User A ส่งข้อความใน `{{chatABId}}`
2. User B ตอบกลับใน `{{chatABId}}`
3. User C ส่งข้อความใน `{{chatCAId}}` และ `{{chatCBId}}`

#### ขั้นตอนที่ 4: Verify Messages

1. ตรวจสอบข้อความในแต่ละ chat ด้วย GET messages API
2. ยืนยันว่าข้อความแสดงถูกต้องสำหรับแต่ละผู้ใช้

### 💡 Tips สำหรับการทดสอบ

1. **Token Management:** ใช้ environment variables เพื่อจัดการ token ของแต่ละ user
2. **Chat ID Tracking:** เก็บ chat ID ในตัวแปรเพื่อใช้ในการทดสอบต่อเนื่อง
3. **Message Flow:** ทดสอบการส่งข้อความไปกลับระหว่าง users
4. **Error Handling:** ทดสอบกรณี error เช่น invalid user ID, expired token

### 🔍 การ Debug

หาก test ไม่สำเร็จ ให้ตรวจสอบ:

1. **User Authentication:** Token ยังใช้งานได้หรือไม่
2. **User IDs:** ID ถูกต้องและมีอยู่ในระบบ
3. **Chat Creation:** Chat สร้างสำเร็จและได้ chat ID
4. **Message Permissions:** User มีสิทธิ์ส่งข้อความใน chat หรือไม่

### 🎉 Expected Results

เมื่อทดสอบสำเร็จ ควรเห็น:

- Users สามารถ login และได้ token
- สร้าง direct chat ระหว่าง users ได้
- ส่งและรับข้อความได้ถูกต้อง
- ข้อความแสดงในลำดับที่ถูกต้อง
- แต่ละ user เห็นเฉพาะ chat ที่ตนเองเป็นส่วนหนึ่ง
