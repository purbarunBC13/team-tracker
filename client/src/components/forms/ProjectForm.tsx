import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Project, User } from "../../types";
import { useProject } from "../../contexts/ProjectContext";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../lib/api";

interface ProjectFormProps {
  project?: Project;
  onCancel: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onCancel,
}) => {
  const { createProject, updateProject } = useProject();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: project?.title || "",
    description: project?.description || "",
    owner: project?.owner || "", // Optional - will default to current user on backend
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch users for owner dropdown (admins and managers can assign to others)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        setUsersError(null);
        try {
          const response = await api.get("/tasks/users");
          console.log("Fetched users:", response);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Clean up form data - remove empty owner to let backend default to current user
      const cleanedFormData: any = { ...formData };
      if (!cleanedFormData.owner || cleanedFormData.owner.trim() === "") {
        delete cleanedFormData.owner;
      }

      let result;
      if (project) {
        // Debug: Log the project ID being used
        console.log("Updating project with ID:", project._id);
        console.log("Project ID type:", typeof project._id);
        console.log("Project ID length:", project._id.length);

        // Validate ObjectId format (24 hex characters)
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(project._id);
        console.log("Is valid ObjectId format:", isValidObjectId);

        if (!isValidObjectId) {
          console.error("Invalid ObjectId format detected:", project._id);
          throw new Error("Project ID format is invalid");
        }

        // Update existing project
        result = await updateProject(project._id, cleanedFormData);
      } else {
        // Create new project
        result = await createProject(cleanedFormData);
      }

      if (result.success) {
        onCancel(); // Close form on success
      } else {
        console.error("Project operation failed:", result.error);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error("Error submitting project:", error);
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
              <CardTitle>
                {project ? "Edit Project" : "Add New Project"}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="project-title"
                    className="text-sm font-medium"
                  >
                    Title
                  </label>
                  <Input
                    id="project-title"
                    placeholder="Enter project title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <label
                    htmlFor="project-description"
                    className="text-sm font-medium"
                  >
                    Description
                  </label>
                  <textarea
                    id="project-description"
                    placeholder="Enter project description"
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
                    htmlFor="project-owner"
                    className="text-sm font-medium"
                  >
                    Owner{" "}
                    <span className="text-muted-foreground text-xs">
                      (Optional - defaults to you)
                    </span>
                  </label>
                  <select
                    id="project-owner"
                    value={formData.owner}
                    onChange={(e) => handleChange("owner", e.target.value)}
                    disabled={isLoadingUsers}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background disabled:opacity-50"
                  >
                    <option value="">
                      {isLoadingUsers
                        ? "Loading users..."
                        : usersError
                        ? "Error loading users"
                        : "Select an owner (optional)"}
                    </option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} - {user.role}
                        {user.company && ` (${user.company})`}
                      </option>
                    ))}
                  </select>
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
                    {isSubmitting ? "Saving..." : project ? "Update" : "Add"}{" "}
                    Project
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
