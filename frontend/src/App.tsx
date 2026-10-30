import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { UserLayout } from './components/layout/UserLayout';
import { AuthorLayout } from './components/layout/AuthorLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { Home } from './pages/public/Home';
import { Books } from './pages/public/Books';
import { BookDetail } from './pages/public/BookDetail';
import { Categories } from './pages/public/Categories';
import { Authors } from './pages/public/Authors';
import { AuthorDetail } from './pages/public/AuthorDetail';
import { About } from './pages/public/About';
import { Contact } from './pages/public/Contact';
import { Legal } from './pages/public/Legal';

// Auth Pages
import { Login } from './pages/auth/Login';
import { RegisterChoice } from './pages/auth/RegisterChoice';
import { RegisterUser } from './pages/auth/RegisterUser';
import { RegisterAuthor } from './pages/auth/RegisterAuthor';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { AccessDenied } from './pages/auth/AccessDenied';
import { AdminLogin } from './pages/admin/AdminLogin';

// User Pages
import { UserDashboard } from './pages/user/UserDashboard';
import { UserLibrary } from './pages/user/UserLibrary';
import { UserOrders } from './pages/user/UserOrders';
import { UserOrderDetail } from './pages/user/UserOrderDetail';
import { UserWishlist } from './pages/user/UserWishlist';
import { UserCart } from './pages/user/UserCart';
import { UserCheckout } from './pages/user/UserCheckout';
import { UserPaymentResult } from './pages/user/UserPaymentResult';
import { UserProfile } from './pages/user/UserProfile';
import { UserReviews } from './pages/user/UserReviews';
import { UserNotifications } from './pages/user/UserNotifications';
import { UserSettings } from './pages/user/UserSettings';
import { UserSupport } from './pages/user/UserSupport';
import { UserReader } from './pages/user/UserReader';

// Author Pages
import { AuthorDashboard } from './pages/author/AuthorDashboard';
import { AuthorBooks } from './pages/author/AuthorBooks';
import { AuthorAddBook } from './pages/author/AuthorAddBook';
import { AuthorEditBook } from './pages/author/AuthorEditBook';
import { AuthorBookDetail } from './pages/author/AuthorBookDetail';
import { AuthorApprovals } from './pages/author/AuthorApprovals';
import { AuthorSales } from './pages/author/AuthorSales';
import { AuthorEarnings } from './pages/author/AuthorEarnings';
import { AuthorPayouts } from './pages/author/AuthorPayouts';
import { AuthorReviews } from './pages/author/AuthorReviews';
import { AuthorProfile } from './pages/author/AuthorProfile';
import { AuthorNotifications } from './pages/author/AuthorNotifications';
import { AuthorSettings } from './pages/author/AuthorSettings';
import { AuthorApprovalStatus } from './pages/author/AuthorApprovalStatus';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import AdminAuthors from './pages/admin/AdminAuthors';
import AdminAuthorApplications from './pages/admin/AdminAuthorApplications';
import AdminBookApprovals from './pages/admin/AdminBookApprovals';
import AdminBooks from './pages/admin/AdminBooks';
import AdminCategories from './pages/admin/AdminCategories';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminOrders from './pages/admin/AdminOrders';
import AdminRefunds from './pages/admin/AdminRefunds';
import AdminCommission from './pages/admin/AdminCommission';
import AdminPayouts from './pages/admin/AdminPayouts';
import AdminReviews from './pages/admin/AdminReviews';
import AdminReports from './pages/admin/AdminReports';
import AdminSupport from './pages/admin/AdminSupport';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminSettings from './pages/admin/AdminSettings';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <Routes>
                {/* Full-screen distraction-free eBook reader */}
                <Route path="/user/reader/:bookId" element={<UserReader />} />

                {/* Standalone Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<RegisterChoice />} />
                <Route path="/register/user" element={<RegisterUser />} />
                <Route path="/register/author" element={<RegisterAuthor />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/access-denied" element={<AccessDenied />} />
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Public Marketplace Layout */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/books" element={<Books />} />
                  <Route path="/books/:slug" element={<BookDetail />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/authors" element={<Authors />} />
                  <Route path="/authors/:id" element={<AuthorDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/help" element={<Contact />} />
                  <Route path="/legal" element={<Legal />} />
                  <Route path="/privacy" element={<Legal />} />
                  <Route path="/terms" element={<Legal />} />
                  <Route path="/refund" element={<Legal />} />
                  <Route path="/author/approval-status" element={<AuthorApprovalStatus />} />
                </Route>

                {/* Student / Reader Protected Routes */}
                <Route path="/user" element={<UserLayout />}>
                  <Route index element={<Navigate to="/user/dashboard" replace />} />
                  <Route path="dashboard" element={<UserDashboard />} />
                  <Route path="library" element={<UserLibrary />} />
                  <Route path="orders" element={<UserOrders />} />
                  <Route path="orders/:orderId" element={<UserOrderDetail />} />
                  <Route path="wishlist" element={<UserWishlist />} />
                  <Route path="cart" element={<UserCart />} />
                  <Route path="checkout" element={<UserCheckout />} />
                  <Route path="payment-result" element={<UserPaymentResult />} />
                  <Route path="profile" element={<UserProfile />} />
                  <Route path="reviews" element={<UserReviews />} />
                  <Route path="notifications" element={<UserNotifications />} />
                  <Route path="settings" element={<UserSettings />} />
                  <Route path="support" element={<UserSupport />} />
                </Route>

                {/* Author Studio Protected Routes */}
                <Route path="/author" element={<AuthorLayout />}>
                  <Route index element={<Navigate to="/author/dashboard" replace />} />
                  <Route path="dashboard" element={<AuthorDashboard />} />
                  <Route path="books" element={<AuthorBooks />} />
                  <Route path="books/new" element={<AuthorAddBook />} />
                  <Route path="books/:bookId" element={<AuthorBookDetail />} />
                  <Route path="books/:bookId/edit" element={<AuthorEditBook />} />
                  <Route path="approvals" element={<AuthorApprovals />} />
                  <Route path="sales" element={<AuthorSales />} />
                  <Route path="earnings" element={<AuthorEarnings />} />
                  <Route path="ledger" element={<AuthorEarnings />} />
                  <Route path="payouts" element={<AuthorPayouts />} />
                  <Route path="reviews" element={<AuthorReviews />} />
                  <Route path="profile" element={<AuthorProfile />} />
                  <Route path="notifications" element={<AuthorNotifications />} />
                  <Route path="settings" element={<AuthorSettings />} />
                </Route>

                {/* Admin Platform Console Protected Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="authors" element={<AdminAuthors />} />
                  <Route path="author-applications" element={<AdminAuthorApplications />} />
                  <Route path="book-approvals" element={<AdminBookApprovals />} />
                  <Route path="books" element={<AdminBooks />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="transactions" element={<AdminTransactions />} />
                  <Route path="refunds" element={<AdminRefunds />} />
                  <Route path="commission" element={<AdminCommission />} />
                  <Route path="payouts" element={<AdminPayouts />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="support" element={<AdminSupport />} />
                  <Route path="audit-logs" element={<AdminAuditLogs />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
