# 🚀 Real-Time Chat API Documentation

**Updated:** 2025-10-12 | **SpaceCMU Backend Real-Time Chat Implementation**

## 📋 **Overview**

SpaceCMU Chat API ได้รับการอัพเดทใหม่เพื่อรองรับ **Real-Time Chat** แบบมาตรฐาน:

- ❌ **ไม่มี Pagination** (เหมาะสำหรับ real-time updates)
- ✅ **Real-Time Polling** (สำหรับ client ที่ต้องการ updates)
- ✅ **Chronological Order** (แสดงข้อความเรียงตามเวลา)
- ✅ **Optimized Queries** (เร็วและประหยัด resources)

---

## 🔧 **API Endpoints**

### **1. Get Chat Messages (Real-Time)**

```http
GET /api/chats/:chatId/messages
```

**Parameters:**

- `limit` (optional): จำนวนข้อความล่าสุด (default: 50)
- `since` (optional): ดึงข้อความตั้งแต่ timestamp นี้
- `messageId` (optional): ดึงข้อความหลังจาก message ID นี้

**Response:**

```json
{
  "message": "Chat messages retrieved",
  "data": {
    "messages": [
      {
        "id": "8f141d6c-2fce-4e2c-b2bc-0ce68cc7ff81",
        "content": "Hello User B! How are you? 👋",
        "type": "text",
        "sender": {
          "id": "f3a3a204-652a-464d-9f74-9b807a515806",
          "name": "Test User 1"
        },
        "replyTo": null,
        "createdAt": "2025-10-12T11:28:14.903Z",
        "updatedAt": "2025-10-12T11:28:14.903Z"
      }
    ],
    "totalMessages": 3,
    "isRealTimeUpdate": false,
    "chatId": "01d746e5-3e0f-49db-aab6-b8536ea0e267"
  }
}
```

### **2. Poll for New Messages ⭐ NEW**

```http
GET /api/chats/:chatId/messages/new
```

**Parameters:**

- `lastMessageId`: ID ของข้อความสุดท้ายที่ client มี
- `since`: Timestamp ของข้อความสุดท้าย

**Response:**

```json
{
  "message": "New messages retrieved",
  "data": {
    "newMessages": [
      {
        "id": "8f7ff7e4-fa61-4387-867e-10d91a0579a5",
        "content": "Testing real-time chat updates!",
        "type": "text",
        "sender": {
          "id": "f3a3a204-652a-464d-9f74-9b807a515806",
          "name": "Test User 1"
        },
        "replyTo": null,
        "createdAt": "2025-10-12T15:43:16.928Z"
      }
    ],
    "hasNewMessages": true,
    "count": 1,
    "chatId": "01d746e5-3e0f-49db-aab6-b8536ea0e267"
  }
}
```

### **3. Send Message (Enhanced Response)**

```http
POST /api/chats/:chatId/messages
```

**Request Body:**

```json
{
  "content": "Testing real-time chat updates!",
  "type": "text"
}
```

**Response:**

```json
{
  "message": "Message sent successfully",
  "data": {
    "id": "8f7ff7e4-fa61-4387-867e-10d91a0579a5",
    "content": "Testing real-time chat updates!",
    "type": "text",
    "sender": {
      "id": "f3a3a204-652a-464d-9f74-9b807a515806",
      "name": "Test User 1"
    },
    "replyTo": null,
    "createdAt": "2025-10-12T15:43:16.928Z",
    "chatId": "01d746e5-3e0f-49db-aab6-b8536ea0e267"
  }
}
```

---

## 💡 **Real-Time Implementation Patterns**

### **1. Initial Chat Load**

```javascript
// Load recent messages when opening chat
const response = await fetch(`/api/chats/${chatId}/messages?limit=50`);
const { data } = await response.json();
displayMessages(data.messages);
```

### **2. Polling for New Messages**

```javascript
let lastMessageId = null;

// Get the ID of the most recent message
if (messages.length > 0) {
  lastMessageId = messages[messages.length - 1].id;
}

// Poll every 2-5 seconds
setInterval(async () => {
  if (lastMessageId) {
    const response = await fetch(
      `/api/chats/${chatId}/messages/new?lastMessageId=${lastMessageId}`
    );
    const { data } = await response.json();

    if (data.hasNewMessages) {
      // Append new messages to chat
      data.newMessages.forEach((message) => {
        appendMessage(message);
        lastMessageId = message.id; // Update reference
      });
    }
  }
}, 3000); // Poll every 3 seconds
```

### **3. Sending Messages with Real-Time Update**

