import React from "react";
import { TasksPage } from "../../pages";
import { Task } from "../../types";

interface TasksRouteProps {
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
}

export const TasksRoute: React.FC<TasksRouteProps> = ({
  onAddTask,
  onEditTask,
}) => {
  return <TasksPage onAddTask={onAddTask} onEditTask={onEditTask} />;
};
