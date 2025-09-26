import React, { useState, useEffect } from "react";
import { AnalyticsDashboard } from "../components/analytics/AnalyticsDashboard";
import { useTask } from "../contexts/TaskContext";
import { TeamMember } from "../types";
import { motion } from "framer-motion";
import { Card, CardContent } from "../components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import api from "../lib/api";

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalProjects: number;
    userProjects: number;
    totalTasks: number;
    overdueTasks: number;
    tasksThisMonth: number;
    tasksCompletedThisMonth: number;
  };
  taskStats: Record<string, number>;
  priorityStats: Record<string, number>;
  userPerformance: Array<{
    _id: {
      userId: string;
      userName: string;
      userEmail: string;
      userRole: string;
    };
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    completionRate: number;
  }>;
  projectStats: Array<{
    _id: {
      projectId: string;
      projectTitle: string;
    };
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
  }>;
}

export const AnalyticsPage: React.FC = () => {
  const { tasks, isLoading: isTasksLoading, error: tasksError } = useTask();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // Fetch team members for analytics
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoadingMembers(true);
        setMembersError(null);

        const response = await api.get("/team-members");

        if (response.data.success) {
          setMembers(response.data.members || []);
        } else {
          setMembersError("Failed to fetch team members");
        }
      } catch (error: any) {
        console.error("Error fetching members:", error);
        setMembersError(
          error.response?.data?.message || "Error fetching team members"
        );
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchMembers();
  }, []);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoadingAnalytics(true);
        setAnalyticsError(null);

        const response = await api.get("/analytics/dashboard");

        if (response.data.success) {
          setAnalyticsData(response.data.data);
        } else {
          setAnalyticsError("Failed to fetch analytics data");
        }
      } catch (error: any) {
        console.error("Error fetching analytics:", error);
        setAnalyticsError(
          error.response?.data?.message || "Error fetching analytics data"
        );
      } finally {
        setIsLoadingAnalytics(false);
      }
    };

    fetchAnalytics();
  }, []);

  const isLoading = isTasksLoading || isLoadingMembers || isLoadingAnalytics;
  const hasError = tasksError || membersError || analyticsError;

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Loading Analytics
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Fetching team data and task metrics...
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (hasError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <Card className="w-full max-w-md border-red-200 dark:border-red-800">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="h-8 w-8 text-red-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Unable to Load Analytics
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {hasError}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"
    >
      <AnalyticsDashboard
        members={members}
        tasks={tasks}
        analyticsData={analyticsData}
      />
    </motion.div>
  );
};
