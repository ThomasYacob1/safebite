const BASE = "http://localhost:3000";

async function runTests() {
  let passed = 0;
  
  let failed= 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅  ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌  ${name}`);
      console.error(`       ${err.message}`);
      failed++;
    }
  }

  function assert(condition, msg) {
    if (!condition) throw new Error(msg || "Assertion failed");
  }

  console.log("\n🧪  SafeBite API Tests\n");

  await test("GET /api/recalls returns 200 and results array", async () => {
    const res  = await fetch(`${BASE}/api/recalls?limit=5`);
    
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    
    const data = await res.json();
    assert(Array.isArray(data.results), "Expected data.results to be an array");
  });

  await test("GET /api/recalls with search param works", async () => {
    const res  = await fetch(`${BASE}/api/recalls?search=salmon&limit=5`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    
    const data = await res.json();
    assert(data.results !== undefined, "Expected results key");
  });

  await test("GET /api/stats returns classification counts", async () => {
    const res  = await fetch(`${BASE}/api/stats`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    
    const data= await res.json();
    assert(Array.isArray(data.results), "Expected results array");
  });

  await test("GET /api/searches returns array", async () => {
    const res  = await fetch(`${BASE}/api/searches`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    
    const data = await res.json();
    assert(Array.isArray(data), "Expected array");
  });

  await test("POST /api/searches saves a term", async () => {
    const res = await fetch(`${BASE}/api/searches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ term: "test-product-123" })
    });
    
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    const data = await res.json();
    
    assert(data.term === "test-product-123", `Expected correct term back`);
  });

  await test("POST /api/searches rejects empty term", async () => {
    const res = await fetch(`${BASE}/api/searches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      
      body: JSON.stringify({ term: "" })
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await test("GET / serves index.html", async () => {
    const res  = await fetch(`${BASE}/`);
    
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    
    const html = await res.text();
    
    assert(html.includes("SafeBite"), "Expected SafeBite in HTML");
  });

  await test("GET /about serves about.html", async () => {
    const res= await fetch(`${BASE}/about`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  await test("GET /help serves help.html", async () => {
    const res = await fetch(`${BASE}/help`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  console.log(`\n  Results: ${passed} passed, ${failed} failed\n`);
  
  process.exit(failed > 0 ? 1 : 0);
}

runTests();