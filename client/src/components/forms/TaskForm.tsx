import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Task, TeamMember, Project, PopulatedTask } from "../../types";
import { useTask } from "../../contexts/TaskContext";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  company?: string;
}

interface TaskFormProps {
  task?: Task | PopulatedTask;
  members?: TeamMember[]; // Make optional since we'll fetch users from API
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ task, onCancel }) => {
  const { createTask, updateTask } = useTask();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  // Utility function to extract ID from populated object or return string ID
  const extractId = (field: any): string => {
    if (!field) return "";
    if (typeof field === "string") return field;
    if (typeof field === "object" && field._id) return field._id;
    return "";
  };

  // Utility function to format date for input field
  const formatDateForInput = (dateString: string | undefined): string => {
    if (!dateString) return new Date().toISOString().split("T")[0];

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return new Date().toISOString().split("T")[0];
      }
      return date.toISOString().split("T")[0];
    } catch {
      return new Date().toISOString().split("T")[0];
    }
  };

  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    assignee_id: extractId(task?.assignee_id),
    project_id: extractId(task?.project_id), // Optional - can be empty
    status: task?.status || ("todo" as const),
    priority: task?.priority || ("medium" as const),
    dueDate: formatDateForInput(task?.dueDate),
    comments: task?.comments || [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when task prop changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        assignee_id: extractId(task.assignee_id),
        project_id: extractId(task.project_id),
        status: task.status || "todo",
        priority: task.priority || "medium",
        dueDate: formatDateForInput(task.dueDate),
        comments: task.comments || [],
      });
    }
  }, [task]);

  // Fetch users for assignment dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        setUsersError(null);
        try {
          const response = await api.get("/tasks/users");

          if (response.data.success) {
            setUsers(response.data.users);
          } else {
            setUsersError("Failed to load users");
          }
        } catch (error) {
          console.error("Error fetching users:", error);
          setUsersError("Failed to load users");
        } finally {
          setIsLoadingUsers(false);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };

    fetchUsers();
  }, []);

  // Fetch projects for project dropdown
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoadingProjects(true);
        setProjectsError(null);
        try {
          const response = await api.get("/projects");

          if (response.data.success) {
            setProjects(response.data.data);
          } else {
            setProjectsError("Failed to load projects");
          }
        } catch (error) {
          console.error("Error fetching projects:", error);
          setProjectsError("Failed to load projects");
        } finally {
          setIsLoadingProjects(false);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };

    fetchProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Clean up form data - remove empty project_id to avoid ObjectId casting errors
      const cleanedFormData: any = { ...formData };
      if (
        !cleanedFormData.project_id ||
        cleanedFormData.project_id.trim() === ""
      ) {
        delete cleanedFormData.project_id;
      }

      let result;
      if (task) {
        // Validate ObjectId format (24 hex characters)
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(task._id);

        if (!isValidObjectId) {
          console.error("Invalid ObjectId format detected:", task._id);
          throw new Error("Task ID format is invalid");
        }

        // Update existing task
        result = await updateTask(task._id, cleanedFormData);
      } else {
        // Create new task
        result = await createTask(cleanedFormData);
      }

      if (result.success) {
        onCancel(); // Close form on success
      } else {
        console.error("Task operation failed:", result.error);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error("Error submitting task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{task ? "Edit Task" : "Add New Task"}</CardTitle>
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="task-title" className="text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id="task-title"
                    placeholder="Enter task title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <label
                    htmlFor="task-description"
                    className="text-sm font-medium"
                  >
                    Description
                  </label>
                  <textarea
                    id="task-description"
                    placeholder="Enter task description"
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    required
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background min-h-[80px]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="task-assignee"
                    className="text-sm font-medium"
                  >
                    Assign To
                  </label>
                  <select
                    id="task-assignee"
                    value={formData.assignee_id}
                    onChange={(e) =>
                      handleChange("assignee_id", e.target.value)
                    }
                    required
                    disabled={isLoadingUsers}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background disabled:opacity-50"
                  >
                    <option value="">
                      {isLoadingUsers
                        ? "Loading users..."
                        : usersError
                        ? "Error loading users"
                        : "Select a user"}
                    </option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} - {user.role}
                        {user.company && ` (${user.company})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="task-project" className="text-sm font-medium">
                    Project{" "}
                    <span className="text-muted-foreground text-xs">
                      (Optional)
                    </span>
                  </label>
                  <select
                    id="task-project"
                    value={formData.project_id}
                    onChange={(e) => handleChange("project_id", e.target.value)}
                    disabled={isLoadingProjects}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background disabled:opacity-50"
                  >
                    <option value="">
                      {isLoadingProjects
                        ? "Loading projects..."
                        : projectsError
                        ? "Error loading projects"
                        : "Select a project (optional)"}
                    </option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="task-status"
                      className="text-sm font-medium"
                    >
                      Status
                    </label>
                    <select
                      id="task-status"
                      value={formData.status}
                      onChange={(e) => handleChange("status", e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="task-priority"
                      className="text-sm font-medium"
                    >
                      Priority
                    </label>
                    <select
                      id="task-priority"
                      value={formData.priority}
                      onChange={(e) => handleChange("priority", e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="task-due-date"
                    className="text-sm font-medium"
                  >
                    Due Date
                  </label>
                  <Input
                    id="task-due-date"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleChange("dueDate", e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : task ? "Update" : "Add"} Task
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
