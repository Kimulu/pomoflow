// @ts-nocheck
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext"; // Import useAuth hook

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Get the register function, isLoading, and error from the AuthContext
  const { register, isLoading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Call the register function from AuthContext, passing all fields
      await register(username, email, password); // Pass username first, as per AuthContextType

      // If registration is successful, redirect to the login page
      router.push("/login");
    } catch (err) {
      // Error handling is now done via the 'error' state from AuthContext
      console.error(
        "Registration component: Error during registration process",
        err
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="w-full max-w-md p-8 bg-base-100 rounded-lg shadow-xl space-y-6">
        <h2 className="text-3xl font-bold text-center text-primary">
          Register
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <span className="label-text">Username</span>
            </label>
            <input
              type="text"
              placeholder="Choose a username"
              className="input input-bordered input-primary w-full"
              value={username}
              required
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              placeholder="Create a password"
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
              "Register"
            )}
          </button>
        </form>

        <div className="text-center text-sm text-base-content">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/login")}
            className="link link-primary"
          >
            Login here
          </button>
        </div>
      </div>
    </div>
  );
}
