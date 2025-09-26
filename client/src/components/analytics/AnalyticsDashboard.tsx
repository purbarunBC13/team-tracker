import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import { motion } from "framer-motion";
import { TeamMember, Task } from "../../types";
import { TrendingUp, Users, Calendar, Target } from "lucide-react";
import { analyticsAPI } from "../../lib/api";

interface MonthlyData {
  month: string;
  created: number;
  completed: number;
}

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

interface AnalyticsDashboardProps {
  members: TeamMember[];
  tasks: Task[];
  analyticsData?: AnalyticsData | null;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  members,
  tasks,
  analyticsData,
}) => {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([
    { month: "Jan", completed: 0, created: 0 },
    { month: "Feb", completed: 0, created: 0 },
    { month: "Mar", completed: 0, created: 0 },
    { month: "Apr", completed: 0, created: 0 },
    { month: "May", completed: 0, created: 0 },
    { month: "Jun", completed: 0, created: 0 },
  ]);
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false);

  // Fetch monthly trends data
  useEffect(() => {
    const fetchMonthlyTrends = async () => {
      try {
        setIsLoadingMonthly(true);
        const response = await analyticsAPI.getMonthlyTrends();
        if (response.data.success) {
          setMonthlyData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching monthly trends:", error);
        // Keep the default empty data if the API fails
      } finally {
        setIsLoadingMonthly(false);
      }
    };

    fetchMonthlyTrends();
  }, []);

  // Helper function to get Tailwind color classes
  const getColorClass = (hexColor: string) => {
    switch (hexColor) {
      case "#94a3b8":
        return "text-slate-500";
      case "#3b82f6":
        return "text-blue-500";
      case "#10b981":
        return "text-green-500";
      case "#ef4444":
        return "text-red-500";
      case "#f59e0b":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  const taskStatusData = analyticsData?.taskStats
    ? [
        {
          name: "To Do",
          value: analyticsData.taskStats["todo"] || 0,
          color: "#94a3b8",
        },
        {
          name: "In Progress",
          value: analyticsData.taskStats["in-progress"] || 0,
          color: "#3b82f6",
        },
        {
          name: "Completed",
          value: analyticsData.taskStats["completed"] || 0,
          color: "#10b981",
        },
      ]
    : [
        {
          name: "To Do",
          value: tasks.filter((t) => t.status === "todo").length,
          color: "#94a3b8",
        },
        {
          name: "In Progress",
          value: tasks.filter((t) => t.status === "in-progress").length,
          color: "#3b82f6",
        },
        {
          name: "Completed",
          value: tasks.filter((t) => t.status === "completed").length,
          color: "#10b981",
        },
      ];

  const priorityData = analyticsData?.priorityStats
    ? [
        {
          name: "High",
          value: analyticsData.priorityStats["high"] || 0,
          color: "#ef4444",
        },
        {
          name: "Medium",
          value: analyticsData.priorityStats["medium"] || 0,
          color: "#f59e0b",
        },
        {
          name: "Low",
          value: analyticsData.priorityStats["low"] || 0,
          color: "#10b981",
        },
      ]
    : [
        {
          name: "High",
          value: tasks.filter((t) => t.priority === "high").length,
          color: "#ef4444",
        },
        {
          name: "Medium",
          value: tasks.filter((t) => t.priority === "medium").length,
          color: "#f59e0b",
        },
        {
          name: "Low",
          value: tasks.filter((t) => t.priority === "low").length,
          color: "#10b981",
        },
      ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="font-medium text-slate-900 dark:text-slate-100">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-medium">
              <span className={`${getColorClass(entry.color)}`}>
                {entry.name}: {entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center space-x-2">
        <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Analytics Dashboard
        </h2>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Task Completion Rate
              </CardTitle>
              <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {analyticsData?.overview
                  ? Math.round(
                      (analyticsData.overview.tasksCompletedThisMonth /
                        Math.max(analyticsData.overview.tasksThisMonth, 1)) *
                        100
                    )
                  : tasks.length > 0
                  ? Math.round(
                      (tasks.filter((t) => t.status === "completed").length /
                        tasks.length) *
                        100
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {analyticsData?.overview
                  ? `${analyticsData.overview.tasksCompletedThisMonth} of ${analyticsData.overview.tasksThisMonth} this month`
                  : `${
                      tasks.filter((t) => t.status === "completed").length
                    } of ${tasks.length} tasks`}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                Active Members
              </CardTitle>
              <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {analyticsData?.overview
                  ? analyticsData.overview.totalUsers
                  : members.filter((m) => m.status === "active").length}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">
                {analyticsData?.overview
                  ? `active users in system`
                  : `${Math.round(
                      (members.filter((m) => m.status === "active").length /
                        Math.max(members.length, 1)) *
                        100
                    )}% of total team`}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Avg Tasks per Member
              </CardTitle>
              <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {members.length > 0
                  ? Math.round(tasks.length / members.length)
                  : 0}
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                tasks per team member
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Overdue Tasks
              </CardTitle>
              <Target className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {analyticsData?.overview
                  ? analyticsData.overview.overdueTasks
                  : tasks.filter(
                      (t) =>
                        new Date(t.dueDate) < new Date() &&
                        t.status !== "completed"
                    ).length}
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                need immediate attention
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="tasks"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
          >
            Task Analysis
          </TabsTrigger>
          <TabsTrigger
            value="trends"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
          >
            Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-slate-100">
                  Task Status Distribution
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Current status of all tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {taskStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center space-x-4 mt-4">
                  {taskStatusData.map((entry, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          entry.color === "#94a3b8"
                            ? "bg-slate-400"
                            : entry.color === "#3b82f6"
                            ? "bg-blue-500"
                            : "bg-green-500"
                        }`}
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {entry.name}: {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">
                Task Priority Distribution
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Priority levels of current tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${((percent as number) * 100).toFixed(0)}%`
                      }
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-4">
                  {priorityData.map((priority, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-4 h-4 rounded-full ${
                            priority.color === "#ef4444"
                              ? "bg-red-500"
                              : priority.color === "#f59e0b"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                        />
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {priority.name} Priority
                        </span>
                      </div>
                      <span
                        className={`text-2xl font-bold ${
                          priority.color === "#ef4444"
                            ? "text-red-500"
                            : priority.color === "#f59e0b"
                            ? "text-yellow-500"
                            : "text-green-500"
                        }`}
                      >
                        {priority.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">
                Monthly Task Trends
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Task creation vs completion over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMonthly ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-slate-500 dark:text-slate-400">
                    Loading monthly trends...
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient
                        id="createdGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient
                        id="completedGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      className="dark:stroke-slate-600"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#64748b" }}
                      className="dark:fill-slate-400"
                    />
                    <YAxis
                      tick={{ fill: "#64748b" }}
                      className="dark:fill-slate-400"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="created"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="url(#createdGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stackId="2"
                      stroke="#10b981"
                      fill="url(#completedGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
