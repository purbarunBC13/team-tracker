import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ConfirmDialog } from "../ui/confirm-dialog";
import { Project } from "../../types";
import { Calendar, Clock, Edit, Trash2, User, FolderOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Check if this project has a valid ObjectId format
  const hasValidObjectId = /^[0-9a-fA-F]{24}$/.test(project._id);

  // Log warning for invalid projects
  if (!hasValidObjectId) {
    console.warn("Project with invalid ObjectId detected:", {
      id: project._id,
      title: project.title,
    });
  }

  // Check if user can edit this project (admin, manager, or owner)
  const canEdit = (): boolean => {
    if (!user) return false;
    return (
      user.role === "admin" ||
      user.role === "manager" ||
      project.owner === user.id
    );
  };

  // Check if user can delete this project (admin or owner)
  const canDelete = (): boolean => {
    if (!user) return false;
    return user.role === "admin" || project.owner === user.id;
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(project._id);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Get owner name if populated, otherwise show "Unknown"
  const getOwnerName = (): string => {
    // For now, projects will be populated with owner info from backend
    // If it's a string ID, we'll show "Unknown Owner"
    if (typeof project.owner === "string") {
      return "Unknown Owner";
    }
    return "Unknown Owner";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card
        className={`h-full transition-all duration-300 hover:shadow-lg ${
          !hasValidObjectId
            ? "border-yellow-300 bg-yellow-50/50 dark:bg-yellow-900/10"
            : "border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold pr-2 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-blue-500" />
              {project.title}
            </CardTitle>
            <div className="flex space-x-1">
              {!hasValidObjectId && (
                <Badge
                  className="bg-yellow-100 text-yellow-800"
                  title="Invalid project ID - editing disabled"
                >
                  ⚠️ Corrupted
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {project.description}
          </p>

          {/* Owner information */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>{getOwnerName()}</span>
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              Created {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>

          {project.updatedAt && project.updatedAt !== project.createdAt && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Updated {new Date(project.updatedAt).toLocaleDateString()}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              Project
            </Badge>

            <div className="flex space-x-2">
              {canEdit() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Validate ObjectId format before editing
                    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(
                      project._id
                    );
                    if (!isValidObjectId) {
                      console.error(
                        "Cannot edit project with invalid ObjectId format:",
                        project._id
                      );
                      alert(
                        `Cannot edit project: Invalid ID format (${project._id}). This project may be corrupted.`
                      );
                      return;
                    }
                    onEdit(project);
                  }}
                  className="transition-all duration-200 hover:scale-105"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {canDelete() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteClick}
                  className="transition-all duration-200 hover:scale-105 hover:bg-red-50 hover:border-red-200"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.title}"? This action cannot be undone. Note: Projects with existing tasks cannot be deleted.`}
        confirmText="Delete Project"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        variant="danger"
      />
    </motion.div>
  );
};
