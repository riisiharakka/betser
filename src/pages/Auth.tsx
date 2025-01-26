import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";

export default function Auth() {
  const navigate = useNavigate();

  return (
    <div className="container max-w-md mx-auto py-16 relative">
      <Button
        variant="ghost"
        className="absolute left-0 top-4 flex items-center gap-2"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <AuthForm />
    </div>
  );
}