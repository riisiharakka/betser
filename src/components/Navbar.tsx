import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface NavbarProps {
  user: User | null;
}

export const Navbar = ({ user }: NavbarProps) => {
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="bg-primary py-4 px-6 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white">
          BetPeer
        </Link>
        
        <div className="flex gap-4 items-center">
          <Link to="/">
            <Button variant="ghost" className="text-white hover:text-primary-foreground">
              Home
            </Button>
          </Link>
          
          {user ? (
            <>
              <Link to="/profile">
                <Button variant="ghost" className="text-white hover:text-primary-foreground">
                  Profile
                </Button>
              </Link>
              <Button variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="secondary">
                Login / Register
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};