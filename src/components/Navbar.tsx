import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface NavbarProps {
  user: User | null;
}

export const Navbar = ({ user }: NavbarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

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
        <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#F97316] to-[#D946EF]">
          BetPeer
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/my-bets">
                <Button variant="secondary">My Bets</Button>
              </Link>
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