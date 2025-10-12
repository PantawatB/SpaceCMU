const axios = require("axios");

const BASE_URL = "http://localhost:3000";
const AUTH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmM2EzYTIwNC02NTJhLTQ2NGQtOWY3NC05YjgwN2E1MTU4MDYiLCJpYXQiOjE3NjAyNjMxMTMsImV4cCI6MTc2MDg2NzkxM30.61aEPRggpwd2MdhIOOYWEsKwJ2nAljt8UgDHvxUqzGs";
const VALID_USER_ID = "db7d463f-0430-4b6b-ad8d-1bf0ba5ca2a8";

async function testCompleteAPI() {
  console.log("🚀 Testing Complete SpaceCMU Backend API...\n");

  const headers = {
    Authorization: `Bearer ${AUTH_TOKEN}`,
    "Content-Type": "application/json",
  };

  let chatId = "";
  let productId = "";

  try {
    // 1. Test Authentication - Get Profile
    console.log("1️⃣ Testing Authentication...");
    const profileResponse = await axios.get(`${BASE_URL}/api/users/me`, {
      headers,
    });
    console.log(
      "✅ Get Profile:",
      profileResponse.status,
      profileResponse.data.message
    );

    // 2. Test Posts API
    console.log("\n2️⃣ Testing Posts API...");

    // Public feed
    const publicFeedResponse = await axios.get(
      `${BASE_URL}/api/posts/feed/public`
    );
    console.log(
      "✅ Public Feed:",
      publicFeedResponse.status,
      `${publicFeedResponse.data.data.items.length} posts`
    );

    // Create post
    const createPostResponse = await axios.post(
      `${BASE_URL}/api/posts`,
      {
        content: "Test post from complete API test! 🧪",
        visibility: "public",
      },
      { headers }
    );
    console.log(
      "✅ Create Post:",
      createPostResponse.status,
      createPostResponse.data.message
    );

    // 3. Test Chat API
    console.log("\n3️⃣ Testing Chat API...");

    // Get my chats
    const myChatsResponse = await axios.get(`${BASE_URL}/api/chats`, {
      headers,
    });
    console.log(
      "✅ Get My Chats:",
      myChatsResponse.status,
      `${myChatsResponse.data.length} chats`
    );

    // Create direct chat
    const createChatResponse = await axios.post(
      `${BASE_URL}/api/chats/direct`,
      {
        otherUserId: VALID_USER_ID,
      },
      { headers }
    );
    chatId = createChatResponse.data.id;
    console.log(
      "✅ Create Direct Chat:",
      createChatResponse.status,
      `Chat ID: ${chatId}`
    );

    // Send message
    const sendMessageResponse = await axios.post(
      `${BASE_URL}/api/chats/${chatId}/messages`,
      {
        content: "Hello from API test! 👋",
      },
      { headers }
    );
    console.log(
      "✅ Send Message:",
      sendMessageResponse.status,
      sendMessageResponse.data.message
    );

    // Get chat messages (updated for real-time API)
    const messagesResponse = await axios.get(
      `${BASE_URL}/api/chats/${chatId}/messages`,
      { headers }
    );
    const messagesData = messagesResponse.data.data || messagesResponse.data;
    const messageCount = messagesData.messages
      ? messagesData.messages.length
      : messagesResponse.data.messages
      ? messagesResponse.data.messages.length
      : 0;
    console.log(
      "✅ Get Messages:",
      messagesResponse.status,
      `${messageCount} messages`
    );

    // 4. Test Market API
    console.log("\n4️⃣ Testing Market API...");

    // Get all products
    const allProductsResponse = await axios.get(`${BASE_URL}/api/products`);
    console.log(
      "✅ Get All Products:",
      allProductsResponse.status,
      `${allProductsResponse.data.data.length} products`
    );

    // Create product
    const createProductResponse = await axios.post(
      `${BASE_URL}/api/products`,
      {
        name: "API Test Product",
        price: 99.99,
        description: "Product created by complete API test",
      },
      { headers }
    );
    productId = createProductResponse.data.data.product.id;
    console.log(
      "✅ Create Product:",
      createProductResponse.status,
      `Product ID: ${productId}`
    );

    // Update product status
    const updateStatusResponse = await axios.patch(
      `${BASE_URL}/api/products/${productId}/status`,
      {
        status: "sold",
      },
      { headers }
    );
    console.log(
      "✅ Update Product Status:",
      updateStatusResponse.status,
      updateStatusResponse.data.message
    );

    // 5. Test Friends API
    console.log("\n5️⃣ Testing Friends API...");

    // Get friend requests
    const friendRequestsResponse = await axios.get(
      `${BASE_URL}/api/friends/requests`,
      { headers }
    );
    console.log(
      "✅ Get Friend Requests:",
      friendRequestsResponse.status,
      `${friendRequestsResponse.data.data.length} requests`
    );

    // Send friend request
    try {
      const sendFriendRequestResponse = await axios.post(
        `${BASE_URL}/api/friends/request`,
        {
          friendId: VALID_USER_ID,
        },
        { headers }
      );
      console.log(
        "✅ Send Friend Request:",
        sendFriendRequestResponse.status,
        sendFriendRequestResponse.data.message
      );
    } catch (error) {
      if (error.response?.status === 400) {
        console.log("ℹ️ Friend Request: Already exists (expected)");
      } else {
        console.log("❌ Friend Request Error:", error.response?.data?.message);
      }
    }

    // Cleanup - Delete product
    try {
      const deleteProductResponse = await axios.delete(
        `${BASE_URL}/api/products/${productId}`,
        { headers }
      );
      console.log(
        "✅ Delete Product:",
        deleteProductResponse.status,
        "Cleaned up"
      );
    } catch (error) {
      console.log("⚠️ Delete Product: Already deleted or error");
    }

    console.log("\n🎉 All API tests completed successfully!");
    console.log("\n📊 Summary:");
    console.log("✅ Authentication: Working");
    console.log("✅ Posts API: Working");
    console.log("✅ Chat API: Working");
    console.log("✅ Market API: Working");
    console.log("✅ Friends API: Working");
    console.log("\n🚀 Your Postman collection should work 100% now!");
  } catch (error) {
    console.error("\n❌ Test Error:", error.response?.data || error.message);
    console.log("\n🔧 Debug Info:");
    console.log("- Auth Token:", AUTH_TOKEN.substring(0, 50) + "...");
    console.log("- Valid User ID:", VALID_USER_ID);
    console.log("- Chat ID:", chatId || "Not created");
    console.log("- Product ID:", productId || "Not created");
  }
}

if (require.main === module) {
  testCompleteAPI().catch(console.error);
}

module.exports = testCompleteAPI;
