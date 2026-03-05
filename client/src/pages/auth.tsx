import { useState } from "react";
import { LoginForm } from "../components/login-form";
import { RegisterForm } from "../components/register";

type AuthMode = "login" | "register";

const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-xl  p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">
          {mode === "login" ? "Login to Your Account" : "Create a New Account"}
        </h2>
        {mode === "login" ? <LoginForm /> : <RegisterForm />}
        <div className="text-center">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => setMode("register")}
                className="text-primary hover:underline"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-primary hover:underline"
              >
                Log In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;