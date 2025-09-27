import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";
import { Task } from "../types";
import { useToast } from "../components/ui/toast";
import { useAuth } from "./AuthContext";

interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  fetchTasks: () => Promise<void>;
  createTask: (
    taskData: Omit<Task, "_id" | "createdAt" | "updatedAt" | "createdBy">
  ) => Promise<{ success: boolean; error?: string }>;
  updateTask: (
    id: string,
    taskData: Partial<Task>
  ) => Promise<{ success: boolean; error?: string }>;
  deleteTask: (id: string) => Promise<{ success: boolean; error?: string }>;
  updateTaskStatus: (
    id: string,
    status: Task["status"]
  ) => Promise<{ success: boolean; error?: string }>;
  getFilteredTasks: () => Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { showSuccess, showError } = useToast();

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/tasks", {
        params: {
          limit: 100, // Get more tasks for now
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      });

      if (response.data.success) {
        const tasks = response.data.tasks || [];

        // Debug: Check for invalid ObjectIds
        const invalidTasks = tasks.filter(
          (task: Task) => !/^[0-9a-fA-F]{24}$/.test(task._id)
        );
        if (invalidTasks.length > 0) {
          console.warn(
            "Found tasks with invalid ObjectId format:",
            invalidTasks
          );
        }

        // Filter out tasks with invalid ObjectIds
        const validTasks = tasks.filter((task: Task) =>
          /^[0-9a-fA-F]{24}$/.test(task._id)
        );

        setTasks(validTasks);
      } else {
        setError("Failed to fetch tasks");
      }
    } catch (error: any) {
      console.error("Fetch tasks error:", error);
      setError(error.response?.data?.message || "Error fetching tasks");
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (
    taskData: Omit<Task, "_id" | "createdAt" | "updatedAt" | "createdBy">
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.post("/tasks", taskData);

      if (response.data.success) {
        // Add the new task to the local state
        setTasks((prev) => [response.data.task, ...prev]);

        // Show success toast
        showSuccess("Task Created", "New task has been created successfully!");

        return { success: true };
      } else {
        const errorMessage = response.data.message || "Failed to create task";
        showError("Creation Failed", errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error: any) {
      console.error("Create task error:", error);
      const errorMessage =
        error.response?.data?.message || "Error creating task";
      showError("Creation Failed", errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const updateTask = async (
    id: string,
    taskData: Partial<Task>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

      if (!isValidObjectId) {
        const error = `Invalid task ID format: ${id}`;
        console.error(error);
        showError("Update Failed", error);
        return { success: false, error };
      }

      const response = await api.put(`/tasks/${id}`, taskData);

      if (response.data.success) {
        // Update the task in local state
        setTasks((prev) =>
          prev.map((task) =>
            task._id === id ? { ...task, ...response.data.task } : task
          )
        );

        // Show success toast
        showSuccess("Task Updated", "Task has been updated successfully!");

        return { success: true };
      } else {
        const errorMessage = response.data.message || "Failed to update task";
        showError("Update Failed", errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error: any) {
      console.error("Update task error:", error);
      const errorMessage =
        error.response?.data?.message || "Error updating task";
      showError("Update Failed", errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const deleteTask = async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.delete(`/tasks/${id}`);

      if (response.data.success) {
        // Remove the task from local state
        setTasks((prev) => prev.filter((task) => task._id !== id));

        // Show success toast
        showSuccess("Task Deleted", "Task has been deleted successfully!");

        return { success: true };
      } else {
        const errorMessage = response.data.message || "Failed to delete task";
        showError("Deletion Failed", errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error: any) {
      console.error("Delete task error:", error);
      const errorMessage =
        error.response?.data?.message || "Error deleting task";
      showError("Deletion Failed", errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const updateTaskStatus = async (
    id: string,
    status: Task["status"]
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.patch(`/tasks/${id}/status`, { status });

      if (response.data.success) {
        // Update the task in local state
        setTasks((prev) =>
          prev.map((task) =>
            task._id === id
              ? { ...task, status, updatedAt: new Date().toISOString() }
              : task
          )
        );

        // Show success toast
        showSuccess("Status Updated", `Task status changed to ${status}`);

        return { success: true };
      } else {
        const errorMessage =
          response.data.message || "Failed to update task status";
        showError("Status Update Failed", errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error: any) {
      console.error("Update task status error:", error);
      const errorMessage =
        error.response?.data?.message || "Error updating task status";
      showError("Status Update Failed", errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const getFilteredTasks = (): Task[] => {
    if (!searchTerm) return tasks;

    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Fetch tasks on mount, but only when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      fetchTasks();
    }
  }, [user, authLoading]);

  const value: TaskContextType = {
    tasks,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    getFilteredTasks,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTask = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
};
