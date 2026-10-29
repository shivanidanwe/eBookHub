const test = require('node:test');
const assert = require('node:assert/strict');

// 1. Test Financial and Commission Calculations
test('Financial Arithmetic: Minor Units (Paise) and Commission Calculations', () => {
  const priceInPaise = 24900; // ₹249.00
  const commissionRate = 0.15; // 15%

  const commission = Math.round(priceInPaise * commissionRate); // 3735 paise (₹37.35)
  const authorEarnings = priceInPaise - commission; // 21165 paise (₹211.65)

  assert.equal(commission, 3735);
  assert.equal(authorEarnings, 21165);
  assert.equal(commission + authorEarnings, priceInPaise, 'Commission and Author Earnings must sum to exact price');
});

// 2. Test Coupon Validation Rules
test('Coupon Validation: Percentage and Fixed Cap Calculations', () => {
  const orderSubtotal = 40000; // ₹400.00
  
  // Rule A: 20% discount with max cap of ₹50.00 (5000 paise)
  const percentDiscount = Math.round((orderSubtotal * 20) / 100); // 8000 paise
  const maxDiscountCap = 5000;
  const effectiveDiscount = percentDiscount > maxDiscountCap ? maxDiscountCap : percentDiscount;
  
  assert.equal(effectiveDiscount, 5000, 'Discount must respect maximum allowable cap');
  assert.equal(orderSubtotal - effectiveDiscount, 35000, 'Final payable amount must reflect capped discount');
});

// 3. Test RBAC Permission Guard
test('Security RBAC: Role-Based Access Enforcement', () => {
  function isAllowed(userRole, requiredRoles) {
    return requiredRoles.includes(userRole);
  }

  assert.equal(isAllowed('USER', ['ADMIN']), false, 'Normal USER must not access ADMIN routes');
  assert.equal(isAllowed('AUTHOR', ['ADMIN']), false, 'AUTHOR must not access ADMIN routes');
  assert.equal(isAllowed('ADMIN', ['ADMIN']), true, 'ADMIN must be allowed on ADMIN routes');
  assert.equal(isAllowed('USER', ['USER', 'AUTHOR', 'ADMIN']), true, 'USER allowed on public/user routes');
});

// 4. Test Digital Entitlement Guard for PDF Access
test('Security Guard: Entitlement Verification for PDF Download', () => {
  function verifyPdfAccess(userId, userRole, entitlementRecord, bookAuthorId, authorProfileId) {
    if (userRole === 'ADMIN') return { allowed: true, reason: 'ADMIN_OVERRIDE' };
    if (authorProfileId && bookAuthorId === authorProfileId) return { allowed: true, reason: 'AUTHOR_OWNERSHIP' };
    if (entitlementRecord && entitlementRecord.userId === userId && entitlementRecord.isActive) {
      return { allowed: true, reason: 'VALID_ENTITLEMENT' };
    }
    return { allowed: false, reason: 'NO_ACTIVE_LICENSE' };
  }

  const bookAuthorId = 'author_rohan_123';
  
  // Case 1: Random student without entitlement
  const attempt1 = verifyPdfAccess('student_sneha', 'USER', null, bookAuthorId, null);
  assert.equal(attempt1.allowed, false);

  // Case 2: Student with purchased active entitlement
  const attempt2 = verifyPdfAccess('student_shivani', 'USER', { userId: 'student_shivani', isActive: true }, bookAuthorId, null);
  assert.equal(attempt2.allowed, true);
  assert.equal(attempt2.reason, 'VALID_ENTITLEMENT');

  // Case 3: Author viewing their own published book
  const attempt3 = verifyPdfAccess('user_rohan', 'AUTHOR', null, bookAuthorId, 'author_rohan_123');
  assert.equal(attempt3.allowed, true);
  assert.equal(attempt3.reason, 'AUTHOR_OWNERSHIP');

  // Case 4: Admin inspecting the book
  const attempt4 = verifyPdfAccess('user_admin', 'ADMIN', null, bookAuthorId, null);
  assert.equal(attempt4.allowed, true);
  assert.equal(attempt4.reason, 'ADMIN_OVERRIDE');
});

// 5. Test Payout Request Validation
test('Author Payout Threshold & Balance Validation', () => {
  function validatePayoutRequest(availableBalance, requestAmount, minThreshold = 100000) {
    if (requestAmount < minThreshold) {
      return { valid: false, error: 'Amount below minimum payout threshold' };
    }
    if (requestAmount > availableBalance) {
      return { valid: false, error: 'Amount exceeds available balance' };
    }
    return { valid: true, error: null };
  }

  const availableBalance = 3624000; // ₹36,240.00
  
  // Request below minimum threshold (₹500 < ₹1000)
  const res1 = validatePayoutRequest(availableBalance, 50000);
  assert.equal(res1.valid, false);

  // Request exceeding available balance (₹40,000 > ₹36,240)
  const res2 = validatePayoutRequest(availableBalance, 4000000);
  assert.equal(res2.valid, false);

  // Valid payout request (₹10,000)
  const res3 = validatePayoutRequest(availableBalance, 1000000);
  assert.equal(res3.valid, true);
});
