import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Readers from "@/pages/readers";
import ReaderProfile from "@/pages/reader-profile";
import About from "@/pages/about";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Shop from "@/pages/shop";
import Dashboard from "@/pages/dashboard";
import ReaderDashboard from "@/pages/reader-dashboard";
import Session from "@/pages/session";
import Messages from "@/pages/messages";
import Admin from "@/pages/admin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/readers" component={Readers} />
      <Route path="/reader/:id" component={ReaderProfile} />
      <Route path="/about" component={About} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/shop" component={Shop} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/reader-dashboard" component={ReaderDashboard} />
      <Route path="/session/:readerId" component={Session} />
      <Route path="/messages" component={Messages} />
      <Route path="/messages/:userId" component={Messages} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <div className="min-h-screen flex flex-col bg-background font-body">
              <Header />
              <main className="flex-1">
                <Router />
              </main>
              <Footer />
            </div>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
