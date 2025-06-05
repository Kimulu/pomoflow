// @ts-nocheck
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext"; // Use the useAuth hook

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const { login, isLoading, error } = useAuth(); // Also get isLoading and error from context

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push("/");
    } catch (err: any) {
      // The alert is now handled by the error state in AuthContext and displayed below
      // Optionally, you could still use an alert for immediate feedback if desired,
      // but showing it in the UI is generally better.
      console.error("Login component: Error during login process", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="w-full max-w-md p-8 bg-base-100 rounded-lg shadow-xl space-y-6">
        <h2 className="text-3xl font-bold text-center text-primary">Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              placeholder="user@example.com"
              className="input input-bordered input-primary w-full"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              placeholder="Your password"
              className="input input-bordered input-primary w-full"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Display error message from AuthContext */}
          {error && (
            <div role="alert" className="alert alert-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isLoading} // Disable button while loading
          >
            {isLoading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Log In"
            )}
          </button>
        </form>

        <div className="text-center text-sm text-base-content">
          Don't have an account?{" "}
          <button
            onClick={() => router.push("/register")}
            className="link link-primary"
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
}
