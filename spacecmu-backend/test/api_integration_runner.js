const axios = require("axios");
const fs = require("fs");
const baseUrl = process.env.BASE_URL || "http://localhost:3001";
const outPath = "./test/reports/api_test_results.json";

const results = [];
function pushResult(obj) {
  results.push(obj);
}

async function runStep(name, fn) {
  try {
    const res = await fn();
    pushResult({
      name,
      status: "ok",
      code: res && res.status,
      data: res && res.data,
    });
    console.log(`OK: ${name} -> ${res && res.status}`);
    return { ok: true, res };
  } catch (err) {
    const code =
      err && err.response && err.response.status ? err.response.status : null;
    const body =
      err && err.response && err.response.data
        ? err.response.data
        : err && err.message
        ? err.message
        : "no body";
    pushResult({ name, status: "fail", code, body });
    console.error(
      `FAIL: ${name} -> ${code || "ERR"} : ${JSON.stringify(body)}`
    );
    return { ok: false, err };
  }
}

(async function run() {
  // configure axios default timeout
  axios.defaults.timeout = 5000;

  let tokenA = null,
    tokenB = null;
  let userAId = null,
    userBId = null;
  let postId = null,
    productId = null,
    chatId = null;

  // 1. Register A
  await runStep("register A", () =>
    axios.post(`${baseUrl}/api/users/register`, {
      studentId: "uA",
      email: "uA@example.com",
      password: "Password123!",
      name: "User A",
    })
  );

  // 2. Login A
  const loginA = await runStep("login A", () =>
    axios.post(`${baseUrl}/api/users/login`, {
      email: "uA@example.com",
      password: "Password123!",
    })
  );
  if (loginA.ok) {
    tokenA = loginA.res.data.token;
    userAId =
      loginA.res.data.user &&
      (loginA.res.data.user.id || loginA.res.data.user.userId);
  }

  // 3. Me A
  if (tokenA)
    await runStep("me A", () =>
      axios.get(`${baseUrl}/api/users/me`, {
        headers: { Authorization: `Bearer ${tokenA}` },
      })
    );
  else pushResult({ name: "me A", status: "skipped", reason: "no token" });

  // 4. Create post
  if (tokenA) {
    const rp = await runStep("create post A", () =>
      axios.post(
        `${baseUrl}/api/posts`,
        { content: "Integration test post", visibility: "public" },
        { headers: { Authorization: `Bearer ${tokenA}` } }
      )
    );
    if (rp.ok)
      postId = rp.res.data.id || (rp.res.data.post && rp.res.data.post.id);
  } else
    pushResult({
      name: "create post A",
      status: "skipped",
      reason: "no token",
    });

  // 5. List posts
  // list posts requires auth in this API; include tokenA when available
  if (tokenA)
    await runStep("list posts", () =>
      axios.get(`${baseUrl}/api/posts`, {
        headers: { Authorization: `Bearer ${tokenA}` },
      })
    );
  else await runStep("list posts", () => axios.get(`${baseUrl}/api/posts`));

  // 6. Create persona
  // persona creation expects `displayName` field
  if (tokenA)
    await runStep("create persona", () =>
      axios.post(
        `${baseUrl}/api/personas`,
        { displayName: "Persona A", bio: "Test" },
        { headers: { Authorization: `Bearer ${tokenA}` } }
      )
    );
  else
    pushResult({
      name: "create persona",
      status: "skipped",
      reason: "no token",
    });

  // 7. Product flows
  if (tokenA) {
    const pcreate = await runStep("create product", () =>
      axios.post(
        `${baseUrl}/api/products`,
        { name: "Test Item", price: 9.99, description: "runner" },
        { headers: { Authorization: `Bearer ${tokenA}` } }
      )
    );
    if (pcreate.ok)
      productId =
        pcreate.res.data.id ||
        (pcreate.res.data.product && pcreate.res.data.product.id) ||
        (pcreate.res.data.data && pcreate.res.data.data.id);
    await runStep("list products", () => axios.get(`${baseUrl}/api/products`));
    if (productId)
      await runStep("delete product", () =>
        axios.delete(`${baseUrl}/api/products/${productId}`, {
          headers: { Authorization: `Bearer ${tokenA}` },
        })
      );
  } else {
    pushResult({
      name: "product flows",
      status: "skipped",
      reason: "no token",
    });
  }

  // 8. Register B and login
  await runStep("register B", () =>
    axios.post(`${baseUrl}/api/users/register`, {
      studentId: "uB",
      email: "uB@example.com",
      password: "Password123!",
      name: "User B",
    })
  );
  const loginB = await runStep("login B", () =>
    axios.post(`${baseUrl}/api/users/login`, {
      email: "uB@example.com",
      password: "Password123!",
    })
  );
  if (loginB.ok) {
    tokenB = loginB.res.data.token;
    userBId =
      loginB.res.data.user &&
      (loginB.res.data.user.id || loginB.res.data.user.userId);
  }

  // 9. Friend request A->B
  // friend API expects `toUserId` (user id) in body
  if (tokenA)
    await runStep("friend request A->B", () =>
      axios.post(
        `${baseUrl}/api/friends/request`,
        { toUserId: userBId },
        { headers: { Authorization: `Bearer ${tokenA}` } }
      )
    );
  else
    pushResult({
      name: "friend request A->B",
      status: "skipped",
      reason: "no token",
    });

  // 10. Create direct chat A->B
  if (!userBId && tokenB) {
    const meB = await runStep("get me B", () =>
      axios.get(`${baseUrl}/api/users/me`, {
        headers: { Authorization: `Bearer ${tokenB}` },
      })
    );
    if (meB.ok) userBId = meB.res.data.id || meB.res.data.userId;
  }
  if (tokenA && userBId) {
    // chat controller expects `otherUserId` in the body
    const c = await runStep("create direct chat", () =>
      axios.post(
        `${baseUrl}/api/chats/direct`,
        { otherUserId: userBId },
        { headers: { Authorization: `Bearer ${tokenA}` } }
      )
    );
    if (c.ok)
      chatId =
        c.res.data.id ||
        (c.res.data.chat && c.res.data.chat.id) ||
        (c.res.data.data && c.res.data.data.id);
  } else
    pushResult({
      name: "create direct chat",
      status: "skipped",
      reason: "missing token or userBId",
    });

  // 11. Send message
  if (tokenA && chatId)
    await runStep("send message", () =>
      axios.post(
        `${baseUrl}/api/chats/${chatId}/messages`,
        { content: "Hello from runner" },
        { headers: { Authorization: `Bearer ${tokenA}` } }
      )
    );
  else
    pushResult({
      name: "send message",
      status: "skipped",
      reason: "missing token or chatId",
    });

  // 12. Comment on post
  if (tokenA && postId)
    await runStep("create comment", () =>
      axios.post(
        `${baseUrl}/api/posts/${postId}/comments`,
        { content: "Nice" },
        { headers: { Authorization: `Bearer ${tokenA}` } }
      )
    );
  else
    pushResult({
      name: "create comment",
      status: "skipped",
      reason: "missing token or postId",
    });

  // Write results
  fs.mkdirSync("./test/reports", { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log("Done. Results written to", outPath);
  // exit 0 even if some steps failed - results contain per-step statuses
  process.exit(0);
})();
