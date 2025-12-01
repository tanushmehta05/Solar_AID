
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { hash } = window.location;
    if (hash) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          navigate("/");
        } else {
          navigate("/auth");
        }
      });
    }
  }, [navigate]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-white" />
      <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
        Processing authentication...
      </p>
    </div>
  );
};

export default AuthCallback;
