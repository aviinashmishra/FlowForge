// Setup for Node.js environment tests (database, API tests)

// Mock Next.js Request and Response for middleware tests
global.Request = class MockRequest {
  constructor(input, init = {}) {
    this.url = typeof input === 'string' ? input : input.url;
    this.method = init.method || 'GET';
    this.headers = new Map(Object.entries(init.headers || {}));
  }
  
  get(name) {
    return this.headers.get(name);
  }
};

global.Response = class MockResponse {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.headers = new Map(Object.entries(init.headers || {}));
  }
  
  static json(data, init = {}) {
    return new MockResponse(JSON.stringify(data), {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init.headers }
    });
  }
};

// Mock NextResponse for middleware tests
global.NextResponse = {
  json: (data, init = {}) => global.Response.json(data, init),
  redirect: (url, init = {}) => new global.Response(null, { ...init, status: 302, headers: { Location: url } }),
  next: () => new global.Response(null, { status: 200 })
};

// Set up environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';

// Use SQLite for testing instead of PostgreSQL
process.env.DATABASE_URL = 'file:./test.db';

// Mock Prisma client for tests that don't need real database
const mockPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  userSession: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  passwordResetToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  $disconnect: jest.fn(),
};

// Make mock available globally
global.mockPrisma = mockPrisma;