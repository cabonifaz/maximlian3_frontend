import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { authService } from "@maximilian/services/auth.service";
import LoadingScreen from "@maximilian/components/common/LoadingScreen";

interface GuestGuardProps {
  children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          // If user is authenticated, go back or to a default protected route
          // Using -1 to go back, or /select-role as fallback
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate("/select-role", { replace: true });
          }
        }
      } catch {
        // Not authenticated, allow access to guest pages
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isChecking) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
