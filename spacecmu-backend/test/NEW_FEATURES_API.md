# SpaceCMU API - New Features Documentation

## 🎯 ฟีเจอร์ใหม่ที่เพิ่มเข้ามา

### 1. 🖼️ Product Image Management

การจัดการรูปภาพสินค้า ร้านค้าสามารถเปลี่ยนรูปสินค้าได้

#### Endpoints:

##### 🔹 สร้างสินค้าพร้อมรูปภาพ

```
POST /api/products
```

**Body:**

```json
{
  "name": "iPhone 15 Pro",
  "description": "Brand new iPhone 15 Pro",
  "price": 35000,
  "category": "Electronics",
  "condition": "New",
  "contactInfo": "Line: @seller123",
  "imageUrl": "https://example.com/iphone15.jpg"
}
```

##### 🔹 อัปเดตรูปภาพสินค้า

```
PUT /api/products/:id/image
```

**Body:**

```json
{
  "imageUrl": "https://example.com/new-product-image.jpg"
}
```

**Response:**

```json
{
  "message": "Product image updated successfully",
  "data": {
    "product": {
      "id": "24",
      "imageUrl": "https://example.com/new-product-image.jpg",
      "updatedAt": "2025-10-12T16:20:32.000Z"
    }
  }
}
```

---

### 2. 💬 Product Seller Chat

การติดต่อเจ้าของสินค้าผ่านแชทพร้อมแนบรูปภาพ

#### Endpoints:

##### 🔹 สร้างแชทกับเจ้าของสินค้า

```
POST /api/chats/product
```

**Body:**

```json
{
  "productId": "24",
  "message": "สวัสดีครับ สนใจ iPhone 15 Pro นี้ครับ ราคายังใช้ได้ไหมครับ",
  "imageUrl": "https://example.com/chat-image.jpg",
  "fileName": "question.jpg",
  "fileSize": 1024
}
```

**Response:**

```json
{
  "message": "Chat created successfully",
  "data": {
    "chatId": "16b7e064-0695-4e61-8bcb-106ba6b67a66",
    "sellerId": "f3a3a204-652a-464d-9f74-9b807a515806",
    "sellerName": "Test Seller",
    "productName": "iPhone 15 Pro",
    "initialMessage": {
      "id": "message-id",
      "content": "สวัสดีครับ สนใจ iPhone 15 Pro นี้ครับ",
      "imageUrl": "https://example.com/chat-image.jpg"
    }
  }
}
```

##### 🔹 ส่งข้อความในแชทพร้อมรูปภาพ

```
POST /api/chats/:chatId/messages
```

**Body:**

```json
{
  "content": "ขอดูรูปเพิ่มเติมได้ไหมครับ",
  "imageUrl": "https://example.com/request-more-pics.jpg",
  "fileName": "request.jpg",
  "fileSize": 2048
}
```

**Response:**

```json
{
  "message": "Message sent successfully",
  "data": {
    "id": "53404456-2003-4933-a5f7-5cc7b1189c4a",
    "content": "ขอดูรูปเพิ่มเติมได้ไหมครับ",
    "type": "text",
    "imageUrl": "https://example.com/request-more-pics.jpg",
    "fileName": "request.jpg",
    "fileSize": 2048,
    "sender": {
      "id": "buyer-id",
      "name": "Test Buyer"
    },
    "createdAt": "2025-10-12T16:23:05.000Z"
  }
}
```

---

## 🔧 Database Changes

### Product Entity

เพิ่ม field ใหม่:

```typescript
@Column({ type: "varchar", nullable: true, name: "imageurl" })
imageUrl?: string;
```

### Message Entity

รองรับการแนบรูปภาพ:

```typescript
@Column({ nullable: true })
imageUrl?: string;

@Column({ nullable: true })
fileName?: string;

@Column({ type: "integer", nullable: true })
fileSize?: number;
```

---

## 🚀 Testing

### Product Image Management

1. สร้างสินค้าใหม่พร้อม `imageUrl`
2. อัปเดตรูปภาพด้วย `PUT /products/:id/image`
3. ตรวจสอบว่า database มี `imageurl` column

### Chat with Product Seller

1. Login ด้วย user A (seller)
2. สร้างสินค้าด้วย user A
3. Login ด้วย user B (buyer)
4. สร้างแชทกับเจ้าของสินค้าด้วย `POST /chats/product`
5. ส่งข้อความพร้อมรูปภาพใน chat

---

## 📋 Postman Collection Updates

### Variables เพิ่มใหม่:

```json
{
  "sampleImageUrl": "https://example.com/sample-product.jpg",
  "chatImageUrl": "https://example.com/chat-attachment.jpg",
  "sampleFileName": "sample.jpg",
  "sampleFileSize": "2048"
}
```

### API Requests เพิ่มใหม่:

1. **Update Product Image** - PUT /products/:id/image
2. **Create Chat with Product Seller** - POST /chats/product
3. **Send Message** - POST /chats/:chatId/messages
4. **Send Message (Text Only)** - POST /chats/:chatId/messages

---

## ⚠️ Security Notes

- ระบบป้องกันการติดต่อตัวเองเรื่องสินค้าตัวเอง
- ต้องมี JWT token ที่ valid
- ตรวจสอบ ownership ของสินค้าก่อนอัปเดตรูปภาพ
- Image URLs ต้องเป็น HTTPS เมื่อใช้งานจริง

---

## 🎉 สรุป

ฟีเจอร์ทั้งสองพร้อมใช้งาน:
✅ ร้านค้าสามารถเปลี่ยนรูปสินค้าได้  
✅ ลูกค้าสามารถแชทกับเจ้าของสินค้าพร้อมแนบรูปได้

**Postman Collection & Environment** ได้รับการอัปเดตแล้ว!
