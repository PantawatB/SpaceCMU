const axios = require("axios");

// Quick script to verify no API responses contain passwordHash
const BASE_URL = process.env.API_URL || "http://localhost:3001";

async function checkPasswordHashLeak() {
  const results = [];
  let hasLeaks = false;

  console.log("🔍 Checking API responses for passwordHash leaks...\n");

  const tests = [
    {
      name: "Register User A",
      method: "post",
      url: `${BASE_URL}/api/users/register`,
      data: {
        studentId: "test001",
        email: "test001@cmu.ac.th",
        password: "password123",
        name: "Test User A",
      },
    },
    {
      name: "Login User A",
      method: "post",
      url: `${BASE_URL}/api/users/login`,
      data: {
        email: "test001@cmu.ac.th",
        password: "password123",
      },
    },
  ];

  let token = null;

  for (const test of tests) {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      console.log(`Testing: ${test.name}...`);
      const response = await axios({
        method: test.method,
        url: test.url,
        data: test.data,
        headers,
        validateStatus: () => true, // Accept all status codes
      });

      // Extract token from login response
      if (test.name === "Login User A" && response.data?.data?.token) {
        token = response.data.data.token;
      }

      // Check response for passwordHash
      const responseText = JSON.stringify(response.data);
      const hasPasswordHash = responseText.includes("passwordHash");

      const result = {
        test: test.name,
        status: response.status,
        hasPasswordHash,
        response: hasPasswordHash ? responseText : "Clean ✅",
      };

      if (hasPasswordHash) {
        hasLeaks = true;
        console.log(`❌ LEAK DETECTED in ${test.name}`);
        console.log(`   Response: ${responseText}\n`);
      } else {
        console.log(`✅ ${test.name} - No passwordHash found`);
      }

      results.push(result);
    } catch (error) {
      console.log(`⚠️  ${test.name} failed: ${error.message}`);
      results.push({
        test: test.name,
        status: "ERROR",
        hasPasswordHash: false,
        error: error.message,
      });
    }
  }

  // Test additional endpoints with token
  if (token) {
    const authenticatedTests = [
      {
        name: "Get My Profile",
        method: "get",
        url: `${BASE_URL}/api/users/me`,
      },
      {
        name: "List Products",
        method: "get",
        url: `${BASE_URL}/api/products`,
      },
      {
        name: "List Posts",
        method: "get",
        url: `${BASE_URL}/api/posts`,
      },
    ];

    for (const test of authenticatedTests) {
      try {
        console.log(`Testing: ${test.name}...`);
        const response = await axios({
          method: test.method,
          url: test.url,
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: () => true,
        });

        const responseText = JSON.stringify(response.data);
        const hasPasswordHash = responseText.includes("passwordHash");

        const result = {
          test: test.name,
          status: response.status,
          hasPasswordHash,
          response: hasPasswordHash ? responseText : "Clean ✅",
        };

        if (hasPasswordHash) {
          hasLeaks = true;
          console.log(`❌ LEAK DETECTED in ${test.name}`);
          console.log(`   Response: ${responseText}\n`);
        } else {
          console.log(`✅ ${test.name} - No passwordHash found`);
        }

        results.push(result);
      } catch (error) {
        console.log(`⚠️  ${test.name} failed: ${error.message}`);
        results.push({
          test: test.name,
          status: "ERROR",
          hasPasswordHash: false,
          error: error.message,
        });
      }
    }
  }

  // Summary
  console.log("\n📊 SUMMARY:");
  console.log(`Total tests: ${results.length}`);
  console.log(`Password leaks detected: ${hasLeaks ? "YES ❌" : "NO ✅"}`);

  if (hasLeaks) {
    console.log("\n🚨 ACTION REQUIRED: Fix password hash leaks in responses!");
    process.exit(1);
  } else {
    console.log("\n✅ All responses are clean - no passwordHash detected!");
  }

  return results;
}

// Run the check
if (require.main === module) {
  checkPasswordHashLeak().catch(console.error);
}

module.exports = { checkPasswordHashLeak };
