import React from "react";
import { motion } from "framer-motion";
import { ProjectCard } from "../components/projects/ProjectCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Project } from "../types";
import { useProject } from "../contexts/ProjectContext";
import { useAuth } from "../contexts/AuthContext";
import { Plus, Search } from "lucide-react";

interface ProjectsPageProps {
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  onAddProject,
  onEditProject,
}) => {
  const {
    searchTerm,
    setSearchTerm,
    getFilteredProjects,
    deleteProject,
    isLoading,
    error,
  } = useProject();
  const { user } = useAuth();

  const filteredProjects = getFilteredProjects();

  const handleDeleteProject = async (id: string) => {
    const result = await deleteProject(id);
    if (!result.success) {
      console.error("Failed to delete project:", result.error);
      // You could show a toast notification here
    }
  };

  // Check if user can create projects (admin or manager)
  const canCreateProjects = (): boolean => {
    if (!user) return false;
    return user.role === "admin" || user.role === "manager";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Projects</h2>
        {canCreateProjects() && (
          <Button
            onClick={onAddProject}
            className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Button>
        )}
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-red-500">Error: {error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={() => onEditProject(project)}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}

      {!isLoading && !error && filteredProjects.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm
              ? "No projects found matching your search."
              : "No projects found. Create your first project!"}
          </p>
        </div>
      )}
    </motion.div>
  );
};
