import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./integrations/supabase/client";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CreateBet from "./pages/CreateBet";
import MyBets from "./pages/MyBets";
import AdminBets from "./pages/admin/AdminBets";
import AdminUsers from "./pages/admin/AdminUsers";
import { Navbar } from "./components/Navbar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Create a client
const queryClient = new QueryClient();

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Navbar user={user} />
        <Routes>
          <Route path="/" element={<Index user={user} />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/create-bet" element={<CreateBet />} />
          <Route path="/my-bets" element={<MyBets user={user} />} />
          <Route
            path="/admin/bets"
            element={
              <ProtectedRoute user={user}>
                <AdminBets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute user={user}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;