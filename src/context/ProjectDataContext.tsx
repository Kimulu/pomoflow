// frontend/context/ProjectDataContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { Project } from "./../types";
import { fetchData, postData, putData, deleteData } from "../pages/api/api";

interface ProjectDataContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  addProject: (name: string) => Promise<Project | null>;
  updateProject: (id: string, name: string) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
}

const ProjectDataContext = createContext<ProjectDataContextType | undefined>(
  undefined
);

export const ProjectDataProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();

  const [projects, _setProjects] = useState<Project[]>([]);
  const setProjects = useCallback(
    (newProjects: Project[] | ((prev: Project[]) => Project[])) => {
      _setProjects((prev) => {
        const result =
          typeof newProjects === "function" ? newProjects(prev) : newProjects;
        console.log(
          `[ProjectDataContext] projects state updated to length: ${result.length}, value:`,
          result
        );
        return result;
      });
    },
    []
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // You can keep this definition, but it won't affect the project fetching logic anymore.
  // const isPremiumUser = isAuthenticated && user && (user.plan === "trial" || user.plan === "plus");

  const hasFetchedInitial = useRef(false);

  const performFetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("[ProjectDataContext] Initiating project fetch via API...");
      const data: Project[] = await fetchData<Project[]>("/projects");
      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        console.warn(
          "[ProjectDataContext] API returned non-array for projects. Setting to empty array.",
          data
        );
        setProjects([]);
      }
    } catch (err: unknown) {
      console.error("[ProjectDataContext] Error fetching projects:", err);
      setError(
        (err instanceof Error ? err.message : String(err)) ||
          "Failed to fetch projects."
      );
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [setProjects]);

  // Main useEffect for fetching projects based on auth state and fetch status
  useEffect(() => {
    console.log(
      `[ProjectDataContext] Fetch useEffect Trigger: authLoading=${authLoading}, isAuthenticated=${isAuthenticated}, hasFetchedInitial=${hasFetchedInitial.current}, projects.length=${projects.length}, loading=${loading}, error=${error}`
    );

    if (authLoading) {
      console.log(
        "[ProjectDataContext] Auth is still loading, waiting to fetch projects."
      );
      return;
    }

    // --- CRITICAL CHANGE IS HERE ---
    if (isAuthenticated) {
      // Only check for isAuthenticated, not isPremiumUser
      if (
        !hasFetchedInitial.current ||
        (projects.length === 0 && !loading && !error)
      ) {
        console.log(
          "[ProjectDataContext] Auth stable and authenticated. Initiating project fetch."
        );
        performFetch();
        hasFetchedInitial.current = true;
      } else {
        console.log(
          "[ProjectDataContext] Auth stable and authenticated, projects already populated or loading."
        );
      }
    } else {
      // User is not authenticated
      if (projects.length > 0 || hasFetchedInitial.current) {
        console.log(
          "[ProjectDataContext] Not authenticated. Clearing projects."
        );
        setProjects([]);
      } else {
        console.log(
          "[ProjectDataContext] Not authenticated, projects already empty or not yet fetched."
        );
      }
      hasFetchedInitial.current = false;
    }
    // --- END CRITICAL CHANGE ---
  }, [
    authLoading,
    isAuthenticated,
    // Removed isPremiumUser from dependencies here
    performFetch,
    projects.length,
    loading,
    error,
    setProjects,
  ]);

  // Dedicated useEffect for logging component unmount (runs ONLY on unmount)
  useEffect(() => {
    return () => {
      console.log("[ProjectDataContext] COMPONENT UNMOUNTED!");
    };
  }, []);

  const addProject = useCallback(
    async (name: string): Promise<Project | null> => {
      // You can keep the isPremiumUser check here if adding/updating/deleting is a premium feature
      if (!isAuthenticated /* || !isPremiumUser */) {
        // Decide if add requires premium
        setError("Not authorized to add projects."); // Adjust message if premium not required
        return null;
      }
      setLoading(true);
      setError(null);
      try {
        const newProject: Project = await postData<Project>("/projects", {
          name,
        });
        setProjects((prev) => [...prev, newProject]);
        return newProject;
      } catch (err: unknown) {
        console.error("Error adding project:", err);
        setError(
          (err instanceof Error ? err.message : String(err)) ||
            "Failed to add project."
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [
      isAuthenticated /* isPremiumUser removed here too if not needed */,
      setProjects,
    ]
  );

  const updateProject = useCallback(
    async (id: string, name: string): Promise<Project | null> => {
      // You can keep the isPremiumUser check here if adding/updating/deleting is a premium feature
      if (!isAuthenticated /* || !isPremiumUser */) {
        // Decide if update requires premium
        setError("Not authorized to update projects."); // Adjust message
        return null;
      }
      setLoading(true);
      setError(null);
      try {
        const updatedProject: Project = await putData<Project>(
          `/projects/${id}`,
          { name }
        );
        if (updatedProject) {
          setProjects((prev) =>
            prev.map((p) => (p._id === id ? updatedProject : p))
          );
        }
        return updatedProject;
      } catch (err: unknown) {
        console.error("Error updating project:", err);
        setError(
          (err instanceof Error ? err.message : String(err)) ||
            "Failed to update project."
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [
      isAuthenticated /* isPremiumUser removed here too if not needed */,
      setProjects,
    ]
  );

  const deleteProject = useCallback(
    async (id: string): Promise<boolean> => {
      // You can keep the isPremiumUser check here if adding/updating/deleting is a premium feature
      if (!isAuthenticated /* || !isPremiumUser */) {
        // Decide if delete requires premium
        setError("Not authorized to delete projects."); // Adjust message
        return false;
      }
      setLoading(true);
      setError(null);
      try {
        await deleteData<unknown>(`/projects/${id}`);
        setProjects((prev) => prev.filter((p) => p._id !== id));
        return true;
      } catch (err: unknown) {
        console.error("Error deleting project:", err);
        setError(
          (err instanceof Error ? err.message : String(err)) ||
            "Failed to delete project."
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [
      isAuthenticated /* isPremiumUser removed here too if not needed */,
      setProjects,
    ]
  );

  const contextValue: ProjectDataContextType = {
    projects,
    loading,
    error,
    fetchProjects: performFetch,
    addProject,
    updateProject,
    deleteProject,
  };

  return (
    <ProjectDataContext.Provider value={contextValue}>
      {children}
    </ProjectDataContext.Provider>
  );
};

export const useProjectData = () => {
  const context = useContext(ProjectDataContext);
  if (context === undefined) {
    throw new Error("useProjectData must be used within a ProjectDataProvider");
  }
  return context;
};
