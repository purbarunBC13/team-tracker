import React from "react";
import { ProjectsPage } from "../../pages";
import { Project } from "../../types";

interface ProjectsRouteProps {
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
}

export const ProjectsRoute: React.FC<ProjectsRouteProps> = ({
  onAddProject,
  onEditProject,
}) => {
  return (
    <ProjectsPage onAddProject={onAddProject} onEditProject={onEditProject} />
  );
};
