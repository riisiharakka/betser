import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";

interface NavbarProps {
  user: User | null;
}

export const Navbar = ({ user }: NavbarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }

      return data?.role === 'admin';
    },
    enabled: !!user,
  });

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
      return;
    }
    navigate("/");
  };

  return (
    <nav className="bg-primary py-4 px-6 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#9b87f5] via-[#7E69AB] to-[#6E59A5]"
        >
          Betser
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/my-bets">
                <Button variant="secondary">My Bets</Button>
              </Link>
              {isAdmin && (
                <Link to="/admin/bets">
                  <Button variant="secondary">Admin</Button>
                </Link>
              )}
              <Button onClick={handleSignOut} variant="secondary">
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="secondary">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};