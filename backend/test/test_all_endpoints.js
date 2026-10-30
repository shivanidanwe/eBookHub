const http = require('http');
const app = require('../dist/app').default;

let server;
let port;

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: port,
        ...options,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch (e) {
            parsed = data;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed,
          });
        });
      }
    );
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

function extractCookie(res) {
  const setCookie = res.headers['set-cookie'];
  if (!setCookie) return '';
  return setCookie.map((c) => c.split(';')[0]).join('; ');
}

async function run() {
  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      port = server.address().port;
      console.log(`Test server running on port ${port}`);
      resolve();
    });
  });

  console.log('\n======================================================');
  console.log('   EBOOKHUB COMPREHENSIVE ENDPOINT VERIFICATION');
  console.log('======================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Health Check
  console.log('\n[1] Health Check:');
  const health = await request({ method: 'GET', path: '/api/health' });
  assert(health.status === 200, 'GET /api/health returns 200');
  assert(health.body.database === 'connected', 'Database reports connected');

  // 2. Student Authentication & Endpoints
  console.log('\n[2] Student / User Portal Flows:');
  const studentLogin = await request(
    {
      method: 'POST',
      path: '/api/auth/login',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'shivani@example.com', password: 'User@123' }
  );
  assert(studentLogin.status === 200, 'Student login successful');
  assert(studentLogin.body.data.user.role === 'USER', 'Student has USER role');
  const studentCookie = extractCookie(studentLogin);
  const studentAuthHeaders = {
    Cookie: studentCookie,
    Authorization: `Bearer ${studentLogin.body.data.token || ''}`,
  };

  const studentProfile = await request({
    method: 'GET',
    path: '/api/auth/me',
    headers: studentAuthHeaders,
  });
  assert(studentProfile.status === 200, 'GET /api/auth/me returns 200');

  const studentDashboard = await request({
    method: 'GET',
    path: '/api/user/dashboard',
    headers: studentAuthHeaders,
  });
  assert(studentDashboard.status === 200, 'GET /api/user/dashboard returns 200');

  const studentLibrary = await request({
    method: 'GET',
    path: '/api/library',
    headers: studentAuthHeaders,
  });
  assert(studentLibrary.status === 200, 'GET /api/library returns 200');

  const studentReviews = await request({
    method: 'GET',
    path: '/api/reviews/my',
    headers: studentAuthHeaders,
  });
  assert(studentReviews.status === 200, 'GET /api/reviews/my returns 200');

  const studentCart = await request({
    method: 'GET',
    path: '/api/cart',
    headers: studentAuthHeaders,
  });
  assert(studentCart.status === 200, 'GET /api/cart returns 200');

  const studentWishlist = await request({
    method: 'GET',
    path: '/api/wishlist',
    headers: studentAuthHeaders,
  });
  assert(studentWishlist.status === 200, 'GET /api/wishlist returns 200');

  const studentOrders = await request({
    method: 'GET',
    path: '/api/orders',
    headers: studentAuthHeaders,
  });
  assert(studentOrders.status === 200, 'GET /api/orders returns 200');

  // 3. Author Authentication & Endpoints
  console.log('\n[3] Author Portal Flows:');
  const authorLogin = await request(
    {
      method: 'POST',
      path: '/api/auth/login',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'rohan.mehta@ebookhub.com', password: 'Author@123' }
  );
  assert(authorLogin.status === 200, 'Author login successful');
  assert(authorLogin.body.data.user.role === 'AUTHOR', 'Author has AUTHOR role');
  const authorCookie = extractCookie(authorLogin);
  const authorAuthHeaders = {
    Cookie: authorCookie,
    Authorization: `Bearer ${authorLogin.body.data.token || ''}`,
  };

  const authorDashboard = await request({
    method: 'GET',
    path: '/api/author/dashboard',
    headers: authorAuthHeaders,
  });
  assert(authorDashboard.status === 200, 'GET /api/author/dashboard returns 200');
  const aMetrics = authorDashboard.body.data?.metrics;
  assert(
    aMetrics &&
      'totalBooks' in aMetrics &&
      'publishedBooks' in aMetrics &&
      'pendingApprovals' in aMetrics &&
      'totalSales' in aMetrics &&
      'grossSales' in aMetrics &&
      'platformCommission' in aMetrics &&
      'totalEarnings' in aMetrics &&
      'availableBalance' in aMetrics,
    'Author dashboard contains all 8 required financial & book metrics'
  );

  const authorBooks = await request({
    method: 'GET',
    path: '/api/author/books',
    headers: authorAuthHeaders,
  });
  assert(authorBooks.status === 200, 'GET /api/author/books returns 200');

  const authorSales = await request({
    method: 'GET',
    path: '/api/author/sales',
    headers: authorAuthHeaders,
  });
  assert(authorSales.status === 200, 'GET /api/author/sales returns 200');

  const authorPayouts = await request({
    method: 'GET',
    path: '/api/author/payouts',
    headers: authorAuthHeaders,
  });
  assert(authorPayouts.status === 200, 'GET /api/author/payouts returns 200');

  // 4. Admin Authentication & Endpoints
  console.log('\n[4] Admin Portal Flows:');
  const adminLogin = await request(
    {
      method: 'POST',
      path: '/api/auth/login',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@ebookhub.com', password: 'Admin@123' }
  );
  assert(adminLogin.status === 200, 'Admin login successful');
  assert(adminLogin.body.data.user.role === 'ADMIN', 'Admin has ADMIN role');
  const adminCookie = extractCookie(adminLogin);
  const adminAuthHeaders = {
    Cookie: adminCookie,
    Authorization: `Bearer ${adminLogin.body.data.token || ''}`,
  };

  const adminDashboard = await request({
    method: 'GET',
    path: '/api/admin/dashboard',
    headers: adminAuthHeaders,
  });
  assert(adminDashboard.status === 200, 'GET /api/admin/dashboard returns 200');
  const admCounts = adminDashboard.body.data?.metrics;
  assert(
    admCounts &&
      'totalUsers' in admCounts &&
      'totalAuthors' in admCounts &&
      'pendingAuthorApplications' in admCounts &&
      'totalBooks' in admCounts &&
      'pendingBookApprovals' in admCounts &&
      'totalOrders' in admCounts &&
      'successfulPayments' in admCounts &&
      'platformRevenue' in admCounts &&
      'pendingPayouts' in admCounts,
    'Admin dashboard contains all 9 required operational & financial metrics'
  );

  const adminUsers = await request({
    method: 'GET',
    path: '/api/admin/users',
    headers: adminAuthHeaders,
  });
  assert(adminUsers.status === 200, 'GET /api/admin/users returns 200');

  const adminAuthors = await request({
    method: 'GET',
    path: '/api/admin/authors',
    headers: adminAuthHeaders,
  });
  assert(adminAuthors.status === 200, 'GET /api/admin/authors returns 200');

  const adminAuthorApps = await request({
    method: 'GET',
    path: '/api/admin/author-applications',
    headers: adminAuthHeaders,
  });
  assert(adminAuthorApps.status === 200, 'GET /api/admin/author-applications returns 200');

  const adminBookApps = await request({
    method: 'GET',
    path: '/api/admin/books?status=PENDING_APPROVAL',
    headers: adminAuthHeaders,
  });
  assert(adminBookApps.status === 200, 'GET /api/admin/books?status=PENDING_APPROVAL returns 200');

  const adminBooks = await request({
    method: 'GET',
    path: '/api/admin/books',
    headers: adminAuthHeaders,
  });
  assert(adminBooks.status === 200, 'GET /api/admin/books returns 200');

  const adminOrders = await request({
    method: 'GET',
    path: '/api/admin/orders',
    headers: adminAuthHeaders,
  });
  assert(adminOrders.status === 200, 'GET /api/admin/orders returns 200');

  const adminTransactions = await request({
    method: 'GET',
    path: '/api/admin/transactions',
    headers: adminAuthHeaders,
  });
  assert(adminTransactions.status === 200, 'GET /api/admin/transactions returns 200');

  const adminCommission = await request({
    method: 'GET',
    path: '/api/admin/settings',
    headers: adminAuthHeaders,
  });
  assert(adminCommission.status === 200, 'GET /api/admin/settings (commission settings) returns 200');

  const adminPayouts = await request({
    method: 'GET',
    path: '/api/admin/payouts',
    headers: adminAuthHeaders,
  });
  assert(adminPayouts.status === 200, 'GET /api/admin/payouts returns 200');

  const adminReviews = await request({
    method: 'GET',
    path: '/api/admin/reviews',
    headers: adminAuthHeaders,
  });
  assert(adminReviews.status === 200, 'GET /api/admin/reviews returns 200');

  const adminReports = await request({
    method: 'GET',
    path: '/api/admin/reports/export?type=orders',
    headers: adminAuthHeaders,
  });
  assert(adminReports.status === 200, 'GET /api/admin/reports/export returns 200 CSV');

  const adminSupport = await request({
    method: 'GET',
    path: '/api/admin/support',
    headers: adminAuthHeaders,
  });
  assert(adminSupport.status === 200, 'GET /api/admin/support returns 200');

  const adminAuditLogs = await request({
    method: 'GET',
    path: '/api/admin/audit-logs',
    headers: adminAuthHeaders,
  });
  assert(adminAuditLogs.status === 200, 'GET /api/admin/audit-logs returns 200');

  const adminSettings = await request({
    method: 'GET',
    path: '/api/admin/settings',
    headers: adminAuthHeaders,
  });
  assert(adminSettings.status === 200, 'GET /api/admin/settings returns 200');

  // 5. Security & Role Isolation Testing
  console.log('\n[5] Security & RBAC Enforcement:');
  const studentToAdmin = await request({
    method: 'GET',
    path: '/api/admin/dashboard',
    headers: studentAuthHeaders,
  });
  assert(studentToAdmin.status === 403, 'Student blocked from Admin Dashboard (HTTP 403)');

  const studentToAuthor = await request({
    method: 'GET',
    path: '/api/author/dashboard',
    headers: studentAuthHeaders,
  });
  assert(studentToAuthor.status === 403, 'Student blocked from Author Dashboard (HTTP 403)');

  const authorToAdmin = await request({
    method: 'GET',
    path: '/api/admin/dashboard',
    headers: authorAuthHeaders,
  });
  assert(authorToAdmin.status === 403, 'Author blocked from Admin Dashboard (HTTP 403)');

  const anonToProtected = await request({
    method: 'GET',
    path: '/api/library',
  });
  assert(anonToProtected.status === 401, 'Anonymous request blocked from User Library (HTTP 401)');

  console.log('\n======================================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  server.close();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Test run failed:', err);
  if (server) server.close();
  process.exit(1);
});
