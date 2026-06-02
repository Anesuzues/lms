import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import SessionTimeoutModal from "./components/SessionTimeoutModal";

const Login         = lazy(() => import("./pages/lms/Login"));
const Courses       = lazy(() => import("./pages/lms/Courses"));
const CourseDetail  = lazy(() => import("./pages/lms/CourseDetail"));
const Dashboard     = lazy(() => import("./pages/lms/Dashboard"));
const LessonViewer  = lazy(() => import("./pages/lms/LessonViewer"));
const AdminDashboard      = lazy(() => import("./pages/admin/AdminDashboard"));
const VerifyCertificate   = lazy(() => import("./pages/lms/VerifyCertificate"));
const Terms               = lazy(() => import("./pages/Terms"));
const Privacy             = lazy(() => import("./pages/Privacy"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes before refetch
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SessionTimeoutModal />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* LMS Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/learn/:id" element={<LessonViewer />} />
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              {/* Certificate verification */}
              <Route path="/verify" element={<VerifyCertificate />} />
              {/* Legal */}
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
