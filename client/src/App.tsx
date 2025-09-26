import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./contexts/AuthContext";
import { TaskProvider } from "./contexts/TaskContext";
import { ProjectProvider } from "./contexts/ProjectContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ToastProvider } from "./components/ui/toast";
import { AuthRoute } from "./components/auth/AuthRoute";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Header } from "./components/layout/Header";
import { TaskForm } from "./components/forms/TaskForm";
import { ProjectForm } from "./components/forms/ProjectForm";
import {
  DashboardRoute,
  MembersRoute,
  TasksRoute,
  ProjectsRoute,
  AnalyticsRoute,
} from "./components/routes";
import { NotificationsPage } from "./pages";
import { Task, Project } from "./types";

const DashboardLayout: React.FC = () => {
  // Mock data

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [editingProject, setEditingProject] = useState<Project | undefined>();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardRoute />} />
            <Route path="/members" element={<MembersRoute />} />
            <Route
              path="/tasks"
              element={
                <TasksRoute
                  onAddTask={() => setShowTaskForm(true)}
                  onEditTask={(task: Task) => {
                    setEditingTask(task);
                    setShowTaskForm(true);
                  }}
                />
              }
            />
            <Route
              path="/projects"
              element={
                <ProjectsRoute
                  onAddProject={() => setShowProjectForm(true)}
                  onEditProject={(project: Project) => {
                    setEditingProject(project);
                    setShowProjectForm(true);
                  }}
                />
              }
            />
            <Route path="/analytics" element={<AnalyticsRoute />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Forms */}
      {/* {showMemberForm && (
        <TeamMemberForm
          member={editingMember}
          onSave={editingMember ? handleEditMember : handleAddMember}
          onCancel={() => {
            setShowMemberForm(false);
            setEditingMember(undefined);
          }}
        />
      )} */}

      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(undefined);
          }}
        />
      )}

      {showProjectForm && (
        <ProjectForm
          project={editingProject}
          onCancel={() => {
            setShowProjectForm(false);
            setEditingProject(undefined);
          }}
        />
      )}
    </div>
  );
};

function App() {
  console.log("App component rendering...");
  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationProvider>
          <TaskProvider>
            <ProjectProvider>
              <Router>
                <Routes>
                  <Route path="/login" element={<AuthRoute />} />
                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Router>
            </ProjectProvider>
          </TaskProvider>
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
