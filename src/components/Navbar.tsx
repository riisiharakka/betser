import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export const Navbar = () => {
  const { toast } = useToast();
  const isLoggedIn = false; // TODO: Replace with actual auth state

  const handleAuthClick = () => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication required",
        description: "Please log in or create an account to continue.",
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
          
          {isLoggedIn ? (
            <>
              <Link to="/profile">
                <Button variant="ghost" className="text-white hover:text-primary-foreground">
                  Profile
                </Button>
              </Link>
              <Button variant="secondary">Logout</Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="secondary" onClick={handleAuthClick}>
                Login / Register
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};