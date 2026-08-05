import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { RequireAdmin, RequireAuth } from "@/components/RouteGuards";
import Index from "./pages/Index.tsx";
import Products from "./pages/Products.tsx";
import About from "./pages/About.tsx";
import Gallery from "./pages/Gallery.tsx";
import Ownership from "./pages/Ownership.tsx";
import BulkOrder from "./pages/BulkOrder.tsx";
import Contact from "./pages/Contact.tsx";
import Auth from "./pages/Auth.tsx";
import Cart from "./pages/Cart.tsx";
import Checkout from "./pages/Checkout.tsx";
import OrderConfirmation from "./pages/OrderConfirmation.tsx";
import MyOrders from "./pages/MyOrders.tsx";
import NotFound from "./pages/NotFound.tsx";
import InstallPrompt from "./components/InstallPrompt.tsx";
import AuthModal from "./components/AuthModal";
import WelcomeManager from "./components/WelcomeManager";
import AdminLayout from "./components/admin/AdminLayout.tsx";
import Dashboard from "./pages/admin/Dashboard.tsx";
import AdminProducts from "./pages/admin/AdminProducts.tsx";
import AdminCategories from "./pages/admin/AdminCategories.tsx";
import AdminOrders from "./pages/admin/AdminOrders.tsx";
import AdminCustomers from "./pages/admin/AdminCustomers.tsx";
import AdminAnalytics from "./pages/admin/AdminAnalytics.tsx";
import AdminWebsite from "./pages/admin/AdminWebsite.tsx";
import AdminStaff from "./pages/admin/AdminStaff.tsx";
import AdminNotifications from "./pages/admin/AdminNotifications.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <WelcomeManager />
            <AuthModal />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/about" element={<About />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/ownership" element={<Ownership />} />
              <Route path="/bulk-order" element={<BulkOrder />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
              <Route path="/order-confirmation/:id" element={<RequireAuth><OrderConfirmation /></RequireAuth>} />
              <Route path="/my-orders" element={<RequireAuth><MyOrders /></RequireAuth>} />

              <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="staff" element={<RequireSuperAdmin><AdminStaff /></RequireSuperAdmin>} />
                <Route path="website" element={<AdminWebsite />} />
                <Route path="notifications" element={<AdminNotifications />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            <InstallPrompt />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
