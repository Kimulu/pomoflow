import { AuthError } from "../../utils/AuthError"; // Adjust path if AuthError is elsewhere

// Helper to make authenticated API requests
export async function apiFetch<T>( // Added generic type <T>
  url: string,
  method: string = "GET",
  data: unknown = null // Changed 'any' to 'unknown'
): Promise<T> {
  // Added Promise<T> return type
  // --- IMPORTANT CHANGE HERE: Constructing the full URL ---
  const fullUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`;
  console.log("--- Frontend attempting API call to:", fullUrl); // This will show the actual URL

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // IMPORTANT: Ensures cookies are sent with cross-origin requests
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(fullUrl, options); // Use the fullUrl here!

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ msg: response.statusText }));
      // Use the custom AuthError class here for better error handling
      throw new AuthError(
        (errorData as { msg?: string }).msg || "An error occurred", // Added type assertion for errorData
        response.status
      );
    }

    if (response.status === 204) {
      return {} as T; // Return an empty object for 204 No Content
    }

    const result = await response.json();
    return result as T; // Cast result to T
  } catch (error) {
    // Re-throw the error so it can be caught by calling functions (e.g., in AuthContext)
    throw error;
  }
}

// Helper functions for common methods (already look good)
export const fetchData = <T>(url: string): Promise<T> => {
  // Added generic type <T>
  console.log("fetchData preparing to call apiFetch with method: 'GET'");
  return apiFetch<T>(url, "GET");
};
export const postData = <T>(url: string, data: unknown): Promise<T> =>
  apiFetch<T>(url, "POST", data); // Changed 'any' to 'unknown'
export const putData = <T>(url: string, data: unknown): Promise<T> =>
  apiFetch<T>(url, "PUT", data); // Changed 'any' to 'unknown'
export const deleteData = <T>(url: string): Promise<T> =>
  apiFetch<T>(url, "DELETE");
