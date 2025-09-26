import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserCard } from "../components/users/UserCard";
import { Input } from "../components/ui/input";
import { User } from "../types";
import { Search, Users as UsersIcon } from "lucide-react";
import api from "../lib/api";

interface MembersPageProps {}

export const MembersPage: React.FC<MembersPageProps> = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Use the same endpoint as TaskForm uses for users
        const response = await api.get("/tasks/users");
        console.log("Fetched users for members page:", response);

        if (response.data.success) {
          setUsers(response.data.users);
        } else {
          setError("Failed to load users");
        }
      } catch (error: any) {
        console.error("Error fetching users:", error);
        setError(error.response?.data?.message || "Error fetching users");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center mb-6">
        <div className="flex items-center space-x-3">
          <UsersIcon className="w-8 h-8 text-blue-500" />
          <h2 className="text-2xl font-bold">Team Members</h2>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading team members...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-red-500">Error: {error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <UserCard key={user._id} user={user} />
          ))}
        </div>
      )}

      {!isLoading && !error && filteredUsers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm
              ? "No team members found matching your search."
              : "No team members found."}
          </p>
        </div>
      )}
    </motion.div>
  );
};
