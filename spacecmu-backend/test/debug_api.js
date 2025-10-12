const axios = require("axios");

async function testSingleCall() {
  try {
    console.log("Testing registration...");
    const res = await axios.post("http://127.0.0.1:3001/api/users/register", {
      studentId: "debugU",
      email: "debugU@example.com",
      password: "Password123!",
      name: "Debug User",
    });
    console.log("SUCCESS:", res.status, JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.log("ERROR Details:");
    console.log("- Message:", err.message);
    console.log("- Status:", err.response?.status);
    console.log(
      "- Response data:",
      JSON.stringify(err.response?.data, null, 2)
    );
    console.log("- Full error:", err.code || err.name);
  }

  try {
    console.log("\nTesting login with existing user...");
    const res = await axios.post("http://127.0.0.1:3001/api/users/login", {
      studentId: "uA",
      password: "Password123!",
    });
    console.log("SUCCESS:", res.status, JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.log("ERROR Details:");
    console.log("- Message:", err.message);
    console.log("- Status:", err.response?.status);
    console.log(
      "- Response data:",
      JSON.stringify(err.response?.data, null, 2)
    );
    console.log("- Full error:", err.code || err.name);
  }
}

testSingleCall().catch(console.error);
