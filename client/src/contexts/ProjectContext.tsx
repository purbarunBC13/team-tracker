import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";
import { Project } from "../types";
import { useToast } from "../components/ui/toast";
import { useAuth } from "./AuthContext";

interface ProjectContextType {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  fetchProjects: () => Promise<void>;
  createProject: (
    projectData: Omit<Project, "_id" | "createdAt" | "updatedAt" | "owner">
  ) => Promise<{ success: boolean; error?: string }>;
  updateProject: (
    id: string,
    projectData: Partial<Project>
  ) => Promise<{ success: boolean; error?: string }>;
  deleteProject: (id: string) => Promise<{ success: boolean; error?: string }>;
  getFilteredProjects: () => Project[];
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { showSuccess, showError } = useToast();

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/projects");

      if (response.data.success) {
        const projects = response.data.data || [];

        // Debug: Check for invalid ObjectIds
        const invalidProjects = projects.filter(
          (project: Project) => !/^[0-9a-fA-F]{24}$/.test(project._id)
        );
        if (invalidProjects.length > 0) {
          console.warn(
            "Found projects with invalid ObjectId format:",
            invalidProjects
          );
        }

        // Filter out projects with invalid ObjectIds
        const validProjects = projects.filter((project: Project) =>
          /^[0-9a-fA-F]{24}$/.test(project._id)
        );

        setProjects(validProjects);
      } else {
        setError("Failed to fetch projects");
      }
    } catch (error: any) {
      console.error("Fetch projects error:", error);
      setError(error.response?.data?.message || "Error fetching projects");
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (
    projectData: Omit<Project, "_id" | "createdAt" | "updatedAt" | "owner">
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.post("/projects", projectData);

      if (response.data.success) {
        // Add the new project to the local state
        setProjects((prev) => [response.data.data, ...prev]);

        // Show success toast
        showSuccess(
          "Project Created",
          "New project has been created successfully!"
        );

        return { success: true };
      } else {
        const errorMessage =
          response.data.message || "Failed to create project";
        showError("Creation Failed", errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error: any) {
      console.error("Create project error:", error);
      const errorMessage =
        error.response?.data?.message || "Error creating project";
      showError("Creation Failed", errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const updateProject = async (
    id: string,
    projectData: Partial<Project>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

      if (!isValidObjectId) {
        const error = `Invalid project ID format: ${id}`;
        console.error(error);
        showError("Update Failed", error);
        return { success: false, error };
      }

      const response = await api.put(`/projects/${id}`, projectData);

      if (response.data.success) {
        // Update the project in local state
        setProjects((prev) =>
          prev.map((project) =>
            project._id === id ? { ...project, ...response.data.data } : project
          )
        );

        // Show success toast
        showSuccess(
          "Project Updated",
          "Project has been updated successfully!"
        );

        return { success: true };
      } else {
        const errorMessage =
          response.data.message || "Failed to update project";
        showError("Update Failed", errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error: any) {
      console.error("Update project error:", error);
      const errorMessage =
        error.response?.data?.message || "Error updating project";
      showError("Update Failed", errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const deleteProject = async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.delete(`/projects/${id}`);

      if (response.data.success) {
        // Remove the project from local state
        setProjects((prev) => prev.filter((project) => project._id !== id));

        // Show success toast
        showSuccess(
          "Project Deleted",
          "Project has been deleted successfully!"
        );

        return { success: true };
      } else {
        const errorMessage =
          response.data.message || "Failed to delete project";
        showError("Deletion Failed", errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error: any) {
      console.error("Delete project error:", error);
      const errorMessage =
        error.response?.data?.message || "Error deleting project";
      showError("Deletion Failed", errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const getFilteredProjects = (): Project[] => {
    if (!searchTerm) return projects;

    return projects.filter(
      (project) =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Fetch projects on mount, but only when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      fetchProjects();
    }
  }, [user, authLoading]);

  const value: ProjectContextType = {
    projects,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    getFilteredProjects,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
