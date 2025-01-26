import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";

export default function Auth() {
  const navigate = useNavigate();

  return (
    <div className="container max-w-md mx-auto py-16">
      <div className="space-y-6">
        <Button
          variant="ghost"
          className="flex items-center gap-2 -ml-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <AuthForm />
      </div>
    </div>
  );
}