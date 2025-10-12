const axios = require("axios");

const BASE_URL = "http://localhost:3000";

async function testEndpoints() {
  console.log("🧪 Testing API endpoints after route fix...\n");

  const tests = [
    {
      name: "Public Feed (should work without auth)",
      method: "GET",
      url: `${BASE_URL}/api/posts/feed/public`,
      expectedStatus: 200,
      public: true,
    },
    {
      name: "Search Posts (should work without auth)",
      method: "GET",
      url: `${BASE_URL}/api/posts/search?authorName=test`,
      expectedStatus: 200,
      public: true,
    },
    {
      name: "Get Single Post (should work without auth)",
      method: "GET",
      url: `${BASE_URL}/api/posts/61d95926-8bf7-4b1f-a597-c694f94b09ed`,
      expectedStatus: 200,
      public: true,
    },
    {
      name: "Post Comments (should work without auth)",
      method: "GET",
      url: `${BASE_URL}/api/posts/61d95926-8bf7-4b1f-a597-c694f94b09ed/comments`,
      expectedStatus: 200,
      public: true,
    },
    {
      name: "Friends Feed (should require auth)",
      method: "GET",
      url: `${BASE_URL}/api/posts/feed/friends`,
      expectedStatus: 401,
      public: false,
    },
    {
      name: "Create Post (should require auth)",
      method: "POST",
      url: `${BASE_URL}/api/posts`,
      expectedStatus: 401,
      public: false,
      data: { content: "Test post" },
    },
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      const config = {
        method: test.method,
        url: test.url,
        validateStatus: () => true, // Don't throw on any status code
      };

      if (test.data) {
        config.data = test.data;
        config.headers = { "Content-Type": "application/json" };
      }

      const response = await axios(config);

      const statusMatch = response.status === test.expectedStatus;
      const status = statusMatch ? "✅" : "❌";

      console.log(`${status} ${test.name}`);
      console.log(
        `   Expected: ${test.expectedStatus}, Got: ${response.status}`
      );

      if (test.public && response.status === 200) {
        console.log(`   ✅ Public endpoint working correctly`);
      } else if (!test.public && response.status === 401) {
        console.log(`   ✅ Protected endpoint properly requires auth`);
      }

      if (statusMatch) passedTests++;
      console.log("");
    } catch (error) {
      console.log(`❌ ${test.name}`);
      console.log(`   Error: ${error.message}\n`);
    }
  }

  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log("🎉 All tests passed! Route conflicts have been resolved.");
    console.log("✅ Public endpoints work without authentication");
    console.log("✅ Protected endpoints properly require authentication");
    console.log("✅ Comment routes are working correctly");
  } else {
    console.log("⚠️  Some tests failed. Please check the API configuration.");
  }
}

if (require.main === module) {
  testEndpoints().catch(console.error);
}

module.exports = testEndpoints;
