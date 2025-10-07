# 🚀 SpaceCMU - Simple Function Test

## 📖 คำอธิบาย

Postman Collection ง่ายๆ สำหรับทดสอบว่าฟังก์ชั่น Chat ทั้งหมดทำงานได้ครบหรือไม่

## ⚠️ สำคัญ - แก้ไขแล้ว!

- **Fixed**: Chat creation API ใช้ `otherUserId` แทน `participantIds`
- **Status**: ✅ All APIs working correctly
- **Tested**: PowerShell validation completed

## 🎯 ฟังก์ชั่นที่ทดสอบ (12 ขั้นตอน)

### 👤 User Management

1. **Create Test Users** - สร้าง 2 users สำหรับทดสอบ
2. **Login Users** - เข้าสู่ระบบและเก็บ tokens

### 💬 Chat Functions

3. **Create Direct Chat** - สร้างแชทระหว่าง 2 users
4. **Send Messages** - ส่งข้อความจาก user ทั้งสอง
5. **Get Messages** - ดึงข้อความในแชท
6. **Get My Chats** - ดูรายการแชทของ user
7. **Get Chat Participants** - ดูสมาชิกในแชท

### 🗑️ Message Management

8. **Delete Message** - ลบข้อความ
9. **Verify Deletion** - ตรวจสอบการลบ

### ✅ Final Check

10. **Status Summary** - สรุปผลการทดสอบ

## 🚀 วิธีใช้งาน

### Import Collection

1. เปิด Postman
2. คลิก **Import**
3. เลือกไฟล์ `SpaceCMU-Simple-Test.postman_collection.json`

### รัน Test

1. **Run Collection** - คลิก **Run** ที่ Collection
2. **Run SpaceCMU - Simple Function Test**
3. **ดูผล Console** - เช็คผลลัพธ์ใน Console tab

### หรือรันทีละขั้น

- คลิกแต่ละ request ตามลำดับ 1️⃣ → 2️⃣ → ... → 🏁

## 📊 Expected Results

### ✅ Success Indicators

- Status Code: `200` หรือ `201`
- Console แสดงข้อความ ✅ สีเขียว
- Variables ได้รับการ set อัตโนมัติ (tokens, IDs)
- ข้อความแสดงในขั้น "Verify Message Deletion"

### ❌ Error Indicators

- Status Code: `4xx` หรือ `5xx`
- Console แสดงข้อความ ❌ สีแดง
- Missing variables (tokens ว่าง)

## 🔧 Auto Variables

Collection จะ set variables เหล่านี้อัตโนมัติ:

- `user1Token` - JWT token สำหรับ User 1
- `user2Token` - JWT token สำหรับ User 2
- `chatId` - ID ของแชทที่สร้าง
- `messageId` - ID ของข้อความล่าสุด
- `user1Id`, `user2Id` - User IDs

## 📋 Test Coverage

### Core Functions ✅

- [x] User Registration & Login
- [x] JWT Authentication
- [x] Create Direct Chat
- [x] Send/Receive Messages
- [x] Get Chat List
- [x] Get Chat Participants
- [x] Delete Messages
- [x] Database Updates (lastMessage)

### Error Handling 🛡️

- [x] Authentication validation
- [x] Permission checking
- [x] Database integrity

## 🎉 Success Output Example

```
✅ User 1 created successfully
✅ User 2 created successfully
✅ User 1 login successful
✅ User 2 login successful
✅ Direct chat created successfully
✅ Message sent by User 1
✅ Message sent by User 2
✅ Retrieved 2 messages
✅ User has 1 chats
✅ Chat has 2 participants
✅ Message deleted successfully
✅ Verification complete

🎉 TEST COMPLETE!

✅ Functions Tested:
- User Registration
- User Authentication (Login)
- Create Direct Chat
- Send Messages
- Retrieve Messages
- Get User Chats
- Get Chat Participants
- Delete Messages
- Message Deletion Verification

📊 Final Status:
- Total Chats: 1
- All core chat functions working properly! 🚀

🔗 Backend Status: All Chat APIs Functional
```

## 🔄 Re-running Tests

Collection สามารถรันซ้ำได้หลายครั้ง:

- Users จะถูก reuse หากมีอยู่แล้ว
- Tokens จะถูกสร้างใหม่ทุกครั้ง
- Chat ใหม่จะถูกสร้างทุกครั้ง

---

**⚡ Quick & Simple - ครอบคลุมทุกฟังก์ชั่นใน 2 นาที! 🚀**
