import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const AdminNav = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="space-y-1">
      <Link
        to="/admin/bets"
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary/80 hover:text-secondary-foreground",
          isActive("/admin/bets")
            ? "bg-secondary text-secondary-foreground"
            : "text-muted-foreground"
        )}
      >
        Bets Management
      </Link>
      <Link
        to="/admin/users"
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary/80 hover:text-secondary-foreground",
          isActive("/admin/users")
            ? "bg-secondary text-secondary-foreground"
            : "text-muted-foreground"
        )}
      >
        Users Management
      </Link>
    </nav>
  );
};