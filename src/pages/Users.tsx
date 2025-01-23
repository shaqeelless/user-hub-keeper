import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log("Fetching users");
      const { data: { users: fetchedUsers }, error } = await supabase.auth.admin.listUsers();

      if (error) throw error;
      
      // Transform the data to match our User interface
      const transformedUsers: User[] = fetchedUsers.map(user => ({
        id: user.id,
        email: user.email || 'No email',
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
      }));

      console.log("Fetched users:", transformedUsers);
      setUsers(transformedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Last Sign In</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {format(new Date(user.created_at), "PPP")}
                </TableCell>
                <TableCell>
                  {user.last_sign_in_at
                    ? format(new Date(user.last_sign_in_at), "PPP")
                    : "Never"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Users;