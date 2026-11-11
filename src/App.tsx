import { Navigate, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { StoreLayout } from "./components/StoreLayout";
import { TrueNorthGate } from "./lib/trueNorthGate";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./contexts/ThemeContext";
import {
  AboutPage,
  AdminPage,
  CartPage,
  CategoryPage,
  CheckoutPage,
  ContactPage,
  DialShopPage,
  FavoritesPage,
  HomePage,
  JournalPage,
  JournalPostPage,
  LoginPage,
  NorthSocialPage,
  OrdersPage,
  PrivacyPage,
  ProductPage,
  ProfilePage,
  ResetPasswordPage,
  ReturnsPage,
  ShippingPolicyPage,
  ShopPage,
  SignupPage,
  SizeGuidePage,
  TermsPage,
  WelcomePage,
} from "./pages";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <Toaster />
        <Routes>
          <Route element={<StoreLayout />}>
            {/* Public routes */}
            <Route path="/" element={<DialShopPage />} />
            <Route path="/dial" element={<DialShopPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/women" element={<CategoryPage gender="women" />} />
            <Route path="/men" element={<CategoryPage gender="men" />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
            <Route path="/returns" element={<ReturnsPage />} />
            <Route path="/size-guide" element={<SizeGuidePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/journal" element={<JournalPage />} />
            {/* Long Read lives in True North nav; keep old journal URL as alias */}
            <Route
              path="/journal/deep-reading"
              element={<Navigate to="/chart/long-read" replace />}
            />
            <Route path="/journal/:slug" element={<JournalPostPage />} />
            <Route path="/chart" element={<TrueNorthGate><NorthSocialPage /></TrueNorthGate>} />
            <Route
              path="/chart/numbers"
              element={<TrueNorthGate><Navigate to="/chart#numbers" replace /></TrueNorthGate>}
            />
            <Route
              path="/chart/almanac"
              element={<TrueNorthGate><Navigate to="/chart" replace /></TrueNorthGate>}
            />
            <Route path="/chart/circle" element={<TrueNorthGate><NorthSocialPage /></TrueNorthGate>} />
            <Route path="/chart/long-read" element={<TrueNorthGate><NorthSocialPage /></TrueNorthGate>} />
            <Route path="/welcome" element={<WelcomePage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<TrueNorthGate><ProfilePage /></TrueNorthGate>} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
