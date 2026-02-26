const { test, expect } = require('@playwright/test');

test.use({
  baseURL: 'http://localhost:3001'
});
//
// Utility: Generate Unique Idempotency Key
//
function generateKey() {
  return `eval-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

//
// TEST 1 — Server Reachability
//
test('Server should be reachable', async ({ request }) => {
  const response = await request.get('/');
  expect(response.status()).toBe(200);
});

//
// TEST 2 — New Idempotency Key Creates Order
//
test('New key should create new order', async ({ request }) => {

  const key = generateKey();

  const response = await request.post('/orders', {
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': key
    },
    data: {
      product: "Laptop",
      quantity: 1,
      price: 50000
    }
  });

  expect(response.status()).toBe(201);

  const body = await response.json();

  expect(body.success).toBe(true);
  expect(body.data._id).toBeDefined();
});

//
// TEST 3 — Same Key + Same Body Returns Same Order
//
test('Same key and same body returns same order', async ({ request }) => {

  const key = generateKey();

  const first = await request.post('/orders', {
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': key
    },
    data: {
      product: "Phone",
      quantity: 1,
      price: 30000
    }
  });

  expect(first.status()).toBe(201);

  const firstBody = await first.json();

  const second = await request.post('/orders', {
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': key
    },
    data: {
      product: "Phone",
      quantity: 1,
      price: 30000
    }
  });

  expect(second.status()).toBe(201);

  const secondBody = await second.json();

  expect(secondBody.data._id).toBe(firstBody.data._id);
});

//
// TEST 4 — Same Key + Different Body Should Return 400
//
test('Same key with different body should return 400', async ({ request }) => {

  const key = generateKey();

  await request.post('/orders', {
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': key
    },
    data: {
      product: "Tablet",
      quantity: 1,
      price: 20000
    }
  });

  const misuse = await request.post('/orders', {
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': key
    },
    data: {
      product: "Changed",
      quantity: 2,
      price: 10000
    }
  });

  expect(misuse.status()).toBe(400);

  const body = await misuse.json();
  expect(body.message).toContain("Idempotency key reused");
});

//
// TEST 5 — Missing Idempotency-Key Header
//
test('Missing Idempotency-Key should return 400', async ({ request }) => {

  const response = await request.post('/orders', {
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      product: "NoKey",
      quantity: 1,
      price: 1000
    }
  });

  expect(response.status()).toBe(400);
});