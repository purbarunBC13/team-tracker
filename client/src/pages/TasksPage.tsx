import React from "react";
import { motion } from "framer-motion";
import { TaskCard } from "../components/tasks/TaskCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Task } from "../types";
import { useTask } from "../contexts/TaskContext";
import { useAuth } from "../contexts/AuthContext";
import { Plus, Search } from "lucide-react";

interface TasksPageProps {
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({
  onAddTask,
  onEditTask,
}) => {
  const {
    searchTerm,
    setSearchTerm,
    getFilteredTasks,
    deleteTask,
    updateTaskStatus,
    isLoading,
    error,
  } = useTask();
  const { canCreateTasks } = useAuth();

  const filteredTasks = getFilteredTasks();

  const handleDeleteTask = async (id: string) => {
    const result = await deleteTask(id);
    if (!result.success) {
      console.error("Failed to delete task:", result.error);
      // You could show a toast notification here
    }
  };

  const handleTaskStatusChange = async (id: string, status: Task["status"]) => {
    const result = await updateTaskStatus(id, status);
    if (!result.success) {
      console.error("Failed to update task status:", result.error);
      // You could show a toast notification here
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tasks</h2>
        {canCreateTasks() && (
          <Button
            onClick={onAddTask}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        )}
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-red-500">Error: {error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={() => onEditTask(task)}
              onDelete={handleDeleteTask}
              onStatusChange={handleTaskStatusChange}
            />
          ))}
        </div>
      )}

      {!isLoading && !error && filteredTasks.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No tasks found.</p>
        </div>
      )}
    </motion.div>
  );
};