```javascript
async function sendMessage(chatId, content) {
  const response = await fetch(`/api/chats/${chatId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content, type: "text" }),
  });

  const { data } = await response.json();

  // Immediately display sent message
  appendMessage(data);
  lastMessageId = data.id;

  return data;
}
```

---

## 🔄 **Real-Time vs Traditional Chat**

| Feature                   | Traditional (Pagination) | Real-Time (Updated)       |
| ------------------------- | ------------------------ | ------------------------- |
| **Message Loading**       | Page-based (1, 2, 3...)  | Recent messages + polling |
| **New Message Detection** | Manual refresh           | Automatic polling         |
| **Message Order**         | May vary by page         | Always chronological      |
| **Performance**           | Heavy queries            | Optimized for real-time   |
| **User Experience**       | Need to refresh          | Seamless updates          |
| **Mobile Friendly**       | Scrolling pagination     | Natural chat flow         |

---

## 📱 **Client Implementation Examples**

### **React/JavaScript Example:**

```javascript
import { useState, useEffect } from "react";

function ChatComponent({ chatId, token }) {
  const [messages, setMessages] = useState([]);
  const [lastMessageId, setLastMessageId] = useState(null);

  // Initial load
  useEffect(() => {
    loadMessages();
  }, [chatId]);

  // Real-time polling
  useEffect(() => {
    if (!lastMessageId) return;

    const interval = setInterval(async () => {
      const response = await fetch(
        `/api/chats/${chatId}/messages/new?lastMessageId=${lastMessageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { data } = await response.json();

      if (data.hasNewMessages) {
        setMessages((prev) => [...prev, ...data.newMessages]);
        setLastMessageId(data.newMessages[data.newMessages.length - 1].id);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [lastMessageId]);

  async function loadMessages() {
    const response = await fetch(`/api/chats/${chatId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { data } = await response.json();
    setMessages(data.messages);
    if (data.messages.length > 0) {
      setLastMessageId(data.messages[data.messages.length - 1].id);
    }
  }

  return (
    <div className="chat-container">
      {messages.map((message) => (
        <div key={message.id} className="message">
          <strong>{message.sender.name}:</strong> {message.content}
        </div>
      ))}
    </div>
  );
}
```

---

## 🧪 **Testing Real-Time Features**

### **Test Scenarios:**

1. **Basic Message Flow:**

   ```bash
   # 1. Load initial messages
   curl -H "Authorization: Bearer TOKEN" \
     "http://localhost:3000/api/chats/CHAT_ID/messages"

   # 2. Send a message
   curl -X POST -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"content":"Hello!","type":"text"}' \
     "http://localhost:3000/api/chats/CHAT_ID/messages"

   # 3. Poll for new messages
   curl -H "Authorization: Bearer TOKEN" \
     "http://localhost:3000/api/chats/CHAT_ID/messages/new?lastMessageId=LAST_ID"
   ```

2. **Multi-User Real-Time:**
   - User A ส่งข้อความ
   - User B poll ใหม่ → ได้ข้อความของ A
   - User B ตอบกลับ
   - User A poll ใหม่ → ได้ข้อความของ B

---

## ⚡ **Performance Optimizations**

### **Database Optimizations:**

- ✅ Index ที่ `chat_id` และ `createdAt`
- ✅ Limit queries เพื่อลดโหลด
- ✅ Select เฉพาะ fields ที่จำเป็น

### **Client Optimizations:**

- 🔄 **Smart Polling**: เพิ่ม/ลด interval ตาม activity
- 📱 **Mobile Consideration**: หยุด polling เมื่อ app ไปอยู่ background
- 💾 **Local Caching**: เก็บข้อความใน local storage

---

## 🚨 **Migration Notes**

### **Breaking Changes:**

- ❌ `pagination` object ถูกลบออกจาก response
- ✅ เพิ่ม `totalMessages`, `isRealTimeUpdate`, `chatId` ใน response
- ✅ เพิ่ม endpoint `/messages/new` สำหรับ polling

### **Backward Compatibility:**

- ✅ Original `/messages` endpoint ยังใช้ได้
- ✅ Query parameters `limit` ยังรองรับ
- ⚠️ `page` parameter ถูก deprecated

---

## 🎯 **Benefits of Real-Time Chat**

1. **📱 Better UX**: ข้อความปรากฏทันทีไม่ต้องรีเฟรช
2. **🚀 Performance**: ลด server load จาก heavy pagination queries
3. **📊 Scalability**: เหมาะสำหรับ chat ที่มีข้อความเยอะ
4. **⚡ Responsiveness**: รู้สึกเหมือน real-time messaging apps
5. **💻 Standard Practice**: เป็น pattern มาตรฐานของ modern chat apps

---

**✨ SpaceCMU Chat API พร้อมสำหรับ Real-Time Chat Experience แล้ว!**
