import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
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
        <CardTitle>Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="p-4 border rounded-lg space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{user.email}</h3>
                  <p className="text-sm text-muted-foreground">
                    ID: {user.id}
                  </p>
                </div>
                <div className="text-sm text-right">
                  <p>
                    Created:{" "}
                    {format(new Date(user.created_at), "PPP")}
                  </p>
                  {user.last_sign_in_at && (
                    <p>
                      Last sign in:{" "}
                      {format(new Date(user.last_sign_in_at), "PPP")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Users;